"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESSES } from "../config/addresses";
import {
  VORT_STAKING_ABI,
  SOMI_STAKING_ABI,
  VORTAN_TOKEN_ABI,
  SOMI_TOKEN_ABI,
} from "../abis";

// Lock period options (in days)
export const LOCK_PERIODS = {
  "30": 30,
  "90": 90,
  "180": 180,
} as const;

export type LockPeriod = keyof typeof LOCK_PERIODS;

interface StakingPosition {
  id: number;
  amount: string;
  lockEnd: number;
  multBps: number;
  multiplier: number;
  lockPeriod: LockPeriod;
  pendingRewards: string;
}

interface StakingData {
  totalStaked: string;
  totalPoints: string;
  rewardRate: string;
  lockMultipliers: {
    t30: number;
    t90: number;
    t180: number;
  };
  userPositions: StakingPosition[];
  userTotalStaked: string;
  userTotalPoints: string;
  userPendingRewards: string;
}

export function useStaking(tokenType: "VORT" | "SOMI") {
  const { address, isConnected } = useAccount();

  // Get contract address and ABI based on token type
  const contractAddress =
    tokenType === "VORT"
      ? CONTRACT_ADDRESSES.VORT_STAKING
      : CONTRACT_ADDRESSES.SOMI_STAKING;

  const contractABI =
    tokenType === "VORT" ? VORT_STAKING_ABI : SOMI_STAKING_ABI;

  console.log(`[${tokenType}] Hook initialized:`, {
    address,
    contractAddress,
    contractABI: "ABI loaded",
    isConnected,
  });

  // State
  const [stakingData, setStakingData] = useState<StakingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if contract exists
  const { data: contractExists } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "totalStaked",
    args: address
      ? [address]
      : [address || "0x0000000000000000000000000000000000000000"],
  });

  console.log(`[${tokenType}] Contract existence check:`, {
    contractAddress,
    contractExists:
      contractExists !== undefined
        ? "Contract responds"
        : "Contract not responding",
  });

  // Read contract data
  const {
    data: totalStaked,
    refetch: refetchTotalStaked,
    error: totalStakedError,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "totalStaked",
    args: address ? [address] : undefined,
  });

  const {
    data: totalPoints,
    refetch: refetchTotalPoints,
    error: totalPointsError,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "totalPoints",
  });

  const {
    data: rewardRate,
    refetch: refetchRewardRate,
    error: rewardRateError,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "rewardRatePerSecond",
  });

  // Get individual multiplier values
  const {
    data: mult30d,
    refetch: refetchMult30d,
    error: mult30dError,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "mult30d",
  });

  const {
    data: mult90d,
    refetch: refetchMult90d,
    error: mult90dError,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "mult90d",
  });

  const {
    data: mult180d,
    refetch: refetchMult180d,
    error: mult180dError,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "mult180d",
  });

  // Debug contract call results and errors
  console.log(`[${tokenType}] Contract call results:`, {
    totalStaked: totalStaked?.toString(),
    totalPoints: totalPoints?.toString(),
    rewardRate: rewardRate?.toString(),
    mult30d: mult30d?.toString(),
    mult90d: mult90d?.toString(),
    mult180d: mult180d?.toString(),
  });

  console.log(`[${tokenType}] Contract call errors:`, {
    totalStakedError,
    totalPointsError,
    rewardRateError,
    mult30dError,
    mult90dError,
    mult180dError,
  });

  const { data: userPendingRewards, refetch: refetchUserRewards } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: "pendingRewards",
      args: address ? [address] : undefined,
    });

  const { data: userTotalPoints, refetch: refetchUserPoints } = useReadContract(
    {
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: "tierPointsOf",
      args: address ? [address] : undefined,
    }
  );

  const { data: userPositions, refetch: refetchUserPositions } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: "positionsOf",
      args: address ? [address] : undefined,
    });

  // Write contract functions
  const { writeContract: stake, isPending: isStaking } = useWriteContract();
  const { writeContract: unstake, isPending: isUnstaking } = useWriteContract();
  const { writeContract: claimRewards, isPending: isClaiming } =
    useWriteContract();

  // Transaction receipts
  const { isLoading: isStakePending, isSuccess: isStakeSuccess } =
    useWaitForTransactionReceipt({
      hash: undefined,
    });

  const { isLoading: isUnstakePending, isSuccess: isUnstakeSuccess } =
    useWaitForTransactionReceipt({
      hash: undefined,
    });

  const { isLoading: isClaimPending, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: undefined,
    });

  // Stake tokens
  const stakeTokens = useCallback(
    async (amount: string, lockPeriod: LockPeriod) => {
      if (!address || !isConnected) {
        setError("Please connect your wallet");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const lockDays = LOCK_PERIODS[lockPeriod];
        const amountWei = parseEther(amount);

        await stake({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: "stake",
          args: [amountWei, BigInt(lockDays)],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to stake tokens");
      } finally {
        setIsLoading(false);
      }
    },
    [address, isConnected, stake, contractAddress, contractABI]
  );

  // Unstake tokens
  const unstakeTokens = useCallback(
    async (amount: string) => {
      if (!address || !isConnected) {
        setError("Please connect your wallet");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const amountWei = parseEther(amount);

        await unstake({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: "unstake",
          args: [amountWei],
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to unstake tokens"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [address, isConnected, unstake, contractAddress, contractABI]
  );

  // Claim rewards
  const claimUserRewards = useCallback(async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await claimRewards({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "claim",
        args: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim rewards");
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, claimRewards, contractAddress, contractABI]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      refetchTotalStaked(),
      refetchTotalPoints(),
      refetchRewardRate(),
      refetchMult30d(),
      refetchMult90d(),
      refetchMult180d(),
      refetchUserRewards(),
      refetchUserPoints(),
      refetchUserPositions(),
    ]);
  }, [
    refetchTotalStaked,
    refetchTotalPoints,
    refetchRewardRate,
    refetchMult30d,
    refetchMult90d,
    refetchMult180d,
    refetchUserRewards,
    refetchUserPoints,
    refetchUserPositions,
  ]);

  // Update staking data when contract data changes
  useEffect(() => {
    console.log(`[${tokenType}] Contract data:`, {
      totalStaked,
      totalPoints,
      rewardRate,
      mult30d,
      mult90d,
      mult180d,
      userPendingRewards,
      userTotalPoints,
      userPositions,
    });

    if (
      totalStaked !== undefined &&
      totalPoints !== undefined &&
      rewardRate !== undefined &&
      mult30d !== undefined &&
      mult90d !== undefined &&
      mult180d !== undefined
    ) {
      console.log(`[${tokenType}] All data available, setting stakingData`);

      // Transform user positions data
      const transformedPositions: StakingPosition[] = userPositions
        ? userPositions.map((pos: any, index: number) => ({
            id: index,
            amount: formatEther(pos.amount),
            lockEnd: Number(pos.lockEnd),
            multBps: Number(pos.multBps),
            multiplier: Number(pos.multBps) / 10000,
            lockPeriod:
              pos.lockEnd > 0
                ? ((Number(pos.lockEnd) - Date.now() / 1000 > 150 * 24 * 60 * 60
                    ? "180"
                    : Number(pos.lockEnd) - Date.now() / 1000 >
                      60 * 24 * 60 * 60
                    ? "90"
                    : "30") as LockPeriod)
                : "30",
            pendingRewards: "0",
          }))
        : [];

      setStakingData({
        totalStaked: formatEther(totalStaked || BigInt(0)),
        totalPoints: formatEther(totalPoints || BigInt(0)),
        rewardRate: formatEther(rewardRate || BigInt(0)),
        lockMultipliers: {
          t30: Number(mult30d || 0) / 10000,
          t90: Number(mult90d || 0) / 10000,
          t180: Number(mult180d || 0) / 10000,
        },
        userPositions: transformedPositions,
        userTotalStaked: formatEther(totalStaked || BigInt(0)),
        userTotalPoints: formatEther(userTotalPoints || BigInt(0)),
        userPendingRewards: formatEther(userPendingRewards || BigInt(0)),
      });
    } else {
      console.log(`[${tokenType}] Missing data, cannot set stakingData`);
    }
  }, [
    totalStaked,
    totalPoints,
    rewardRate,
    mult30d,
    mult90d,
    mult180d,
    userPendingRewards,
    userTotalPoints,
    userPositions,
    tokenType,
  ]);

  // Refresh data after successful transactions
  useEffect(() => {
    if (isStakeSuccess || isUnstakeSuccess || isClaimSuccess) {
      refreshData();
    }
  }, [isStakeSuccess, isUnstakeSuccess, isClaimSuccess]);

  // Check token allowance
  const tokenAddress =
    tokenType === "VORT"
      ? CONTRACT_ADDRESSES.VORTAN_TOKEN
      : CONTRACT_ADDRESSES.SOMI_TOKEN;

  console.log(`[${tokenType}] Token addresses:`, {
    tokenAddress,
    contractAddress,
    address,
  });

  const tokenABI = tokenType === "VORT" ? VORTAN_TOKEN_ABI : SOMI_TOKEN_ABI;

  const { data: allowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: tokenABI,
    functionName: "allowance",
    args: address ? [address, contractAddress] : undefined,
  });

  const checkAllowance = useCallback(async () => {
    console.log(`[${tokenType}] Allowance data:`, {
      allowance,
      tokenAddress,
      contractAddress,
      address,
    });
    return allowance ? formatEther(allowance as bigint) : "0";
  }, [allowance, tokenType, tokenAddress, contractAddress, address]);

  // Get user token balance
  const { data: tokenBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: tokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const getUserTokenBalance = useCallback(async () => {
    console.log(`[${tokenType}] Balance data:`, {
      tokenBalance,
      tokenAddress,
      address,
    });
    return tokenBalance ? formatEther(tokenBalance as bigint) : "0";
  }, [tokenBalance, tokenType, tokenAddress, address]);

  // Approve tokens
  const { writeContract, data: approveHash } = useWriteContract();

  const approveTokens = useCallback(
    async (amount: string) => {
      if (!address) throw new Error("Please connect your wallet");

      try {
        const amountWei = parseEther(amount);

        await writeContract({
          address: tokenAddress as `0x${string}`,
          abi: tokenABI,
          functionName: "approve",
          args: [contractAddress, amountWei],
        });
      } catch (error) {
        console.error(`[${tokenType}] Failed to approve tokens:`, error);
        throw error;
      }
    },
    [address, contractAddress, tokenAddress, writeContract]
  );

  // Wait for approval transaction
  const { isLoading: isApprovePending, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  return {
    // Data
    stakingData,

    // Actions
    stakeTokens,
    unstakeTokens,
    claimUserRewards,
    refreshData,

    // Loading states
    isLoading,
    isStaking,
    isUnstaking,
    isClaiming,
    isStakePending,
    isUnstakePending,
    isClaimPending,
    isApprovePending,

    // Success states
    isStakeSuccess,
    isUnstakeSuccess,
    isClaimSuccess,
    isApproveSuccess,

    // Error handling
    error,
    setError,

    // Token functions
    checkAllowance,
    getUserTokenBalance,
    approveTokens,
  };
}
