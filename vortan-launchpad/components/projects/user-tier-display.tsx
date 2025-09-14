"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useDualStaking } from "@/lib/web3/hooks/use-dual-staking";
import { useSalePoolUser } from "@/lib/web3/hooks/use-sale-pool-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Star, Trophy, Zap } from "lucide-react";

interface UserTierDisplayProps {
  saleAddress: string;
  tierCaps: {
    T1: number;
    T2: number;
    T3: number;
  };
}

export function UserTierDisplay({ saleAddress, tierCaps }: UserTierDisplayProps) {
  const { isConnected, address } = useAccount();
  const { combinedData, isLoading } = useDualStaking();
  const { userInfo: saleUserInfo, isLoading: isUserInfoLoading } = useSalePoolUser(saleAddress);

  // Calculate user tier using the same logic as staking page
  const userTierData = useMemo(() => {
    if (!combinedData) {
      return {
        tier: 0,
        combinedPoints: 0,
        tierThresholds: { t1: 1000, t2: 5000, t3: 20000 },
        tierName: "No Tier",
        tierIcon: null,
        tierColor: "default",
        maxAllocation: 0,
      };
    }

    const t1 = 1000;
    const t2 = 5000;
    const t3 = 20000;
    
    const combinedPoints =
      parseFloat(combinedData.vort.userTotalPoints || "0") +
      parseFloat(combinedData.somi.userTotalPoints || "0") * 0.8;

    let tier = 0;
    let tierName = "No Tier";
    let tierIcon = null;
    let tierColor: "default" | "secondary" | "destructive" | "outline" = "default";
    let maxAllocation = 0;

    if (combinedPoints >= t3) {
      tier = 3;
      tierName = "Tier 3";
      tierIcon = <Crown className="h-4 w-4" />;
      tierColor = "destructive";
      maxAllocation = tierCaps.T3;
    } else if (combinedPoints >= t2) {
      tier = 2;
      tierName = "Tier 2";
      tierIcon = <Trophy className="h-4 w-4" />;
      tierColor = "secondary";
      maxAllocation = tierCaps.T2;
    } else if (combinedPoints >= t1) {
      tier = 1;
      tierName = "Tier 1";
      tierIcon = <Star className="h-4 w-4" />;
      tierColor = "outline";
      maxAllocation = tierCaps.T1;
    }

    return {
      tier,
      combinedPoints,
      tierThresholds: { t1, t2, t3 },
      tierName,
      tierIcon,
      tierColor,
      maxAllocation,
    };
  }, [combinedData, tierCaps]);

  // Calculate progress to next tier
  const progressToNextTier = useMemo(() => {
    if (userTierData.tier === 3) return 100; // Max tier reached
    
    const nextThreshold = userTierData.tier === 0 
      ? userTierData.tierThresholds.t1
      : userTierData.tier === 1 
      ? userTierData.tierThresholds.t2
      : userTierData.tierThresholds.t3;
    
    const currentThreshold = userTierData.tier === 0 
      ? 0 
      : userTierData.tier === 1 
      ? userTierData.tierThresholds.t1
      : userTierData.tierThresholds.t2;
    
    const progress = ((userTierData.combinedPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.max(0, Math.min(100, progress));
  }, [userTierData]);

  // Get user's current allocation from contract
  const userAllocation = saleUserInfo ? parseFloat(saleUserInfo.purchasedTokens) : 0;
  
  // Calculate allocation progress
  const allocationProgress = userTierData.maxAllocation > 0 
    ? (userAllocation / userTierData.maxAllocation) * 100 
    : 0;

  if (!isConnected) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Your Tier Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Connect your wallet to view your tier and allocation limits
          </p>
          <Badge variant="outline" className="text-sm">
            Connect Wallet
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isUserInfoLoading) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Your Tier Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <span>Your Tier Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Current Tier:</span>
            <Badge variant={userTierData.tierColor} className="flex items-center space-x-1">
              {userTierData.tierIcon}
              <span>{userTierData.tierName}</span>
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {userTierData.combinedPoints.toFixed(0)} points
            </div>
            <div className="text-xs text-muted-foreground">
              VORT + (SOMI × 0.8)
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {userTierData.tier < 3 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress to {userTierData.tier === 0 ? "T1" : userTierData.tier === 1 ? "T2" : "T3"}:
              </span>
              <span className="font-medium">{progressToNextTier.toFixed(1)}%</span>
            </div>
            <Progress value={progressToNextTier} className="h-2" />
          </div>
        )}

        {/* Allocation Info */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Max Allocation:</span>
            <span className="text-sm font-bold text-primary">
              {userTierData.maxAllocation > 0 
                ? `${userTierData.maxAllocation.toLocaleString()} tokens`
                : "No allocation"
              }
            </span>
          </div>
          
          {userTierData.maxAllocation > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used:</span>
                <span className="font-medium">
                  {userAllocation.toLocaleString()} / {userTierData.maxAllocation.toLocaleString()}
                </span>
              </div>
              <Progress value={allocationProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Purchase Info */}
        {saleUserInfo && parseFloat(saleUserInfo.purchasedTokens) > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Purchased:</span>
                <span className="font-medium">
                  {parseFloat(saleUserInfo.purchasedTokens).toLocaleString()} tokens
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">TGE Claimed:</span>
                <Badge variant={saleUserInfo.tgeClaimed ? "default" : "outline"} className="text-xs">
                  {saleUserInfo.tgeClaimed ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-1">
            {userTierData.tier === 0 && (
              <p>Stake VORT/SOMI to unlock tier benefits and higher allocations</p>
            )}
            {userTierData.tier === 1 && (
              <p>✓ T1 allocation access • Stake more to reach T2</p>
            )}
            {userTierData.tier === 2 && (
              <p>✓ T1 & T2 allocation access • Stake more to reach T3</p>
            )}
            {userTierData.tier === 3 && (
              <p>✓ Maximum tier! Access to all allocations</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
