import { NextResponse } from "next/server"

// Mock detailed project data as specified in the requirements
const mockProjectDetails = {
  "0xSale1": {
    saleAddress: "0xSale1",
    meta: {
      name: "Andromeda Quest",
      symbol: "ANDQ",
      bannerUrl: "/futuristic-space-game-banner-with-nebula.png",
      logoUrl: "/circular-space-game-logo-with-planet.png",
      description: "AI-powered MMO set in the Andromeda galaxy with procedural worlds and cross-dimensional gameplay.",
      longDescription:
        "Andromeda Quest represents the next evolution in gaming, combining artificial intelligence with blockchain technology to create an immersive MMO experience. Players explore procedurally generated worlds, engage in epic space battles, and build civilizations across multiple galaxies. The game features a player-driven economy, NFT-based assets, and revolutionary AI companions that learn and adapt to your playstyle.",
      website: "https://andromeda.example",
      socials: {
        x: "https://x.com/andromeda",
        discord: "https://discord.gg/andromeda",
        medium: "https://medium.com/@andromeda",
      },
    },
    sale: {
      baseToken: "USDC",
      priceDisplay: "50 ANDQ per 1 USDC",
      hardCap: 200000,
      softCap: 50000,
      perWalletCap: 1000,
      tierCaps: {
        T1: 1000,
        T2: 2000,
        T3: 5000,
      },
      start: 1724505600,
      end: 1724725200,
      tgeTime: 1724811600,
      tgeBps: 1000, // 10%
      vestDuration: 15552000, // 6 months
    },
    stats: {
      raised: 126000,
      buyers: 812,
      tokensSold: 6300000,
    },
  },
  "0xSale2": {
    saleAddress: "0xSale2",
    meta: {
      name: "Stellar Mining Corp",
      symbol: "SMC",
      bannerUrl: "/space-mining-operation-with-asteroids.png",
      logoUrl: "/mining-company-logo-with-pickaxe-and-star.png",
      description: "Decentralized asteroid mining protocol for rare earth elements.",
      longDescription:
        "Stellar Mining Corp is pioneering the future of space resource extraction through blockchain technology. Our protocol enables decentralized ownership and operation of asteroid mining operations, with smart contracts governing resource distribution and profit sharing. Token holders participate in mining decisions and receive rewards based on successful extractions.",
      website: "https://stellarmining.example",
      socials: {
        x: "https://x.com/stellarmining",
        discord: "https://discord.gg/stellarmining",
        medium: "https://medium.com/@stellarmining",
      },
    },
    sale: {
      baseToken: "SOMI",
      priceDisplay: "25 SMC per 1 SOMI",
      hardCap: 150000,
      softCap: 37500,
      perWalletCap: 800,
      tierCaps: {
        T1: 800,
        T2: 1600,
        T3: 4000,
      },
      start: 1724811600,
      end: 1725031200,
      tgeTime: 1725117600,
      tgeBps: 1500, // 15%
      vestDuration: 10368000, // 4 months
    },
    stats: {
      raised: 0,
      buyers: 0,
      tokensSold: 0,
    },
  },
}

export async function GET(request: Request, { params }: { params: { saleAddress: string } }) {
  const { saleAddress } = params
  const projectDetail = mockProjectDetails[saleAddress as keyof typeof mockProjectDetails]

  if (!projectDetail) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(projectDetail)
}
