import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Configuring deployed Vortan contracts...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Configuring contracts with account:", deployer.address);

  // Contract addresses from deployment
  const CONTRACT_ADDRESSES = {
    usdc: "0xEf56Dce856AB8b1C85D7266064Da04c78927Edc4",
    somi: "0xc578aBA50AF13BAB8FCeAfA99c0eb0E43477cC8E",
    vortanToken: "0xdEFAA5459ba8DcC24A7470DB4835C97B0fdf85fc",
    vortStaking: "0xb70E38365aD53485BA3ba8b472735c5D4140A0E0",
    somiStaking: "0xF321b818669d56C8f11b3617429cD987c745B0D2",
    tierAggregator: "0xDf1499a95cE0BC67390103293178df03C332AaA1",
    saleFactory: "0x9F69a019DC9F4a4A30a255B572E7F425a7814637",
    faucet: "0xA939e5f884f46a281Eac2c438a7337b890644b8C",
    governor: "0xb59E4c855a8E142e389bB535962622B42955b9BC",
  };

  // Get contract instances
  const vortanToken = await ethers.getContractAt(
    "VortanToken",
    CONTRACT_ADDRESSES.vortanToken
  );
  const somi = await ethers.getContractAt("SOMI", CONTRACT_ADDRESSES.somi);
  const usdc = await ethers.getContractAt("USDC", CONTRACT_ADDRESSES.usdc);
  const vortStaking = await ethers.getContractAt(
    "StakingWithRewards",
    CONTRACT_ADDRESSES.vortStaking
  );
  const somiStaking = await ethers.getContractAt(
    "StakingWithRewards",
    CONTRACT_ADDRESSES.somiStaking
  );
  const tierAggregator = await ethers.getContractAt(
    "TierAggregator",
    CONTRACT_ADDRESSES.tierAggregator
  );
  const saleFactory = await ethers.getContractAt(
    "SaleFactory",
    CONTRACT_ADDRESSES.saleFactory
  );
  const faucet = await ethers.getContractAt(
    "VortanFaucet",
    CONTRACT_ADDRESSES.faucet
  );
  const governor = await ethers.getContractAt(
    "LIghtGovernor",
    CONTRACT_ADDRESSES.governor
  );

  console.log("📋 Contract instances loaded successfully\n");

  try {
    // 1. Configure Staking Reward Rates
    console.log("🎁 Setting staking reward rates...");

    // VORT Staking: 100 VORT per day (100 * 10^18 / 86400 seconds)
    const vortRewardRate = ethers.parseEther("100") / 86400n;
    await vortStaking.setRewardRate(vortRewardRate);
    console.log("✅ VORT staking reward rate set to 100 VORT/day");

    // SOMI Staking: 50 VORT per day (50 * 10^18 / 86400 seconds)
    const somiRewardRate = ethers.parseEther("50") / 86400n;
    await somiStaking.setRewardRate(somiRewardRate);
    console.log("✅ SOMI staking reward rate set to 50 VORT/day");

    // 2. Configure Staking Lock Multipliers
    console.log("\n🔒 Setting staking lock multipliers...");

    // 30 days: 1.0x, 90 days: 1.2x, 180 days: 1.5x
    await vortStaking.setLockMultipliers(10000, 12000, 15000);
    console.log(
      "✅ VORT staking multipliers set (30d: 1.0x, 90d: 1.2x, 180d: 1.5x)"
    );

    await somiStaking.setLockMultipliers(10000, 12000, 15000);
    console.log(
      "✅ SOMI staking multipliers set (30d: 1.0x, 90d: 1.2x, 180d: 1.5x)"
    );

    // 3. Configure Tier Aggregator Thresholds
    console.log("\n🏆 Setting tier thresholds...");

    // Tier 1: 1000 points, Tier 2: 5000 points, Tier 3: 20000 points
    await tierAggregator.setThresholds(
      ethers.parseEther("1000"), // Tier 1
      ethers.parseEther("5000"), // Tier 2
      ethers.parseEther("20000") // Tier 3
    );
    console.log("✅ Tier thresholds set (T1: 1000, T2: 5000, T3: 20000)");

    // 4. Configure Sale Factory Platform Fee
    console.log("\n💰 Setting platform fee...");

    // Set platform fee to 5% (500 basis points)
    await saleFactory.setPlatformFee(500);
    console.log("✅ Platform fee set to 5%");

    // 5. Fund Staking Contracts with Rewards
    console.log("\n🎁 Funding staking contracts with rewards...");

    // Fund VORT staking with 100K VORT rewards
    await vortanToken.mint(
      CONTRACT_ADDRESSES.vortStaking,
      ethers.parseEther("100000")
    );
    console.log("✅ VORT staking funded with 100K VORT rewards");

    // Fund SOMI staking with 50K VORT rewards
    await vortanToken.mint(
      CONTRACT_ADDRESSES.somiStaking,
      ethers.parseEther("50000")
    );
    console.log("✅ SOMI staking funded with 50K VORT rewards");

    // 6. Fund Faucet with All Token Types
    console.log("\n🚰 Funding faucet with all token types...");

    // Fund with VORT, SOMI, and USDC
    await vortanToken.transfer(
      CONTRACT_ADDRESSES.faucet,
      ethers.parseEther("10000")
    ); // 10K VORT
    await somi.transfer(CONTRACT_ADDRESSES.faucet, ethers.parseEther("5000")); // 5K SOMI
    await usdc.transfer(
      CONTRACT_ADDRESSES.faucet,
      ethers.parseUnits("1000", 6)
    ); // 1K USDC
    console.log("✅ Faucet funded with VORT, SOMI, and USDC");

    // 7. Verify Configurations
    console.log("\n🔍 Verifying configurations...");

    const vortRate = await vortStaking.rewardRatePerSecond();
    const somiRate = await somiStaking.rewardRatePerSecond();
    const platformFee = await saleFactory.platformFeeBps();
    const tier1 = await tierAggregator.t1();
    const tier2 = await tierAggregator.t2();
    const tier3 = await tierAggregator.t3();

    console.log(
      "✅ VORT staking rate:",
      ethers.formatEther(vortRate * 86400n),
      "VORT/day"
    );
    console.log(
      "✅ SOMI staking rate:",
      ethers.formatEther(somiRate * 86400n),
      "VORT/day"
    );
    console.log("✅ Platform fee:", Number(platformFee) / 100, "%");
    console.log("✅ Tier 1 threshold:", ethers.formatEther(tier1), "points");
    console.log("✅ Tier 2 threshold:", ethers.formatEther(tier2), "points");
    console.log("✅ Tier 3 threshold:", ethers.formatEther(tier3), "points");

    console.log("\n🎉 All contracts configured successfully!");
    console.log("\n📋 Current Configuration:");
    console.log("- Staking rewards: VORT (100/day), SOMI (50/day)");
    console.log("- Lock multipliers: 30d(1.0x), 90d(1.2x), 180d(1.5x)");
    console.log("- Tier thresholds: T1(1000), T2(5000), T3(20000)");
    console.log("- Platform fee: 5%");
    console.log("- Faucet: Funded with all token types");
    console.log("- Staking contracts: Funded with reward tokens");
  } catch (error) {
    console.error("❌ Configuration failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Configuration failed:", error);
    process.exit(1);
  });
