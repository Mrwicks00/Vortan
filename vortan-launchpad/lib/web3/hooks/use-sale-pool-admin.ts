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

interface SaleStats {
  totalRaisedBase: string;
  totalTokensSold: string;
  totalSaleTokensDeposited: string;
  finalized: boolean;
  successful: boolean;
}

interface SaleStatus {
  status: "Unfunded" | "Upcoming" | "Live" | "SoldOut" | "Ended";
}

export function useSalePoolAdmin(saleAddress: string) {
  const { address, isConnected } = useAccount();

  // Transaction state
  const [finalizeTxHash, setFinalizeTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [withdrawTxHash, setWithdrawTxHash] = useState<
    `0x${string}` | undefined
  >();

  // Contract write functions
  const { writeContract: writeFinalize, isPending: isFinalizePending } =
    useWriteContract();
  const { writeContract: writeWithdraw, isPending: isWithdrawPending } =
    useWriteContract();

  // Transaction receipts
  const { isLoading: isFinalizeTxLoading } = useWaitForTransactionReceipt({
    hash: finalizeTxHash,
  });

  const { isLoading: isWithdrawTxLoading } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  });

  // Read sale stats
  const { data: saleStats, refetch: refetchSaleStats } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "saleStats",
    query: {
      enabled: !!saleAddress,
    },
  });

  // Read sale status
  const { data: saleStatus, refetch: refetchSaleStatus } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "status",
    query: {
      enabled: !!saleAddress,
    },
  });

  // Transform sale stats data
  const transformedStats: SaleStats | null = saleStats
    ? {
        totalRaisedBase: saleStats[0]?.toString() || "0",
        totalTokensSold: saleStats[1]?.toString() || "0",
        totalSaleTokensDeposited: saleStats[2]?.toString() || "0",
        finalized: saleStats[3] || false,
        successful: saleStats[4] || false,
      }
    : null;

  // Transform sale status data
  const transformedStatus: SaleStatus | null = saleStatus
    ? {
        status: ["Unfunded", "Upcoming", "Live", "SoldOut", "Ended"][
          Number(saleStatus)
        ] as "Unfunded" | "Upcoming" | "Live" | "SoldOut" | "Ended",
      }
    : null;

  const finalizeSale = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      toast.info("Finalizing sale...");
      writeFinalize({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "finalize",
      });
      toast.success("Sale finalization initiated!");
      refetchSaleStats();
      refetchSaleStatus();
    } catch (error) {
      toast.error(
        `Finalization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const withdrawUnsoldTokens = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      toast.info("Withdrawing unsold tokens...");
      writeWithdraw({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "withdrawUnsoldTokens",
      });
      toast.success("Withdrawal initiated!");
      refetchSaleStats();
    } catch (error) {
      toast.error(
        `Withdrawal failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Update transaction hashes when write functions are called
  const handleFinalize = async () => {
    try {
      await finalizeSale();
    } catch (error) {
      console.error("Finalize error:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawUnsoldTokens();
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  return {
    // Data
    saleStats: transformedStats,
    saleStatus: transformedStatus,

    // Actions
    finalizeSale: handleFinalize,
    withdrawUnsoldTokens: handleWithdraw,

    // Loading states
    isFinalizePending: isFinalizePending || isFinalizeTxLoading,
    isWithdrawPending: isWithdrawPending || isWithdrawTxLoading,

    // Transaction hashes
    finalizeTxHash,
    withdrawTxHash,

    // Refetch functions
    refetchSaleStats,
    refetchSaleStatus,
  };
}



