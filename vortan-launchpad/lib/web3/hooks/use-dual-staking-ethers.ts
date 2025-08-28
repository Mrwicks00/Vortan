"use client";

import { useCallback, useMemo } from "react";
import { useStakingEthers } from "./use-staking-ethers";

export function useDualStakingEthers() {
  // Individual staking hooks
  const vortStaking = useStakingEthers("VORT");
  const somiStaking = useStakingEthers("SOMI");

  // Combined data
  const combinedData = useMemo(() => {
    if (!vortStaking.stakingData || !somiStaking.stakingData) {
      return null;
    }

    const vort = vortStaking.stakingData;
    const somi = somiStaking.stakingData;

    return {
      // VORT staking
      vort: {
        totalStaked: vort.totalStaked,
        totalPoints: vort.totalPoints,
        rewardRate: vort.rewardRate,
        lockMultipliers: vort.lockMultipliers,
        userPositions: vort.userPositions,
        userTotalStaked: vort.userTotalStaked,
        userTotalPoints: vort.userTotalPoints,
        userPendingRewards: vort.userPendingRewards,
      },

      // SOMI staking
      somi: {
        totalStaked: somi.totalStaked,
        totalPoints: somi.totalPoints,
        rewardRate: somi.rewardRate,
        lockMultipliers: somi.lockMultipliers,
        userPositions: somi.userPositions,
        userTotalStaked: somi.userTotalStaked,
        userTotalPoints: somi.userTotalPoints,
        userPendingRewards: somi.userPendingRewards,
      },

      // Combined metrics
      combined: {
        totalStaked: {
          vort: parseFloat(vort.totalStaked),
          somi: parseFloat(somi.totalStaked),
        },
        totalPoints: {
          vort: parseFloat(vort.totalPoints),
          somi: parseFloat(somi.totalPoints),
        },
        userPendingRewards: {
          vort: parseFloat(vort.userPendingRewards),
          somi: parseFloat(somi.userPendingRewards),
        },
      },
    };
  }, [vortStaking.stakingData, somiStaking.stakingData]);

  // Combined loading states
  const isLoading = vortStaking.isLoading || somiStaking.isLoading;

  // Combined error handling
  const error = vortStaking.error || somiStaking.error;
  const setError = useCallback(
    (error: string | null) => {
      vortStaking.setError(error);
      somiStaking.setError(error);
    },
    [vortStaking, somiStaking]
  );

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([vortStaking.refreshData(), somiStaking.refreshData()]);
  }, [vortStaking, somiStaking]);

  // Combined actions
  const stakeTokens = useCallback(
    async (
      tokenType: "VORT" | "SOMI",
      amount: string,
      lockPeriod: keyof typeof import("./use-staking-ethers").LOCK_PERIODS
    ) => {
      if (tokenType === "VORT") {
        return await vortStaking.stakeTokens(amount, lockPeriod);
      } else {
        return await somiStaking.stakeTokens(amount, lockPeriod);
      }
    },
    [vortStaking, somiStaking]
  );

  const unstakeTokens = useCallback(
    async (tokenType: "VORT" | "SOMI", amount: string) => {
      if (tokenType === "VORT") {
        return await vortStaking.unstakeTokens(amount);
      } else {
        return await somiStaking.unstakeTokens(amount);
      }
    },
    [vortStaking, somiStaking]
  );

  const claimAllRewards = useCallback(async () => {
    await Promise.all([
      vortStaking.claimUserRewards(),
      somiStaking.claimUserRewards(),
    ]);
  }, [vortStaking, somiStaking]);

  return {
    // Data
    combinedData,
    vort: vortStaking.stakingData,
    somi: somiStaking.stakingData,

    // Actions
    stakeTokens,
    unstakeTokens,
    claimAllRewards,
    refreshAllData,

    // Loading states
    isLoading,

    // Error handling
    error,
    setError,

    // Individual hooks for specific operations
    vortStaking,
    somiStaking,

    // Approval functions
    approveTokens: (tokenType: "VORT" | "SOMI", amount: string) => {
      if (tokenType === "VORT") {
        return vortStaking.approveTokens(amount);
      } else {
        return somiStaking.approveTokens(amount);
      }
    },
    checkAllowance: (tokenType: "VORT" | "SOMI") => {
      if (tokenType === "VORT") {
        return vortStaking.checkAllowance();
      } else {
        return somiStaking.checkAllowance();
      }
    },
    getUserTokenBalance: (tokenType: "VORT" | "SOMI") => {
      if (tokenType === "VORT") {
        return vortStaking.getUserTokenBalance();
      } else {
        return somiStaking.getUserTokenBalance();
      }
    },
  };
}
