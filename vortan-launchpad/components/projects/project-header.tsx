"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Twitter, MessageCircle, FileText } from "lucide-react"

interface ProjectHeaderProps {
  project: {
    name: string
    symbol: string
    bannerUrl: string
    logoUrl: string
    description: string
    longDescription: string
    website: string
    socials: {
      x: string
      discord: string
      medium: string
    }
  }
  status: "Live" | "Upcoming" | "Ended"
}

export function ProjectHeader({ project, status }: ProjectHeaderProps) {
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
    <div className="glass-effect glow-border rounded-lg overflow-hidden">
      <div className="relative h-64 md:h-80">
        <Image
          src={project.bannerUrl || "/placeholder.svg"}
          alt={`${project.name} banner`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute top-6 right-6">
          <Badge className={`font-medium text-lg px-4 py-2 ${getStatusColor(status)}`}>{status}</Badge>
        </div>
        <div className="absolute bottom-6 left-6 flex items-end space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/50 bg-card">
            <Image
              src={project.logoUrl || "/placeholder.svg"}
              alt={`${project.name} logo`}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <div className="pb-2">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm bg-background/50 backdrop-blur">
                {project.symbol}
              </Badge>
              <div className="flex items-center space-x-2">
                <a
                  href={project.socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors backdrop-blur"
                >
                  <Twitter className="h-4 w-4 text-primary" />
                </a>
                <a
                  href={project.socials.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors backdrop-blur"
                >
                  <MessageCircle className="h-4 w-4 text-secondary" />
                </a>
                <a
                  href={project.socials.medium}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-accent/20 hover:bg-accent/30 transition-colors backdrop-blur"
                >
                  <FileText className="h-4 w-4 text-accent" />
                </a>
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted/20 hover:bg-muted/30 transition-colors backdrop-blur"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-muted-foreground mb-4">{project.description}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{project.longDescription}</p>
      </div>
    </div>
  )
}
