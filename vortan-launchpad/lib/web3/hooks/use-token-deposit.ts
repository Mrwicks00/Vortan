"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";
import { parseUnits } from "viem";
import { toast } from "react-toastify";

interface DepositParams {
  salePoolAddress: string;
  amount: string;
  decimals: number;
}

export function useTokenDeposit() {
  const { address, isConnected } = useAccount();
  const [depositTxHash, setDepositTxHash] = useState<
    `0x${string}` | undefined
  >();

  const { writeContract: writeDeposit, isPending: isDepositPending } =
    useWriteContract();

  const { isLoading: isDepositTxLoading } = useWaitForTransactionReceipt({
    hash: depositTxHash,
    onSuccess: (receipt) => {
      console.log("🎉 Deposit transaction confirmed:", receipt);
      toast.success("Tokens deposited successfully!");
      setDepositTxHash(undefined);
    },
    onError: (error) => {
      console.error("❌ Deposit transaction failed:", error);
      toast.error(`Deposit transaction failed: ${error.message}`);
      setDepositTxHash(undefined);
    },
  });

  const depositTokens = async ({
    salePoolAddress,
    amount,
    decimals,
  }: DepositParams) => {
    console.log("🔍 Deposit Debug Info:", {
      isConnected,
      address,
      salePoolAddress,
      amount,
      decimals,
      parsedAmount: parseUnits(amount, decimals).toString(),
    });

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!salePoolAddress || !amount || !decimals) {
      toast.error("Missing required parameters for deposit");
      console.error("❌ Missing parameters:", {
        salePoolAddress,
        amount,
        decimals,
      });
      return;
    }

    try {
      toast.info("Depositing tokens...");
      console.log("📤 Attempting deposit with:", {
        address: salePoolAddress as `0x${string}`,
        functionName: "depositSaleTokens",
        args: [parseUnits(amount, decimals)],
      });

      const hash = await writeDeposit({
        address: salePoolAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "depositSaleTokens",
        args: [parseUnits(amount, decimals)],
      });

      console.log("✅ Deposit transaction submitted:", hash);
      setDepositTxHash(hash);
    } catch (error) {
      console.error("❌ Deposit failed:", error);

      // More detailed error handling
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Parse common error messages
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for gas fees";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("execution reverted")) {
          errorMessage =
            "Transaction reverted - check token balance and allowance";
        }
      }

      toast.error(`Deposit failed: ${errorMessage}`);
    }
  };

  return {
    depositTokens,
    isDepositPending,
    isDepositTxLoading,
    isDepositing: isDepositPending || isDepositTxLoading,
  };
}
