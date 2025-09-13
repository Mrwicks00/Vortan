import { NextResponse } from "next/server";
import { projectsApi } from "@/lib/supabase/projects";
import { createPublicClient, http, formatUnits } from "viem";
import { somniaTestnet } from "@/lib/web3/config/chains";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";
import { USDC_TOKEN_ABI } from "@/lib/web3/abis/usdc-token";

// Create public client for reading contract data
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

async function fetchContractData(saleAddress: string) {
  try {
    // Fetch contract data in parallel
    const [
      baseToken,
      priceNum,
      priceDen,
      start,
      end,
      tgeTime,
      tgeBps,
      vestStart,
      vestDuration,
      hardCapBase,
      softCapBase,
      perWalletCapBase,
      tier1CapBase,
      tier2CapBase,
      tier3CapBase,
      totalRaisedBase,
      totalTokensSold,
      status,
      finalized,
      successful,
      projectOwner,
    ] = await Promise.all([
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "baseToken",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "priceNum",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "priceDen",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "start",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "end",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "tgeTime",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "tgeBps",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "vestStart",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "vestDuration",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "hardCapBase",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "softCapBase",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "perWalletCapBase",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "tier1CapBase",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "tier2CapBase",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "tier3CapBase",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "totalRaisedBase",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "totalTokensSold",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "status",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "finalized",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "successful",
      }),
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "projectOwner",
      }),
    ]);

    // Get base token symbol
    let baseTokenSymbol = "USDC";
    try {
      const symbol = await publicClient.readContract({
        address: baseToken as `0x${string}`,
        abi: USDC_TOKEN_ABI,
        functionName: "symbol",
      });
      baseTokenSymbol = symbol as string;
    } catch (error) {
      console.warn("Could not fetch base token symbol:", error);
    }

    // Calculate derived values
    const price =
      Number(priceDen) > 0 ? Number(priceNum) / Number(priceDen) : 0;
    const priceDisplay =
      price > 0 ? `${price.toFixed(6)} ${baseTokenSymbol}` : "TBD";

    const hardCapDisplay = formatUnits(hardCapBase as bigint, 6);
    const softCapDisplay = formatUnits(softCapBase as bigint, 6);
    const totalRaisedDisplay = formatUnits(totalRaisedBase as bigint, 6);

    const raisedPct =
      Number(hardCapBase) > 0
        ? (Number(totalRaisedBase) / Number(hardCapBase)) * 100
        : 0;

    // Determine status
    const now = Math.floor(Date.now() / 1000);
    let saleStatus = "Draft";

    if (finalized) {
      saleStatus = successful ? "Ended" : "Failed";
    } else if (now < Number(start)) {
      saleStatus = "Upcoming";
    } else if (now >= Number(start) && now <= Number(end)) {
      saleStatus = "Live";
    } else {
      saleStatus = "Ended";
    }

    return {
      baseToken: baseTokenSymbol,
      priceDisplay,
      start: Number(start),
      end: Number(end),
      tgeTime: Number(tgeTime),
      tgeBps: Number(tgeBps),
      vestStart: Number(vestStart),
      vestDuration: Number(vestDuration),
      hardCap: Number(hardCapBase) / 1e6,
      softCap: Number(softCapBase) / 1e6,
      perWalletCap: Number(perWalletCapBase) / 1e6,
      tierCaps: {
        T1: Number(tier1CapBase) / 1e6,
        T2: Number(tier2CapBase) / 1e6,
        T3: Number(tier3CapBase) / 1e6,
      },
      raised: Number(totalRaisedBase) / 1e6,
      tokensSold: Number(totalTokensSold) / 1e18, // Assuming 18 decimals for sale token
      raisedPct: Math.min(raisedPct, 100),
      status: saleStatus,
      finalized: finalized as boolean,
      successful: successful as boolean,
      projectOwner: projectOwner as string,
      hardCapDisplay: `${hardCapDisplay} ${baseTokenSymbol}`,
      softCapDisplay: `${softCapDisplay} ${baseTokenSymbol}`,
      totalRaisedDisplay: `${totalRaisedDisplay} ${baseTokenSymbol}`,
    };
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { saleAddress: string } }
) {
  try {
    const { saleAddress } = params;

    // Get project metadata from Supabase
    const project = await projectsApi.getBySaleAddress(saleAddress);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch contract data
    const contractData = await fetchContractData(saleAddress);

    // Return project data with real contract data
    const projectDetail = {
      saleAddress: project.sale_address,
      meta: {
        name: project.name,
        symbol: project.symbol,
        bannerUrl: project.banner_url || "/placeholder.jpg",
        logoUrl: project.logo_url || "/placeholder-logo.svg",
        description: project.short_description,
        longDescription: project.long_description || project.short_description,
        website: project.website || "",
        socials: {
          x: project.twitter || "",
          discord: project.discord || "",
          medium: project.medium || "",
        },
      },
      sale: {
        baseToken: contractData?.baseToken || "USDC",
        priceDisplay: contractData?.priceDisplay || "TBD",
        hardCap: contractData?.hardCap || 0,
        softCap: contractData?.softCap || 0,
        perWalletCap: contractData?.perWalletCap || 0,
        tierCaps: contractData?.tierCaps || {
          T1: 0,
          T2: 0,
          T3: 0,
        },
        start: contractData?.start || 0,
        end: contractData?.end || 0,
        tgeTime: contractData?.tgeTime || 0,
        tgeBps: contractData?.tgeBps || 0,
        vestDuration: contractData?.vestDuration || 0,
        vestStart: contractData?.vestStart || 0,
      },
      stats: {
        raised: contractData?.raised || 0,
        buyers: 0, // Would need to fetch from events
        tokensSold: contractData?.tokensSold || 0,
        raisedPct: contractData?.raisedPct || 0,
        status: contractData?.status || "Draft",
        finalized: contractData?.finalized || false,
        successful: contractData?.successful || false,
      },
      projectOwner: contractData?.projectOwner || "",
    };

    return NextResponse.json(projectDetail);
  } catch (error) {
    console.error("Error fetching project details:", error);
    return NextResponse.json(
      { error: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}
