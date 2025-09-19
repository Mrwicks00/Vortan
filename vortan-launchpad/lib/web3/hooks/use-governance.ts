import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { GOVERNOR_ABI } from "@/lib/web3/abis/governor";
import { CONTRACT_ADDRESSES } from "@/lib/web3/config/addresses";
import { toast } from "react-toastify";

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
}

interface ProposalInput {
  targets: string[];
  values: bigint[];
  calldatas: string[];
  description: string;
}

export function useGovernance() {
  const { address, isConnected } = useAccount();

  // Contract address from configuration
  const GOVERNOR_ADDRESS = CONTRACT_ADDRESSES.GOVERNOR as `0x${string}`;

  // Transaction states
  const [proposeTxHash, setProposeTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [voteTxHash, setVoteTxHash] = useState<`0x${string}` | undefined>();
  const [executeTxHash, setExecuteTxHash] = useState<
    `0x${string}` | undefined
  >();

  // Contract write functions
  const { writeContract: writePropose, isPending: isProposePending } =
    useWriteContract();
  const { writeContract: writeVote, isPending: isVotePending } =
    useWriteContract();
  const { writeContract: writeExecute, isPending: isExecutePending } =
    useWriteContract();

  // Transaction receipts
  const { isLoading: isProposeTxLoading } = useWaitForTransactionReceipt({
    hash: proposeTxHash,
    onSuccess: () => {
      toast.success("Proposal created successfully!");
      setProposeTxHash(undefined);
    },
    onError: (error) => {
      toast.error(`Proposal creation failed: ${error.message}`);
      setProposeTxHash(undefined);
    },
  });

  const { isLoading: isVoteTxLoading } = useWaitForTransactionReceipt({
    hash: voteTxHash,
    onSuccess: () => {
      toast.success("Vote cast successfully!");
      setVoteTxHash(undefined);
    },
    onError: (error) => {
      toast.error(`Vote failed: ${error.message}`);
      setVoteTxHash(undefined);
    },
  });

  const { isLoading: isExecuteTxLoading } = useWaitForTransactionReceipt({
    hash: executeTxHash,
    onSuccess: () => {
      toast.success("Proposal executed successfully!");
      setExecuteTxHash(undefined);
    },
    onError: (error) => {
      toast.error(`Execution failed: ${error.message}`);
      setExecuteTxHash(undefined);
    },
  });

  // Read governance settings
  const { data: votingDelay } = useReadContract({
    address: GOVERNOR_ADDRESS,
    abi: GOVERNOR_ABI,
    functionName: "votingDelay",
    query: { enabled: !!GOVERNOR_ADDRESS },
  });

  const { data: votingPeriod } = useReadContract({
    address: GOVERNOR_ADDRESS,
    abi: GOVERNOR_ABI,
    functionName: "votingPeriod",
    query: { enabled: !!GOVERNOR_ADDRESS },
  });

  const { data: proposalThreshold } = useReadContract({
    address: GOVERNOR_ADDRESS,
    abi: GOVERNOR_ABI,
    functionName: "proposalThreshold",
    query: { enabled: !!GOVERNOR_ADDRESS },
  });

  // Read user's voting power
  const { data: userVotingPower, refetch: refetchVotingPower } =
    useReadContract({
      address: GOVERNOR_ADDRESS,
      abi: GOVERNOR_ABI,
      functionName: "getVotes",
      args: [address!, BigInt(0)], // Current block
      query: { enabled: !!address && !!GOVERNOR_ADDRESS },
    });

  // Actions
  const createProposal = async (proposalInput: ProposalInput) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.info("Creating proposal...");
      const hash = await writePropose({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "propose",
        args: [
          proposalInput.targets,
          proposalInput.values,
          proposalInput.calldatas,
          proposalInput.description,
        ],
      });
      setProposeTxHash(hash);
    } catch (error) {
      toast.error(
        `Proposal creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const castVote = async (proposalId: string, support: 0 | 1 | 2) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.info("Casting vote...");
      const hash = await writeVote({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "castVote",
        args: [BigInt(proposalId), support],
      });
      setVoteTxHash(hash);
    } catch (error) {
      toast.error(
        `Vote failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const executeProposal = async (proposalInput: ProposalInput) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.info("Executing proposal...");
      const hash = await writeExecute({
        address: GOVERNOR_ADDRESS,
        abi: GOVERNOR_ABI,
        functionName: "execute",
        args: [
          proposalInput.targets,
          proposalInput.values,
          proposalInput.calldatas,
          proposalInput.description,
        ],
      });
      setExecuteTxHash(hash);
    } catch (error) {
      toast.error(
        `Execution failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return {
    // Contract address
    governorAddress: GOVERNOR_ADDRESS,

    // Settings
    votingDelay: votingDelay?.toString(),
    votingPeriod: votingPeriod?.toString(),
    proposalThreshold: proposalThreshold?.toString(),

    // User data
    userVotingPower: userVotingPower?.toString(),

    // Actions
    createProposal,
    castVote,
    executeProposal,

    // Loading states
    isProposePending: isProposePending || isProposeTxLoading,
    isVotePending: isVotePending || isVoteTxLoading,
    isExecutePending: isExecutePending || isExecuteTxLoading,

    // Transaction hashes
    proposeTxHash,
    voteTxHash,
    executeTxHash,

    // Refetch functions
    refetchVotingPower,
  };
}
