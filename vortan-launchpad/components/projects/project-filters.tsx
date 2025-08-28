"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"

interface ProjectFiltersProps {
  onFiltersChange: (filters: {
    status: string
    baseToken: string
    search: string
  }) => void
}

export function ProjectFilters({ onFiltersChange }: ProjectFiltersProps) {
  const [filters, setFilters] = useState({
    status: "All",
    baseToken: "All",
    search: "",
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      status: "All",
      baseToken: "All",
      search: "",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.status !== "All" || filters.baseToken !== "All" || filters.search !== ""

  return (
    <div className="glass-effect glow-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 bg-input/50 border-border/50 focus:border-primary/50"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="glass-effect border-border/50">
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Live">Live</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Ended">Ended</SelectItem>
          </SelectContent>
        </Select>

        {/* Base Token Filter */}
        <Select value={filters.baseToken} onValueChange={(value) => handleFilterChange("baseToken", value)}>
          <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary/50">
            <SelectValue placeholder="Filter by token" />
          </SelectTrigger>
          <SelectContent className="glass-effect border-border/50">
            <SelectItem value="All">All Tokens</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="SOMI">SOMI</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
