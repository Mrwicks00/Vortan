"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Droplets,
  Coins,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { useFaucet } from "@/lib/web3/hooks/use-faucet";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

export function FaucetPage() {
  const { isConnected } = useAccount();
  const {
    faucetInfo,
    tokenBalances,
    claimTokens,
    isClaimPending,
    refreshData,
  } = useFaucet();

  const formatTokenAmount = (amount: string, decimals: number = 18) => {
    try {
      return parseFloat(
        formatUnits(BigInt(amount || "0"), decimals)
      ).toLocaleString();
    } catch {
      return "0";
    }
  };

  const canClaim = isConnected && faucetInfo && !faucetInfo.hasClaimed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Droplets className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-heading">Token Faucet</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get test tokens for development and testing purposes. Each address can
          claim tokens once.
        </p>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="glass-effect glow-border border-yellow-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium text-yellow-700">
                  Connect Your Wallet
                </p>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to claim test tokens from the faucet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claim Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Claim Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faucetInfo ? (
              <div className="flex items-center gap-3">
                {faucetInfo.hasClaimed ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700">
                        Already Claimed
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You have already claimed tokens from this faucet.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-700">Available</p>
                      <p className="text-sm text-muted-foreground">
                        You can claim test tokens from this faucet.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading claim status...</p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold">What You'll Get:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">VORT Tokens</span>
                  <Badge variant="outline">5,000 VORT</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">SOMI Tokens</span>
                  <Badge variant="outline">5,000 SOMI</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">USDC Tokens</span>
                  <Badge variant="outline">4,000 USDC</Badge>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={claimTokens}
                disabled={!canClaim || isClaimPending}
                className="w-full"
                size="lg"
              >
                {isClaimPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Claiming Tokens...
                  </>
                ) : faucetInfo?.hasClaimed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Claimed
                  </>
                ) : (
                  <>
                    <Droplets className="h-4 w-4 mr-2" />
                    Claim Test Tokens
                  </>
                )}
              </Button>
            </div>

            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to claim tokens
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Your Token Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">VORT Balance</span>
                  <span className="font-mono">
                    {formatTokenAmount(tokenBalances?.vortBalance || "0", 18)}{" "}
                    VORT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">SOMI Balance</span>
                  <span className="font-mono">
                    {formatTokenAmount(tokenBalances?.somiBalance || "0", 18)}{" "}
                    SOMI
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">USDC Balance</span>
                  <span className="font-mono">
                    {formatTokenAmount(tokenBalances?.usdcBalance || "0", 6)}{" "}
                    USDC
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Connect your wallet to view balances
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={refreshData}
                className="w-full"
                disabled={!isConnected}
              >
                Refresh Balances
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Faucet Rules</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each address can claim tokens only once</li>
                <li>• Tokens are for testing purposes only</li>
                <li>• No real value - testnet tokens only</li>
                <li>• Use responsibly for development</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">What You Can Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Test token transfers and interactions</li>
                <li>• Participate in test sales and staking</li>
                <li>• Vote on governance proposals</li>
                <li>• Develop and test your applications</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-700 mb-1">
                  Testnet Only
                </h4>
                <p className="text-sm text-muted-foreground">
                  These tokens are only for the Somnia testnet and have no real
                  value. Do not attempt to trade them on mainnet or expect any
                  monetary value.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
