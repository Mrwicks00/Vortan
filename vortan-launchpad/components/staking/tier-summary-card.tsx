"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"

interface TierSummaryCardProps {
  address: string
  aggregator: {
    somiWeightBps: number
    t1: string
    t2: string
    t3: string
    combined: string
    tier: number
  }
}

export function TierSummaryCard({ address, aggregator }: TierSummaryCardProps) {
  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 0:
        return { name: "T0", icon: Star, color: "text-muted-foreground", bgColor: "bg-muted/20" }
      case 1:
        return { name: "T1", icon: Trophy, color: "text-accent", bgColor: "bg-accent/20" }
      case 2:
        return { name: "T2", icon: Zap, color: "text-secondary", bgColor: "bg-secondary/20" }
      case 3:
        return { name: "T3", icon: Crown, color: "text-primary", bgColor: "bg-primary/20" }
      default:
        return { name: "T0", icon: Star, color: "text-muted-foreground", bgColor: "bg-muted/20" }
    }
  }

  const tierInfo = getTierInfo(aggregator.tier)
  const TierIcon = tierInfo.icon

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat().format(Number.parseInt(num))
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getProgressToNextTier = () => {
    const current = Number.parseInt(aggregator.combined)
    const thresholds = [
      0,
      Number.parseInt(aggregator.t1),
      Number.parseInt(aggregator.t2),
      Number.parseInt(aggregator.t3),
    ]

    if (aggregator.tier >= 3) {
      return { progress: 100, nextTier: null, needed: 0 }
    }

    const nextThreshold = thresholds[aggregator.tier + 1]
    const prevThreshold = thresholds[aggregator.tier]
    const progress = ((current - prevThreshold) / (nextThreshold - prevThreshold)) * 100

    return {
      progress: Math.min(100, Math.max(0, progress)),
      nextTier: aggregator.tier + 1,
      needed: Math.max(0, nextThreshold - current),
    }
  }

  const progressInfo = getProgressToNextTier()

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <TierIcon className={`h-6 w-6 ${tierInfo.color}`} />
          <span>Tier Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Address */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connected Address:</span>
          <Badge variant="outline" className="font-mono text-xs">
            {shortenAddress(address)}
          </Badge>
        </div>

        {/* Current Tier */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${tierInfo.bgColor}`}>
            <TierIcon className={`h-8 w-8 ${tierInfo.color}`} />
            <span className={`font-heading text-2xl font-bold ${tierInfo.color}`}>{tierInfo.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">Your Current Tier</p>
        </div>

        {/* Combined Points */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {formatNumber(aggregator.combined)}
          </div>
          <p className="text-sm text-muted-foreground">Combined Points</p>
        </div>

        {/* Progress to Next Tier */}
        {progressInfo.nextTier !== null && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to T{progressInfo.nextTier}:</span>
              <span className="font-medium">{progressInfo.progress.toFixed(1)}%</span>
            </div>
            <Progress value={progressInfo.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {formatNumber(progressInfo.needed.toString())} more points needed for T{progressInfo.nextTier}
            </p>
          </div>
        )}

        {/* Tier Thresholds */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Tier Thresholds</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded bg-accent/10">
              <p className="text-xs text-muted-foreground">T1</p>
              <p className="font-semibold text-sm text-accent">{formatNumber(aggregator.t1)}</p>
            </div>
            <div className="text-center p-2 rounded bg-secondary/10">
              <p className="text-xs text-muted-foreground">T2</p>
              <p className="font-semibold text-sm text-secondary">{formatNumber(aggregator.t2)}</p>
            </div>
            <div className="text-center p-2 rounded bg-primary/10">
              <p className="text-xs text-muted-foreground">T3</p>
              <p className="font-semibold text-sm text-primary">{formatNumber(aggregator.t3)}</p>
            </div>
          </div>
        </div>

        {/* SOMI Weight Info */}
        <div className="bg-muted/10 rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium">Point Calculation</p>
          <p className="text-xs text-muted-foreground">SOMI points count at {aggregator.somiWeightBps / 100}% weight</p>
          <p className="text-xs text-muted-foreground">
            Combined = VORT points + (SOMI points × {aggregator.somiWeightBps / 100}%)
          </p>
        </div>

        {/* View Projects Button */}
        <Link href="/projects">
          <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300">
            View Projects
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
