// Contract addresses from your deployment
export const CONTRACT_ADDRESSES = {
  // Tokens
  VORTAN_TOKEN: "0xdEFAA5459ba8DcC24A7470DB4835C97B0fdf85fc",
  SOMI_TOKEN: "0xc578aBA50AF13BAB8FCeAfA99c0eb0E43477cC8E",
  USDC_TOKEN: "0xEf56Dce856AB8b1C85D7266064Da04c78927Edc4",

  // Staking Contracts
  VORT_STAKING: "0xb70E38365aD53485BA3ba8b472735c5D4140A0E0",
  SOMI_STAKING: "0xF321b818669d56C8f11b3617429cD987c745B0D2",

  // Other Contracts
  TIER_AGGREGATOR: "0xDf1499a95cE0BC67390103293178df03C332AaA1",
  SALE_FACTORY: "0x9F69a019DC9F4a4A30a255B572E7F425a7814637",
  FAUCET: "0xA939e5f884f46a281Eac2c438a7337b890644b8C",
  GOVERNOR: "0xb59E4c855a8E142e389bB535962622B42955b9BC",
} as const;

// Network configuration - Only Somnia Testnet
export const NETWORKS = {
  SOMNIA_TESTNET: {
    id: 50312, // Correct Somnia testnet chain ID
    name: "Somnia Testnet",
    rpc: "https://dream-rpc.somnia.network", // Correct RPC URL
    explorer: "https://somnia-testnet.socialscan.io", // Correct explorer
    nativeCurrency: {
      name: "STT",
      symbol: "STT",
      decimals: 18,
    },
  },
} as const;

// Get contract address by name
export const getContractAddress = (
  name: keyof typeof CONTRACT_ADDRESSES
): string => {
  return CONTRACT_ADDRESSES[name];
};

// Get network by ID
export const getNetworkById = (chainId: number) => {
  return Object.values(NETWORKS).find((network) => network.id === chainId);
};
