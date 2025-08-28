"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, Target, Wallet } from "lucide-react"

interface SalePanelProps {
  sale: {
    baseToken: string
    priceDisplay: string
    hardCap: number
    softCap: number
    perWalletCap: number
    tierCaps: {
      T1: number
      T2: number
      T3: number
    }
    start: number
    end: number
    tgeTime: number
    tgeBps: number
    vestDuration: number
  }
  stats: {
    raised: number
    buyers: number
    tokensSold: number
  }
  status: "Live" | "Upcoming" | "Ended"
}

export function SalePanel({ sale, stats, status }: SalePanelProps) {
  const [amount, setAmount] = useState("")
  const [isApproved, setIsApproved] = useState(false)

  const progressPercentage = (stats.raised / sale.hardCap) * 100
  const timeLeft = sale.end - Math.floor(Date.now() / 1000)
  const isActive = status === "Live" && timeLeft > 0

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Ended"
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const handleApprove = () => {
    setIsApproved(true)
    // Mock approval - in real app would call smart contract
  }

  const handleBuy = () => {
    // Mock buy transaction - in real app would call smart contract
    alert(`Simulated purchase of ${amount} ${sale.baseToken} worth of tokens`)
  }

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Token Sale</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sale Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-semibold">{sale.priceDisplay}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Base Token</p>
            <Badge variant="outline">{sale.baseToken}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Hard Cap</p>
            <p className="font-semibold">
              {formatNumber(sale.hardCap)} {sale.baseToken}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Soft Cap</p>
            <p className="font-semibold">
              {formatNumber(sale.softCap)} {sale.baseToken}
            </p>
          </div>
        </div>

        <Separator />

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {formatNumber(stats.raised)} {sale.baseToken} raised
            </span>
            <span>
              {formatNumber(sale.hardCap)} {sale.baseToken} goal
            </span>
          </div>
        </div>

        <Separator />

        {/* Time and Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Time Left</p>
              <p className="font-semibold text-secondary">{formatTimeLeft(timeLeft)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="font-semibold text-accent">{formatNumber(stats.buyers)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tier Caps */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Tier Limits</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded bg-muted/20">
              <p className="text-xs text-muted-foreground">T1</p>
              <p className="font-semibold text-sm">{formatNumber(sale.tierCaps.T1)}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/20">
              <p className="text-xs text-muted-foreground">T2</p>
              <p className="font-semibold text-sm">{formatNumber(sale.tierCaps.T2)}</p>
            </div>
            <div className="text-center p-2 rounded bg-muted/20">
              <p className="text-xs text-muted-foreground">T3</p>
              <p className="font-semibold text-sm">{formatNumber(sale.tierCaps.T3)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Purchase Interface */}
        {isActive ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount ({sale.baseToken})</label>
              <Input
                type="number"
                placeholder={`Enter ${sale.baseToken} amount`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">
                Max per wallet: {formatNumber(sale.perWalletCap)} {sale.baseToken}
              </p>
            </div>

            <div className="space-y-2">
              {!isApproved ? (
                <Button
                  onClick={handleApprove}
                  className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
                  disabled={!amount || Number.parseFloat(amount) <= 0}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Approve {sale.baseToken}
                </Button>
              ) : (
                <Button
                  onClick={handleBuy}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 animate-glow"
                  disabled={!amount || Number.parseFloat(amount) <= 0}
                >
                  Buy Tokens
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{status === "Upcoming" ? "Sale not started yet" : "Sale has ended"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {status === "Upcoming" ? `Starts: ${formatDate(sale.start)}` : `Ended: ${formatDate(sale.end)}`}
            </p>
          </div>
        )}

        {/* Sale Timeline */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Start:</span>
            <span>{formatDate(sale.start)}</span>
          </div>
          <div className="flex justify-between">
            <span>End:</span>
            <span>{formatDate(sale.end)}</span>
          </div>
          <div className="flex justify-between">
            <span>TGE:</span>
            <span>{formatDate(sale.tgeTime)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
