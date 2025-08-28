"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { TierSummaryCard } from "@/components/staking/tier-summary-card";
import { StakeCard } from "@/components/staking/stake-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Wallet } from "lucide-react";
import { useDualStakingEthers } from "@/lib/web3/hooks/use-dual-staking-ethers";
import { Button } from "@/components/ui/button";

export default function StakingPage() {
  const {
    combinedData,
    isLoading,
    error,
    stakeTokens,
    unstakeTokens,
    claimAllRewards,
    refreshAllData,
    vortStaking,
    somiStaking,
    setError,
    approveTokens,
    checkAllowance,
    getUserTokenBalance,
  } = useDualStakingEthers();

  const { isConnected, address } = vortStaking;
  const [localError, setLocalError] = useState<string | null>(null);

  // Show network warning if not on correct network
  if (isConnected && !vortStaking.isConnected) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-effect glow-border rounded-lg p-12 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-destructive mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to access the staking dashboard.
            </p>
            <Button onClick={() => {}} variant="outline">
              Connect Wallet
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Transform contract data to match your existing UI structure
  const stakingData = combinedData
    ? {
        vort: {
          positions: combinedData.vort.userPositions || [],
          points: combinedData.vort.userTotalPoints || "0",
          pending: combinedData.vort.userPendingRewards || "0",
          totalStaked: combinedData.vort.userTotalStaked || "0",
          rewardRate: combinedData.vort.rewardRate || "0",
          lockMultipliers: combinedData.vort.lockMultipliers || {
            t30: 1,
            t90: 1.2,
            t180: 1.5,
          },
          isLoading: vortStaking.isLoading,
        },
        somi: {
          positions: combinedData.somi.userPositions || [],
          points: combinedData.somi.userTotalPoints || "0",
          pending: combinedData.somi.userPendingRewards || "0",
          totalStaked: combinedData.somi.userTotalStaked || "0",
          rewardRate: combinedData.somi.rewardRate || "0",
          lockMultipliers: combinedData.somi.lockMultipliers || {
            t30: 1,
            t90: 1.2,
            t180: 1.5,
          },
          isLoading: somiStaking.isLoading,
        },
        aggregator: {
          somiWeightBps: 8000,
          t1: "1000",
          t2: "5000",
          t3: "20000",
          combined: (
            parseFloat(combinedData.vort.userTotalPoints || "0") +
            parseFloat(combinedData.somi.userTotalPoints || "0") * 0.8
          ).toString(),
          tier: 1,
        },
      }
    : null;

  // Debug logging
  console.log("Debug - isConnected:", isConnected);
  console.log("Debug - address:", address);
  console.log("Debug - combinedData:", combinedData);
  console.log("Debug - stakingData:", stakingData);
  console.log("Debug - isLoading:", isLoading);
  console.log("Debug - error:", error);
  console.log("Debug - localError:", localError);

  const handleStake = async (
    tokenName: "VORT" | "SOMI",
    amount: string,
    lockDays: number
  ) => {
    if (!isConnected) {
      setLocalError("Please connect your wallet first");
      return;
    }

    try {
      setLocalError(null);
      const lockPeriod =
        lockDays === 30 ? "30" : lockDays === 90 ? "90" : "180";
      await stakeTokens(tokenName, amount, lockPeriod as any);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to stake tokens"
      );
    }
  };

  const handleUnstake = async (tokenName: "VORT" | "SOMI", amount: string) => {
    if (!isConnected) {
      setLocalError("Please connect your wallet first");
      return;
    }

    try {
      setLocalError(null);
      await unstakeTokens(tokenName, amount);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to unstake tokens"
      );
    }
  };

  const handleClaim = async (tokenName: "VORT" | "SOMI") => {
    if (!isConnected) {
      setLocalError("Please connect your wallet first");
      return;
    }

    try {
      setLocalError(null);
      await claimAllRewards();
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to claim rewards"
      );
    }
  };

  // Show connect wallet prompt if not connected
  if (!isConnected) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-effect glow-border rounded-lg p-12 max-w-md mx-auto">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your staking positions and earn
              rewards
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              onClick={() => {}}
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error || localError || !stakingData) {
    let errorMessage = "Unable to load staking data.";

    if (error) {
      errorMessage = error;
    } else if (localError) {
      errorMessage = localError;
    } else if (isConnected && !vortStaking.isConnected) {
      errorMessage = "Please connect your wallet to access staking.";
    } else if (isConnected && !combinedData) {
      errorMessage =
        "Contracts are not responding. Please check your network connection.";
    }

    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-effect glow-border rounded-lg p-12 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-destructive mb-2">
              Failed to Load
            </h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <Button onClick={refreshAllData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold mb-4">
            Staking Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stake VORT and SOMI tokens to earn rewards and unlock higher tier
            access to exclusive launches
          </p>
          {address && (
            <p className="text-sm text-muted-foreground mt-2">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tier Summary */}
          <TierSummaryCard
            address={address || ""}
            aggregator={stakingData.aggregator}
          />

          {/* VORT Staking */}
          <StakeCard
            tokenName="VORT"
            tokenData={stakingData.vort}
            onStake={(amount, lockDays) =>
              handleStake("VORT", amount, lockDays)
            }
            onUnstake={(amount) => handleUnstake("VORT", amount)}
            onClaim={() => handleClaim("VORT")}
            onApprove={(amount) => approveTokens("VORT", amount)}
            onGetBalance={() => getUserTokenBalance("VORT")}
            onCheckAllowance={() => checkAllowance("VORT")}
          />

          {/* SOMI Staking */}
          <StakeCard
            tokenName="SOMI"
            tokenData={stakingData.somi}
            onStake={(amount, lockDays) =>
              handleStake("SOMI", amount, lockDays)
            }
            onUnstake={(amount) => handleUnstake("SOMI", amount)}
            onClaim={() => handleClaim("SOMI")}
            onApprove={(amount) => approveTokens("SOMI", amount)}
            onGetBalance={() => getUserTokenBalance("SOMI")}
            onCheckAllowance={() => checkAllowance("SOMI")}
          />
        </div>

        {/* Formula Explanation */}
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              Point Calculation Formula
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong>VORT Points:</strong> Staked Amount × Lock Multiplier
                </p>
                <p className="text-muted-foreground">
                  <strong>SOMI Points:</strong> Staked Amount × Lock Multiplier
                </p>
                <p className="text-muted-foreground">
                  <strong>Lock Multipliers:</strong> 30d = 100%, 90d = 110%,
                  180d = 120%
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong>Combined Points:</strong> VORT + (SOMI × 0.8)
                </p>
                <p className="text-muted-foreground">
                  <strong>Tier Thresholds:</strong> T1: 1,000 | T2: 5,000 | T3:
                  20,000
                </p>
                <p className="text-muted-foreground">
                  Higher tiers unlock better allocation limits and exclusive
                  access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
