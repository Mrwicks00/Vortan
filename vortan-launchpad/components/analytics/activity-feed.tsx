"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock } from "lucide-react"

interface ActivityFeedProps {
  highlights: Array<{
    time: string
    text: string
  }>
}

export function ActivityFeed({ highlights }: ActivityFeedProps) {
  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center space-x-2">
          <Activity className="h-5 w-5 text-accent" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-relaxed">{highlight.text}</p>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {highlight.time}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
