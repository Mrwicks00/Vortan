"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";

interface UserSaleInfo {
  purchasedBase: string;
  purchasedTokens: string;
  tgeClaimed: boolean;
  vestedClaimed: string;
}

export function useSalePoolUser(saleAddress?: string) {
  const { address } = useAccount();

  // Fetch user info from the sale pool contract
  const {
    data: userInfo,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "userInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!saleAddress && !!address,
    },
  });

  // Transform the data to a more usable format
  const transformedData: UserSaleInfo | null = userInfo
    ? {
        purchasedBase: userInfo[0]?.toString() || "0",
        purchasedTokens: userInfo[1]?.toString() || "0",
        tgeClaimed: userInfo[2] || false,
        vestedClaimed: userInfo[3]?.toString() || "0",
      }
    : null;

  return {
    userInfo: transformedData,
    isLoading,
    error,
    refetch,
  };
}
