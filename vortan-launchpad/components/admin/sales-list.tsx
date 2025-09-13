"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Upload, Settings } from "lucide-react";
import Link from "next/link";
import { Project } from "@/lib/supabase/types";

interface SalesListProps {
  projects: Project[];
  onDepositTokens: (saleAddress: string) => void;
}

export function SalesList({ projects, onDepositTokens }: SalesListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "pending":
        return "bg-accent/20 text-accent border-accent/30";
      case "ended":
        return "bg-muted/20 text-muted-foreground border-muted/30";
      case "draft":
        return "bg-muted/20 text-muted-foreground border-muted/30";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Created Sales</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No projects created yet</p>
            <p className="text-sm mt-2">
              Create your first project using the form above
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="border-border/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.symbol}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {project.short_description}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(project.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {project.sale_address ? (
                          <Link href={`/projects/${project.sale_address}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary/30 hover:bg-primary/20 bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="border-muted/30"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDepositTokens(project.sale_address || "")}
                          disabled={!project.sale_address}
                          className="border-accent/30 hover:bg-accent/20"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
