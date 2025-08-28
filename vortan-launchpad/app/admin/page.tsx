"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { CreateSaleForm } from "@/components/admin/create-sale-form"
import { SalesList } from "@/components/admin/sales-list"
import { useToast } from "@/hooks/use-toast"

interface Sale {
  saleAddress: string
  name: string
  symbol: string
  status: "Live" | "Upcoming" | "Ended"
  hardCap: string
  raised: number
  buyers: number
  createdAt: string
}

export default function AdminPage() {
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([
    {
      saleAddress: "0xSale1",
      name: "Andromeda Quest",
      symbol: "ANDQ",
      status: "Live",
      hardCap: "200,000 USDC",
      raised: 126000,
      buyers: 812,
      createdAt: "2025-08-20",
    },
    {
      saleAddress: "0xSale2",
      name: "Stellar Mining Corp",
      symbol: "SMC",
      status: "Upcoming",
      hardCap: "150,000 SOMI",
      raised: 0,
      buyers: 0,
      createdAt: "2025-08-22",
    },
  ])

  const handleCreateSale = (formData: any) => {
    // Mock sale creation
    const newSale: Sale = {
      saleAddress: `0xSale${Date.now()}`,
      name: formData.name,
      symbol: formData.symbol,
      status: "Upcoming",
      hardCap: `${new Intl.NumberFormat().format(Number.parseFloat(formData.hardCap))} ${formData.baseToken}`,
      raised: 0,
      buyers: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setSales((prev) => [newSale, ...prev])

    toast({
      title: "Sale Created Successfully",
      description: `${formData.name} (${formData.symbol}) sale has been created and is pending launch.`,
    })

    // In real implementation, this would:
    // 1. Deploy smart contract
    // 2. Upload media to IPFS/storage
    // 3. Store metadata in database
    // 4. Return transaction hash and contract address
  }

  const handleDepositTokens = (saleAddress: string) => {
    const sale = sales.find((s) => s.saleAddress === saleAddress)
    if (sale) {
      toast({
        title: "Token Deposit Simulated",
        description: `Simulated token deposit for ${sale.name}. In production, this would call the smart contract.`,
      })
    }

    // In real implementation, this would:
    // 1. Calculate required token amount
    // 2. Call smart contract deposit function
    // 3. Update sale status to "Live"
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create and manage token sales across the Vortan launchpad platform
          </p>
        </div>

        <CreateSaleForm onSubmit={handleCreateSale} />

        <SalesList sales={sales} onDepositTokens={handleDepositTokens} />
      </div>
    </MainLayout>
  )
}
