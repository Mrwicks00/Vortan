"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, XCircle, Settings } from "lucide-react";
import { useSalePoolAdmin } from "@/lib/web3/hooks/use-sale-pool-admin";

interface AdminSaleModalProps {
  saleAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSaleModal({
  saleAddress,
  isOpen,
  onClose,
}: AdminSaleModalProps) {
  const {
    saleStats,
    saleStatus,
    finalizeSale,
    withdrawUnsoldTokens,
    isFinalizePending,
    isWithdrawPending,
  } = useSalePoolAdmin(saleAddress);

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat().format(Number.parseFloat(num));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Sale Administration</span>
          </DialogTitle>
          <DialogDescription>
            Manage your token sale finalization and token withdrawal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Status Overview */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Sale Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Current Status
                  </p>
                  <Badge
                    variant={
                      saleStatus?.status === "Ended" ? "default" : "secondary"
                    }
                    className="text-sm"
                  >
                    {saleStatus?.status || "Loading..."}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Finalized</p>
                  <Badge
                    variant={saleStats?.finalized ? "default" : "destructive"}
                    className="text-sm"
                  >
                    {saleStats?.finalized ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              {saleStats?.finalized && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Sale Result</p>
                  <Badge
                    variant={saleStats.successful ? "default" : "destructive"}
                    className="text-sm"
                  >
                    {saleStats.successful ? "Successful" : "Failed"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sale Statistics */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Sale Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="font-semibold">
                    {saleStats ? formatNumber(saleStats.totalRaisedBase) : "0"}{" "}
                    USDC
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tokens Sold</p>
                  <p className="font-semibold">
                    {saleStats ? formatNumber(saleStats.totalTokensSold) : "0"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Tokens Deposited
                  </p>
                  <p className="font-semibold">
                    {saleStats
                      ? formatNumber(saleStats.totalSaleTokensDeposited)
                      : "0"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unsold Tokens</p>
                  <p className="font-semibold text-primary">
                    {saleStats
                      ? formatNumber(
                          (
                            parseFloat(saleStats.totalSaleTokensDeposited) -
                            parseFloat(saleStats.totalTokensSold)
                          ).toString()
                        )
                      : "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Admin Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Administrative Actions</h3>

            {/* Finalize Sale Action */}
            {saleStatus?.status === "Ended" && !saleStats?.finalized && (
              <Card className="border-orange-200 bg-orange-50/10">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold text-orange-700">
                          Finalize Sale
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Finalize the sale to determine if it was successful
                          and enable token distribution
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={finalizeSale}
                      disabled={isFinalizePending}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {isFinalizePending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Finalizing...
                        </>
                      ) : (
                        "Finalize Sale"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Withdraw Unsold Tokens Action */}
            {saleStats?.finalized && saleStats.successful && (
              <Card className="border-green-200 bg-green-50/10">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-green-700">
                          Withdraw Unsold Tokens
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Withdraw any surplus sale tokens that were not sold
                          during the sale
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={withdrawUnsoldTokens}
                      disabled={isWithdrawPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isWithdrawPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        "Withdraw Unsold Tokens"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Actions Available */}
            {saleStats?.finalized && !saleStats.successful && (
              <Card className="border-red-200 bg-red-50/10">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-semibold text-red-700">
                        Sale Failed
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This sale did not meet the soft cap. Buyers can claim
                        refunds.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



