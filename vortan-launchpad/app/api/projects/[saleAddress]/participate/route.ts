import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { saleAddress: string } }) {
  try {
    const body = await request.json()
    const { address, amount, paymentToken } = body
    const { saleAddress } = params

    // Simulate participation in token sale
    const participationResult = {
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      saleAddress,
      participantAddress: address,
      contributionAmount: amount,
      paymentToken,
      tokensAllocated: amount * 100, // Mock token allocation rate
      vestingSchedule: {
        tgePercent: 20,
        cliffMonths: 1,
        vestingMonths: 12,
      },
      participationTime: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: participationResult,
      message: `Successfully participated with ${amount} ${paymentToken}`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to participate in sale" }, { status: 500 })
  }
}
