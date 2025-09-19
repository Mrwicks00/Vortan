import { ethers } from "hardhat";

async function main() {
  console.log("🚰 Deploying VortanFaucet contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Contract addresses (update these with your deployed token addresses)
  const VORT_TOKEN_ADDRESS = "0xdEFAA5459ba8DcC24A7470DB4835C97B0fdf85fc"; // Replace with actual VORT token address
  const SOMI_TOKEN_ADDRESS = "0xc578aBA50AF13BAB8FCeAfA99c0eb0E43477cC8E"; // Replace with actual SOMI token address
  const USDC_TOKEN_ADDRESS = "0xEf56Dce856AB8b1C85D7266064Da04c78927Edc4"; // Replace with actual USDC token address

  console.log("Token addresses:");
  console.log("VORT Token:", VORT_TOKEN_ADDRESS);
  console.log("SOMI Token:", SOMI_TOKEN_ADDRESS);
  console.log("USDC Token:", USDC_TOKEN_ADDRESS);

  // Deploy the VortanFaucet contract
  const VortanFaucet = await ethers.getContractFactory("VortanFaucet");
  const faucet = await VortanFaucet.deploy(
    VORT_TOKEN_ADDRESS,
    SOMI_TOKEN_ADDRESS,
    USDC_TOKEN_ADDRESS
  );

  await faucet.waitForDeployment();

  const faucetAddress = await faucet.getAddress();
  console.log("✅ VortanFaucet deployed to:", faucetAddress);

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log("Faucet Address:", faucetAddress);
  console.log("VORT Token:", VORT_TOKEN_ADDRESS);
  console.log("SOMI Token:", SOMI_TOKEN_ADDRESS);
  console.log("USDC Token:", USDC_TOKEN_ADDRESS);
  console.log("\n🎯 Token amounts per claim:");
  console.log("- 5,000 VORT");
  console.log("- 5,000 SOMI");
  console.log("- 4,000 USDC");

  console.log("\n⚠️  Next steps:");
  console.log("1. Update the faucet address in your frontend configuration");
  console.log("2. Mint tokens to the faucet contract address");
  console.log("3. Test the faucet functionality");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    faucetAddress: faucetAddress,
    vortToken: VORT_TOKEN_ADDRESS,
    somiToken: SOMI_TOKEN_ADDRESS,
    usdcToken: USDC_TOKEN_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    tokenAmounts: {
      vort: "5000",
      somi: "5000",
      usdc: "4000",
    },
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
