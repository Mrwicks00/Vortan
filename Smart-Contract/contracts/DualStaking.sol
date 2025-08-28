// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPoints {
    function tierPointsOf(address user) external view returns (uint256);
}

contract StakingWithRewards is Ownable(msg.sender), ReentrancyGuard, IPoints {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakeToken;   // e.g., VORT or SOMI
    IERC20 public immutable rewardToken;  // emissions paid in your platform token (e.g., VORT/SOMI)

    struct Position { uint128 amount; uint64 lockEnd; uint16 multBps; }
    mapping(address => Position[]) private _positions;
    mapping(address => uint256) public totalStaked;

    // lock multipliers (in bps: 10000 = 1.0x)
    uint16 public mult30d  = 10000; // 1.0x
    uint16 public mult90d  = 12000; // 1.2x
    uint16 public mult180d = 15000; // 1.5x

    // ---- rewards: acc per point (RAY precision) ----
    uint256 public rewardRatePerSecond;  // reward tokens emitted per second (global)
    uint256 public lastUpdate;           // last time acc updated
    uint256 public accRewardPerPointRay; // accumulated reward per point (scaled by 1e27)
    uint256 private constant RAY = 1e27;

    // per-user reward accounting
    mapping(address => uint256) public userRewardDebtRay; // points * acc at last user update
    mapping(address => uint256) public pendingRewards;    // unclaimed rewards

    // global points total (sum of all users' current points)
    uint256 private _totalPointsAll;

    // cache each user's last points so we can update the global total precisely
    mapping(address => uint256) private _lastUserPoints;

    event Staked(address indexed user, uint256 amount, uint256 lockDays, uint16 mult);
    event Unstaked(address indexed user, uint256 amount);
    event Claim(address indexed user, uint256 amount);
    event Funded(uint256 amount);
    event SetRate(uint256 rate);
    event Multipliers(uint16 m30, uint16 m90, uint16 m180);

    constructor(IERC20 _stakeToken, IERC20 _rewardToken, address owner_) {
        stakeToken  = _stakeToken;
        rewardToken = _rewardToken;
        _transferOwnership(owner_);
        lastUpdate = block.timestamp;
    }

    // ----------------------- admin -----------------------

    function setLockMultipliers(uint16 m30, uint16 m90, uint16 m180) external onlyOwner {
        require(m30 >= 10000 && m90 >= m30 && m180 >= m90, "bad mult");
        (mult30d, mult90d, mult180d) = (m30, m90, m180);
        emit Multipliers(m30, m90, m180);
    }

    function setRewardRate(uint256 rate) external onlyOwner {
        _accUpdate();
        rewardRatePerSecond = rate;
        emit SetRate(rate);
    }

    /// @notice fund the pool with reward tokens (transfer in)
    function fund(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Funded(amount);
    }

    // ----------------------- user actions -----------------------

    function stake(uint256 amount, uint256 lockDays) external nonReentrant {
        require(amount > 0, "amt");
        _accUpdate(); // update global acc

        // settle rewards for user up to now using previous points
        _settleUser(msg.sender);

        // add position
        uint16 mult = lockDays >= 180 ? mult180d : lockDays >= 90 ? mult90d : mult30d;
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);
        _positions[msg.sender].push(
            Position(uint128(amount), uint64(block.timestamp + lockDays * 1 days), mult)
        );
        totalStaked[msg.sender] += amount;

        // update global/user points
        _refreshUserPoints(msg.sender);

        emit Staked(msg.sender, amount, lockDays, mult);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0 && amount <= totalStaked[msg.sender], "amt");
        _accUpdate(); // update global acc

        // settle rewards for user up to now using previous points
        _settleUser(msg.sender);

        // remove from positions (only unlocked)
        uint256 remaining = amount;
        Position[] storage arr = _positions[msg.sender];
        for (uint256 i = arr.length; i > 0 && remaining > 0; i--) {
            Position storage p = arr[i-1];
            if (block.timestamp < p.lockEnd) continue;
            uint256 take = remaining < p.amount ? remaining : p.amount;
            p.amount -= uint128(take);
            remaining -= take;
            if (p.amount == 0) { arr.pop(); }
        }
        require(remaining == 0, "locked");

        totalStaked[msg.sender] -= amount;
        stakeToken.safeTransfer(msg.sender, amount);

        // update global/user points
        _refreshUserPoints(msg.sender);

        emit Unstaked(msg.sender, amount);
    }

    function claim() external nonReentrant {
        _accUpdate();
        _settleUser(msg.sender);
        uint256 toPay = pendingRewards[msg.sender];
        require(toPay > 0, "0");
        pendingRewards[msg.sender] = 0;
        rewardToken.safeTransfer(msg.sender, toPay);
        emit Claim(msg.sender, toPay);
    }

    // ----------------------- views -----------------------

    /// @notice total points = sum(amount * multBps / 1e4) across user positions
    function tierPointsOf(address user) public view returns (uint256 pts) {
        Position[] storage arr = _positions[user];
        for (uint256 i = 0; i < arr.length; i++) {
            pts += uint256(arr[i].amount) * arr[i].multBps / 1e4;
        }
    }

    function positionsOf(address user) external view returns (Position[] memory) {
        return _positions[user];
    }

    function totalPoints() external view returns (uint256) {
        return _totalPointsAll;
    }

    // ----------------------- internal helpers -----------------------

    function _accUpdate() internal {
        if (block.timestamp == lastUpdate) return;
        uint256 totalPts = _totalPointsAll;
        if (totalPts > 0 && rewardRatePerSecond > 0) {
            uint256 delta = block.timestamp - lastUpdate;
            uint256 addAcc = (delta * rewardRatePerSecond * RAY) / totalPts;
            accRewardPerPointRay += addAcc;
        }
        lastUpdate = block.timestamp;
    }

    /// @dev settle user's pending by moving (points * acc - debt) into pendingRewards
    function _settleUser(address user) internal {
        uint256 prevPts = _lastUserPoints[user];
        if (prevPts == 0) {
            // just set debt baseline
            userRewardDebtRay[user] = accRewardPerPointRay * 0;
            return;
        }
        uint256 accrued = (prevPts * accRewardPerPointRay);
        uint256 debt    = userRewardDebtRay[user];
        if (accrued > debt) {
            uint256 pending = (accrued - debt) / RAY;
            if (pending > 0) pendingRewards[user] += pending;
        }
        // set new debt baseline at current acc using prev points; will be updated again after points refresh
        userRewardDebtRay[user] = prevPts * accRewardPerPointRay;
    }

    /// @dev recompute user's points, update global total, and reset user debt to new baseline
    function _refreshUserPoints(address user) internal {
        uint256 oldPts = _lastUserPoints[user];
        uint256 newPts = tierPointsOf(user);

        if (newPts > oldPts) _totalPointsAll += (newPts - oldPts);
        else if (oldPts > newPts) _totalPointsAll -= (oldPts - newPts);

        _lastUserPoints[user]   = newPts;
        userRewardDebtRay[user] = newPts * accRewardPerPointRay; // new baseline
    }
}
