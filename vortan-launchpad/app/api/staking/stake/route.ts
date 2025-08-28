import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, token, amount, lockPeriod } = body

    // Simulate staking operation
    const stakeResult = {
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      stakedAmount: amount,
      token,
      lockPeriod,
      multiplier: lockPeriod === 30 ? 1.0 : lockPeriod === 90 ? 1.5 : 2.0,
      estimatedRewards: amount * 0.12 * (lockPeriod / 365), // 12% APY
      unlockDate: new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: stakeResult,
      message: `Successfully staked ${amount} ${token}`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to stake tokens" }, { status: 500 })
  }
}
