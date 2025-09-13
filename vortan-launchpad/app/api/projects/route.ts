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
    if (!saleAddress || saleAddress === "TBD" || saleAddress === "pending") {
      return null;
    }

    // Fetch contract data in parallel
    const [
      baseToken,
      priceNum,
      priceDen,
      start,
      end,
      hardCapBase,
      softCapBase,
      totalRaisedBase,
      status,
      finalized,
      successful,
      tgeTime,
      tgeBps,
      vestDuration,
      tier1CapBase,
      tier2CapBase,
      tier3CapBase,
      perWalletCapBase,
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
        functionName: "totalRaisedBase",
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
        functionName: "vestDuration",
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
        functionName: "perWalletCapBase",
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
      baseTokenSymbol,
      priceDisplay,
      start: Number(start),
      end: Number(end),
      hardCapDisplay: `${hardCapDisplay} ${baseTokenSymbol}`,
      softCapDisplay: `${softCapDisplay} ${baseTokenSymbol}`,
      raisedPct: Math.min(raisedPct, 100),
      status: saleStatus,
      totalRaisedDisplay: `${totalRaisedDisplay} ${baseTokenSymbol}`,
      tgeTime: Number(tgeTime),
      tgeBps: Number(tgeBps),
      vestDuration: Number(vestDuration),
      tier1CapBase: Number(tier1CapBase),
      tier2CapBase: Number(tier2CapBase),
      tier3CapBase: Number(tier3CapBase),
      perWalletCapBase: Number(perWalletCapBase),
      projectOwner: projectOwner as string,
      finalized: finalized as boolean,
      successful: successful as boolean,
    };
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return null;
  }
}

export async function GET() {
  try {
    // Get all projects from Supabase
    const projects = await projectsApi.getAll();

    // Fetch contract data for each project in parallel
    const transformedProjects = await Promise.all(
      projects.map(async (project) => {
        // Fetch contract data if sale address exists
        const contractData = project.sale_address
          ? await fetchContractData(project.sale_address)
          : null;

        return {
          saleAddress: project.sale_address || "TBD",
          name: project.name,
          symbol: project.symbol,
          bannerUrl: project.banner_url || "/placeholder.jpg",
          logoUrl: project.logo_url || "/placeholder-logo.svg",
          description: project.short_description,
          website: project.website || "",
          socials: {
            x: project.twitter || "",
            discord: project.discord || "",
            medium: project.medium || "",
          },
          // Use contract data if available, otherwise fallback to defaults
          baseToken: contractData?.baseTokenSymbol || "USDC",
          priceDisplay: contractData?.priceDisplay || "TBD",
          status:
            contractData?.status ||
            (project.status === "live"
              ? "Live"
              : project.status === "pending"
              ? "Upcoming"
              : project.status === "ended"
              ? "Ended"
              : "Draft"),
          start: contractData?.start || 0,
          end: contractData?.end || 0,
          hardCap: contractData?.hardCapDisplay || "TBD",
          raisedPct: contractData?.raisedPct || 0,
          // Additional data for enhanced cards
          softCap: contractData?.softCapDisplay || "TBD",
          totalRaised: contractData?.totalRaisedDisplay || "0 USDC",
          tgeTime: contractData?.tgeTime || 0,
          tgeBps: contractData?.tgeBps || 0,
          vestDuration: contractData?.vestDuration || 0,
          tierCaps: {
            T1: contractData?.tier1CapBase
              ? contractData.tier1CapBase / 1e6
              : 0,
            T2: contractData?.tier2CapBase
              ? contractData.tier2CapBase / 1e6
              : 0,
            T3: contractData?.tier3CapBase
              ? contractData.tier3CapBase / 1e6
              : 0,
          },
          perWalletCap: contractData?.perWalletCapBase
            ? contractData.perWalletCapBase / 1e6
            : 0,
          projectOwner: contractData?.projectOwner || "",
          finalized: contractData?.finalized || false,
          successful: contractData?.successful || false,
        };
      })
    );

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
