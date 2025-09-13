"use client";

import { useCallback, useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { projectsApi } from "@/lib/supabase/projects";
import { Project } from "@/lib/supabase/types";
import { SALE_POOL_ABI } from "../abis/sale-pool";
import { formatEther } from "viem";

interface ProjectData extends Project {
  // On-chain data
  onChainData?: {
    totalRaised: string;
    totalTokensSold: string;
    status: number;
    finalized: boolean;
    successful: boolean;
    startTime: number;
    endTime: number;
    hardCap: string;
    softCap: string;
    price: string;
  };
}

export function useProjectData(saleAddress?: string) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read on-chain data
  const { data: saleStats } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "saleStats",
  });

  const { data: startTime } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "start",
  });

  const { data: endTime } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "end",
  });

  const { data: hardCap } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "hardCapBase",
  });

  const { data: softCap } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "softCapBase",
  });

  const { data: priceNum } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "priceNum",
  });

  const { data: priceDen } = useReadContract({
    address: saleAddress as `0x${string}`,
    abi: SALE_POOL_ABI,
    functionName: "priceDen",
  });

  // Fetch project metadata
  const fetchProjectData = useCallback(async () => {
    if (!saleAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const project = await projectsApi.getBySaleAddress(saleAddress);
      setProjectData(project as ProjectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch project data");
    } finally {
      setIsLoading(false);
    }
  }, [saleAddress]);

  // Update project data when on-chain data changes
  useEffect(() => {
    if (projectData && saleStats && startTime && endTime && hardCap && softCap && priceNum && priceDen) {
      const onChainData = {
        totalRaised: formatEther(saleStats[0] || BigInt(0)),
        totalTokensSold: formatEther(saleStats[1] || BigInt(0)),
        status: Number(saleStats[3] || 0),
        finalized: Boolean(saleStats[3]),
        successful: Boolean(saleStats[4]),
        startTime: Number(startTime),
        endTime: Number(endTime),
        hardCap: formatEther(hardCap),
        softCap: formatEther(softCap),
        price: priceDen > 0 ? (Number(priceNum) / Number(priceDen)).toString() : "0",
      };

      setProjectData(prev => prev ? { ...prev, onChainData } : null);
    }
  }, [projectData, saleStats, startTime, endTime, hardCap, softCap, priceNum, priceDen]);

  // Load project data on mount
  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  return {
    projectData,
    isLoading,
    error,
    fetchProjectData,
  };
}
