import { Chain } from "viem";

// Custom Somnia Testnet chain configuration
export const somniaTestnet: Chain = {
  id: 50312, // Correct Somnia testnet chain ID
  name: "Somnia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "STT",
    symbol: "STT",
  },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] },
    public: { http: ["https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://somnia-testnet.socialscan.io",
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1,
    },
  },
};

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
