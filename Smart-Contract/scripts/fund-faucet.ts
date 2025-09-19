import { ethers } from "hardhat";

async function main() {
  console.log("💰 Funding Faucet with tokens...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Funding with account:", deployer.address);

  // Contract addresses (update these with your actual addresses)
  const FAUCET_ADDRESS = "0x7510cf64c770cb7ba035fE5115699BcB72987b3A"; // Replace with your faucet address
  const VORT_TOKEN_ADDRESS = "0xdEFAA5459ba8DcC24A7470DB4835C97B0fdf85fc"; // Replace with actual VORT token address
  const SOMI_TOKEN_ADDRESS = "0xc578aBA50AF13BAB8FCeAfA99c0eb0E43477cC8E"; // Replace with actual SOMI token address
  const USDC_TOKEN_ADDRESS = "0xEf56Dce856AB8b1C85D7266064Da04c78927Edc4"; // Replace with actual USDC token address

  // Amounts to mint to faucet (enough for many claims)
  const VORT_AMOUNT = ethers.parseEther("1000000"); // 1M VORT tokens
  const SOMI_AMOUNT = ethers.parseEther("1000000"); // 1M SOMI tokens
  const USDC_AMOUNT = ethers.parseUnits("1000000", 6); // 1M USDC tokens (6 decimals)

  console.log("Funding amounts:");
  console.log("- VORT:", ethers.formatEther(VORT_AMOUNT));
  console.log("- SOMI:", ethers.formatEther(SOMI_AMOUNT));
  console.log("- USDC:", ethers.formatUnits(USDC_AMOUNT, 6));

  try {
    // Get token contracts
    const VORT_ABI = [
      "function mint(address to, uint256 amount) external",
      "function balanceOf(address account) external view returns (uint256)",
    ];

    const SOMI_ABI = [
      "function mint(address to, uint256 amount) external",
      "function balanceOf(address account) external view returns (uint256)",
    ];

    const USDC_ABI = [
      "function mint(address to, uint256 amount) external",
      "function balanceOf(address account) external view returns (uint256)",
    ];

    const vortToken = new ethers.Contract(
      VORT_TOKEN_ADDRESS,
      VORT_ABI,
      deployer
    );
    const somiToken = new ethers.Contract(
      SOMI_TOKEN_ADDRESS,
      SOMI_ABI,
      deployer
    );
    const usdcToken = new ethers.Contract(
      USDC_TOKEN_ADDRESS,
      USDC_ABI,
      deployer
    );

    // Check current faucet balances
    console.log("\n📊 Current faucet balances:");
    const currentVortBalance = await vortToken.balanceOf(FAUCET_ADDRESS);
    const currentSomiBalance = await somiToken.balanceOf(FAUCET_ADDRESS);
    const currentUsdcBalance = await usdcToken.balanceOf(FAUCET_ADDRESS);

    console.log("- VORT:", ethers.formatEther(currentVortBalance));
    console.log("- SOMI:", ethers.formatEther(currentSomiBalance));
    console.log("- USDC:", ethers.formatUnits(currentUsdcBalance, 6));

    // Mint VORT tokens to faucet
    console.log("\n🪙 Minting VORT tokens to faucet...");
    const vortTx = await vortToken.mint(FAUCET_ADDRESS, VORT_AMOUNT);
    await vortTx.wait();
    console.log("✅ VORT tokens minted. Tx:", vortTx.hash);

    // Mint SOMI tokens to faucet
    console.log("\n🪙 Minting SOMI tokens to faucet...");
    const somiTx = await somiToken.mint(FAUCET_ADDRESS, SOMI_AMOUNT);
    await somiTx.wait();
    console.log("✅ SOMI tokens minted. Tx:", somiTx.hash);

    // Mint USDC tokens to faucet
    console.log("\n🪙 Minting USDC tokens to faucet...");
    const usdcTx = await usdcToken.mint(FAUCET_ADDRESS, USDC_AMOUNT);
    await usdcTx.wait();
    console.log("✅ USDC tokens minted. Tx:", usdcTx.hash);

    // Check new faucet balances
    console.log("\n📊 New faucet balances:");
    const newVortBalance = await vortToken.balanceOf(FAUCET_ADDRESS);
    const newSomiBalance = await somiToken.balanceOf(FAUCET_ADDRESS);
    const newUsdcBalance = await usdcToken.balanceOf(FAUCET_ADDRESS);

    console.log("- VORT:", ethers.formatEther(newVortBalance));
    console.log("- SOMI:", ethers.formatEther(newSomiBalance));
    console.log("- USDC:", ethers.formatUnits(newUsdcBalance, 6));

    // Calculate how many claims are possible
    const vortClaims = Number(ethers.formatEther(newVortBalance)) / 5000;
    const somiClaims = Number(ethers.formatEther(newSomiBalance)) / 5000;
    const usdcClaims = Number(ethers.formatUnits(newUsdcBalance, 6)) / 4000;
    const maxClaims = Math.floor(Math.min(vortClaims, somiClaims, usdcClaims));

    console.log("\n🎯 Faucet capacity:");
    console.log("- Possible VORT claims:", Math.floor(vortClaims));
    console.log("- Possible SOMI claims:", Math.floor(somiClaims));
    console.log("- Possible USDC claims:", Math.floor(usdcClaims));
    console.log("- Maximum total claims:", maxClaims);

    console.log("\n✅ Faucet funding completed successfully!");
    console.log("Users can now claim:");
    console.log("- 5,000 VORT per claim");
    console.log("- 5,000 SOMI per claim");
    console.log("- 4,000 USDC per claim");
  } catch (error) {
    console.error("❌ Funding failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
