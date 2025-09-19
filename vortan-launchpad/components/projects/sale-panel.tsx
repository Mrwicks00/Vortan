"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { useDualStaking } from "@/lib/web3/hooks/use-dual-staking";
import { useSalePoolUser } from "@/lib/web3/hooks/use-sale-pool-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Target, Wallet, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";
import { USDC_TOKEN_ABI } from "@/lib/web3/abis/usdc-token";
import { SOMI_TOKEN_ABI } from "@/lib/web3/abis/somi-token";
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";
import {
  BASE_TOKEN_ADDRESSES,
  BASE_TOKEN_DECIMALS,
  BaseTokenType,
} from "@/lib/web3/utils/token-resolver";

interface SalePanelProps {
  saleAddress: string;
  sale: {
    baseToken: string;
    priceDisplay: string;
    hardCap: number;
    softCap: number;
    perWalletCap: number;
    tierCaps: {
      T1: number;
      T2: number;
      T3: number;
    };
    start: number;
    end: number;
    tgeTime: number;
    tgeBps: number;
    vestDuration: number;
    saleTokenSymbol?: string;
  };
  stats: {
    raised: number;
    buyers: number;
    tokensSold: number;
  };
  status: "Live" | "Upcoming" | "Unfunded" | "Ended";
}

// Helper function to extract token multiplier from price display
function getTokenMultiplier(priceDisplay: string): number {
  // Extract from priceDisplay like "1 USDC = 50 tokens"
  try {
    const match = priceDisplay.match(/=\s*(\d+)/);
    return match ? parseInt(match[1]) : 50; // Default fallback
  } catch {
    return 50; // Default fallback
  }
}

