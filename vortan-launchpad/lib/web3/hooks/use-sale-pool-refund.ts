"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";
import { toast } from "react-toastify";

interface RefundInfo {
  canRefund: boolean;
  refunded: boolean;
  purchasedAmount: string;
}

export function useSalePoolRefund(saleAddress: string) {
  const { address, isConnected } = useAccount();

  // Transaction state
  const [refundTxHash, setRefundTxHash] = useState<`0x${string}` | undefined>();

  // Contract write functions
  const { writeContract: writeRefund, isPending: isRefundPending } =
    useWriteContract();

  // Transaction receipts
  const { isLoading: isRefundTxLoading } = useWaitForTransactionReceipt({
    hash: refundTxHash,
  });

  // Read user info to check if they can refund
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "userInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!saleAddress && !!address,
    },
  });

  // Read sale stats to check if sale failed
  const { data: saleStats } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "saleStats",
    query: {
      enabled: !!saleAddress,
    },
  });

  // Transform refund info
  const refundInfo: RefundInfo | null =
    userInfo && saleStats
      ? {
          canRefund: !saleStats[4] && saleStats[3], // not successful but finalized
          refunded: userInfo[0]?.toString() === "0", // purchasedBase is 0 if refunded
          purchasedAmount: userInfo[0]?.toString() || "0", // purchasedBase amount
        }
      : null;

  const claimRefund = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!refundInfo?.canRefund) {
      toast.error("No refund available");
      return;
    }

    try {
      toast.info("Processing refund...");
      writeRefund({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "refundIfSoftcapFailed",
      });
      toast.success("Refund initiated!");
      refetchUserInfo();
    } catch (error) {
      toast.error(
        `Refund failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return {
    // Data
    refundInfo,

    // Actions
    claimRefund,

    // Loading states
    isRefundPending: isRefundPending || isRefundTxLoading,

    // Transaction hash
    refundTxHash,

    // Refetch functions
    refetchUserInfo,
  };
}



