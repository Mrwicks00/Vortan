# Vortan - Advanced IDO Platform

A comprehensive decentralized IDO platform built on the Somnia blockchain with advanced staking, governance, and project management capabilities.

## 🚀 Overview

Vortan solves the problem of fragmented IDO platforms by providing a unified IDO platform with integrated staking rewards and governance voting on the Somnia blockchain. The platform enables users to discover, participate in, and manage token sales while earning rewards through dual staking mechanisms.

## ✨ Key Features

### 🎯 IDO Platform

- **SaleFactory**: Automated creation and management of IDO sales
- **SalePool**: Individual IDO contracts with tier-based allocation
- **Tier System**: Multi-tier allocation based on staking participation
- **Vesting**: Configurable token vesting schedules with TGE releases

### 💰 Dual Staking System

- **VORT Staking**: Stake VORT tokens to earn rewards and unlock tiers
- **SOMI Staking**: Stake SOMI tokens with weighted contribution to tier system
- **Lock Multipliers**: 30-day (1.0x), 90-day (1.2x), 180-day (1.5x) lock periods
- **Reward Distribution**: Automated reward calculation and distribution

### 🏛️ Governance

- **LightGovernor**: On-chain governance with staking-based voting power
- **Proposal System**: Create and vote on platform proposals
- **Quorum Management**: 4% quorum requirement for proposal execution

### 📊 Analytics & Management

- **Real-time Analytics**: Project performance tracking and metrics
- **Admin Dashboard**: Comprehensive project and user management
- **Activity Monitoring**: User participation and transaction tracking

## 🏗️ Architecture

### Smart Contracts

- **DualStaking.sol**: Core staking contract with reward distribution
- **SaleFactory.sol**: Factory contract for creating new IDO sales
- **SalePool.sol**: Individual IDO implementation with tier logic
- **TierAggregator.sol**: Tier calculation based on dual staking
- **LightGovernor.sol**: Governance implementation
- **VortanToken.sol**: Main platform token (VORT) with voting capabilities
- **SOMI.sol**: Secondary staking token
- **USDC.sol**: Base currency for IDO sales
- **VortanFaucet.sol**: Testnet token distribution

### Frontend

- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Full type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework with custom styling
- **Wagmi + RainbowKit**: Web3 wallet integration
- **Supabase**: Database and backend services for project data
- **Radix UI**: Accessible component library
- **React Toastify**: Toast notifications for user feedback

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm/npm/yarn
- Hardhat (for smart contract development)
- MetaMask or compatible Web3 wallet

### Smart Contract Setup

```bash
cd Smart-Contract
npm install
npm run compile
npm run test
```

### Frontend Setup

```bash
cd vortan-launchpad
pnpm install
pnpm dev
```

## 🔧 Configuration

### Network Support

- **Somnia Testnet**: Primary testnet for development (Chain ID: 50312)
- **Local Development**: Hardhat local network
- **Mainnet Ready**: Contracts deployable to mainnet

### Contract Addresses (Somnia Testnet)

```typescript
// Deployed Contract Addresses
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

### Environment Variables

Create `.env` files in both directories with:

- Private keys for deployment
- RPC endpoints (https://dream-rpc.somnia.network)
- API keys for verification

## 📚 Documentation

- **Smart Contracts**: Comprehensive Solidity contracts with OpenZeppelin standards
- **Frontend Components**: Modular React components with TypeScript
- **API Routes**: Next.js API routes for blockchain interaction
- **Database Schema**: Supabase database schema for project and user data

## 🧪 Testing

```bash
# Smart Contract Tests
cd Smart-Contract
npm run test

# Test on Testnet
npm run test:testnet

# Integration Tests
npm run test:deployment
```

## 🚀 Deployment

```bash
# Deploy to Testnet
cd Smart-Contract
npm run deploy:testnet

# Deploy Locally
npm run deploy:local

# Verify Contracts
npm run verify:config
```

## 🔧 Faucet System

The platform includes a faucet system for testing:

- **VORT**: 5,000 tokens per claim
- **SOMI**: 5,000 tokens per claim
- **USDC**: 4,000 tokens per claim

Access the faucet at `/faucet` in the application.

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Platform**: [Vortan IDO Platform](https://vortan-mocha.vercel.app/)

---

_Built for the future of decentralized finance_
