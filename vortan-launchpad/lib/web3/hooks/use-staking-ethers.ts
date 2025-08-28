"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "../config/addresses";
import { VORT_STAKING_ABI, SOMI_STAKING_ABI } from "../abis";
import { useWallet } from "../contexts/wallet-context";

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

export function useStakingEthers(tokenType: "VORT" | "SOMI") {
  const { address, isConnected } = useWallet();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [stakingData, setStakingData] = useState<StakingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contract address and ABI based on token type
  const contractAddress =
    tokenType === "VORT"
      ? CONTRACT_ADDRESSES.VORT_STAKING
      : CONTRACT_ADDRESSES.SOMI_STAKING;

  const contractABI =
    tokenType === "VORT" ? VORT_STAKING_ABI : SOMI_STAKING_ABI;

  // Initialize ethers provider and signer when wallet connects
  useEffect(() => {
    const initEthers = async () => {
      if (!isConnected || !address) {
        setProvider(null);
        setSigner(null);
        return;
      }

      try {
        // Check if MetaMask is installed
        if (typeof window !== "undefined" && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Get signer
          const signer = await provider.getSigner();
          setSigner(signer);

          console.log(`[${tokenType}] Ethers initialized:`, {
            contractAddress,
            address,
            isConnected: true,
          });
        }
      } catch (err) {
        console.error(`[${tokenType}] Failed to initialize ethers:`, err);
        setError("Failed to connect wallet");
      }
    };

    initEthers();
  }, [isConnected, address, tokenType, contractAddress]);

  // Fetch staking data
  const fetchStakingData = useCallback(async () => {
    if (!provider || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

      console.log(`[${tokenType}] Fetching contract data...`);

      // Fetch all contract data in parallel
      const [
        totalStaked,
        totalPoints,
        rewardRate,
        mult30d,
        mult90d,
        mult180d,
        userPendingRewards,
        userTotalPoints,
        userPositions,
      ] = await Promise.all([
        contract.totalStaked(address),
        contract.totalPoints(),
        contract.rewardRatePerSecond(),
        contract.mult30d(),
        contract.mult90d(),
        contract.mult180d(),
        contract.pendingRewards(address),
        contract.tierPointsOf(address),
        contract.positionsOf(address),
      ]);

      console.log(`[${tokenType}] Contract data fetched:`, {
        totalStaked: totalStaked.toString(),
        totalPoints: totalPoints.toString(),
        rewardRate: rewardRate.toString(),
        mult30d: mult30d.toString(),
        mult90d: mult90d.toString(),
        mult180d: mult180d.toString(),
        userPendingRewards: userPendingRewards.toString(),
        userTotalPoints: userTotalPoints.toString(),
        userPositions: userPositions.length,
      });

      // Transform user positions data
      const transformedPositions: StakingPosition[] = userPositions.map(
        (pos: any, index: number) => ({
          id: index,
          amount: ethers.formatEther(pos.amount),
          lockEnd: Number(pos.lockEnd),
          multBps: Number(pos.multBps),
          multiplier: Number(pos.multBps) / 10000,
          lockPeriod:
            pos.lockEnd > 0
              ? ((Number(pos.lockEnd) - Date.now() / 1000 > 150 * 24 * 60 * 60
                  ? "180"
                  : Number(pos.lockEnd) - Date.now() / 1000 > 60 * 24 * 60 * 60
                  ? "90"
                  : "30") as LockPeriod)
              : "30",
          pendingRewards: "0",
        })
      );

      const data: StakingData = {
        totalStaked: ethers.formatEther(totalStaked),
        totalPoints: ethers.formatEther(totalPoints),
        rewardRate: ethers.formatEther(rewardRate),
        lockMultipliers: {
          t30: Number(mult30d) / 10000,
          t90: Number(mult90d) / 10000,
          t180: Number(mult180d) / 10000,
        },
        userPositions: transformedPositions,
        userTotalStaked: ethers.formatEther(totalStaked),
        userTotalPoints: ethers.formatEther(userTotalPoints),
        userPendingRewards: ethers.formatEther(userPendingRewards),
      };

      setStakingData(data);
      console.log(`[${tokenType}] Staking data set:`, data);
    } catch (err) {
      console.error(`[${tokenType}] Failed to fetch staking data:`, err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch staking data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [provider, address, contractAddress, contractABI, tokenType]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchStakingData();
  }, [fetchStakingData]);

  // Fetch data when provider or address changes
  useEffect(() => {
    if (provider && address) {
      fetchStakingData();
    }
  }, [provider, address, fetchStakingData]);

  // Stake tokens
  const stakeTokens = useCallback(
    async (amount: string, lockPeriod: LockPeriod) => {
      if (!signer || !address) {
        throw new Error("Please connect your wallet");
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const amountWei = ethers.parseEther(amount);

        console.log(
          `[${tokenType}] Staking ${amount} tokens for ${lockPeriod} days...`
        );

        const tx = await contract.stake(amountWei, lockPeriod);
        const receipt = await tx.wait();

        console.log(
          `[${tokenType}] Stake transaction confirmed:`,
          receipt.hash
        );

        // Refresh data after successful stake
        await fetchStakingData();

        return receipt;
      } catch (err) {
        console.error(`[${tokenType}] Stake failed:`, err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to stake tokens";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [signer, address, contractAddress, contractABI, tokenType, fetchStakingData]
  );

  // Unstake tokens
  const unstakeTokens = useCallback(
    async (amount: string) => {
      if (!signer || !address) {
        throw new Error("Please connect your wallet");
      }

      try {
        setIsLoading(true);
        setError(null);

        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const amountWei = ethers.parseEther(amount);

        console.log(`[${tokenType}] Unstaking ${amount} tokens...`);

        const tx = await contract.unstake(amountWei);
        const receipt = await tx.wait();

        console.log(
          `[${tokenType}] Unstake transaction confirmed:`,
          receipt.hash
        );

        // Refresh data after successful unstake
        await fetchStakingData();

        return receipt;
      } catch (err) {
        console.error(`[${tokenType}] Unstake failed:`, err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to unstake tokens";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [signer, address, contractAddress, contractABI, tokenType, fetchStakingData]
  );

  // Claim rewards
  const claimUserRewards = useCallback(async () => {
    if (!signer || !address) {
      throw new Error("Please connect your wallet");
    }

    try {
      setIsLoading(true);
      setError(null);

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      console.log(`[${tokenType}] Claiming rewards...`);

      const tx = await contract.claim();
      const receipt = await tx.wait();

      console.log(`[${tokenType}] Claim transaction confirmed:`, receipt.hash);

      // Refresh data after successful claim
      await fetchStakingData();

      return receipt;
    } catch (err) {
      console.error(`[${tokenType}] Claim failed:`, err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to claim rewards";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    signer,
    address,
    contractAddress,
    contractABI,
    tokenType,
    fetchStakingData,
  ]);

  // Check token allowance
  const checkAllowance = useCallback(async () => {
    console.log(`[${tokenType}] Check allowance called:`, {
      provider,
      address,
      contractAddress,
    });

    if (!provider || !address) return "0";

    try {
      // Get the token contract (stakeToken)
      const tokenAddress =
        tokenType === "VORT"
          ? CONTRACT_ADDRESSES.VORTAN_TOKEN
          : CONTRACT_ADDRESSES.SOMI_TOKEN;

      const tokenABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
      ];

      console.log(
        `[${tokenType}] Creating token contract for allowance check:`,
        { tokenAddress, contractAddress }
      );

      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        provider
      );
      const allowance = await tokenContract.allowance(address, contractAddress);

      console.log(
        `[${tokenType}] Token allowance:`,
        ethers.formatEther(allowance)
      );
      return ethers.formatEther(allowance);
    } catch (err) {
      console.error(`[${tokenType}] Failed to check allowance:`, err);
      return "0";
    }
  }, [provider, address, contractAddress, tokenType]);

  // Approve tokens
  const approveTokens = useCallback(
    async (amount: string) => {
      console.log(`[${tokenType}] Approve tokens called:`, {
        amount,
        signer,
        address,
      });

      if (!signer || !address) {
        throw new Error("Please connect your wallet");
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get the token contract (stakeToken)
        const tokenAddress =
          tokenType === "VORT"
            ? CONTRACT_ADDRESSES.VORTAN_TOKEN
            : CONTRACT_ADDRESSES.SOMI_TOKEN;

        const tokenABI = [
          "function approve(address spender, uint256 amount) returns (bool)",
        ];

        console.log(`[${tokenType}] Creating token contract:`, {
          tokenAddress,
          contractAddress,
        });

        const tokenContract = new ethers.Contract(
          tokenAddress,
          tokenABI,
          signer
        );
        const amountWei = ethers.parseEther(amount);

        console.log(
          `[${tokenType}] Approving ${amount} tokens for staking contract...`
        );

        const tx = await tokenContract.approve(contractAddress, amountWei);
        console.log(`[${tokenType}] Approval transaction sent:`, tx.hash);

        const receipt = await tx.wait();
        console.log(
          `[${tokenType}] Approval transaction confirmed:`,
          receipt.hash
        );

        return receipt;
      } catch (err) {
        console.error(`[${tokenType}] Approval failed:`, err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to approve tokens";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [signer, address, contractAddress, tokenType]
  );

  // Get user token balance
  const getUserTokenBalance = useCallback(async () => {
    console.log(`[${tokenType}] Get user token balance called:`, {
      provider,
      address,
    });

    if (!provider || !address) return "0";

    try {
      const tokenAddress =
        tokenType === "VORT"
          ? CONTRACT_ADDRESSES.VORTAN_TOKEN
          : CONTRACT_ADDRESSES.SOMI_TOKEN;

      const tokenABI = [
        "function balanceOf(address account) view returns (uint256)",
      ];

      console.log(`[${tokenType}] Creating token contract for balance check:`, {
        tokenAddress,
      });

      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        provider
      );
      const balance = await tokenContract.balanceOf(address);

      console.log(
        `[${tokenType}] User token balance:`,
        ethers.formatEther(balance)
      );

      return ethers.formatEther(balance);
    } catch (err) {
      console.error(`[${tokenType}] Failed to get token balance:`, err);
      return "0";
    }
  }, [provider, address, tokenType]);

  return {
    // Data
    stakingData,
    address,
    isConnected,

    // Actions
    stakeTokens,
    unstakeTokens,
    claimUserRewards,
    refreshData,
    approveTokens,
    checkAllowance,
    getUserTokenBalance,

    // Loading states
    isLoading,

    // Error handling
    error,
    setError,
  };
}
