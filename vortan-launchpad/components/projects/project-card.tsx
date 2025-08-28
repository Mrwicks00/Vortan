"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, Twitter, MessageCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: {
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
}

export function ProjectCard({ project }: ProjectCardProps) {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <Card className="glass-effect glow-border hover:animate-glow transition-all duration-300 group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={project.bannerUrl || "/placeholder.svg"}
            alt={`${project.name} banner`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-4 right-4">
            <Badge className={cn("font-medium", getStatusColor(project.status))}>{project.status}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center space-x-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50">
              <Image
                src={project.logoUrl || "/placeholder.svg"}
                alt={`${project.name} logo`}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">{project.name}</h3>
              <p className="text-sm text-gray-300">{project.symbol}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">{project.priceDisplay}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Token:</span>
            <Badge variant="outline" className="text-xs">
              {project.baseToken}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hard Cap:</span>
            <span className="font-medium">{project.hardCap}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{project.raisedPct}%</span>
          </div>
          <Progress value={project.raisedPct} className="h-2" />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Start: {formatDate(project.start)}</span>
          <span>End: {formatDate(project.end)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={project.socials.x}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <Twitter className="h-4 w-4 text-primary" />
          </a>
          <a
            href={project.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-secondary" />
          </a>
          <a
            href={project.socials.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-accent/20 hover:bg-accent/30 transition-colors"
          >
            <FileText className="h-4 w-4 text-accent" />
          </a>
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/projects/${project.saleAddress}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300">
            View Project
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