export function SalePanel({
  saleAddress,
  sale,
  stats,
  status,
}: SalePanelProps) {
  const { isConnected, address } = useAccount();
  const { combinedData } = useDualStaking();
  const { userInfo, refetch: refetchUserInfo } = useSalePoolUser(saleAddress);

  const [amount, setAmount] = useState("");

  // Determine base token type and get appropriate ABI and decimals
  const getBaseTokenInfo = (baseTokenSymbol: string) => {
    const tokenType = baseTokenSymbol.toUpperCase() as BaseTokenType;
    const tokenAddress = BASE_TOKEN_ADDRESSES[tokenType];
    const decimals = BASE_TOKEN_DECIMALS[tokenType];
    const abi = tokenType === "USDC" ? USDC_TOKEN_ABI : SOMI_TOKEN_ABI;

    return { tokenType, tokenAddress, decimals, abi };
  };

  const baseTokenInfo = getBaseTokenInfo(sale.baseToken);
  const baseTokenAddress = baseTokenInfo.tokenAddress;

  // Check base token allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: baseTokenAddress as `0x${string}`,
    abi: baseTokenInfo.abi,
    functionName: "allowance",
    args: address ? [address, saleAddress as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Contract write functions with proper hash management
  const {
    writeContract: writeApprove,
    isPending: isApprovePending,
    data: approveHash,
  } = useWriteContract();
  const {
    writeContract: writeBuy,
    isPending: isBuyPending,
    data: buyHash,
  } = useWriteContract();

  // Transaction receipts with proper hash management
  const { isLoading: isApproveTxLoading, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isLoading: isBuyTxLoading, isSuccess: isBuySuccess } =
    useWaitForTransactionReceipt({
      hash: buyHash,
    });

  // Handle approval transaction success
  useEffect(() => {
    if (approveHash && isApproveSuccess) {
      toast.success("Token approval successful!");
      refetchAllowance();
    }
  }, [approveHash, isApproveSuccess, refetchAllowance]);

  // Handle buy transaction success
  useEffect(() => {
    if (buyHash && isBuySuccess) {
      toast.success("Tokens purchased successfully!");
      setAmount("");
      refetchUserInfo();
      refetchAllowance();
    }
  }, [buyHash, isBuySuccess, refetchUserInfo, refetchAllowance]);

  // Check base token balance
  const { data: balance } = useReadContract({
    address: baseTokenAddress as `0x${string}`,
    abi: baseTokenInfo.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Calculate user tier and max allocation
  const userTierData = useMemo(() => {
    if (!combinedData) return { tier: 0, maxAllocation: 0 };

    const t1 = 1000,
      t2 = 5000,
      t3 = 20000;
    const combinedPoints =
      parseFloat(combinedData.vort.userTotalPoints || "0") +
      parseFloat(combinedData.somi.userTotalPoints || "0") * 0.8;

    let tier = 0,
      maxAllocation = 0;
    if (combinedPoints >= t3) {
      tier = 3;
      maxAllocation = sale.tierCaps.T3;
    } else if (combinedPoints >= t2) {
      tier = 2;
      maxAllocation = sale.tierCaps.T2;
    } else if (combinedPoints >= t1) {
      tier = 1;
      maxAllocation = sale.tierCaps.T1;
    }

    return { tier, maxAllocation };
  }, [combinedData, sale.tierCaps]);

  // Calculate user's current allocation usage
  const userPurchased = userInfo ? parseFloat(userInfo.purchasedBase) : 0;
  const userPurchasedTokens = userInfo
    ? parseFloat(userInfo.purchasedTokens)
    : 0;
  const remainingAllocation = Math.max(
    0,
    userTierData.maxAllocation - userPurchased
  );

  // Check if user has used their full allocation
  const hasUsedFullAllocation =
    remainingAllocation <= 0 && userTierData.maxAllocation > 0;

  // Check if user has sufficient allowance
  const amountWei = amount
    ? parseUnits(amount, baseTokenInfo.decimals)
    : BigInt(0);
  const hasAllowance = allowance ? allowance >= amountWei : false;

  // Check if user has sufficient balance
  const hasBalance = balance ? balance >= amountWei : false;

  const progressPercentage = (stats.raised / sale.hardCap) * 100;
  const timeLeft = sale.end - Math.floor(Date.now() / 1000);
  const isActive = status === "Live" && timeLeft > 0;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Ended";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleApprove = async () => {
    if (!isConnected || !address || !amount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    try {
      toast.loading(`Approving ${baseTokenInfo.tokenType}...`, {
        toastId: "approve-loading",
      });
      await writeApprove({
        address: baseTokenAddress as `0x${string}`,
        abi: baseTokenInfo.abi,
        functionName: "approve",
        args: [
          saleAddress as `0x${string}`,
          parseUnits(amount, baseTokenInfo.decimals),
        ],
      });
      // Success toast and data refresh handled by useEffect
    } catch (error) {
      toast.dismiss("approve-loading");
      toast.error(
        `Approval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleBuy = async () => {
    if (!isConnected || !address || !amount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    // Validation checks
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (!hasBalance) {
      toast.error(`Insufficient ${baseTokenInfo.tokenType} balance`);
      return;
    }

    if (amountNum > remainingAllocation) {
      toast.error(
        `Amount exceeds your tier allocation. Max: ${remainingAllocation} ${sale.baseToken}`
      );
      return;
    }

    if (amountNum > sale.perWalletCap) {
      toast.error(
        `Amount exceeds per-wallet cap: ${sale.perWalletCap} ${baseTokenInfo.tokenType}`
      );
      return;
    }

    try {
      toast.loading("Purchasing tokens...", { toastId: "buy-loading" });
      await writeBuy({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "buy",
        args: [parseUnits(amount, baseTokenInfo.decimals)],
      });
      // Success toast and data refresh handled by useEffect
    } catch (error) {
      toast.dismiss("buy-loading");
      toast.error(
        `Purchase failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Token Sale</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sale Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-semibold">{sale.priceDisplay}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Base Token</p>
            <Badge variant="outline">{sale.baseToken}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Hard Cap</p>
            <p className="font-semibold">
              {formatNumber(sale.hardCap)} {sale.baseToken}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Soft Cap</p>
            <p className="font-semibold">
              {formatNumber(sale.softCap)} {sale.baseToken}
            </p>
          </div>
        </div>

        <Separator />

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {formatNumber(stats.raised)} {sale.baseToken} raised
            </span>
            <span>
              {formatNumber(sale.hardCap)} {sale.baseToken} goal
            </span>
          </div>
        </div>

        <Separator />

        {/* Time and Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Time Left</p>
              <p className="font-semibold text-secondary">
                {formatTimeLeft(timeLeft)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="font-semibold text-accent">
                {formatNumber(stats.buyers)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tier Caps */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Tier Limits</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded bg-muted/20">
              <p className="text-xs text-muted-foreground">T1</p>
              <p className="font-semibold text-sm">
                {formatNumber(sale.tierCaps.T1)}
              </p>
            </div>
            <div className="text-center p-2 rounded bg-muted/20">
              <p className="text-xs text-muted-foreground">T2</p>
              <p className="font-semibold text-sm">
                {formatNumber(sale.tierCaps.T2)}
              </p>
            </div>
            <div className="text-center p-2 rounded bg-muted/20">
              <p className="text-xs text-muted-foreground">T3</p>
              <p className="font-semibold text-sm">
                {formatNumber(sale.tierCaps.T3)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Purchase Interface */}
        {!isConnected ? (
          <div className="text-center py-6">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Connect your wallet to purchase tokens
            </p>
            <Badge variant="outline" className="text-sm">
              Connect Wallet
            </Badge>
          </div>
        ) : isActive ? (
          <div className="space-y-4">
            {/* User Info */}
            <div className="bg-muted/10 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Tier:</span>
                <Badge variant={userTierData.tier > 0 ? "default" : "outline"}>
                  {userTierData.tier > 0 ? `T${userTierData.tier}` : "No Tier"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Allocation:</span>
                <span className="font-medium">
                  {userTierData.maxAllocation > 0
                    ? `${formatNumber(userTierData.maxAllocation)} ${
                        sale.baseToken
                      }`
                    : "No allocation"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used:</span>
                <span className="font-medium">
                  {formatNumber(userPurchased)} /{" "}
                  {formatNumber(userTierData.maxAllocation)} {sale.baseToken}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purchased:</span>
                <span className="font-medium text-primary">
                  {formatNumber(userPurchasedTokens)}{" "}
                  {sale.saleTokenSymbol || "tokens"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium">
                  {formatNumber(remainingAllocation)} {sale.baseToken}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tokens Out:</span>
                <span className="font-medium text-primary">
                  {formatNumber(
                    remainingAllocation * getTokenMultiplier(sale.priceDisplay)
                  )}{" "}
                  {sale.saleTokenSymbol || "tokens"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Balance:</span>
                <span className="font-medium">
                  {balance
                    ? `${formatNumber(
                        parseFloat(
                          formatUnits(balance as bigint, baseTokenInfo.decimals)
                        )
                      )} ${baseTokenInfo.tokenType}`
                    : "Loading..."}
                </span>
              </div>
            </div>

            {hasUsedFullAllocation ? (
              // Show allocation summary when user has used full allocation
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <h3 className="font-semibold text-primary">
                    Allocation Bought
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Purchased:
                    </span>
                    <span className="font-semibold text-lg">
                      {formatNumber(userPurchased)} {sale.baseToken}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tokens You'll Get:
                    </span>
                    <span className="font-semibold text-lg text-primary">
                      {formatNumber(userPurchasedTokens)}{" "}
                      {sale.saleTokenSymbol || "tokens"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tier:</span>
                    <Badge variant="default" className="font-medium">
                      T{userTierData.tier}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  You've used your full allocation. Check the Token Claims
                  section below to claim your tokens.
                </p>
              </div>
            ) : (
              // Show buy form when user still has allocation remaining
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Amount ({sale.baseToken})
                </label>
                <Input
                  type="number"
                  placeholder={`Enter ${sale.baseToken} amount`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-input/50 border-border/50 focus:border-primary/50"
                />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    Max per wallet: {formatNumber(sale.perWalletCap)}{" "}
                    {sale.baseToken}
                  </p>
                  <p>
                    Your remaining allocation:{" "}
                    {formatNumber(remainingAllocation)} {sale.baseToken}
                  </p>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-primary font-medium">
                      You'll receive:{" "}
                      {formatNumber(
                        parseFloat(amount) *
                          getTokenMultiplier(sale.priceDisplay)
                      )}{" "}
                      {sale.saleTokenSymbol || "tokens"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Validation Messages */}
            {!hasUsedFullAllocation && amount && parseFloat(amount) > 0 && (
              <div className="space-y-1">
                {!hasBalance && (
                  <div className="flex items-center space-x-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Insufficient {baseTokenInfo.tokenType} balance</span>
                  </div>
                )}
                {parseFloat(amount) > remainingAllocation && (
                  <div className="flex items-center space-x-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Amount exceeds your tier allocation</span>
                  </div>
                )}
                {parseFloat(amount) > sale.perWalletCap && (
                  <div className="flex items-center space-x-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Amount exceeds per-wallet cap</span>
                  </div>
                )}
              </div>
            )}

            {!hasUsedFullAllocation && (
              <div className="space-y-2">
                {!hasAllowance ? (
                  <Button
                    onClick={handleApprove}
                    className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
                    disabled={
                      !amount ||
                      Number.parseFloat(amount) <= 0 ||
                      isApprovePending ||
                      isApproveTxLoading
                    }
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {isApprovePending || isApproveTxLoading
                      ? "Approving..."
                      : `Approve ${sale.baseToken}`}
                  </Button>
                ) : (
                  <Button
                    onClick={handleBuy}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow"
                    disabled={
                      !amount ||
                      Number.parseFloat(amount) <= 0 ||
                      !hasBalance ||
                      parseFloat(amount) > remainingAllocation ||
                      parseFloat(amount) > sale.perWalletCap ||
                      isBuyPending ||
                      isBuyTxLoading
                    }
                  >
                    {isBuyPending || isBuyTxLoading
                      ? "Purchasing..."
                      : "Buy Tokens"}
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : status === "Unfunded" ? (
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-orange-500 font-semibold mb-2">
              Sale Not Funded
            </p>
            <p className="text-sm text-muted-foreground">
              Project owner needs to deposit sale tokens before purchases can
              begin
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {status === "Upcoming"
                ? "Sale not started yet"
                : "Sale has ended"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {status === "Upcoming"
                ? `Starts: ${formatDate(sale.start)}`
                : `Ended: ${formatDate(sale.end)}`}
            </p>
          </div>
        )}

        {/* Sale Timeline */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Start:</span>
            <span>{formatDate(sale.start)}</span>
          </div>
          <div className="flex justify-between">
            <span>End:</span>
            <span>{formatDate(sale.end)}</span>
          </div>
          <div className="flex justify-between">
            <span>TGE:</span>
            <span>{formatDate(sale.tgeTime)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
