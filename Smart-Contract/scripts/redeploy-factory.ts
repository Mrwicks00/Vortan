import { ethers } from "hardhat";

async function main() {
  console.log("Redeploying SaleFactory...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy SaleFactory
  const SaleFactory = await ethers.getContractFactory("SaleFactory");
  const saleFactory = await SaleFactory.deploy(
    deployer.address, // owner
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // platform treasury
  );

  await saleFactory.waitForDeployment();

  const factoryAddress = await saleFactory.getAddress();
  console.log("SaleFactory deployed to:", factoryAddress);

  console.log("\n✅ Update this address in addresses.ts:");
  console.log(`SALE_FACTORY: "${factoryAddress}",`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
