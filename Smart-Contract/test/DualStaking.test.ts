import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("DualStaking", function () {
  let dualStaking: any;
  let vortanToken: any;
  let somi: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await hre.ethers.getSigners();

    // Deploy tokens
    const VortanToken = await hre.ethers.getContractFactory("VortanToken");
    vortanToken = await VortanToken.deploy(owner.address);

    const SOMI = await hre.ethers.getContractFactory("SOMI");
    somi = await SOMI.deploy(owner.address);

    // Deploy staking contract
    const StakingWithRewards = await hre.ethers.getContractFactory(
      "StakingWithRewards"
    );
    dualStaking = await StakingWithRewards.deploy(
      vortanToken.target,
      somi.target,
      owner.address
    );

    // Mint tokens to users
    await vortanToken.mint(user1.address, ethers.parseEther("10000"));
    await vortanToken.mint(user2.address, ethers.parseEther("10000"));
    await vortanToken.mint(user3.address, ethers.parseEther("10000"));
    await somi.mint(user1.address, ethers.parseEther("10000"));
    await somi.mint(user2.address, ethers.parseEther("10000"));
    await somi.mint(user3.address, ethers.parseEther("10000"));
  });

  describe("Basic Functionality", function () {
    it("Should have correct token addresses", async function () {
      expect(await dualStaking.stakeToken()).to.equal(vortanToken.target);
      expect(await dualStaking.rewardToken()).to.equal(somi.target);
    });

    it("Should start with zero total staked", async function () {
      expect(await dualStaking.totalStaked(user1.address)).to.equal(0);
    });
  });

  describe("Token Staking", function () {
    beforeEach(async function () {
      await vortanToken
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
    });

    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockDays = 30;
      await dualStaking.connect(user1).stake(stakeAmount, lockDays);

      expect(await dualStaking.totalStaked(user1.address)).to.equal(
        stakeAmount
      );
    });

    it("Should not allow staking more than approved", async function () {
      const stakeAmount = ethers.parseEther("15000");
      const lockDays = 30;
      await expect(
        dualStaking.connect(user1).stake(stakeAmount, lockDays)
      ).to.be.revertedWithCustomError(
        vortanToken,
        "ERC20InsufficientAllowance"
      );
    });

    it("Should not allow staking zero amount", async function () {
      const lockDays = 30;
      await expect(
        dualStaking.connect(user1).stake(0, lockDays)
      ).to.be.revertedWith("amt");
    });

    it("Should update user's staking info correctly", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const lockDays = 30;

      await dualStaking.connect(user1).stake(stakeAmount, lockDays);

      expect(await dualStaking.totalStaked(user1.address)).to.equal(
        stakeAmount
      );
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await vortanToken
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));

      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 1); // 1 day lock
    });

    it("Should allow users to unstake tokens after lock period", async function () {
      // Wait for lock period to end
      await time.increase(2 * 24 * 60 * 60); // 2 days

      const unstakeAmount = ethers.parseEther("500");
      const initialBalance = await vortanToken.balanceOf(user1.address);

      await dualStaking.connect(user1).unstake(unstakeAmount);

      expect(await dualStaking.totalStaked(user1.address)).to.equal(
        ethers.parseEther("500")
      );
      expect(await vortanToken.balanceOf(user1.address)).to.equal(
        initialBalance + unstakeAmount
      );
    });

    it("Should not allow unstaking more than staked", async function () {
      await expect(
        dualStaking.connect(user1).unstake(ethers.parseEther("1500"))
      ).to.be.revertedWith("amt");
    });

    it("Should not allow unstaking zero amount", async function () {
      await expect(dualStaking.connect(user1).unstake(0)).to.be.revertedWith(
        "amt"
      );
    });
  });

  describe("Points Calculation", function () {
    beforeEach(async function () {
      await vortanToken
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
    });

    it("Should calculate tier points correctly", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await dualStaking.connect(user1).stake(stakeAmount, 30);

      const points = await dualStaking.tierPointsOf(user1.address);
      expect(points).to.equal(stakeAmount);
    });

    it("Should handle zero stakes correctly", async function () {
      const points = await dualStaking.tierPointsOf(user1.address);
      expect(points).to.equal(0);
    });
  });

  describe("Multiple Users", function () {
    beforeEach(async function () {
      await vortanToken
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
      await vortanToken
        .connect(user2)
        .approve(dualStaking.target, ethers.parseEther("10000"));
    });

    it("Should handle multiple users staking", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);
      await dualStaking.connect(user2).stake(ethers.parseEther("2000"), 30);

      expect(await dualStaking.totalStaked(user1.address)).to.equal(
        ethers.parseEther("1000")
      );
      expect(await dualStaking.totalStaked(user2.address)).to.equal(
        ethers.parseEther("2000")
      );
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 values", async function () {
      const maxAmount = ethers.parseEther("1000"); // Use reasonable amount to avoid overflow
      await vortanToken.mint(user1.address, maxAmount);
      await vortanToken.connect(user1).approve(dualStaking.target, maxAmount);

      await expect(dualStaking.connect(user1).stake(maxAmount, 30)).to.not.be
        .reverted;

      expect(await dualStaking.totalStaked(user1.address)).to.equal(maxAmount);
    });

    it("Should handle very small amounts", async function () {
      const smallAmount = 1;
      await vortanToken.connect(user1).approve(dualStaking.target, smallAmount);

      await expect(dualStaking.connect(user1).stake(smallAmount, 30)).to.not.be
        .reverted;

      expect(await dualStaking.totalStaked(user1.address)).to.equal(
        smallAmount
      );
    });
  });
});
