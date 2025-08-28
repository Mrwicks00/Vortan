# 🚀 Vortan Platform Deployment Guide - Somnia Testnet

## 🌐 Network Configuration

**Network**: Somnia Testnet (Shannon)  
**Chain ID**: 50312  
**Symbol**: STT  
**RPC URL**: https://dream-rpc.somnia.network/  
**Block Explorer**: https://shannon-explorer.somnia.network/  
**Faucet**: https://testnet.somnia.network/  

## 📋 Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get Testnet STT Tokens**
   - Visit: https://testnet.somnia.network/
   - Or use Thirdweb: https://thirdweb.com/somnia-shannon-testnet

3. **Set Up Private Key**
   ```bash
   # Create .env file (copy from .env.example)
   cp .env.example .env
   
   # Add your private key to .env
   PRIVATE_KEY=your_private_key_here
   ```

## 🏗️ Deployment Commands

### 1. Compile Contracts
```bash
npx hardhat compile
```

### 2. Deploy to Somnia Testnet
```bash
npx hardhat run scripts/deploy-somnia.ts --network somniaTestnet
```

### 3. Verify Contracts (Optional)
```bash
npx hardhat verify --network somniaTestnet CONTRACT_ADDRESS [CONSTRUCTOR_ARGS]
```

## 📊 Contract Addresses

After deployment, you'll get addresses for:
- **USDC Mock Token**
- **SOMI Mock Token** 
- **VortanToken (VORT)**
- **VORT Staking Contract**
- **SOMI Staking Contract**
- **TierAggregator**
- **SaleFactory**
- **VortanFaucet**
- **LightGovernor**

## 🔧 Configuration

### Gas Settings
- **Gas Price**: Auto (network determines)
- **Gas Limit**: Auto (contract estimates)

### Initial Supply
- **VORT**: 1,000,000 tokens
- **SOMI**: 1,000,000 tokens  
- **USDC**: 1,000,000 tokens (6 decimals)

### Faucet
- **Claim Amount**: 10,000 VORT per address
- **Max Claims**: 1 per address

## 🧪 Testing

### Local Testing
```bash
npx hardhat test
```

### Testnet Testing
```bash
npx hardhat test --network somniaTestnet
```

## 🌐 Useful Links

- **Network Explorer**: https://shannon-explorer.somnia.network/
- **Alternative Explorer**: https://somnia-testnet.socialscan.io/
- **Faucet**: https://testnet.somnia.network/
- **Thirdweb Faucet**: https://thirdweb.com/somnia-shannon-testnet

## ⚠️ Important Notes

1. **Keep your private key secure** - never commit it to version control
2. **Test thoroughly** on testnet before mainnet deployment
3. **Monitor gas costs** - Somnia testnet may have different gas dynamics
4. **Backup deployment addresses** - you'll need these for frontend integration

## 🆘 Troubleshooting

### Common Issues

1. **Insufficient STT for gas**
   - Get more testnet tokens from faucet

2. **Contract verification fails**
   - Somnia doesn't require API keys for verification

3. **Deployment timeout**
   - Check network connectivity and RPC endpoint

### Support
- Check network status: https://status.somnia.network/
- Community: https://discord.gg/somnia
