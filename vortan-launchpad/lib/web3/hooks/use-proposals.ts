import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { GOVERNOR_ABI } from "@/lib/web3/abis/governor";
import { CONTRACT_ADDRESSES } from "@/lib/web3/config/addresses";
import { somniaTestnet } from "@/lib/web3/config/chains";
import { parseEventLogs } from "viem";

// Utility functions for time formatting
const BLOCK_TIME_SECONDS = 15; // Somnia testnet block time (approximate)

const formatBlockToTime = (blockNumber: bigint, currentBlock: bigint) => {
  const blocksAgo = currentBlock - blockNumber;
  const secondsAgo = Number(blocksAgo) * BLOCK_TIME_SECONDS;

  if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
};

const formatBlockToDate = (blockNumber: bigint, currentBlock: bigint) => {
  const blocksAgo = currentBlock - blockNumber;
  const secondsAgo = Number(blocksAgo) * BLOCK_TIME_SECONDS;
  const timestamp = Date.now() - secondsAgo * 1000;
  const date = new Date(timestamp);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDuration = (startBlock: bigint, endBlock: bigint) => {
  const blocksDuration = Number(endBlock - startBlock);
  const secondsDuration = blocksDuration * BLOCK_TIME_SECONDS;

  if (secondsDuration < 3600) {
    const minutes = Math.floor(secondsDuration / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else if (secondsDuration < 86400) {
    const hours = Math.floor(secondsDuration / 3600);
    const minutes = Math.floor((secondsDuration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(secondsDuration / 86400);
    const hours = Math.floor((secondsDuration % 86400) / 3600);
    return `${days} day${days !== 1 ? "s" : ""} ${hours}h`;
  }
};

// Create public client
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

interface Proposal {
  id: string;
  proposer: string;
  description: string;
  startBlock: bigint;
  endBlock: bigint;
  state:
    | "Pending"
    | "Active"
    | "Canceled"
    | "Defeated"
    | "Succeeded"
    | "Queued"
    | "Expired"
    | "Executed";
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  hasVoted: boolean;
  userVote: "For" | "Against" | "Abstain" | null;
  eta?: bigint; // Execution time for queued proposals
  // Formatted time information
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  timeAgo?: string;
}

export function useProposals() {
  const { address } = useAccount();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GOVERNOR_ADDRESS = CONTRACT_ADDRESSES.GOVERNOR as `0x${string}`;

  // Load cached proposals on mount
  useEffect(() => {
    const cached = localStorage.getItem(`proposals_${GOVERNOR_ADDRESS}`);
    if (cached) {
      try {
        const cachedProposals = JSON.parse(cached);
        setProposals(cachedProposals);
        console.log(`📦 Loaded ${cachedProposals.length} cached proposals`);
      } catch (err) {
        console.warn("Failed to parse cached proposals:", err);
      }
    }
  }, [GOVERNOR_ADDRESS]);

  // Fetch proposals from events
  const fetchProposals = async () => {
    if (!GOVERNOR_ADDRESS) {
      console.error("❌ No governor address configured");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Starting proposal fetch...");

      // Get current block number first
      const currentBlock = await publicClient.getBlockNumber();
      console.log(`📊 Current block: ${currentBlock}`);

      // Calculate chunk size (use 500 blocks to be safe, well under 1000 limit)
      const chunkSize = BigInt(500);
      let allLogs: any[] = [];

      // Start from a more recent block if the chain is very long
      // This reduces the number of chunks we need to fetch
      let startBlock =
        currentBlock > BigInt(50000) ? currentBlock - BigInt(50000) : BigInt(0);

      // If the range is still too large, try even smaller range
      if (currentBlock - startBlock > BigInt(10000)) {
        startBlock = currentBlock - BigInt(10000);
        console.log(`⚠️ Range too large, reducing to last 10000 blocks`);
      }

      console.log(
        `🎯 Fetching from block ${startBlock} to ${currentBlock} (${
          currentBlock - startBlock
        } blocks)`
      );

      // Fetch logs in chunks
      let chunkCount = 0;
      for (
        let fromBlock = startBlock;
        fromBlock <= currentBlock;
        fromBlock += chunkSize
      ) {
        const toBlock =
          fromBlock + chunkSize > currentBlock
            ? currentBlock
            : fromBlock + chunkSize;
        chunkCount++;

        try {
          console.log(
            `📦 Fetching chunk ${chunkCount}: blocks ${fromBlock} to ${toBlock}`
          );
          const chunkLogs = await publicClient.getLogs({
            address: GOVERNOR_ADDRESS,
            event: {
              type: "event",
              name: "ProposalCreated",
              inputs: [
                { name: "proposalId", type: "uint256", indexed: false },
                { name: "proposer", type: "address", indexed: false },
                { name: "targets", type: "address[]", indexed: false },
                { name: "values", type: "uint256[]", indexed: false },
                { name: "signatures", type: "string[]", indexed: false },
                { name: "calldatas", type: "bytes[]", indexed: false },
                { name: "voteStart", type: "uint256", indexed: false },
                { name: "voteEnd", type: "uint256", indexed: false },
                { name: "description", type: "string", indexed: false },
              ],
            },
            fromBlock,
            toBlock,
          });

          allLogs = [...allLogs, ...chunkLogs];
          console.log(`✅ Chunk ${chunkCount}: found ${chunkLogs.length} logs`);
        } catch (chunkError) {
          console.error(
            `❌ Failed to fetch chunk ${chunkCount} (blocks ${fromBlock} to ${toBlock}):`,
            chunkError
          );
          // Continue with next chunk instead of failing completely
        }
      }

      console.log(
        `📈 Total logs fetched: ${allLogs.length} from ${chunkCount} chunks`
      );

      // If no logs found and we're not searching from block 0, try a larger range
      if (allLogs.length === 0 && startBlock > BigInt(0)) {
        console.log(
          `🔄 No proposals found in recent blocks, trying larger range...`
        );

        // Try from block 0 with smaller chunks to avoid RPC limits
        const fallbackStartBlock = BigInt(0);
        const fallbackChunkSize = BigInt(200); // Smaller chunks for larger range
        let fallbackLogs: any[] = [];
        let fallbackChunkCount = 0;

        for (
          let fromBlock = fallbackStartBlock;
          fromBlock <= currentBlock;
          fromBlock += fallbackChunkSize
        ) {
          const toBlock =
            fromBlock + fallbackChunkSize > currentBlock
              ? currentBlock
              : fromBlock + fallbackChunkSize;
          fallbackChunkCount++;

          try {
            console.log(
              `🔄 Fallback chunk ${fallbackChunkCount}: blocks ${fromBlock} to ${toBlock}`
            );
            const chunkLogs = await publicClient.getLogs({
              address: GOVERNOR_ADDRESS,
              event: {
                type: "event",
                name: "ProposalCreated",
                inputs: [
                  { name: "proposalId", type: "uint256", indexed: false },
                  { name: "proposer", type: "address", indexed: false },
                  { name: "targets", type: "address[]", indexed: false },
                  { name: "values", type: "uint256[]", indexed: false },
                  { name: "signatures", type: "string[]", indexed: false },
                  { name: "calldatas", type: "bytes[]", indexed: false },
                  { name: "voteStart", type: "uint256", indexed: false },
                  { name: "voteEnd", type: "uint256", indexed: false },
                  { name: "description", type: "string", indexed: false },
                ],
              },
              fromBlock,
              toBlock,
            });

            fallbackLogs = [...fallbackLogs, ...chunkLogs];
            console.log(
              `✅ Fallback chunk ${fallbackChunkCount}: found ${chunkLogs.length} logs`
            );

            // Stop if we found some logs (don't need to search the entire chain)
            if (fallbackLogs.length > 0) {
              console.log(
                `🎉 Found proposals in fallback search, stopping early`
              );
              break;
            }
          } catch (chunkError) {
            console.warn(
              `❌ Fallback chunk ${fallbackChunkCount} failed:`,
              chunkError
            );
            // Continue with next chunk
          }
        }

        if (fallbackLogs.length > 0) {
          allLogs = fallbackLogs;
          console.log(`🔄 Fallback search found ${allLogs.length} logs`);
        }
      }

      const parsedLogs = parseEventLogs({
        abi: GOVERNOR_ABI,
        logs: allLogs,
        eventName: "ProposalCreated",
      });

      console.log(`🔍 Parsed ${parsedLogs.length} proposal events`);

      // Fetch additional data for each proposal
      const proposalPromises = parsedLogs.map(async (log) => {
        const proposalId = log.args.proposalId?.toString();
        if (!proposalId) return null;

        try {
          // Fetch proposal state and votes
          const [state, votes] = await Promise.all([
            publicClient.readContract({
              address: GOVERNOR_ADDRESS,
              abi: GOVERNOR_ABI,
              functionName: "state",
              args: [BigInt(proposalId)],
            }),
            publicClient.readContract({
              address: GOVERNOR_ADDRESS,
              abi: GOVERNOR_ABI,
              functionName: "proposalVotes",
              args: [BigInt(proposalId)],
            }),
          ]);

          // Check if user has voted
          let hasVoted = false;
          if (address) {
            hasVoted = await publicClient.readContract({
              address: GOVERNOR_ADDRESS,
              abi: GOVERNOR_ABI,
              functionName: "hasVoted",
              args: [BigInt(proposalId), address],
            });
          }

          // Map state number to string
          const stateMap = [
            "Pending",
            "Active",
            "Canceled",
            "Defeated",
            "Succeeded",
            "Queued",
            "Expired",
            "Executed",
          ];
          const stateString = stateMap[Number(state)] as Proposal["state"];

          // Format time information
          const proposalStartBlock = log.args.voteStart || BigInt(0);
          const proposalEndBlock = log.args.voteEnd || BigInt(0);

          return {
            id: proposalId,
            proposer: log.args.proposer || "",
            description: log.args.description || "",
            startBlock: proposalStartBlock,
            endBlock: proposalEndBlock,
            state: stateString,
            votesFor: votes[1] || BigInt(0), // forVotes
            votesAgainst: votes[0] || BigInt(0), // againstVotes
            votesAbstain: votes[2] || BigInt(0), // abstainVotes
            hasVoted: Boolean(hasVoted),
            userVote: null, // Would need to query events to get this
            // Formatted time information
            startTime: formatBlockToTime(proposalStartBlock, currentBlock),
            endTime: formatBlockToTime(proposalEndBlock, currentBlock),
            startDate: formatBlockToDate(proposalStartBlock, currentBlock),
            endDate: formatBlockToDate(proposalEndBlock, currentBlock),
            duration: formatDuration(proposalStartBlock, proposalEndBlock),
            timeAgo: formatBlockToTime(proposalStartBlock, currentBlock),
          } as Proposal;
        } catch (err) {
          console.error(`Error fetching proposal ${proposalId} details:`, err);
          return null;
        }
      });

      const proposalResults = await Promise.all(proposalPromises);
      const validProposals = proposalResults.filter(Boolean) as Proposal[];

      console.log(
        `✅ Successfully processed ${validProposals.length} proposals`
      );

      // Sort by proposal ID (newest first)
      validProposals.sort((a, b) => Number(b.id) - Number(a.id));

      console.log(
        `📋 Final proposals:`,
        validProposals.map((p) => ({
          id: p.id,
          state: p.state,
          proposer: p.proposer,
        }))
      );

      // Cache proposals locally
      try {
        localStorage.setItem(
          `proposals_${GOVERNOR_ADDRESS}`,
          JSON.stringify(validProposals)
        );
        console.log(`💾 Cached ${validProposals.length} proposals locally`);
      } catch (err) {
        console.warn("Failed to cache proposals:", err);
      }

      setProposals(validProposals);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch proposals";
      setError(errorMessage);
      console.error("❌ Error fetching proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual proposal
  const fetchProposal = async (
    proposalId: string
  ): Promise<Proposal | null> => {
    try {
      // Get proposal from existing proposals or fetch from events
      const existingProposal = proposals.find((p) => p.id === proposalId);
      if (existingProposal) {
        return existingProposal;
      }

      // If not found, fetch from events (similar to fetchProposals but for single proposal)
      // Use a smaller range for single proposal fetch
      const currentBlock = await publicClient.getBlockNumber();
      const startBlock =
        currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0);

      const logs = await publicClient.getLogs({
        address: GOVERNOR_ADDRESS,
        event: {
          type: "event",
          name: "ProposalCreated",
          inputs: [
            { name: "proposalId", type: "uint256", indexed: false },
            { name: "proposer", type: "address", indexed: false },
            { name: "targets", type: "address[]", indexed: false },
            { name: "values", type: "uint256[]", indexed: false },
            { name: "signatures", type: "string[]", indexed: false },
            { name: "calldatas", type: "bytes[]", indexed: false },
            { name: "voteStart", type: "uint256", indexed: false },
            { name: "voteEnd", type: "uint256", indexed: false },
            { name: "description", type: "string", indexed: false },
          ],
        },
        fromBlock: startBlock,
        toBlock: currentBlock,
      });

      const parsedLogs = parseEventLogs({
        abi: GOVERNOR_ABI,
        logs,
        eventName: "ProposalCreated",
      });

      const proposalLog = parsedLogs.find(
        (log) => log.args.proposalId?.toString() === proposalId
      );
      if (!proposalLog) return null;

      // Fetch state and votes
      const [state, votes] = await Promise.all([
        publicClient.readContract({
          address: GOVERNOR_ADDRESS,
          abi: GOVERNOR_ABI,
          functionName: "state",
          args: [BigInt(proposalId)],
        }),
        publicClient.readContract({
          address: GOVERNOR_ADDRESS,
          abi: GOVERNOR_ABI,
          functionName: "proposalVotes",
          args: [BigInt(proposalId)],
        }),
      ]);

      let hasVoted = false;
      if (address) {
        hasVoted = await publicClient.readContract({
          address: GOVERNOR_ADDRESS,
          abi: GOVERNOR_ABI,
          functionName: "hasVoted",
          args: [BigInt(proposalId), address],
        });
      }

      const stateMap = [
        "Pending",
        "Active",
        "Canceled",
        "Defeated",
        "Succeeded",
        "Queued",
        "Expired",
        "Executed",
      ];
      const stateString = stateMap[Number(state)] as Proposal["state"];

      // Format time information
      const singleStartBlock = proposalLog.args.voteStart || BigInt(0);
      const singleEndBlock = proposalLog.args.voteEnd || BigInt(0);

      return {
        id: proposalId,
        proposer: proposalLog.args.proposer || "",
        description: proposalLog.args.description || "",
        startBlock: singleStartBlock,
        endBlock: singleEndBlock,
        state: stateString,
        votesFor: votes[1] || BigInt(0),
        votesAgainst: votes[0] || BigInt(0),
        votesAbstain: votes[2] || BigInt(0),
        hasVoted: Boolean(hasVoted),
        userVote: null,
        // Formatted time information
        startTime: formatBlockToTime(singleStartBlock, currentBlock),
        endTime: formatBlockToTime(singleEndBlock, currentBlock),
        startDate: formatBlockToDate(singleStartBlock, currentBlock),
        endDate: formatBlockToDate(singleEndBlock, currentBlock),
        duration: formatDuration(singleStartBlock, singleEndBlock),
        timeAgo: formatBlockToTime(singleStartBlock, currentBlock),
      } as Proposal;
    } catch (err) {
      console.error(`Error fetching proposal ${proposalId}:`, err);
      return null;
    }
  };

  // Get proposal state
  const getProposalState = async (proposalId: string) => {
    try {
      return await publicClient.readContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "state",
        args: [BigInt(proposalId)],
      });
    } catch (err) {
      console.error(`Error getting proposal state:`, err);
      return null;
    }
  };

  // Get proposal votes
  const getProposalVotes = async (proposalId: string) => {
    try {
      return await publicClient.readContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "proposalVotes",
        args: [BigInt(proposalId)],
      });
    } catch (err) {
      console.error(`Error getting proposal votes:`, err);
      return null;
    }
  };

  // Check if user has voted
  const hasUserVoted = async (proposalId: string) => {
    if (!address) return false;

    try {
      return await publicClient.readContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "hasVoted",
        args: [BigInt(proposalId), address],
      });
    } catch (err) {
      console.error(`Error checking if user voted:`, err);
      return false;
    }
  };

  // Get quorum for a proposal
  const getQuorum = async (proposalId: string) => {
    try {
      // Get the vote start block from events
      // Use a smaller range for quorum fetch
      const currentBlock = await publicClient.getBlockNumber();
      const startBlock =
        currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0);

      const logs = await publicClient.getLogs({
        address: GOVERNOR_ADDRESS,
        event: {
          type: "event",
          name: "ProposalCreated",
          inputs: [
            { name: "proposalId", type: "uint256", indexed: false },
            { name: "proposer", type: "address", indexed: false },
            { name: "targets", type: "address[]", indexed: false },
            { name: "values", type: "uint256[]", indexed: false },
            { name: "signatures", type: "string[]", indexed: false },
            { name: "calldatas", type: "bytes[]", indexed: false },
            { name: "voteStart", type: "uint256", indexed: false },
            { name: "voteEnd", type: "uint256", indexed: false },
            { name: "description", type: "string", indexed: false },
          ],
        },
        fromBlock: startBlock,
        toBlock: currentBlock,
      });

      const parsedLogs = parseEventLogs({
        abi: GOVERNOR_ABI,
        logs,
        eventName: "ProposalCreated",
      });

      const proposalLog = parsedLogs.find(
        (log) => log.args.proposalId?.toString() === proposalId
      );
      if (!proposalLog || !proposalLog.args.voteStart) return null;

      return await publicClient.readContract({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "quorum",
        args: [proposalLog.args.voteStart],
      });
    } catch (err) {
      console.error(`Error getting quorum:`, err);
      return null;
    }
  };

  // Refresh proposals
  const refreshProposals = async () => {
    await fetchProposals();
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (GOVERNOR_ADDRESS) {
      fetchProposals();
    }
  }, [GOVERNOR_ADDRESS]);

  return {
    proposals,
    loading,
    error,
    proposalCount: proposals.length.toString(),

    // Actions
    fetchProposal,
    getProposalState,
    getProposalVotes,
    hasUserVoted,
    getQuorum,
    refreshProposals,
  };
}
