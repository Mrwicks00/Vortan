import { ethers } from "hardhat";

async function main() {
  console.log("Minting 30 million test tokens...");

  const [deployer] = await ethers.getSigners();
  console.log("Minting with account:", deployer.address);

  // Get the deployed TestToken contract address
  // You can pass this as an argument: npx hardhat run scripts/mint-test-tokens.ts --network somniaTestnet -- --token-address 0xYourTokenAddress
  const TEST_TOKEN_ADDRESS =
    process.argv[4] || "0x3fc21dDa39DeB844886368850Fc10609b64314C0"; // Update this with your token address

  if (TEST_TOKEN_ADDRESS === "0x1234567890123456789012345678901234567890") {
    console.log(
      "⚠️  Please update the TEST_TOKEN_ADDRESS in the script with your deployed token address"
    );
    console.log(
      "Or run: npx hardhat run scripts/mint-test-tokens.ts --network somniaTestnet -- --token-address 0xYourTokenAddress"
    );
    return;
  }

  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = TestToken.attach(TEST_TOKEN_ADDRESS);

  // Check current balance before minting
  const currentBalance = await testToken.balanceOf(deployer.address);
  console.log("Current balance:", ethers.formatEther(currentBalance), "tokens");

  // Mint 30 million tokens (30,000,000 with 18 decimals)
  const mintAmount = ethers.parseEther("30000000"); // 30 million tokens
  console.log("Minting amount:", ethers.formatEther(mintAmount), "tokens");

  try {
    const tx = await testToken.mint(deployer.address, mintAmount);
    console.log("Mint transaction hash:", tx.hash);

    await tx.wait();
    console.log("✅ Successfully minted 30 million tokens!");

    // Check new balance
    const balance = await testToken.balanceOf(deployer.address);
    console.log("New balance:", ethers.formatEther(balance), "tokens");
  } catch (error) {
    console.error("❌ Minting failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
