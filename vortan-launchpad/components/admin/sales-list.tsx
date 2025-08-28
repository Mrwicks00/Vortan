"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Upload, Settings } from "lucide-react"
import Link from "next/link"

interface Sale {
  saleAddress: string
  name: string
  symbol: string
  status: "Live" | "Upcoming" | "Ended"
  hardCap: string
  raised: number
  buyers: number
  createdAt: string
}

interface SalesListProps {
  sales: Sale[]
  onDepositTokens: (saleAddress: string) => void
}

export function SalesList({ sales, onDepositTokens }: SalesListProps) {
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Created Sales</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No sales created yet</p>
            <p className="text-sm mt-2">Create your first token sale using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hard Cap</TableHead>
                  <TableHead>Raised</TableHead>
                  <TableHead>Buyers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.saleAddress} className="border-border/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.name}</div>
                        <div className="text-sm text-muted-foreground">{sale.symbol}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                    </TableCell>
                    <TableCell>{sale.hardCap}</TableCell>
                    <TableCell>{formatNumber(sale.raised)}</TableCell>
                    <TableCell>{formatNumber(sale.buyers)}</TableCell>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link href={`/projects/${sale.saleAddress}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/30 hover:bg-primary/20 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDepositTokens(sale.saleAddress)}
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
  )
}
