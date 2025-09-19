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
    // Fetch contract data in parallel
    const [
      saleToken,
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
      totalSaleTokensDeposited,
      status,
      finalized,
      successful,
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
      baseToken: baseTokenSymbol,
      priceDisplay,
      start: Number(start),
      end: Number(end),
      tgeTime: Number(tgeTime),
      tgeBps: Number(tgeBps),
      vestStart: Number(vestStart),
      vestDuration: Number(vestDuration),
      hardCap: Number(hardCapBase) / 10 ** tokenDecimals,
      softCap: Number(softCapBase) / 10 ** tokenDecimals,
      perWalletCap: Number(perWalletCapBase) / 10 ** tokenDecimals,
      tierCaps: {
        T1: Number(tier1CapBase) / 10 ** tokenDecimals,
        T2: Number(tier2CapBase) / 10 ** tokenDecimals,
        T3: Number(tier3CapBase) / 10 ** tokenDecimals,
      },
      raised: Number(totalRaisedBase) / 10 ** tokenDecimals,
      tokensSold: Number(totalTokensSold) / 1e18, // Sale tokens are 18 decimals
      raisedPct: Math.min(raisedPct, 100),
      status: saleStatus,
      finalized: finalized as boolean,
      successful: successful as boolean,
      projectOwner: projectOwner as string,
      hardCapDisplay: `${hardCapDisplay} ${baseTokenSymbol}`,
      softCapDisplay: `${softCapDisplay} ${baseTokenSymbol}`,
      totalRaisedDisplay: `${totalRaisedDisplay} ${baseTokenSymbol}`,
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
    console.log(`🔍 Fetching participants for sale: ${saleAddress}`);

    // Get the current block number to query from contract creation
    const currentBlock = await publicClient.getBlockNumber();
    console.log(`📊 Current block: ${currentBlock}`);

    // Use chunked fetching to handle potential RPC block range limitations
    const CHUNK_SIZE = 500; // 500 blocks per chunk
    const uniqueParticipants = new Set<string>();

    // Start from a recent block range first (more likely to have participants)
    const recentBlocks = BigInt(10000); // Last 10,000 blocks
    const startBlock =
      currentBlock > recentBlocks ? currentBlock - recentBlocks : BigInt(0);

    console.log(
      `🚀 Starting participant search from block ${startBlock} to ${currentBlock}`
    );

    // Try recent blocks first
    let allLogs: any[] = [];

    for (
      let fromBlock = startBlock;
      fromBlock < currentBlock;
      fromBlock += BigInt(CHUNK_SIZE)
    ) {
      const toBlock =
        fromBlock + BigInt(CHUNK_SIZE) > currentBlock
          ? currentBlock
          : fromBlock + BigInt(CHUNK_SIZE);

      try {
        console.log(`📦 Fetching chunk: blocks ${fromBlock} to ${toBlock}`);

        const chunkLogs = await publicClient.getLogs({
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
          fromBlock,
          toBlock,
        });

        allLogs.push(...chunkLogs);
        console.log(`✅ Chunk success: found ${chunkLogs.length} events`);
      } catch (chunkError) {
        console.warn(
          `⚠️ Chunk failed for blocks ${fromBlock}-${toBlock}:`,
          chunkError
        );
        // Continue with next chunk
      }
    }

    // If no events found in recent blocks, try from block 0 with smaller chunks
    if (allLogs.length === 0 && startBlock > BigInt(0)) {
      console.log(
        `🔄 No participants found in recent blocks, searching from block 0...`
      );

      for (
        let fromBlock = BigInt(0);
        fromBlock < startBlock;
        fromBlock += BigInt(200)
      ) {
        const toBlock =
          fromBlock + BigInt(200) > startBlock
            ? startBlock
            : fromBlock + BigInt(200);

        try {
          const chunkLogs = await publicClient.getLogs({
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
            fromBlock,
            toBlock,
          });

          allLogs.push(...chunkLogs);

          // Stop early if we found participants
          if (chunkLogs.length > 0) {
            console.log(
              `🎯 Found participants in early blocks, stopping search`
            );
            break;
          }
        } catch (chunkError) {
          console.warn(
            `⚠️ Early chunk failed for blocks ${fromBlock}-${toBlock}:`,
            chunkError
          );
        }
      }
    }

    // Parse the logs to extract unique participants
    const parsedLogs = parseEventLogs({
      abi: SALE_POOL_ABI,
      logs: allLogs,
      eventName: "Bought",
    });

    // Count unique participants
    parsedLogs.forEach((log) => {
      if (log.args.user) {
        uniqueParticipants.add(log.args.user.toLowerCase());
      }
    });

    console.log(
      `🎉 Total participants found: ${uniqueParticipants.size} from ${allLogs.length} events`
    );
    return uniqueParticipants.size;
  } catch (error) {
    console.error("❌ Error counting participants:", error);
    return 0; // Return 0 if there's an error
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

    // Fetch participant count
    const participantCount = await getParticipantCount(saleAddress);

    // Fetch sale token symbol
    let saleTokenSymbol = "TOKEN";
    try {
      saleTokenSymbol = (await publicClient.readContract({
        address: contractData?.saleTokenAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "symbol",
            outputs: [{ name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "symbol",
      })) as string;
    } catch (error) {
      console.error("Error fetching token symbol:", error);
    }

    // Return project data with real contract data
    const projectDetail = {
      saleAddress: project.sale_address,
      saleTokenAddress: contractData?.saleTokenAddress || "",
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
        fundingStatus: contractData?.fundingStatus,
        tgeTime: contractData?.tgeTime || 0,
        tgeBps: contractData?.tgeBps || 0,
        vestDuration: contractData?.vestDuration || 0,
        vestStart: contractData?.vestStart || 0,
        projectOwner: contractData?.projectOwner || "",
        saleTokenSymbol: saleTokenSymbol,
      },
      stats: {
        raised: contractData?.raised || 0,
        buyers: participantCount,
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
