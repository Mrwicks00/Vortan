import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, positionId } = body

    // Simulate unstaking operation
    const unstakeResult = {
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      unstakedAmount: 1000, // Mock amount
      rewards: 120, // Mock rewards
      penalty: 0, // No penalty if lock period completed
      totalReceived: 1120,
    }

    return NextResponse.json({
      success: true,
      data: unstakeResult,
      message: "Successfully unstaked tokens",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to unstake tokens" }, { status: 500 })
  }
}
