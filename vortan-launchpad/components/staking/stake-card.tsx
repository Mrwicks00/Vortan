"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Coins,
  Lock,
  Gift,
  Loader2,
  Wallet,
  Trophy,
  Star,
  Zap,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StakingPosition {
  id: number;
  amount: string;
  lockEnd: number;
  multBps: number;
  multiplier: number;
  lockPeriod: "30" | "90" | "180";
  pendingRewards: string;
}

interface StakeCardProps {
  tokenName: "VORT" | "SOMI";
  tokenData: {
    positions: StakingPosition[];
    points: string;
    pending: string;
    totalStaked: string;
    rewardRate: string;
    lockMultipliers: {
      t30: number;
      t90: number;
      t180: number;
    };
    isLoading: boolean;
  };
  onStake: (amount: string, lockDays: number) => Promise<void>;
  onUnstake: (amount: string) => Promise<void>;
  onClaim: () => Promise<void>;
  onApprove: (amount: string) => Promise<void>;
  onGetBalance: () => Promise<string>;
  onCheckAllowance: () => Promise<string>;
  onRefresh?: () => void;
}

export function StakeCard({
  tokenName,
  tokenData,
  onStake,
  onUnstake,
  onClaim,
  onApprove,
  onGetBalance,
  onCheckAllowance,
  onRefresh,
}: StakeCardProps) {
  const [amount, setAmount] = useState("");
  const [lockPeriod, setLockPeriod] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allowance, setAllowance] = useState("0");
  const [userBalance, setUserBalance] = useState("0");

  // Fetch user balance and allowance on mount and when needed
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balance, allowance] = await Promise.all([
          onGetBalance(),
          onCheckAllowance(),
        ]);
        setUserBalance(balance);
        setAllowance(allowance);
      } catch (error) {
        console.error("Error fetching data:", error);
        setUserBalance("0");
        setAllowance("0");
      }
    };

    fetchData();
  }, [onGetBalance, onCheckAllowance]);

  // Check if user is approved when amount or allowance changes
  useEffect(() => {
    if (!amount) {
      setIsApproved(false);
      return;
    }

    const hasAllowance = parseFloat(allowance) >= parseFloat(amount);
    const hasBalance = parseFloat(userBalance) >= parseFloat(amount);

    console.log(`[${tokenName}] Approval check:`, {
      amount,
      allowance,
      userBalance,
      hasAllowance,
      hasBalance,
      willBeApproved: hasAllowance && hasBalance,
    });

    setIsApproved(hasAllowance && hasBalance);
  }, [amount, allowance, userBalance, tokenName]);

  const { toast } = useToast();

  const lockOptions = [
    { days: 30, label: "30 Days", multiplier: 100 },
    { days: 90, label: "90 Days", multiplier: 110 },
    { days: 180, label: "180 Days", multiplier: 120 },
  ];

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat().format(Number.parseFloat(num));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const isPositionUnlocked = (lockEnd: number) => {
    return Date.now() / 1000 > lockEnd;
  };

  const getMultiplierFromBps = (bps: number) => {
    return (bps / 100).toFixed(0);
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!amount || !onApprove) return;

    try {
      setIsLoading(true);
      await onApprove(amount);

      // Refresh allowance after successful approval
      try {
        const newAllowance = await onCheckAllowance();
        setAllowance(newAllowance);
      } catch (error) {
        console.error("Error refreshing allowance:", error);
      }

      toast({
        title: "Approval Successful",
        description: `Successfully approved ${amount} ${tokenName} for staking`,
      });
    } catch (error) {
      console.error("Error approving tokens:", error);
      toast({
        title: "Approval Failed",
        description:
          error instanceof Error ? error.message : "Failed to approve tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (amount && lockPeriod && onStake) {
      setIsLoading(true);
      try {
        await onStake(amount, Number.parseInt(lockPeriod));

        toast({
          title: "Staking Successful",
          description: `Successfully staked ${amount} ${tokenName} for ${lockPeriod} days`,
        });

        setAmount("");
        setLockPeriod("");
        setIsApproved(false);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error("Error staking tokens:", error);
        toast({
          title: "Staking Failed",
          description:
            error instanceof Error ? error.message : "Failed to stake tokens",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUnstake = async (positionIndex: number) => {
    if (onUnstake && tokenData.positions[positionIndex]) {
      setIsLoading(true);
      try {
        const position = tokenData.positions[positionIndex];
        // Use the actual Web3 function passed from parent
        await onUnstake(position.amount);

        toast({
          title: "Unstaking Successful",
          description: `Successfully unstaked ${position.amount} ${tokenName}`,
        });

        if (onRefresh) onRefresh();
      } catch (error) {
        console.error("Error unstaking tokens:", error);
        toast({
          title: "Unstaking Failed",
          description:
            error instanceof Error ? error.message : "Failed to unstake tokens",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClaim = () => {
    if (onClaim) {
      setIsLoading(true);
      try {
        // Use the actual Web3 function passed from parent
        onClaim();

        toast({
          title: "Claim Successful",
          description: `Successfully claimed ${tokenData.pending} ${tokenName} rewards`,
        });

        if (onRefresh) onRefresh();
      } catch (error) {
        console.error("Error claiming rewards:", error);
        toast({
          title: "Claim Failed",
          description:
            error instanceof Error ? error.message : "Failed to claim rewards",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const selectedLockOption = lockOptions.find(
    (opt) => opt.days.toString() === lockPeriod
  );

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <Coins
            className={`h-5 w-5 ${
              tokenName === "VORT" ? "text-primary" : "text-secondary"
            }`}
          />
          <span>Stake {tokenName}</span>
          {tokenName === "SOMI" && (
            <Badge variant="outline" className="text-xs">
              0.8× weight
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Staking Interface */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder={`Enter ${tokenName} amount`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-input/50 border-border/50 focus:border-primary/50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Lock Period</label>
            <Select
              value={lockPeriod}
              onValueChange={setLockPeriod}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary/50">
                <SelectValue placeholder="Select lock period" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-border/50">
                {lockOptions.map((option) => (
                  <SelectItem key={option.days} value={option.days.toString()}>
                    {option.label} ({option.multiplier}% multiplier)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLockOption && (
              <p className="text-xs text-muted-foreground">
                Multiplier: {selectedLockOption.multiplier}% • Points:{" "}
                {amount
                  ? (
                      (Number.parseFloat(amount) *
                        selectedLockOption.multiplier) /
                      100
                    ).toFixed(0)
                  : "0"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Approve Button - Always visible when not approved */}
            {!isApproved && (
              <Button
                onClick={handleApprove}
                disabled={!amount || isLoading}
                className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Approve {tokenName}
                  </>
                )}
              </Button>
            )}

            {/* Stake Button - Only visible when approved */}
            {isApproved && (
              <Button
                onClick={handleStake}
                disabled={!amount || !lockPeriod || isLoading}
                className={`w-full transition-all duration-300 ${
                  tokenName === "VORT"
                    ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary/60"
                    : "bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary/60"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Staking...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Stake {tokenName}
                  </>
                )}
              </Button>
            )}

            {/* Show balance info */}
            {amount && (
              <div className="text-sm text-muted-foreground text-center">
                <p>
                  Your balance: {userBalance} {tokenName}
                </p>
                {parseFloat(amount) > parseFloat(userBalance) && (
                  <p className="text-destructive">Insufficient balance</p>
                )}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-primary">
              {formatNumber(tokenData.points)}
            </p>
            <p className="text-xs text-muted-foreground">{tokenName} Points</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-accent">
              {formatNumber(tokenData.pending)}
            </p>
            <p className="text-xs text-muted-foreground">Pending Rewards</p>
          </div>
        </div>

        {/* Claim Rewards */}
        <Button
          onClick={handleClaim}
          variant="outline"
          className="w-full border-accent/30 hover:bg-accent/20 hover:border-accent/50 bg-transparent"
          disabled={Number.parseFloat(tokenData.pending) === 0 || isLoading}
        >
          <Gift className="h-4 w-4 mr-2" />
          Claim Rewards ({formatNumber(tokenData.pending)} {tokenName})
        </Button>

        <Separator />

        {/* Positions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Your Positions</span>
          </h4>

          {tokenData.positions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No active positions
            </div>
          ) : (
            <div className="space-y-2">
              {tokenData.positions.map((position, index) => {
                const isUnlocked = isPositionUnlocked(position.lockEnd);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatNumber(position.amount)} {tokenName}
                        </span>
                        <Badge
                          variant={isUnlocked ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {getMultiplierFromBps(position.multBps)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unlocks: {formatDate(position.lockEnd)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={isUnlocked ? "default" : "ghost"}
                      onClick={() => handleUnstake(index)}
                      disabled={!isUnlocked || isLoading}
                      className={
                        isUnlocked
                          ? "bg-destructive hover:bg-destructive/80"
                          : ""
                      }
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isUnlocked ? (
                        "Unstake"
                      ) : (
                        "Locked"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
