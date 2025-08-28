import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Vortan Platform to Somnia Testnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "STT\n"
  );

  // Deploy USDC Mock Token
  console.log("🏗️  Deploying USDC Mock Token...");
  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy(deployer.address);
  await usdc.waitForDeployment();
  console.log("✅ USDC deployed to:", await usdc.getAddress());

  // Deploy SOMI Mock Token
  console.log("🏗️  Deploying SOMI Mock Token...");
  const SOMI = await ethers.getContractFactory("SOMI");
  const somi = await SOMI.deploy(deployer.address);
  await somi.waitForDeployment();
  console.log("✅ SOMI deployed to:", await somi.getAddress());

  // Deploy VortanToken
  console.log("🏗️  Deploying VortanToken...");
  const VortanToken = await ethers.getContractFactory("VortanToken");
  const vortanToken = await VortanToken.deploy(deployer.address);
  await vortanToken.waitForDeployment();
  console.log("✅ VortanToken deployed to:", await vortanToken.getAddress());

  // Deploy StakingWithRewards contracts
  console.log("🏗️  Deploying Staking Contracts...");
  const StakingWithRewards = await ethers.getContractFactory(
    "StakingWithRewards"
  );
  const vortStaking = await StakingWithRewards.deploy(
    await vortanToken.getAddress(),
    await vortanToken.getAddress(),
    deployer.address
  );
  await vortStaking.waitForDeployment();
  console.log("✅ VORT Staking deployed to:", await vortStaking.getAddress());

  const somiStaking = await StakingWithRewards.deploy(
    await somi.getAddress(),
    await vortanToken.getAddress(),
    deployer.address
  );
  await somiStaking.waitForDeployment();
  console.log("✅ SOMI Staking deployed to:", await somiStaking.getAddress());

  // Deploy TierAggregator
  console.log("🏗️  Deploying TierAggregator...");
  const TierAggregator = await ethers.getContractFactory("TierAggregator");
  const tierAggregator = await TierAggregator.deploy(
    await vortStaking.getAddress(),
    await somiStaking.getAddress()
  );
  await tierAggregator.waitForDeployment();
  console.log(
    "✅ TierAggregator deployed to:",
    await tierAggregator.getAddress()
  );

  // Deploy SaleFactory
  console.log("🏗️  Deploying SaleFactory...");
  const SaleFactory = await ethers.getContractFactory("SaleFactory");
  const saleFactory = await SaleFactory.deploy(
    deployer.address,
    deployer.address
  );
  await saleFactory.waitForDeployment();
  console.log("✅ SaleFactory deployed to:", await saleFactory.getAddress());

  // Deploy VortanFaucet
  console.log("🏗️  Deploying VortanFaucet...");
  const VortanFaucet = await ethers.getContractFactory("VortanFaucet");
  const faucet = await VortanFaucet.deploy(
    await vortanToken.getAddress(),
    await somi.getAddress(),
    await usdc.getAddress()
  );
  await faucet.waitForDeployment();
  console.log("✅ VortanFaucet deployed to:", await faucet.getAddress());

  // Deploy LightGovernor (optional)
  console.log("🏗️  Deploying LightGovernor...");
  const LightGovernor = await ethers.getContractFactory("LIghtGovernor");
  const governor = await LightGovernor.deploy(
    await vortanToken.getAddress(),
    await vortStaking.getAddress()
  );
  await governor.waitForDeployment();
  console.log("✅ LightGovernor deployed to:", await governor.getAddress());

  // Mint initial tokens
  console.log("\n💰 Minting initial tokens...");
  await vortanToken.mint(deployer.address, ethers.parseEther("1000000")); // 1M VORT
  await somi.mint(deployer.address, ethers.parseEther("1000000")); // 1M SOMI
  await usdc.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  console.log("✅ Initial tokens minted");

  // Fund faucet
  console.log("🚰 Funding faucet...");
  await vortanToken.transfer(
    await faucet.getAddress(),
    ethers.parseEther("10000")
  ); // 10K VORT
  await somi.transfer(await faucet.getAddress(), ethers.parseEther("5000")); // 5K SOMI
  await usdc.transfer(await faucet.getAddress(), ethers.parseUnits("1000", 6)); // 1K USDC
  console.log("✅ Faucet funded");

  // Fund staking contracts with rewards
  console.log("🎁 Funding staking rewards...");
  await vortanToken.mint(
    await vortStaking.getAddress(),
    ethers.parseEther("100000")
  ); // 100K VORT rewards
  await vortanToken.mint(
    await somiStaking.getAddress(),
    ethers.parseEther("50000")
  ); // 50K VORT rewards
  console.log("✅ Staking rewards funded");

  console.log("\n🎉 Deployment Complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("USDC Mock:", await usdc.getAddress());
  console.log("SOMI Mock:", await somi.getAddress());
  console.log("VortanToken:", await vortanToken.getAddress());
  console.log("VORT Staking:", await vortStaking.getAddress());
  console.log("SOMI Staking:", await somiStaking.getAddress());
  console.log("TierAggregator:", await tierAggregator.getAddress());
  console.log("SaleFactory:", await saleFactory.getAddress());
  console.log("VortanFaucet:", await faucet.getAddress());
  console.log("LightGovernor:", await governor.getAddress());

  console.log("\n🔗 Somnia Testnet Explorer:");
  console.log("https://shannon-explorer.somnia.network/");
  console.log("\n🚰 Faucet:");
  console.log("https://testnet.somnia.network/");

  // Save addresses to a file for easy reference
  const deploymentInfo = {
    network: "Somnia Testnet",
    chainId: 50312,
    deployer: deployer.address,
    contracts: {
      usdc: await usdc.getAddress(),
      somi: await somi.getAddress(),
      vortanToken: await vortanToken.getAddress(),
      vortStaking: await vortStaking.getAddress(),
      somiStaking: await somiStaking.getAddress(),
      tierAggregator: await tierAggregator.getAddress(),
      saleFactory: await saleFactory.getAddress(),
      faucet: await faucet.getAddress(),
      governor: await governor.getAddress(),
    },
    deploymentTime: new Date().toISOString(),
  };

  console.log("\n💾 Deployment info saved to deployment-info.json");
  console.log("Use these addresses for your frontend integration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
