export const DEPLOYMENT_CONFIG = {
  // Somnia Testnet Network Configuration
  network: {
    name: "Somnia Testnet",
    chainId: 50312,
    rpcUrl: "https://dream-rpc.somnia.network/",
    explorer: "https://shannon-explorer.somnia.network/",
    symbol: "STT",
    faucet: "https://testnet.somnia.network/",
  },

  // Contract Deployment Order
  deploymentOrder: [
    "USDC",
    "SOMI", 
    "VortanToken",
    "StakingWithRewards_VORT",
    "StakingWithRewards_SOMI",
    "TierAggregator",
    "SaleFactory",
    "VortanFaucet",
    "LightGovernor"
  ],

  // Initial Token Supply
  initialSupply: {
    vortan: "1000000", // 1M VORT
    somi: "1000000",   // 1M SOMI
    usdc: "1000000",   // 1M USDC (6 decimals)
  },

  // Faucet Configuration
  faucet: {
    vortanAmount: "10000", // 10K VORT per claim
    maxClaims: 1,          // Max claims per address
  },

  // Staking Rewards
  stakingRewards: {
    vortStaking: "100000", // 100K VORT rewards
    somiStaking: "50000",  // 50K VORT rewards
  },

  // Gas Settings
  gas: {
    price: "auto",
    limit: "auto",
  },

  // Verification
  verification: {
    enabled: true,
    apiKey: "dummy", // Somnia doesn't require API key
  }
};

export default DEPLOYMENT_CONFIG;
