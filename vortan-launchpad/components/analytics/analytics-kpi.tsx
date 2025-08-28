"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface AnalyticsKPIProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  color?: "primary" | "secondary" | "accent" | "muted"
}

export function AnalyticsKPI({ title, value, icon, trend, color = "primary" }: AnalyticsKPIProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      return new Intl.NumberFormat().format(val)
    }
    return val
  }

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="h-3 w-3" />
    if (trendValue < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return "text-secondary"
    if (trendValue < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "text-primary"
      case "secondary":
        return "text-secondary"
      case "accent":
        return "text-accent"
      case "muted":
        return "text-muted-foreground"
      default:
        return "text-primary"
    }
  }

  return (
    <Card className="glass-effect glow-border hover:animate-glow transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={getColorClasses(color)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {trend && (
            <Badge variant="outline" className={`text-xs ${getTrendColor(trend.value)}`}>
              {getTrendIcon(trend.value)}
              <span className="ml-1">{trend.label}</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
