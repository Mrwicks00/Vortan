"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useSalePoolUser } from "@/lib/web3/hooks/use-sale-pool-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Clock, Percent, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { formatUnits } from "viem";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";

interface ClaimsPanelProps {
  saleAddress: string;
  sale: {
    tgeTime: number;
    tgeBps: number; // basis points (1000 = 10%)
    vestDuration: number;
  };
}

export function ClaimsPanel({ saleAddress, sale }: ClaimsPanelProps) {
  const { isConnected, address } = useAccount();
  const { userInfo, isLoading: isUserInfoLoading } =
    useSalePoolUser(saleAddress);

  // Contract write functions with proper hash management
  const {
    writeContract: writeClaimTGE,
    isPending: isClaimTGEPending,
    data: tgeHash,
  } = useWriteContract();
  const {
    writeContract: writeClaimVested,
    isPending: isClaimVestedPending,
    data: vestedHash,
  } = useWriteContract();

  // Transaction receipts with proper hash management
  const { isLoading: isTgeTxLoading, isSuccess: isTgeSuccess } =
    useWaitForTransactionReceipt({
      hash: tgeHash,
    });

  const { isLoading: isVestedTxLoading, isSuccess: isVestedSuccess } =
    useWaitForTransactionReceipt({
      hash: vestedHash,
    });

  // Handle TGE claim transaction success
  useEffect(() => {
    if (tgeHash && isTgeSuccess) {
      toast.success("TGE tokens claimed successfully!");
      // Refresh user data
      window.location.reload(); // Simple refresh for now
    }
  }, [tgeHash, isTgeSuccess]);

  // Handle vested claim transaction success
  useEffect(() => {
    if (vestedHash && isVestedSuccess) {
      toast.success("Vested tokens claimed successfully!");
      // Refresh user data
      window.location.reload(); // Simple refresh for now
    }
  }, [vestedHash, isVestedSuccess]);

  // Get user purchase data from contract
  const userPurchased = userInfo ? parseFloat(userInfo.purchasedTokens) : 0;
  const tgePercentage = sale.tgeBps / 100; // Convert basis points to percentage
  const tgeAmount = (userPurchased * tgePercentage) / 100;
  const vestAmount = userPurchased - tgeAmount;

  const now = Math.floor(Date.now() / 1000);
  const tgeUnlocked = now >= sale.tgeTime;
  const vestStartTime = sale.tgeTime;
  const vestEndTime = vestStartTime + sale.vestDuration;
  const vestProgress = Math.min(
    100,
    Math.max(0, ((now - vestStartTime) / sale.vestDuration) * 100)
  );
  const vestedAmount = (vestAmount * vestProgress) / 100;
  const claimableVested = tgeUnlocked ? vestedAmount : 0;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.floor(num));
  };

  const handleClaimTGE = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.loading("Claiming TGE tokens...", { toastId: "claim-tge-loading" });
      await writeClaimTGE({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "claimTGE",
      });
      // Success toast and data refresh handled by useEffect
    } catch (error) {
      toast.dismiss("claim-tge-loading");
      toast.error(
        `Failed to claim TGE: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleClaimVested = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.loading("Claiming vested tokens...", {
        toastId: "claim-vested-loading",
      });
      await writeClaimVested({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "claimVested",
      });
      // Success toast and data refresh handled by useEffect
    } catch (error) {
      toast.dismiss("claim-vested-loading");
      toast.error(
        `Failed to claim vested tokens: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <Gift className="h-5 w-5 text-accent" />
            <span>Token Claims</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Connect your wallet to view and claim your tokens
          </p>
          <Badge variant="outline" className="text-sm">
            Connect Wallet
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while fetching user data
  if (isUserInfoLoading) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <Gift className="h-5 w-5 text-accent" />
            <span>Token Claims</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/10 rounded-lg p-4 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user hasn't purchased any tokens
  if (userPurchased === 0) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center space-x-2">
            <Gift className="h-5 w-5 text-accent" />
            <span>Token Claims</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            You haven't purchased any tokens in this sale yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <Gift className="h-5 w-5 text-accent" />
          <span>Token Claims</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Purchase Summary */}
        <div className="bg-muted/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Purchase:</span>
            <span className="font-semibold">
              {formatNumber(userPurchased)} tokens
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              TGE Amount ({tgePercentage}%):
            </span>
            <span className="font-semibold text-accent">
              {formatNumber(tgeAmount)} tokens
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vesting Amount:</span>
            <span className="font-semibold text-secondary">
              {formatNumber(vestAmount)} tokens
            </span>
          </div>
        </div>

        <Separator />

        {/* TGE Claim */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-accent" />
              <span className="font-medium">TGE Claim</span>
            </div>
            <Badge variant={tgeUnlocked ? "default" : "secondary"}>
              {tgeUnlocked ? "Available" : "Locked"}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Claimable:</span>
              <span className="font-medium">
                {formatNumber(
                  tgeUnlocked && !userInfo?.tgeClaimed ? tgeAmount : 0
                )}{" "}
                tokens
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={
                  userInfo?.tgeClaimed
                    ? "default"
                    : tgeUnlocked
                    ? "secondary"
                    : "outline"
                }
                className="text-xs"
              >
                {userInfo?.tgeClaimed
                  ? "Claimed"
                  : tgeUnlocked
                  ? "Available"
                  : "Locked"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">TGE Date:</span>
              <span className="font-medium">{formatDate(sale.tgeTime)}</span>
            </div>
          </div>

          <Button
            onClick={handleClaimTGE}
            disabled={
              !tgeUnlocked ||
              tgeAmount === 0 ||
              userInfo?.tgeClaimed ||
              isClaimTGEPending ||
              isTgeTxLoading
            }
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            {isClaimTGEPending || isTgeTxLoading
              ? "Claiming..."
              : userInfo?.tgeClaimed
              ? "Already Claimed"
              : `Claim TGE (${formatNumber(tgeAmount)} tokens)`}
          </Button>
        </div>

        <Separator />

        {/* Vesting Claim */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="font-medium">Vesting Claim</span>
            </div>
            <Badge variant={claimableVested > 0 ? "default" : "secondary"}>
              {claimableVested > 0 ? "Available" : "Vesting"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vesting Progress:</span>
                <span className="font-medium">{vestProgress.toFixed(1)}%</span>
              </div>
              <Progress value={vestProgress} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Claimable Now:</span>
                <span className="font-medium">
                  {formatNumber(claimableVested)} tokens
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Vesting:</span>
                <span className="font-medium">
                  {formatNumber(vestAmount)} tokens
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vest End:</span>
                <span className="font-medium">{formatDate(vestEndTime)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleClaimVested}
            disabled={
              claimableVested === 0 || isClaimVestedPending || isVestedTxLoading
            }
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
          >
            {isClaimVestedPending || isVestedTxLoading
              ? "Claiming..."
              : `Claim Vested (${formatNumber(claimableVested)} tokens)`}
          </Button>
        </div>

        {/* Vesting Schedule Info */}
        <div className="bg-muted/10 rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-medium">Vesting Schedule</h4>
          <p className="text-muted-foreground">
            • {tgePercentage}% unlocked at TGE ({formatDate(sale.tgeTime)})
          </p>
          <p className="text-muted-foreground">
            • Remaining {100 - tgePercentage}% vests linearly over{" "}
            {Math.floor(sale.vestDuration / (30 * 24 * 3600))} months
          </p>
          <p className="text-muted-foreground">
            • Tokens can be claimed at any time during vesting period
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
