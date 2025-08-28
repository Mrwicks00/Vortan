import { type NextRequest, NextResponse } from "next/server"

// Mock database for admin sales
const adminSales = [
  {
    id: "1",
    name: "Stellar Nexus",
    token: "SNEX",
    status: "active",
    totalRaised: 2500000,
    targetRaise: 5000000,
    participants: 1250,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    saleAddress: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    name: "Quantum Bridge",
    token: "QBDG",
    status: "upcoming",
    totalRaised: 0,
    targetRaise: 3000000,
    participants: 0,
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    saleAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    createdAt: "2024-02-20T14:30:00Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: adminSales,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch admin sales" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate sale creation
    const newSale = {
      id: String(adminSales.length + 1),
      ...body,
      status: "draft",
      totalRaised: 0,
      participants: 0,
      saleAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      createdAt: new Date().toISOString(),
    }

    adminSales.push(newSale)

    return NextResponse.json({
      success: true,
      data: newSale,
      message: "Sale created successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create sale" }, { status: 500 })
  }
}
