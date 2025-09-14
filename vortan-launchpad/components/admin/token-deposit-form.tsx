"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTokenDeposit } from "@/lib/web3/hooks/use-token-deposit";
import { useAccount, useReadContract } from "wagmi";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";
import { formatEther } from "viem";
import { toast } from "react-toastify";

interface TokenDepositFormProps {
  saleAddress: string;
  saleTokenAddress: string;
  projectOwner: string;
}

export function TokenDepositForm({
  saleAddress,
  saleTokenAddress,
  projectOwner,
}: TokenDepositFormProps) {
  const [amount, setAmount] = useState("");
  const { address, isConnected } = useAccount();
  const { depositTokens, isDepositing } = useTokenDeposit();

  // Get required deposit amount
  const { data: requiredDeposit } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "requiredDepositTokens",
    query: {
      enabled: !!saleAddress,
    },
  });

  // Get user's token balance
  const { data: tokenBalance } = useReadContract({
    address: saleTokenAddress as `0x${string}`,
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
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!saleTokenAddress,
    },
  });

  // Get remaining required tokens
  const { data: remainingRequired } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "remainingRequiredTokens",
    query: {
      enabled: !!saleAddress,
    },
  });

  // Check if user is project owner
  const isProjectOwner =
    address && address.toLowerCase() === projectOwner.toLowerCase();

  // Get contract parameters for debugging
  const { data: hardCapBase } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "hardCapBase",
    query: { enabled: !!saleAddress },
  });

  const { data: priceNum } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "priceNum",
    query: { enabled: !!saleAddress },
  });

  const { data: priceDen } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "priceDen",
    query: { enabled: !!saleAddress },
  });

  // Debug logging
  console.log("TokenDepositForm Debug:", {
    address,
    projectOwner,
    isProjectOwner,
    isConnected,
    saleAddress,
    contractParams: {
      hardCapBase: hardCapBase ? hardCapBase.toString() : null,
      priceNum: priceNum ? priceNum.toString() : null,
      priceDen: priceDen ? priceDen.toString() : null,
    },
    requiredDeposit: requiredDeposit
      ? {
          tokensForSale: formatEther(requiredDeposit[0] as bigint),
          feeTokens: formatEther(requiredDeposit[1] as bigint),
          totalRequired: formatEther(requiredDeposit[2] as bigint),
        }
      : null,
    remainingRequired: remainingRequired
      ? formatEther(remainingRequired as bigint)
      : null,
  });

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if user has enough tokens
    if (
      tokenBalance &&
      parseFloat(amount) > parseFloat(formatEther(tokenBalance as bigint))
    ) {
      toast.error("Insufficient token balance");
      return;
    }

    await depositTokens({
      saleToken: saleAddress, // The SalePool contract
      amount,
      decimals: 18, // Assuming 18 decimals for sale tokens
    });
  };

  if (!isProjectOwner) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Only the project owner can deposit tokens for this sale.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle>Deposit Sale Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Required tokens:{" "}
            {requiredDeposit
              ? `${(requiredDeposit[2] as bigint).toString()} sale tokens`
              : "Loading..."}
          </p>
          <p className="text-sm text-muted-foreground">
            Remaining required:{" "}
            {remainingRequired
              ? `${(remainingRequired as bigint).toString()} sale tokens`
              : "Loading..."}
          </p>
          <p className="text-sm text-muted-foreground">
            Your balance:{" "}
            {tokenBalance
              ? `${(tokenBalance as bigint).toString()} sale tokens`
              : "Loading..."}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount to Deposit</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button
          onClick={handleDeposit}
          disabled={
            !amount ||
            parseFloat(amount) <= 0 ||
            isDepositing ||
            (tokenBalance &&
              parseFloat(amount) >
                parseFloat(formatEther(tokenBalance as bigint)))
          }
          className="w-full"
        >
          {isDepositing
            ? "Depositing..."
            : tokenBalance &&
              parseFloat(amount) >
                parseFloat(formatEther(tokenBalance as bigint))
            ? "Insufficient Balance"
            : "Deposit Tokens"}
        </Button>
      </CardContent>
    </Card>
  );
}
