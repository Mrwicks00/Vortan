import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { FAUCET_ABI } from "@/lib/web3/abis/faucet";
import { CONTRACT_ADDRESSES } from "@/lib/web3/config/addresses";
import { toast } from "react-toastify";

interface FaucetInfo {
  hasClaimed: boolean;
  vortToken: string;
  somiToken: string;
  usdcToken: string;
}

interface TokenBalances {
  vortBalance: string;
  somiBalance: string;
  usdcBalance: string;
}

export function useFaucet() {
  const { address, isConnected } = useAccount();

  // Contract address from configuration
  const FAUCET_ADDRESS = CONTRACT_ADDRESSES.FAUCET as `0x${string}`;

  // Transaction state
  const [claimTxHash, setClaimTxHash] = useState<`0x${string}` | undefined>();

  // Contract write function
  const { writeContract: writeClaim, isPending: isClaimPending } =
    useWriteContract();

  // Transaction receipt
  const { isLoading: isClaimTxLoading } = useWaitForTransactionReceipt({
    hash: claimTxHash,
    onSuccess: () => {
      toast.success("Tokens claimed successfully!");
      setClaimTxHash(undefined);
    },
    onError: (error) => {
      toast.error(`Token claim failed: ${error.message}`);
      setClaimTxHash(undefined);
    },
  });

  // Read faucet info
  const { data: hasClaimed, refetch: refetchHasClaimed } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "hasClaimed",
    args: [address!],
    query: { enabled: !!address && !!FAUCET_ADDRESS },
  });

  // Read token addresses from faucet
  const { data: vortTokenAddress } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "vortToken",
    query: { enabled: !!FAUCET_ADDRESS },
  });

  const { data: somiTokenAddress } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "somiToken",
    query: { enabled: !!FAUCET_ADDRESS },
  });

  const { data: usdcTokenAddress } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "usdcToken",
    query: { enabled: !!FAUCET_ADDRESS },
  });

  // Read user's current token balances
  const { data: vortBalance, refetch: refetchVortBalance } = useReadContract({
    address: vortTokenAddress as `0x${string}`,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address && !!vortTokenAddress },
  });

  const { data: somiBalance, refetch: refetchSomiBalance } = useReadContract({
    address: somiTokenAddress as `0x${string}`,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address && !!somiTokenAddress },
  });

  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: usdcTokenAddress as `0x${string}`,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address && !!usdcTokenAddress },
  });

  // Transform faucet info
  const faucetInfo: FaucetInfo | null =
    hasClaimed !== undefined
      ? {
          hasClaimed: Boolean(hasClaimed),
          vortToken: vortTokenAddress || "",
          somiToken: somiTokenAddress || "",
          usdcToken: usdcTokenAddress || "",
        }
      : null;

  // Transform token balances
  const tokenBalances: TokenBalances | null = {
    vortBalance: vortBalance?.toString() || "0",
    somiBalance: somiBalance?.toString() || "0",
    usdcBalance: usdcBalance?.toString() || "0",
  };

  // Actions
  const claimTokens = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (hasClaimed) {
      toast.error("You have already claimed tokens from the faucet");
      return;
    }

    try {
      toast.info("Claiming tokens from faucet...");
      const hash = await writeClaim({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: "claimTokens",
      });
      setClaimTxHash(hash);
    } catch (error) {
      toast.error(
        `Token claim failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      refetchHasClaimed(),
      refetchVortBalance(),
      refetchSomiBalance(),
      refetchUsdcBalance(),
    ]);
  };

  return {
    // Contract address
    faucetAddress: FAUCET_ADDRESS,

    // Data
    faucetInfo,
    tokenBalances,

    // Actions
    claimTokens,

    // Loading states
    isClaimPending: isClaimPending || isClaimTxLoading,

    // Transaction hash
    claimTxHash,

    // Refetch functions
    refreshData,
  };
}


