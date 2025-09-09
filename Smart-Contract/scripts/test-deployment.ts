import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Deployment Setup...\n");

  try {
    // Test getting signers
    const [deployer] = await ethers.getSigners();
    console.log("✅ Signers loaded:", deployer.address);

    // Test getting contract factories
    console.log("🏗️  Testing contract factories...");

    const USDC = await ethers.getContractFactory("USDC");
    console.log("✅ USDC factory loaded");

    const SOMI = await ethers.getContractFactory("SOMI");
    console.log("✅ SOMI factory loaded");

    const VortanToken = await ethers.getContractFactory("VortanToken");
    console.log("✅ VortanToken factory loaded");

    const StakingWithRewards = await ethers.getContractFactory(
      "StakingWithRewards"
    );
    console.log("✅ StakingWithRewards factory loaded");

    const TierAggregator = await ethers.getContractFactory("TierAggregator");
    console.log("✅ TierAggregator factory loaded");

    const SaleFactory = await ethers.getContractFactory("SaleFactory");
    console.log("✅ SaleFactory factory loaded");

    const VortanFaucet = await ethers.getContractFactory("VortanFaucet");
    console.log("✅ VortanFaucet factory loaded");

    const LightGovernor = await ethers.getContractFactory("LIghtGovernor");
    console.log("✅ LightGovernor factory loaded");

    console.log("\n🎉 All contract factories loaded successfully!");
    console.log("🚀 Ready for deployment to Somnia Testnet!");
  } catch (error) {
    console.error("❌ Error loading contract factories:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });





