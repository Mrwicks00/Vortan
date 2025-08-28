import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("VortanFaucet", function () {
  let faucet: any;
  let vortanToken: any;
  let somi: any;
  let usdc: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await hre.ethers.getSigners();

    // Deploy tokens
    const VortanToken = await hre.ethers.getContractFactory("VortanToken");
    vortanToken = await VortanToken.deploy(owner.address);

    const SOMI = await hre.ethers.getContractFactory("SOMI");
    somi = await SOMI.deploy(owner.address);

    const USDC = await hre.ethers.getContractFactory("USDC");
    usdc = await USDC.deploy(owner.address);

    // Deploy faucet
    const VortanFaucet = await hre.ethers.getContractFactory("VortanFaucet");
    faucet = await VortanFaucet.deploy(
      vortanToken.target,
      somi.target,
      usdc.target
    );

    // Mint tokens to owner first, then fund the faucet
    await vortanToken.mint(owner.address, ethers.parseEther("10000")); // 10K VORT
    await somi.mint(owner.address, ethers.parseEther("5000")); // 5K SOMI
    await usdc.mint(owner.address, ethers.parseUnits("1000", 6)); // 1K USDC

    // Fund the faucet with tokens
    await vortanToken.transfer(faucet.target, ethers.parseEther("10000")); // 10K VORT
    await somi.transfer(faucet.target, ethers.parseEther("5000")); // 5K SOMI
    await usdc.transfer(faucet.target, ethers.parseUnits("1000", 6)); // 1K USDC
  });

  it("Should allow users to claim tokens once", async function () {
    // User1 claims tokens
    await faucet.connect(user1).claimTokens();

    // Check token balances
    expect(await vortanToken.balanceOf(user1.address)).to.equal(
      ethers.parseEther("1000")
    );
    expect(await somi.balanceOf(user1.address)).to.equal(
      ethers.parseEther("500")
    );
    expect(await usdc.balanceOf(user1.address)).to.equal(
      ethers.parseUnits("100", 6)
    );

    // Check that user1 has claimed
    expect(await faucet.hasClaimed(user1.address)).to.be.true;
  });

  it("Should not allow users to claim twice", async function () {
    // User1 claims first time
    await faucet.connect(user1).claimTokens();

    // Try to claim again (should fail)
    await expect(faucet.connect(user1).claimTokens()).to.be.revertedWith(
      "Already claimed"
    );
  });

  it("Should allow multiple users to claim", async function () {
    // User1 claims
    await faucet.connect(user1).claimTokens();

    // User2 claims
    await faucet.connect(user2).claimTokens();

    // Check both users got tokens
    expect(await vortanToken.balanceOf(user1.address)).to.equal(
      ethers.parseEther("1000")
    );
    expect(await vortanToken.balanceOf(user2.address)).to.equal(
      ethers.parseEther("1000")
    );

    expect(await faucet.hasClaimed(user1.address)).to.be.true;
    expect(await faucet.hasClaimed(user2.address)).to.be.true;
  });

  it("Should emit TokensClaimed event", async function () {
    // User1 claims tokens
    const tx = await faucet.connect(user1).claimTokens();
    const receipt = await tx.wait();

    // Check event was emitted
    expect(receipt?.logs.length).to.be.gt(0);
  });
});
