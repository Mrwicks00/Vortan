import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TestToken...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy TestToken with these parameters:
  const tokenName = "Eden";
  const tokenSymbol = "EDEN";
  const initialSupply = ethers.parseEther("1000000"); // 1,000,000 tokens with 18 decimals

  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy(
    tokenName,
    tokenSymbol,
    initialSupply
  );

  await testToken.waitForDeployment();

  const tokenAddress = await testToken.getAddress();
  console.log("TestToken deployed to:", tokenAddress);

  // Verify deployment
  const name = await testToken.name();
  const symbol = await testToken.symbol();
  const totalSupply = await testToken.totalSupply();
  const decimals = await testToken.decimals();

  console.log("\n✅ Token Details:");
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Owner: ${deployer.address}`);

  console.log("\n📋 Copy this for your frontend:");
  console.log(`Token Address: "${tokenAddress}"`);
  console.log(`Token Symbol: "${symbol}"`);
  console.log(`Token Name: "${name}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
