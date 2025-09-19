"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Wifi, Loader2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "@/lib/web3/contexts/wallet-context";
import { useMemo } from "react";

export function Topbar() {
  const walletContext = useWallet();

  // Memoize wallet values to prevent unnecessary re-renders
  const { isConnected, address, chainName, isCorrectNetwork, isLoading } =
    useMemo(
      () => ({
        isConnected: walletContext.isConnected,
        address: walletContext.address,
        chainName: walletContext.chainName,
        isCorrectNetwork: walletContext.isCorrectNetwork,
        isLoading: walletContext.isLoading,
      }),
      [
        walletContext.isConnected,
        walletContext.address,
        walletContext.chainName,
        walletContext.isCorrectNetwork,
        walletContext.isLoading,
      ]
    );

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 glass-effect border-b border-border">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <h1 className="font-heading text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            <span className="hidden sm:inline">Space Station Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Network Indicator - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-secondary" />
            <Badge
              variant={isCorrectNetwork ? "secondary" : "destructive"}
              className={`${
                isCorrectNetwork
                  ? "bg-secondary/20 text-secondary border-secondary/30"
                  : "bg-destructive/20 text-destructive border-destructive/30"
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : null}
              {chainName}
            </Badge>
          </div>

          {/* Wallet Connect - Using RainbowKit's ConnectButton */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div>
                  {(() => {
                    if (!ready) {
                      return (
                        <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300 animate-glow">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </Button>
                      );
                    }

                    if (!connected) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300 animate-glow"
                        >
                          <Wallet className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">
                            Connect Wallet
                          </span>
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          variant="destructive"
                          className="animate-pulse text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">
                            Wrong network
                          </span>
                          <span className="sm:hidden">Network</span>
                        </Button>
                      );
                    }

                    return (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={openChainModal}
                          variant="outline"
                          size="sm"
                          className="text-xs hidden sm:flex"
                        >
                          {chain.name}
                        </Button>

                        <Button
                          onClick={openAccountModal}
                          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300 text-xs sm:text-sm"
                        >
                          <Wallet className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {account.displayName}
                          </span>
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
