"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { getChainById } from "../config/chains";

interface WalletContextType {
  // Wallet state
  isConnected: boolean;
  address: string | undefined;
  isConnecting: boolean;

  // Network state
  chainId: number | undefined;
  chainName: string;
  isCorrectNetwork: boolean;

  // Balances
  nativeBalance: string;
  vortBalance: string;
  somiBalance: string;
  usdcBalance: string;

  // Actions
  switchToCorrectNetwork: () => void;

  // Loading states
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Wagmi hooks
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();

  // Local state
  const [isLoading, setIsLoading] = useState(false);

  // Get balances
  const { data: nativeBalanceData } = useBalance({
    address,
  });

  const { data: vortBalanceData } = useBalance({
    address,
    token: "0xdEFAA5459ba8DcC24A7470DB4835C97B0fdf85fc", // VortanToken address
  });

  const { data: somiBalanceData } = useBalance({
    address,
    token: "0xc578aBA50AF13BAB8FCeAfA99c0eb0E43477cC8E", // SOMI address
  });

  const { data: usdcBalanceData } = useBalance({
    address,
    token: "0xEf56Dce856AB8b1C85D7266064Da04c78927Edc4", // USDC address
  });

  // Determine correct network (Somnia testnet only)
  const correctChainId = 50312; // Correct Somnia testnet chain ID
  const isCorrectNetwork = chainId === correctChainId;

  // Get chain name
  const chainName =
    chainId === correctChainId ? "Somnia Testnet" : "Unknown Network";

  // Switch to correct network (this will be handled by RainbowKit)
  const switchToCorrectNetwork = async () => {
    // RainbowKit handles network switching automatically
    console.log("Network switching handled by RainbowKit");
  };

  // Format balances - memoized to prevent unnecessary re-renders
  const formatBalance = useMemo(
    () => (balance: any) => {
      if (!balance) return "0";
      return parseFloat(balance.formatted).toFixed(4);
    },
    []
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: WalletContextType = useMemo(
    () => ({
      // Wallet state
      isConnected: !!isConnected,
      address,
      isConnecting,

      // Network state
      chainId,
      chainName,
      isCorrectNetwork,

      // Balances
      nativeBalance: formatBalance(nativeBalanceData),
      vortBalance: formatBalance(vortBalanceData),
      somiBalance: formatBalance(somiBalanceData),
      usdcBalance: formatBalance(usdcBalanceData),

      // Actions
      switchToCorrectNetwork,

      // Loading states
      isLoading,
    }),
    [
      isConnected,
      address,
      isConnecting,
      chainId,
      chainName,
      isCorrectNetwork,
      nativeBalanceData,
      vortBalanceData,
      somiBalanceData,
      usdcBalanceData,
      switchToCorrectNetwork,
      isLoading,
      formatBalance,
    ]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}
