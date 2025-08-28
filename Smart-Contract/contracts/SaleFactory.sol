// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SalePool} from "./SalePool.sol";

contract SaleFactory is Ownable {
    address[] public allSales;
    uint16 public platformFeeBps = 500; // 5%
    address public platformTreasury;

    // Optional: if you want multiple approved recipients
    mapping(address => bool) public approvedFeeRecipients;

    event SaleCreated(address sale, address saleToken, address baseToken, address projectOwner);
    event PlatformTreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(address owner_, address _platformTreasury) Ownable(owner_) {
        require(_platformTreasury != address(0), "invalid treasury");
        platformTreasury = _platformTreasury;
        approvedFeeRecipients[_platformTreasury] = true; // Auto-approve platform treasury
    }

    // Remove feeTokenBps and feeRecipient from user input since platform controls these
    struct SaleParams {
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
        // Removed: feeTokenBps and feeRecipient (platform controlled)
    }

    function setPlatformTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "invalid treasury");
        address oldTreasury = platformTreasury;
        platformTreasury = _treasury;
        
        // Update approved recipients
        approvedFeeRecipients[oldTreasury] = false;
        approvedFeeRecipients[_treasury] = true;
        
        emit PlatformTreasuryUpdated(oldTreasury, _treasury);
    }

    function setPlatformFee(uint16 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "max 10%"); // Reasonable max fee
        platformFeeBps = _feeBps;
    }

    // Optional: for multiple approved recipients
    function addFeeRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "invalid recipient");
        approvedFeeRecipients[recipient] = true;
    }

    function removeFeeRecipient(address recipient) external onlyOwner {
        require(recipient != platformTreasury, "cannot remove platform treasury");
        approvedFeeRecipients[recipient] = false;
    }

    function createSale(SaleParams calldata p) external returns (address sale) {
        require(p.saleToken != address(0) && p.baseToken != address(0) && p.tierOracle != address(0), "addr");
        require(p.start < p.end && p.tgeTime >= p.end, "time");
        require(p.priceNum > 0 && p.priceDen > 0, "price");
        
        // Platform controls fee parameters completely
        SalePool.Params memory sp = SalePool.Params({
            saleToken:        p.saleToken,
            baseToken:        p.baseToken,
            priceNum:         p.priceNum,
            priceDen:         p.priceDen,
            start:            p.start,
            end:              p.end,
            tgeTime:          p.tgeTime,
            tgeBps:           p.tgeBps,
            vestStart:        p.vestStart,
            vestDuration:     p.vestDuration,
            hardCapBase:      p.hardCapBase,
            softCapBase:      p.softCapBase,
            perWalletCapBase: p.perWalletCapBase,
            tier1CapBase:     p.tier1CapBase,
            tier2CapBase:     p.tier2CapBase,
            tier3CapBase:     p.tier3CapBase,
            tierOracle:       p.tierOracle,
            projectOwner:     p.projectOwner,
            feeTokenBps:      platformFeeBps,     
            feeRecipient:     platformTreasury    
        });

        sale = address(new SalePool(sp));
        allSales.push(sale);
        emit SaleCreated(sale, p.saleToken, p.baseToken, p.projectOwner);
    }

    function salesCount() external view returns (uint256) { return allSales.length; }
    function getAllSales() external view returns (address[] memory) { return allSales; }
}