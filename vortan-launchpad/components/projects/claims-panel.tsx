"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Gift, Clock, Percent } from "lucide-react"

interface ClaimsPanelProps {
  sale: {
    tgeTime: number
    tgeBps: number // basis points (1000 = 10%)
    vestDuration: number
  }
  userPurchased?: number // Mock user purchase amount
}

export function ClaimsPanel({ sale, userPurchased = 5000 }: ClaimsPanelProps) {
  const tgePercentage = sale.tgeBps / 100 // Convert basis points to percentage
  const tgeAmount = (userPurchased * tgePercentage) / 100
  const vestAmount = userPurchased - tgeAmount

  const now = Math.floor(Date.now() / 1000)
  const tgeUnlocked = now >= sale.tgeTime
  const vestStartTime = sale.tgeTime
  const vestEndTime = vestStartTime + sale.vestDuration
  const vestProgress = Math.min(100, Math.max(0, ((now - vestStartTime) / sale.vestDuration) * 100))
  const vestedAmount = (vestAmount * vestProgress) / 100
  const claimableVested = tgeUnlocked ? vestedAmount : 0

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.floor(num))
  }

  const handleClaimTGE = () => {
    alert(`Claimed ${formatNumber(tgeAmount)} tokens from TGE`)
  }

  const handleClaimVested = () => {
    alert(`Claimed ${formatNumber(claimableVested)} vested tokens`)
  }

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <Gift className="h-5 w-5 text-accent" />
          <span>Token Claims</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Purchase Summary */}
        <div className="bg-muted/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Purchase:</span>
            <span className="font-semibold">{formatNumber(userPurchased)} tokens</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TGE Amount ({tgePercentage}%):</span>
            <span className="font-semibold text-accent">{formatNumber(tgeAmount)} tokens</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vesting Amount:</span>
            <span className="font-semibold text-secondary">{formatNumber(vestAmount)} tokens</span>
          </div>
        </div>

        <Separator />

        {/* TGE Claim */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-accent" />
              <span className="font-medium">TGE Claim</span>
            </div>
            <Badge variant={tgeUnlocked ? "default" : "secondary"}>{tgeUnlocked ? "Available" : "Locked"}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Claimable:</span>
              <span className="font-medium">{formatNumber(tgeUnlocked ? tgeAmount : 0)} tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">TGE Date:</span>
              <span className="font-medium">{formatDate(sale.tgeTime)}</span>
            </div>
          </div>

          <Button
            onClick={handleClaimTGE}
            disabled={!tgeUnlocked || tgeAmount === 0}
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            Claim TGE ({formatNumber(tgeAmount)} tokens)
          </Button>
        </div>

        <Separator />

        {/* Vesting Claim */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="font-medium">Vesting Claim</span>
            </div>
            <Badge variant={claimableVested > 0 ? "default" : "secondary"}>
              {claimableVested > 0 ? "Available" : "Vesting"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vesting Progress:</span>
                <span className="font-medium">{vestProgress.toFixed(1)}%</span>
              </div>
              <Progress value={vestProgress} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Claimable Now:</span>
                <span className="font-medium">{formatNumber(claimableVested)} tokens</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Vesting:</span>
                <span className="font-medium">{formatNumber(vestAmount)} tokens</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vest End:</span>
                <span className="font-medium">{formatDate(vestEndTime)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleClaimVested}
            disabled={claimableVested === 0}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
          >
            Claim Vested ({formatNumber(claimableVested)} tokens)
          </Button>
        </div>

        {/* Vesting Schedule Info */}
        <div className="bg-muted/10 rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-medium">Vesting Schedule</h4>
          <p className="text-muted-foreground">
            • {tgePercentage}% unlocked at TGE ({formatDate(sale.tgeTime)})
          </p>
          <p className="text-muted-foreground">
            • Remaining {100 - tgePercentage}% vests linearly over {Math.floor(sale.vestDuration / (30 * 24 * 3600))}{" "}
            months
          </p>
          <p className="text-muted-foreground">• Tokens can be claimed at any time during vesting period</p>
        </div>
      </CardContent>
    </Card>
  )
}
