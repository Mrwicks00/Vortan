# Vortan - Advanced Token Launchpad Platform

A comprehensive token launchpad built on blockchain technology with advanced staking, governance, and project management capabilities.

## 🚀 Overview

Vortan is a comprehensive token launchpad platform that combines cutting-edge DeFi features with a modern user interface. The platform enables users to discover, participate in, and manage token sales while earning rewards through dual staking mechanisms.

## ✨ Key Features

### 🎯 Token Launchpad

- **SaleFactory**: Automated creation and management of token sales
- **SalePool**: Individual sale contracts with tier-based allocation
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
- **SaleFactory.sol**: Factory contract for creating new token sales
- **SalePool.sol**: Individual sale implementation with tier logic
- **TierAggregator.sol**: Tier calculation based on dual staking
- **LightGovernor.sol**: Governance implementation
- **VortanToken.sol**: Main platform token (VORT) with voting capabilities
- **SOMI.sol**: Secondary staking token
- **USDC.sol**: Base currency for token sales
- **VortanFaucet.sol**: Testnet token distribution

### Frontend

- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Full type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework with custom styling
- **Wagmi + RainbowKit**: Web3 wallet integration
- **Prisma**: Database ORM for project data
- **Radix UI**: Accessible component library

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

- **Somnia Testnet**: Primary testnet for development
- **Local Development**: Hardhat local network
- **Mainnet Ready**: Contracts deployable to mainnet

### Environment Variables

Create `.env` files in both directories with:

- Private keys for deployment
- RPC endpoints
- API keys for verification

## 📚 Documentation

- **Smart Contracts**: Comprehensive Solidity contracts with OpenZeppelin standards
- **Frontend Components**: Modular React components with TypeScript
- **API Routes**: Next.js API routes for blockchain interaction
- **Database Schema**: Prisma schema for project and user data

## 🧪 Testing

```bash
# Smart Contract Tests
npm run test

# Frontend Tests
pnpm test

# Integration Tests
npm run test:deployment
```

## 🚀 Deployment

```bash
# Deploy to Testnet
npm run deploy:testnet

# Deploy Locally
npm run deploy:local

# Verify Contracts
npm run verify:config
```

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Platform**: [Vortan Launchpad](https://vortan.xyz)
- **Documentation**: [Docs](https://docs.vortan.xyz)
- **Discord**: [Community](https://discord.gg/vortan)

---

_Built for the future of decentralized finance_
