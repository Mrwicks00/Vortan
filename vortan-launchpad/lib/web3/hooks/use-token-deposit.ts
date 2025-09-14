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
  saleToken: string;
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
    onSuccess: () => {
      toast.success("Tokens deposited successfully!");
      setDepositTxHash(undefined);
    },
    onError: (error) => {
      toast.error(`Deposit failed: ${error.message}`);
      setDepositTxHash(undefined);
    },
  });

  const depositTokens = async ({
    saleToken,
    amount,
    decimals,
  }: DepositParams) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.info("Depositing tokens...");
      const hash = await writeDeposit({
        address: saleToken as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "depositSaleTokens",
        args: [parseUnits(amount, decimals)],
      });
      setDepositTxHash(hash);
    } catch (error) {
      toast.error(
        `Deposit failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return {
    depositTokens,
    isDepositPending,
    isDepositTxLoading,
    isDepositing: isDepositPending || isDepositTxLoading,
  };
}
