import { NextResponse } from "next/server"

// Mock staking data as specified in the requirements
const mockStakingData = {
  "0x1234567890123456789012345678901234567890": {
    vort: {
      positions: [
        {
          amount: "2000",
          lockEnd: 1729900000, // ~6 months from now
          multBps: 12000, // 120% multiplier for 180 days
        },
        {
          amount: "1500",
          lockEnd: 1727308000, // ~3 months from now
          multBps: 11000, // 110% multiplier for 90 days
        },
      ],
      points: "2400",
      pending: "35.2",
    },
    somi: {
      positions: [
        {
          amount: "1000",
          lockEnd: 1727000000, // ~2.5 months from now
          multBps: 10000, // 100% multiplier for 30 days
        },
      ],
      points: "1000",
      pending: "12.5",
    },
    aggregator: {
      somiWeightBps: 8000, // 80% weight for SOMI
      t1: "1000",
      t2: "5000",
      t3: "20000",
      combined: "3200", // (2400 + 1000 * 0.8)
      tier: 2, // T2 tier
    },
  },
}

export async function GET(request: Request, { params }: { params: { address: string } }) {
  const { address } = params

  // For demo purposes, return mock data for any address
  // In real implementation, this would query actual staking contracts
  const stakingData = mockStakingData["0x1234567890123456789012345678901234567890"]

  return NextResponse.json(stakingData)
}
