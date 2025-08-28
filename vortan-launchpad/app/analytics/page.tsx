"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProjectSelector } from "@/components/analytics/project-selector"
import { AnalyticsKPI } from "@/components/analytics/analytics-kpi"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { ActivityFeed } from "@/components/analytics/activity-feed"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Twitter, MessageCircle, FileText, Users, TrendingUp } from "lucide-react"

interface Project {
  saleAddress: string
  name: string
  symbol: string
  status: "Live" | "Upcoming" | "Ended"
}

interface AnalyticsData {
  x: {
    mentions24h: number
    series: Array<[string, number]>
  }
  discord: {
    newMembers7d: number
    series: Array<[string, number]>
  }
  medium: {
    reads7d: number
    series: Array<[string, number]>
  }
  onchain: {
    buyers24h: number
    txSeries: Array<[string, number]>
  }
  sentiment: {
    score: number
    label: string
  }
  highlights: Array<{
    time: string
    text: string
  }>
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        const data = await response.json()
        setProjects(data)
        if (data.length > 0) {
          setSelectedProject(data[0].saleAddress)
        }
      } catch (error) {
        setError("Failed to fetch projects")
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    if (!selectedProject) return

    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/${selectedProject}`)
        if (!response.ok) {
          throw new Error("Analytics data not found")
        }
        const data = await response.json()
        setAnalyticsData(data)
        setError(null)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch analytics")
        setAnalyticsData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedProject])

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "heating":
        return "bg-secondary/20 text-secondary border-secondary/30"
      case "stable":
        return "bg-accent/20 text-accent border-accent/30"
      case "cooling":
        return "bg-muted/20 text-muted-foreground border-muted/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const selectedProjectData = projects.find((p) => p.saleAddress === selectedProject)

  if (loading && !analyticsData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error && !analyticsData) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="glass-effect glow-border rounded-lg p-12 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-destructive mb-2">Analytics Unavailable</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track project performance, social momentum, and on-chain activity across the galaxy
          </p>
        </div>

        <ProjectSelector projects={projects} selectedProject={selectedProject} onProjectChange={setSelectedProject} />

        {analyticsData && selectedProjectData && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <AnalyticsKPI
                title="X Mentions (24h)"
                value={analyticsData.x.mentions24h}
                icon={<Twitter className="h-4 w-4" />}
                color="primary"
                trend={{ value: 12, label: "+12%" }}
              />
              <AnalyticsKPI
                title="Discord Members (7d)"
                value={analyticsData.discord.newMembers7d}
                icon={<MessageCircle className="h-4 w-4" />}
                color="secondary"
                trend={{ value: 8, label: "+8%" }}
              />
              <AnalyticsKPI
                title="Medium Reads (7d)"
                value={analyticsData.medium.reads7d}
                icon={<FileText className="h-4 w-4" />}
                color="accent"
                trend={{ value: 15, label: "+15%" }}
              />
              <AnalyticsKPI
                title="On-chain Buyers (24h)"
                value={analyticsData.onchain.buyers24h}
                icon={<Users className="h-4 w-4" />}
                color="secondary"
                trend={{ value: 5, label: "+5%" }}
              />
              <div className="glass-effect glow-border hover:animate-glow transition-all duration-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Sentiment</span>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{analyticsData.sentiment.score}</div>
                  <Badge className={getSentimentColor(analyticsData.sentiment.label)}>
                    {analyticsData.sentiment.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                title="X Mentions Over Time"
                data={analyticsData.x.series}
                type="area"
                color="#9d4edd"
                icon={<Twitter className="h-5 w-5" />}
              />
              <AnalyticsChart
                title="Discord Member Growth"
                data={analyticsData.discord.series}
                type="line"
                color="#00e5ff"
                icon={<MessageCircle className="h-5 w-5" />}
              />
              <AnalyticsChart
                title="Medium Article Reads"
                data={analyticsData.medium.series}
                type="area"
                color="#ffd54f"
                icon={<FileText className="h-5 w-5" />}
              />
              <AnalyticsChart
                title="On-chain Activity (Hourly)"
                data={analyticsData.onchain.txSeries}
                type="line"
                color="#00e5ff"
                icon={<Users className="h-5 w-5" />}
              />
            </div>

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed highlights={analyticsData.highlights} />
              </div>
              <div className="glass-effect glow-border rounded-lg p-6 space-y-4">
                <h3 className="font-heading text-lg font-semibold">Project Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedProjectData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium">{selectedProjectData.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getSentimentColor(selectedProjectData.status)}>
                      {selectedProjectData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sentiment Score:</span>
                    <span className="font-bold text-primary">{analyticsData.sentiment.score}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
