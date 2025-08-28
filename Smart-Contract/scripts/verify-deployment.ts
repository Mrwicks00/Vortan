import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying Somnia Testnet Configuration...\n");

  // Check network configuration
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Current Network:");
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Name: ${network.name || "Unknown"}`);

  // Check if we're connected to Somnia Testnet
  if (network.chainId === 50312n) {
    console.log("✅ Connected to Somnia Testnet!");
  } else {
    console.log("⚠️  Not connected to Somnia Testnet");
    console.log("   Expected Chain ID: 50312");
    console.log("   Current Chain ID:", network.chainId.toString());
  }

  // Check deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\n👤 Deployer Account:");
  console.log(`   Address: ${deployer.address}`);
  console.log(`   Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} STT`);

  // Check if we have enough balance for deployment
  const estimatedDeploymentCost = ethers.parseEther("0.1"); // Rough estimate
  const balance = await ethers.provider.getBalance(deployer.address);
  
  if (balance > estimatedDeploymentCost) {
    console.log("✅ Sufficient balance for deployment");
  } else {
    console.log("❌ Insufficient balance for deployment");
    console.log("   Get testnet tokens from: https://testnet.somnia.network/");
  }

  // Test RPC connection
  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("\n🔗 RPC Connection:");
    console.log(`   Latest Block: ${blockNumber}`);
    console.log("✅ RPC connection successful");
  } catch (error) {
    console.log("\n❌ RPC connection failed:", error);
  }

  console.log("\n📋 Next Steps:");
  console.log("1. Ensure you have sufficient STT tokens");
  console.log("2. Run: npx hardhat run scripts/deploy-somnia.ts --network somniaTestnet");
  console.log("3. Save contract addresses for frontend integration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
