// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITierOracle {
    function tierOf(address) external view returns (uint8);
}

contract SalePool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // config
    address public immutable saleToken;
    address public immutable baseToken;
    address public immutable tierOracle;
    address public immutable projectOwner;
    address public immutable feeRecipient;

    uint96 public immutable priceNum;
    uint96 public immutable priceDen;
    uint64 public immutable start;
    uint64 public immutable end;
    uint64 public immutable tgeTime;
    uint16 public immutable tgeBps;
    uint64 public immutable vestStart;
    uint64 public immutable vestDuration;

    uint96 public immutable hardCapBase;
    uint96 public immutable softCapBase;
    uint96 public immutable perWalletCapBase;
    uint96 public immutable tier1CapBase;
    uint96 public immutable tier2CapBase;
    uint96 public immutable tier3CapBase;

    uint16 public immutable feeTokenBps; // e.g., 500 = 5%

    // state
    bool public finalized;
    bool public successful;
    uint256 public totalRaisedBase;
    uint256 public totalTokensSold;
    uint256 public totalSaleTokensDeposited;

    mapping(address => uint256) public purchasedBase;
    mapping(address => uint256) public purchasedTokens;
    mapping(address => bool) public tgeClaimed;
    mapping(address => uint256) public vestedClaimed;
    mapping(address => bool) public refunded;
    
    // Participant tracking
    uint256 public participantCount;
    mapping(address => bool) public hasParticipated;

    enum SaleStatus {
        Unfunded,
        Upcoming,
        Live,
        SoldOut,
        Ended
    }

    event Bought(address indexed user, uint256 baseAmount, uint256 tokenAmount);
    event Finalized(uint256 totalRaised, bool successful);
    event DepositedSaleTokens(uint256 amount);
    event WithdrawUnsold(uint256 amount);
    event ClaimedTGE(address indexed user, uint256 amount);
    event ClaimedVested(address indexed user, uint256 amount);

    struct Params {
        address saleToken;
        address baseToken;
        uint96 priceNum;
        uint96 priceDen;
        uint64 start;
        uint64 end;
        uint64 tgeTime;
        uint16 tgeBps;
        uint64 vestStart;
        uint64 vestDuration;
        uint96 hardCapBase;
        uint96 softCapBase;
        uint96 perWalletCapBase;
        uint96 tier1CapBase;
        uint96 tier2CapBase;
        uint96 tier3CapBase;
        address tierOracle;
        address projectOwner;
        uint16 feeTokenBps;
        address feeRecipient;
    }

    constructor(Params memory p) {
        saleToken = p.saleToken;
        baseToken = p.baseToken;
        priceNum = p.priceNum;
        priceDen = p.priceDen;
        start = p.start;
        end = p.end;
        tgeTime = p.tgeTime;
        tgeBps = p.tgeBps;
        vestStart = p.vestStart;
        vestDuration = p.vestDuration;
        hardCapBase = p.hardCapBase;
        softCapBase = p.softCapBase;
        perWalletCapBase = p.perWalletCapBase;
        tier1CapBase = p.tier1CapBase;
        tier2CapBase = p.tier2CapBase;
        tier3CapBase = p.tier3CapBase;
        tierOracle = p.tierOracle;
        projectOwner = p.projectOwner;
        feeTokenBps = p.feeTokenBps;
        feeRecipient = p.feeRecipient;
    }

    function requiredDepositTokens()
        public
        view
        returns (
            uint256 tokensForSale,
            uint256 feeTokens,
            uint256 totalRequired
        )
    {
        // Adjust hardCapBase to account for decimal difference (baseToken=6 decimals, saleToken=18 decimals)
        uint256 adjustedHardCap = uint256(hardCapBase) * (10 ** 12); // 18-6=12 decimal difference

        tokensForSale =
            (adjustedHardCap * uint256(priceNum)) /
            uint256(priceDen);
        feeTokens = (tokensForSale * uint256(feeTokenBps)) / 1e4;
        totalRequired = tokensForSale + feeTokens;
    }

    function remainingRequiredTokens()
        external
        view
        returns (uint256 remaining)
    {
        (, , uint256 req) = requiredDepositTokens();
        return
            totalSaleTokensDeposited >= req
                ? 0
                : req - totalSaleTokensDeposited;
    }

    function depositSaleTokens(uint256 amount) external {
        require(msg.sender == projectOwner, "owner");
        require(block.timestamp < start, "started");
        IERC20(saleToken).safeTransferFrom(msg.sender, address(this), amount);
        totalSaleTokensDeposited += amount;
        emit DepositedSaleTokens(amount);
    }

    function buy(uint256 baseAmount) external nonReentrant {
        require(block.timestamp >= start && block.timestamp <= end, "time");
        require(baseAmount > 0, "amt");
        uint256 remainCap = uint256(hardCapBase) > totalRaisedBase
            ? uint256(hardCapBase) - totalRaisedBase
            : 0;
        require(baseAmount <= remainCap, "hardcap");

        // per-wallet cap via tier
        uint256 cap = perWalletCapBase;
        uint8 t = ITierOracle(tierOracle).tierOf(msg.sender);
        if (t == 1 && tier1CapBase > 0) cap = tier1CapBase;
        else if (t == 2 && tier2CapBase > 0) cap = tier2CapBase;
        else if (t == 3 && tier3CapBase > 0) cap = tier3CapBase;
        require(purchasedBase[msg.sender] + baseAmount <= cap, "walletcap");

        uint256 tokensOut = (baseAmount * uint256(priceNum)) /
            uint256(priceDen);
        // need tokensOut + feeTokens to be covered overall; enforce by ensuring deposit >= sold+fee at finalize
        require(
            totalSaleTokensDeposited >= totalTokensSold + tokensOut,
            "insufficient sale tokens"
        );

        IERC20(baseToken).safeTransferFrom(
            msg.sender,
            address(this),
            baseAmount
        );

        // Track participant count
        if (!hasParticipated[msg.sender]) {
            participantCount++;
            hasParticipated[msg.sender] = true;
        }

        purchasedBase[msg.sender] += baseAmount;
        purchasedTokens[msg.sender] += tokensOut;
        totalRaisedBase += baseAmount;
        totalTokensSold += tokensOut;

        emit Bought(msg.sender, baseAmount, tokensOut);
    }

    function finalize() external {
        require(!finalized, "final");
        require(block.timestamp > end, "not ended");
        finalized = true;

        if (softCapBase == 0 || totalRaisedBase >= softCapBase) {
            successful = true;

            // enforce enough tokens to also cover fee
            uint256 feeTokens = (totalTokensSold * uint256(feeTokenBps)) / 1e4;
            require(
                totalSaleTokensDeposited >= totalTokensSold + feeTokens,
                "need fee tokens"
            );

            // send proceeds to project
            IERC20(baseToken).safeTransfer(projectOwner, totalRaisedBase);
            // send token fee to treasury
            if (feeTokens > 0)
                IERC20(saleToken).safeTransfer(feeRecipient, feeTokens);
        } else {
            successful = false; // refunds path
        }
        emit Finalized(totalRaisedBase, successful);
    }

    function refundIfSoftcapFailed() external nonReentrant {
        require(finalized && !successful, "no refund");
        require(!refunded[msg.sender], "done");
        uint256 paid = purchasedBase[msg.sender];
        require(paid > 0, "none");
        refunded[msg.sender] = true;
        purchasedBase[msg.sender] = 0;
        purchasedTokens[msg.sender] = 0;
        IERC20(baseToken).safeTransfer(msg.sender, paid);
    }

    function claimTGE() external nonReentrant {
        require(finalized && successful, "no claim");
        require(block.timestamp >= tgeTime, "not tge");
        require(!tgeClaimed[msg.sender], "claimed");
        uint256 total = purchasedTokens[msg.sender];
        require(total > 0, "none");
        tgeClaimed[msg.sender] = true;
        uint256 amt = (total * uint256(tgeBps)) / 1e4;
        if (amt > 0) IERC20(saleToken).safeTransfer(msg.sender, amt);
        emit ClaimedTGE(msg.sender, amt);
    }

    function claimVested() external nonReentrant {
        require(finalized && successful, "no claim");
        require(block.timestamp >= vestStart, "not vest");
        uint256 total = purchasedTokens[msg.sender];
        require(total > 0, "none");
        uint256 tgeAmt = (total * uint256(tgeBps)) / 1e4;
        uint256 vestedTotal = total - tgeAmt;

        uint256 elapsed = block.timestamp > vestStart
            ? (block.timestamp - vestStart)
            : 0;
        if (elapsed > vestDuration) elapsed = vestDuration;

        uint256 vestedSoFar = (vestedTotal * elapsed) / vestDuration;
        uint256 already = vestedClaimed[msg.sender];
        require(vestedSoFar > already, "0");
        uint256 claimAmt = vestedSoFar - already;
        vestedClaimed[msg.sender] = vestedSoFar;

        if (claimAmt > 0) IERC20(saleToken).safeTransfer(msg.sender, claimAmt);
        emit ClaimedVested(msg.sender, claimAmt);
    }

    // unsold tokens → project (any surplus beyond totalTokensSold + required future vesting)
    function withdrawUnsoldTokens() external {
        require(msg.sender == projectOwner, "owner");
        require(finalized && successful, "not success");
        uint256 bal = IERC20(saleToken).balanceOf(address(this));
        // Keep at least totalTokensSold for investor claims (TGE+vesting).
        require(bal > totalTokensSold, "none");
        uint256 withdrawAmt = bal - totalTokensSold;
        IERC20(saleToken).safeTransfer(projectOwner, withdrawAmt);
        emit WithdrawUnsold(withdrawAmt);
    }

    // frontend helpers
    function userInfo(
        address u
    )
        external
        view
        returns (
            uint256 _purchasedBase,
            uint256 _purchasedTokens,
            bool _tgeDone,
            uint256 _vestedClaimed
        )
    {
        return (
            purchasedBase[u],
            purchasedTokens[u],
            tgeClaimed[u],
            vestedClaimed[u]
        );
    }

    function saleStats()
        external
        view
        returns (
            uint256 _totalRaisedBase,
            uint256 _totalTokensSold,
            uint256 _totalSaleTokensDeposited,
            bool _finalized,
            bool _successful
        )
    {
        return (
            totalRaisedBase,
            totalTokensSold,
            totalSaleTokensDeposited,
            finalized,
            successful
        );
    }

    function status() external view returns (SaleStatus) {
        (, , uint256 req) = requiredDepositTokens();
        bool isFunded = totalSaleTokensDeposited >= req;

        if (!isFunded) return SaleStatus.Unfunded;
        if (block.timestamp < start) return SaleStatus.Upcoming;

        if (block.timestamp <= end) {
            if (totalRaisedBase >= hardCapBase) return SaleStatus.SoldOut;
            return SaleStatus.Live;
        }

        return SaleStatus.Ended;
    }
}
