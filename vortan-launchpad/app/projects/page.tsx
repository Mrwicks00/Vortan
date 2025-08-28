"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectFilters } from "@/components/projects/project-filters"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  saleAddress: string
  name: string
  symbol: string
  bannerUrl: string
  logoUrl: string
  description: string
  website: string
  socials: {
    x: string
    discord: string
    medium: string
  }
  baseToken: string
  priceDisplay: string
  status: "Live" | "Upcoming" | "Ended"
  start: number
  end: number
  hardCap: string
  raisedPct: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "All",
    baseToken: "All",
    search: "",
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        const data = await response.json()
        setProjects(data)
        setFilteredProjects(data)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    let filtered = projects

    // Filter by status
    if (filters.status !== "All") {
      filtered = filtered.filter((project) => project.status === filters.status)
    }

    // Filter by base token
    if (filters.baseToken !== "All") {
      filtered = filtered.filter((project) => project.baseToken === filters.baseToken)
    }

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          project.symbol.toLowerCase().includes(filters.search.toLowerCase()) ||
          project.description.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    setFilteredProjects(filtered)
  }, [projects, filters])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Project Launchpad
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and participate in the most innovative token launches across the galaxy
          </p>
        </div>

        <ProjectFilters onFiltersChange={handleFiltersChange} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-effect glow-border rounded-lg p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-effect glow-border rounded-lg p-12 max-w-md mx-auto">
              <h3 className="font-heading text-xl font-semibold text-muted-foreground mb-2">No Projects Found</h3>
              <p className="text-muted-foreground">
                No projects match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.saleAddress} project={project} />
            ))}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>
    </MainLayout>
  )
}
