// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract VortanToken is ERC20, ERC20Permit, ERC20Votes, Ownable, Pausable {
    constructor(address initialOwner)
        ERC20("Vortan", "VORT")
        // Tip: make the Permit name match the token name
        ERC20Permit("Vortan")
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) external onlyOwner { _mint(to, amount); }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // Hook required by ERC20Votes
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    // FIX: override Nonces + ERC20Permit (not ERC20Votes)
    function nonces(address owner)
        public
        view
        override(Nonces, ERC20Permit)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
