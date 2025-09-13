import { somniaTestnet } from "@reown/appkit/networks";
import { Chain } from "viem";

// Re-export somniaTestnet for use in other files
export { somniaTestnet };

// Export all supported chains (only Somnia for now)
export const supportedChains = [somniaTestnet];

// Get chain by ID
export const getChainById = (chainId: number): Chain | undefined => {
  return supportedChains.find((chain) => chain.id === chainId);
};

// Get chain by name
export const getChainByName = (chainName: string): Chain | undefined => {
  return supportedChains.find((chain) => chain.name === chainName);
};
