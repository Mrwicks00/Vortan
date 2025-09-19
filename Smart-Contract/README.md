# Vortan Smart Contracts

This directory contains the smart contracts for the Vortan IDO platform, built with Hardhat and deployed on the Somnia blockchain.

## 📋 Contract Overview

### Core Contracts

- **DualStaking.sol**: Dual token staking system for VORT and SOMI tokens
- **SaleFactory.sol**: Factory contract for creating new IDO sales
- **SalePool.sol**: Individual IDO contracts with tier-based allocation and participant tracking
- **TierAggregator.sol**: Tier calculation based on dual staking participation
- **LightGovernor.sol**: Governance implementation with staking-based voting power

### Token Contracts

- **VortanToken.sol**: Main platform token (VORT) with ERC20Votes extension
- **SOMI.sol**: Secondary staking token
- **USDC.sol**: Base currency for IDO sales

### Utility Contracts

- **VortanFaucet.sol**: Testnet token distribution system

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to testnet
npm run deploy:testnet
```

## 📊 Deployed Addresses (Somnia Testnet)

```typescript
const CONTRACT_ADDRESSES = {
  // Tokens
  VORTAN_TOKEN: "0xdEFAA5459ba8DcC24A7470DB4835C97B0fdf85fc",
  SOMI_TOKEN: "0xc578aBA50AF13BAB8FCeAfA99c0eb0E43477cC8E",
  USDC_TOKEN: "0xEf56Dce856AB8b1C85D7266064Da04c78927Edc4",

  // Staking Contracts
  VORT_STAKING: "0xb70E38365aD53485BA3ba8b472735c5D4140A0E0",
  SOMI_STAKING: "0xF321b818669d56C8f11b3617429cD987c745B0D2",

  // Other Contracts
  TIER_AGGREGATOR: "0xDf1499a95cE0BC67390103293178df03C332AaA1",
  SALE_FACTORY: "0x7b299220aAa4C29083C47dceCB495C7366591D2C",
  FAUCET: "0x7510cf64c770cb7ba035fE5115699BcB72987b3A",
  GOVERNOR: "0xb59E4c855a8E142e389bB535962622B42955b9BC",
};
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with gas reporting
REPORT_GAS=true npm run test

# Test deployment integration
npm run test:deployment
```

## 🚀 Deployment

```bash
# Deploy to local network
npm run deploy:local

# Deploy to Somnia testnet
npm run deploy:testnet

# Verify contracts on block explorer
npm run verify:config
```

## 🔧 Scripts

- `deploy-somnia.ts`: Main deployment script for Somnia testnet
- `test-deployment.ts`: Test deployed contracts functionality
- `verify-deployment.ts`: Verify contracts on block explorer
- `mint-test-tokens.ts`: Mint test tokens for development
- `fund-faucet.ts`: Fund the faucet contract with tokens

## 📝 Contract Features

### Staking System

- Dual token staking (VORT + SOMI)
- Lock period multipliers (30d, 90d, 180d)
- Automated reward distribution
- Tier-based allocation system

### IDO System

- Factory pattern for IDO creation
- Tier-based token allocation
- Configurable vesting schedules
- Participant tracking (new contracts)
- Refund system for failed IDOs

### Governance

- On-chain proposal creation and voting
- Staking-based voting power
- Configurable quorum and thresholds
- Time-locked execution

## 🌐 Network Configuration

- **Somnia Testnet**: Chain ID 50312
- **RPC**: https://dream-rpc.somnia.network
- **Explorer**: https://somnia-testnet.socialscan.io
