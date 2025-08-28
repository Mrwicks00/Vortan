"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Project {
  saleAddress: string
  name: string
  symbol: string
  status: "Live" | "Upcoming" | "Ended"
}

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: string
  onProjectChange: (saleAddress: string) => void
}

export function ProjectSelector({ projects, selectedProject, onProjectChange }: ProjectSelectorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-secondary/20 text-secondary border-secondary/30"
      case "Upcoming":
        return "bg-accent/20 text-accent border-accent/30"
      case "Ended":
        return "bg-muted/20 text-muted-foreground border-muted/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  return (
    <div className="glass-effect glow-border rounded-lg p-4">
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">Project Analytics</h3>
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary/50">
            <SelectValue placeholder="Select a project to analyze" />
          </SelectTrigger>
          <SelectContent className="glass-effect border-border/50">
            {projects.map((project) => (
              <SelectItem key={project.saleAddress} value={project.saleAddress}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground">({project.symbol})</span>
                  </div>
                  <Badge className={`ml-2 text-xs ${getStatusColor(project.status)}`}>{project.status}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
