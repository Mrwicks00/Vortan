"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTokenDeposit } from "@/lib/web3/hooks/use-token-deposit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";
import { formatEther, formatUnits, parseUnits } from "viem";
import { toast } from "react-toastify";

// ERC20 ABI for token metadata
const ERC20_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Helper function to format numbers with commas
function formatNumber(num: string | number): string {
  const numStr = typeof num === "string" ? num : num.toString();
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

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

  // Approval functionality
  const { writeContract: writeApprove, isPending: isApprovePending } =
    useWriteContract();
  const [approveTxHash, setApproveTxHash] = useState<
    `0x${string}` | undefined
  >();

  const {
    isLoading: isApproveTxLoading,
    data: approveReceipt,
    error: approveError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    onSuccess: async (receipt) => {
      console.log("🎉 Approval transaction confirmed:", receipt);
      toast.success("Token approval successful!");

      // Refetch allowance to update UI
      await refetchAllowance();

      setApproveTxHash(undefined);
    },
    onError: (error) => {
      console.error("❌ Approval transaction failed:", error);
      toast.error(`Approval failed: ${error.message}`);
      setApproveTxHash(undefined);
    },
  });

  // Debug approval transaction state
  console.log("🔍 Approval transaction state:", {
    approveTxHash,
    isApproveTxLoading,
    approveReceipt: approveReceipt ? "confirmed" : "pending",
    approveError,
  });

  // Get required deposit amount
  const { data: requiredDeposit } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "requiredDepositTokens",
    query: {
      enabled: !!saleAddress,
    },
  });

  // Get token metadata
  const { data: tokenName } = useReadContract({
    address: saleTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "name",
    query: { enabled: !!saleTokenAddress },
  });

  const { data: tokenSymbol } = useReadContract({
    address: saleTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!saleTokenAddress },
  });

  // Get user's token balance
  const { data: tokenBalance } = useReadContract({
    address: saleTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!saleTokenAddress,
    },
  });

  // Fetch token decimals
  const { data: tokenDecimals } = useReadContract({
    address: saleTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!saleTokenAddress,
    },
  });

  // Check token allowance for the SalePool contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: saleTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, saleAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!saleTokenAddress && !!saleAddress,
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

  // Check if user has sufficient balance
  const decimals = tokenDecimals ? Number(tokenDecimals) : 18; // Default to 18 if not available
  const userBalance = tokenBalance
    ? formatUnits(tokenBalance as bigint, decimals)
    : "0";
  const depositAmount = amount ? parseFloat(amount) : 0;
  const remainingRequiredAmount = remainingRequired
    ? parseFloat(formatUnits(remainingRequired as bigint, decimals))
    : 0;

  // Check if user has sufficient allowance
  const allowanceAmount = allowance
    ? parseFloat(formatUnits(allowance as bigint, decimals))
    : 0;
  const hasSufficientAllowance = allowanceAmount >= depositAmount;

  // User needs sufficient balance AND the amount shouldn't exceed remaining required
  const hasSufficientBalance =
    depositAmount > 0 &&
    parseFloat(userBalance) >= depositAmount &&
    depositAmount <= remainingRequiredAmount;

  // Debug logging
  console.log("TokenDepositForm Debug:", {
    address,
    projectOwner,
    isProjectOwner,
    isConnected,
    saleAddress,
    saleTokenAddress,
    tokenBalance,
    tokenDecimals,
    decimals,
    userBalance,
    allowanceAmount,
    hasSufficientAllowance,
    depositAmount,
    remainingRequiredAmount,
    hasSufficientBalance,
    amount,
    requiredDeposit: requiredDeposit
      ? {
          tokensForSale: formatUnits(requiredDeposit[0] as bigint, decimals),
          feeTokens: formatUnits(requiredDeposit[1] as bigint, decimals),
          totalRequired: formatUnits(requiredDeposit[2] as bigint, decimals),
        }
      : null,
    remainingRequired: remainingRequired
      ? formatUnits(remainingRequired as bigint, decimals)
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
      parseFloat(amount) >
        parseFloat(formatUnits(tokenBalance as bigint, decimals))
    ) {
      toast.error("Insufficient token balance");
      return;
    }

    try {
      console.log("🚀 Starting deposit process...");
      await depositTokens({
        salePoolAddress: saleAddress, // The SalePool contract
        amount,
        decimals: decimals, // Use actual token decimals
      });
    } catch (error) {
      console.error("❌ Deposit process failed:", error);
      toast.error("Failed to initiate deposit transaction");
    }
  };

  const handleApprove = async () => {
    console.log("🔐 handleApprove called");

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount first");
      return;
    }

    if (!saleTokenAddress || !saleAddress || !decimals) {
      toast.error("Missing required contract information");
      console.error("❌ Missing contract info:", {
        saleTokenAddress,
        saleAddress,
        decimals,
      });
      return;
    }

    try {
      console.log("🔐 Approving tokens...");
      console.log("🔍 Approval debug info:", {
        isConnected,
        address,
        saleTokenAddress,
        saleAddress,
        amount,
        decimals,
        approveAmount: parseUnits(amount, decimals).toString(),
      });

      toast.info("Approving tokens...");

      const approveAmount = parseUnits(amount, decimals);

      console.log("📤 Calling writeApprove with:", {
        address: saleTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [saleAddress as `0x${string}`, approveAmount],
      });

      const hash = await writeApprove({
        address: saleTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [saleAddress as `0x${string}`, approveAmount],
      });

      console.log("✅ Approval transaction submitted:", hash);
      console.log("🔍 Hash type:", typeof hash, "Hash value:", hash);

      if (hash) {
        setApproveTxHash(hash);

        // Set a timeout to reset state if transaction gets stuck
        setTimeout(() => {
          if (approveTxHash === hash) {
            console.warn("⚠️ Approval transaction timeout - resetting state");
            setApproveTxHash(undefined);
            toast.warning(
              "Approval transaction is taking longer than expected. Please check your wallet."
            );
          }
        }, 60000); // 60 seconds timeout
      } else {
        console.error("❌ No transaction hash returned");
        toast.error("Failed to get transaction hash");
      }
    } catch (error) {
      console.error("❌ Approval failed:", error);
      toast.error(
        `Approval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
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
        <CardTitle>
          Deposit Sale Tokens
          {tokenName && tokenSymbol && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({tokenName} - {tokenSymbol})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Required tokens:{" "}
            {requiredDeposit
              ? `${formatNumber(
                  formatUnits(requiredDeposit[2] as bigint, decimals)
                )} ${tokenSymbol || "tokens"}`
              : "Loading..."}
          </p>
          <p className="text-sm text-muted-foreground">
            Remaining required:{" "}
            {remainingRequired
              ? `${formatNumber(
                  formatUnits(remainingRequired as bigint, decimals)
                )} ${tokenSymbol || "tokens"}`
              : "Loading..."}
          </p>
          <p className="text-sm text-muted-foreground">
            Your balance:{" "}
            <span
              className={
                hasSufficientBalance ? "text-green-500" : "text-orange-500"
              }
            >
              {tokenBalance
                ? `${formatNumber(
                    formatUnits(tokenBalance as bigint, decimals)
                  )} ${tokenSymbol || "tokens"}`
                : "Loading..."}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Allowance:{" "}
            <span
              className={
                hasSufficientAllowance ? "text-green-500" : "text-orange-500"
              }
            >
              {allowance
                ? `${formatNumber(
                    formatUnits(allowance as bigint, decimals)
                  )} ${tokenSymbol || "tokens"}`
                : "Loading..."}
            </span>
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

        {!hasSufficientAllowance ? (
          <Button
            onClick={handleApprove}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              isApprovePending ||
              isApproveTxLoading
            }
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            {isApprovePending || isApproveTxLoading
              ? "Approving..."
              : "Approve Tokens"}
          </Button>
        ) : (
          <Button
            onClick={handleDeposit}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              isDepositing ||
              !hasSufficientBalance
            }
            className="w-full"
          >
            {isDepositing
              ? "Depositing..."
              : !hasSufficientBalance
              ? depositAmount > remainingRequiredAmount
                ? "Amount Exceeds Required"
                : "Insufficient Balance"
              : "Deposit Tokens"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
