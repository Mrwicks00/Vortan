import { NextResponse } from "next/server";
import { projectsApi } from "@/lib/supabase/projects";
import { createPublicClient, http, formatUnits, parseEventLogs } from "viem";
import { somniaTestnet } from "@/lib/web3/config/chains";
import { SALE_POOL_ABI } from "@/lib/web3/abis/sale-pool";
import { USDC_TOKEN_ABI } from "@/lib/web3/abis/usdc-token";
import { SOMI_TOKEN_ABI } from "@/lib/web3/abis/somi-token";
import {
  BASE_TOKEN_ADDRESSES,
  BASE_TOKEN_DECIMALS,
} from "@/lib/web3/utils/token-resolver";

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
      saleToken,
      baseToken,
      priceNum,
      priceDen,
      start,
      end,
      hardCapBase,
      softCapBase,
      totalRaisedBase,
      totalSaleTokensDeposited,
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
        functionName: "saleToken",
      }),
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
        functionName: "totalSaleTokensDeposited",
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

    // Get base token symbol and determine token type
    let baseTokenSymbol = "USDC";
    let tokenDecimals = 6; // Default to USDC decimals

    try {
      // Determine which ABI to use based on contract address
      const isUSDC =
        baseToken.toLowerCase() === BASE_TOKEN_ADDRESSES.USDC.toLowerCase();
      const isSOMI =
        baseToken.toLowerCase() === BASE_TOKEN_ADDRESSES.SOMI.toLowerCase();

      const abi = isUSDC
        ? USDC_TOKEN_ABI
        : isSOMI
        ? SOMI_TOKEN_ABI
        : USDC_TOKEN_ABI;
      const tokenType = isUSDC ? "USDC" : isSOMI ? "SOMI" : "USDC";

      const symbol = await publicClient.readContract({
        address: baseToken as `0x${string}`,
        abi: abi,
        functionName: "symbol",
      });
      baseTokenSymbol = symbol as string;
      tokenDecimals =
        BASE_TOKEN_DECIMALS[tokenType as keyof typeof BASE_TOKEN_DECIMALS];
    } catch (error) {
      console.warn("Could not fetch base token symbol:", error);
    }

    // Calculate derived values
    const tokensPerBase =
      Number(priceDen) > 0 ? Number(priceNum) / Number(priceDen) : 0;
    const priceDisplay =
      tokensPerBase > 0
        ? `1 ${baseTokenSymbol} = ${tokensPerBase.toFixed(2)} tokens`
        : "TBD";

    const hardCapDisplay = formatUnits(hardCapBase as bigint, tokenDecimals);
    const softCapDisplay = formatUnits(softCapBase as bigint, tokenDecimals);
    const totalRaisedDisplay = formatUnits(
      totalRaisedBase as bigint,
      tokenDecimals
    );

    const raisedPct =
      Number(hardCapBase) > 0
        ? (Number(totalRaisedBase) / Number(hardCapBase)) * 100
        : 0;

    // Get required deposit tokens to check if funded
    const [requiredDeposit] = await Promise.all([
      publicClient.readContract({
        address: saleAddress as `0x${string}`,
        abi: SALE_POOL_ABI,
        functionName: "requiredDepositTokens",
      }),
    ]);

    const requiredTokens = requiredDeposit[2] as bigint; // totalRequired is the third return value
    const isFunded = (totalSaleTokensDeposited as bigint) >= requiredTokens;

    // Determine status (separate sale status and funding status)
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
      tokenDecimals,
      isFunded,
      fundingStatus: isFunded ? "Funded" : "Unfunded",
      totalSaleTokensDeposited: Number(totalSaleTokensDeposited),
      requiredTokens: Number(requiredTokens),
      saleTokenAddress: saleToken as string,
    };
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return null;
  }
}

async function getParticipantCount(saleAddress: string): Promise<number> {
  try {
    // Get all Bought events from the contract
    const logs = await publicClient.getLogs({
      address: saleAddress as `0x${string}`,
      event: {
        type: "event",
        name: "Bought",
        inputs: [
          { name: "user", type: "address", indexed: true },
          { name: "baseAmount", type: "uint256", indexed: false },
          { name: "tokenAmount", type: "uint256", indexed: false },
        ],
      },
      fromBlock: "earliest",
      toBlock: "latest",
    });

    // Count unique participants
    const uniqueParticipants = new Set<string>();
    const parsedLogs = parseEventLogs({
      abi: SALE_POOL_ABI,
      logs,
      eventName: "Bought",
    });

    parsedLogs.forEach((log) => {
      if (log.args.user) {
        uniqueParticipants.add(log.args.user.toLowerCase());
      }
    });

    return uniqueParticipants.size;
  } catch (error) {
    console.error("Error counting participants:", error);
    return 0;
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

        // Fetch participant count if contract data exists
        const participantCount = contractData
          ? await getParticipantCount(project.sale_address)
          : 0;

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
          fundingStatus: contractData?.fundingStatus,
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
          projectOwner: contractData?.projectOwner || "",
          tierCaps: {
            T1: contractData?.tier1CapBase
              ? contractData.tier1CapBase /
                10 ** (contractData.tokenDecimals || 6)
              : 0,
            T2: contractData?.tier2CapBase
              ? contractData.tier2CapBase /
                10 ** (contractData.tokenDecimals || 6)
              : 0,
            T3: contractData?.tier3CapBase
              ? contractData.tier3CapBase /
                10 ** (contractData.tokenDecimals || 6)
              : 0,
          },
          perWalletCap: contractData?.perWalletCapBase
            ? contractData.perWalletCapBase /
              10 ** (contractData.tokenDecimals || 6)
            : 0,
          projectOwner: contractData?.projectOwner || "",
          finalized: contractData?.finalized || false,
          successful: contractData?.successful || false,
          stats: {
            raised: contractData?.raised || 0,
            buyers: participantCount,
            tokensSold: contractData?.tokensSold || 0,
            raisedPct: contractData?.raisedPct || 0,
          },
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
