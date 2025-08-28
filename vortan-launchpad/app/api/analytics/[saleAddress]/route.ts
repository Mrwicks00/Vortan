import { NextResponse } from "next/server"

// Mock analytics data as specified in the requirements
const mockAnalyticsData = {
  "0xSale1": {
    x: {
      mentions24h: 1280,
      series: [
        ["2025-08-20", 720],
        ["2025-08-21", 940],
        ["2025-08-22", 1280],
        ["2025-08-23", 1150],
        ["2025-08-24", 1420],
        ["2025-08-25", 1680],
      ],
    },
    discord: {
      newMembers7d: 842,
      series: [
        ["2025-08-16", 12000],
        ["2025-08-17", 12120],
        ["2025-08-18", 12280],
        ["2025-08-19", 12450],
        ["2025-08-20", 12580],
        ["2025-08-21", 12720],
        ["2025-08-22", 12842],
      ],
    },
    medium: {
      reads7d: 3400,
      series: [
        ["2025-08-16", 2100],
        ["2025-08-17", 2250],
        ["2025-08-18", 2400],
        ["2025-08-19", 2650],
        ["2025-08-20", 2850],
        ["2025-08-21", 3100],
        ["2025-08-22", 3400],
      ],
    },
    onchain: {
      buyers24h: 312,
      txSeries: [
        ["10:00", 12],
        ["11:00", 22],
        ["12:00", 35],
        ["13:00", 28],
        ["14:00", 45],
        ["15:00", 38],
        ["16:00", 52],
        ["17:00", 41],
        ["18:00", 39],
      ],
    },
    sentiment: {
      score: 72,
      label: "Heating",
    },
    highlights: [
      { time: "2h ago", text: "Top wallet bought 2,500 USDC worth of tokens" },
      { time: "5h ago", text: "Partner DAO retweeted launch announcement" },
      { time: "8h ago", text: "Medium article reached 1,000 reads milestone" },
      { time: "12h ago", text: "Discord community crossed 12,800 members" },
      { time: "1d ago", text: "Project featured in major crypto newsletter" },
    ],
  },
  "0xSale2": {
    x: {
      mentions24h: 450,
      series: [
        ["2025-08-20", 200],
        ["2025-08-21", 280],
        ["2025-08-22", 320],
        ["2025-08-23", 380],
        ["2025-08-24", 420],
        ["2025-08-25", 450],
      ],
    },
    discord: {
      newMembers7d: 234,
      series: [
        ["2025-08-16", 5200],
        ["2025-08-17", 5280],
        ["2025-08-18", 5320],
        ["2025-08-19", 5380],
        ["2025-08-20", 5410],
        ["2025-08-21", 5430],
        ["2025-08-22", 5434],
      ],
    },
    medium: {
      reads7d: 1200,
      series: [
        ["2025-08-16", 800],
        ["2025-08-17", 850],
        ["2025-08-18", 920],
        ["2025-08-19", 980],
        ["2025-08-20", 1050],
        ["2025-08-21", 1120],
        ["2025-08-22", 1200],
      ],
    },
    onchain: {
      buyers24h: 0,
      txSeries: [
        ["10:00", 0],
        ["11:00", 0],
        ["12:00", 0],
        ["13:00", 0],
        ["14:00", 0],
        ["15:00", 0],
        ["16:00", 0],
        ["17:00", 0],
        ["18:00", 0],
      ],
    },
    sentiment: {
      score: 58,
      label: "Stable",
    },
    highlights: [
      { time: "3h ago", text: "New partnership announcement on Twitter" },
      { time: "6h ago", text: "Community AMA scheduled for next week" },
      { time: "1d ago", text: "Whitepaper v2.0 released on Medium" },
      { time: "2d ago", text: "Discord bot integration completed" },
      { time: "3d ago", text: "First community contest launched" },
    ],
  },
}

export async function GET(request: Request, { params }: { params: { saleAddress: string } }) {
  const { saleAddress } = params
  const analyticsData = mockAnalyticsData[saleAddress as keyof typeof mockAnalyticsData]

  if (!analyticsData) {
    return NextResponse.json({ error: "Analytics data not found" }, { status: 404 })
  }

  return NextResponse.json(analyticsData)
}
