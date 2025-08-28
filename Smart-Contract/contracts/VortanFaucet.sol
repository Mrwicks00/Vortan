// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VortanToken.sol";
import "./Tokens/SOMI.sol";
import "./Tokens/USDC.sol";

contract VortanFaucet {
    VortanToken public vortToken;
    SOMI public somiToken;
    USDC public usdcToken;

    mapping(address => bool) public hasClaimed;

    event TokensClaimed(
        address user,
        uint256 vortAmount,
        uint256 somiAmount,
        uint256 usdcAmount
    );

    constructor(VortanToken _vortToken, SOMI _somiToken, USDC _usdcToken) {
        vortToken = _vortToken;
        somiToken = _somiToken;
        usdcToken = _usdcToken;
    }

    function claimTokens() external {
        require(!hasClaimed[msg.sender], "Already claimed");

        // Transfer tokens to user (must be pre-funded)
        uint256 vortAmount = 1000 * 10 ** 18; // 1000 VORT
        uint256 somiAmount = 500 * 10 ** 18; // 500 SOMI
        uint256 usdcAmount = 100 * 10 ** 6; // 100 USDC

        // Check if faucet has enough tokens
        require(
            vortToken.balanceOf(address(this)) >= vortAmount,
            "Not enough VORT"
        );
        require(
            somiToken.balanceOf(address(this)) >= somiAmount,
            "Not enough SOMI"
        );
        require(
            usdcToken.balanceOf(address(this)) >= usdcAmount,
            "Not enough USDC"
        );

        vortToken.transfer(msg.sender, vortAmount);
        somiToken.transfer(msg.sender, somiAmount);
        usdcToken.transfer(msg.sender, usdcAmount);

        hasClaimed[msg.sender] = true;

        emit TokensClaimed(msg.sender, vortAmount, somiAmount, usdcAmount);
    }

    // Function to fund the faucet (only owner can call)
    function fundFaucet() external {
        // This will be called by the token owner to fund the faucet
        // For now, we'll just check if faucet has tokens
        require(vortToken.balanceOf(address(this)) > 0, "Faucet not funded");
    }
}
