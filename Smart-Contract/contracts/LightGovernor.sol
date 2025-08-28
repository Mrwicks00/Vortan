// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

interface IStaking {
    function totalStaked(address user) external view returns (uint256);
}

contract LIghtGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    IStaking public vortStaking; // your staking contract (current-balance based)

    constructor(IVotes _token, IStaking _vortStaking)
        Governor("EnhancedGovernor")
        GovernorSettings(
            1,      // votingDelay (blocks)
            45818,  // votingPeriod (~1 week on Ethereum)
            0       // proposalThreshold (anyone can propose)
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
    {
        vortStaking = _vortStaking;
    }

    // ── Overrides required by multiple inheritance ────────────────────────────

    // Both Governor & GovernorSettings define these; resolve by delegating to super
    function votingDelay()
        public view override(Governor, GovernorSettings) returns (uint256)
    { return super.votingDelay(); }

    function votingPeriod()
        public view override(Governor, GovernorSettings) returns (uint256)
    { return super.votingPeriod(); }

    function proposalThreshold()
        public view override(Governor, GovernorSettings) returns (uint256)
    { return super.proposalThreshold(); }

    // Quorum comes from the quorum extension
    function quorum(uint256 blockNumber)
        public view override(Governor, GovernorVotesQuorumFraction) returns (uint256)
    { return super.quorum(blockNumber); }

    // Only override Governor here (keep it simple in OZ v5)
    function getVotes(address account, uint256 blockNumber)
        public view override(Governor) returns (uint256)
    {
        // Past token votes (checkpointed by the Votes token)
        uint256 tokenVotes = super.getVotes(account, blockNumber);

        uint256 staked = vortStaking.totalStaked(account);
        return tokenVotes + staked;
    }

    // These are fine to leave as Governor defaults in v5:
    // - state(...) → only Governor
    // - propose(...) → you can omit the override entirely
    // - _execute/_cancel/_executor → only needed with timelock mixins

    function supportsInterface(bytes4 interfaceId)
        public view override(Governor) returns (bool)
    { return super.supportsInterface(interfaceId); }
}
