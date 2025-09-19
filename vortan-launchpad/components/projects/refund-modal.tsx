"use client";

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
import { Loader2, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useSalePoolRefund } from "@/lib/web3/hooks/use-sale-pool-refund";

interface RefundModalProps {
  saleAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RefundModal({
  saleAddress,
  isOpen,
  onClose,
}: RefundModalProps) {
  const { refundInfo, claimRefund, isRefundPending } =
    useSalePoolRefund(saleAddress);

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat().format(Number.parseFloat(num));
  };

  const formatUSDC = (num: string) => {
    return (Number.parseFloat(num) / 1e6).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5 text-orange-500" />
            <span>Claim Refund</span>
          </DialogTitle>
          <DialogDescription>
            This sale did not meet the soft cap. You can claim a full refund of
            your purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Refund Status */}
          <Card className="glass-effect border-orange-200 bg-orange-50/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                <span>Sale Failed</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sale Result</p>
                <Badge variant="destructive" className="text-sm">
                  Failed - Soft Cap Not Met
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Refund Status</p>
                <Badge
                  variant={refundInfo?.refunded ? "default" : "secondary"}
                  className="text-sm"
                >
                  {refundInfo?.refunded ? "Already Refunded" : "Available"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Your Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Amount Purchased
                </p>
                <p className="text-2xl font-bold text-primary">
                  {refundInfo ? formatUSDC(refundInfo.purchasedAmount) : "0"}{" "}
                  USDC
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Refund Amount</p>
                <p className="text-xl font-semibold text-green-600">
                  {refundInfo ? formatUSDC(refundInfo.purchasedAmount) : "0"}{" "}
                  USDC
                </p>
              </div>

              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>100% refundable - no fees deducted</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Refund Action */}
          <div className="space-y-4">
            {refundInfo?.refunded ? (
              <Card className="border-green-200 bg-green-50/10">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-semibold text-green-700">
                        Refund Completed
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        You have already received your refund for this sale.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : refundInfo?.canRefund ? (
              <Card className="border-orange-200 bg-orange-50/10">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RotateCcw className="h-5 w-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold text-orange-700">
                          Claim Your Refund
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Get your full purchase amount back in your wallet
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={claimRefund}
                      disabled={isRefundPending}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {isRefundPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Refund...
                        </>
                      ) : (
                        "Claim Refund"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200 bg-gray-50/10">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-gray-500" />
                    <div>
                      <h4 className="font-semibold text-gray-700">
                        No Refund Available
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        You are not eligible for a refund from this sale.
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



