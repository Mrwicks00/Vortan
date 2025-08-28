"use client";

import { useCallback, useMemo } from "react";
import { useStaking } from "./use-staking";
import { useWallet } from "../contexts/wallet-context";

export function useDualStaking() {
  const { address, isConnected } = useWallet();

  // Individual staking hooks
  const vortStaking = useStaking("VORT");
  const somiStaking = useStaking("SOMI");

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
  const isStaking = vortStaking.isStaking || somiStaking.isStaking;
  const isUnstaking = vortStaking.isUnstaking || somiStaking.isUnstaking;
  const isClaiming = vortStaking.isClaiming || somiStaking.isClaiming;

  // Combined success states
  const isStakeSuccess =
    vortStaking.isStakeSuccess || somiStaking.isStakeSuccess;
  const isUnstakeSuccess =
    vortStaking.isUnstakeSuccess || somiStaking.isUnstakeSuccess;
  const isClaimSuccess =
    vortStaking.isClaimSuccess || somiStaking.isClaimSuccess;

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
      lockPeriod: keyof typeof import("./use-staking").LOCK_PERIODS
    ) => {
      if (tokenType === "VORT") {
        return vortStaking.stakeTokens(amount, lockPeriod);
      } else {
        return somiStaking.stakeTokens(amount, lockPeriod);
      }
    },
    [vortStaking, somiStaking]
  );

  const unstakeTokens = useCallback(
    async (tokenType: "VORT" | "SOMI", amount: string) => {
      if (tokenType === "VORT") {
        return vortStaking.unstakeTokens(amount);
      } else {
        return somiStaking.unstakeTokens(amount);
      }
    },
    [vortStaking, somiStaking]
  );

  const claimAllRewards = useCallback(async () => {
    const promises = [];

    if (parseFloat(vortStaking.stakingData?.userPendingRewards || "0") > 0) {
      promises.push(vortStaking.claimUserRewards());
    }

    if (parseFloat(somiStaking.stakingData?.userPendingRewards || "0") > 0) {
      promises.push(somiStaking.claimUserRewards());
    }

    await Promise.all(promises);
  }, [vortStaking, somiStaking]);

  return {
    // Individual staking hooks
    vortStaking,
    somiStaking,

    // Combined data
    combinedData,

    // Combined loading states
    isLoading,
    isStaking,
    isUnstaking,
    isClaiming,

    // Combined success states
    isStakeSuccess,
    isUnstakeSuccess,
    isClaimSuccess,

    // Combined actions
    stakeTokens,
    unstakeTokens,
    claimAllRewards,
    refreshAllData,

    // Error handling
    error,
    setError,

    // Wallet state
    isConnected,
    address,
  };
}
