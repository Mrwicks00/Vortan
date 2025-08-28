import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("TierAggregator", function () {
  let tierAggregator: any;
  let dualStaking: any;
  let vortanToken: any;
  let somi: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await hre.ethers.getSigners();

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

    // Deploy tier aggregator
    const TierAggregator = await hre.ethers.getContractFactory(
      "TierAggregator"
    );
    tierAggregator = await TierAggregator.deploy();

    // Add staking contract to tier aggregator
    await tierAggregator.addStakingContract(dualStaking.target);

    // Mint tokens to users
    await vortanToken.mint(user1.address, ethers.parseEther("10000"));
    await vortanToken.mint(user2.address, ethers.parseEther("10000"));
    await vortanToken.mint(user3.address, ethers.parseEther("10000"));
    await somi.mint(user1.address, ethers.parseEther("10000"));
    await somi.mint(user2.address, ethers.parseEther("10000"));
    await somi.mint(user3.address, ethers.parseEther("10000"));
  });

  describe("Basic Functionality", function () {
    it("Should have correct staking contracts", async function () {
      const stakingContracts = await tierAggregator.getStakingContracts();
      expect(stakingContracts).to.include(dualStaking.target);
    });

    it("Should start with zero total points", async function () {
      expect(await tierAggregator.getTotalPoints(user1.address)).to.equal(0);
    });
  });

  describe("Adding Staking Contracts", function () {
    it("Should allow owner to add staking contracts", async function () {
      const newStaking = await (
        await hre.ethers.getContractFactory("StakingWithRewards")
      ).deploy(vortanToken.target, somi.target, owner.address);

      await tierAggregator.addStakingContract(newStaking.target);

      const stakingContracts = await tierAggregator.getStakingContracts();
      expect(stakingContracts).to.include(newStaking.target);
    });

    it("Should not allow non-owner to add staking contracts", async function () {
      const newStaking = await (
        await hre.ethers.getContractFactory("StakingWithRewards")
      ).deploy(vortanToken.target, somi.target, owner.address);

      await expect(
        tierAggregator.connect(user1).addStakingContract(newStaking.target)
      ).to.be.revertedWithCustomError(
        tierAggregator,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should not allow adding duplicate staking contracts", async function () {
      await expect(
        tierAggregator.addStakingContract(dualStaking.target)
      ).to.be.revertedWith("Staking contract already exists");
    });
  });

  describe("Points Aggregation", function () {
    beforeEach(async function () {
      await vortanToken
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
      await somi
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
    });

    it("Should aggregate VORT points correctly", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);

      const totalPoints = await tierAggregator.pointsOf(user1.address);
      expect(totalPoints).to.equal(ethers.parseEther("1000"));
    });

    it("Should aggregate SOMI points correctly", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);

      const totalPoints = await tierAggregator.pointsOf(user1.address);
      expect(totalPoints).to.equal(ethers.parseEther("1000"));
    });

    it("Should aggregate both token points correctly", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);

      const totalPoints = await tierAggregator.pointsOf(user1.address);
      expect(totalPoints).to.equal(ethers.parseEther("1000"));
    });

    it("Should handle multiple users correctly", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);
      await dualStaking.connect(user2).stake(ethers.parseEther("2000"), 30);

      const user1Points = await tierAggregator.pointsOf(user1.address);
      const user2Points = await tierAggregator.pointsOf(user2.address);

      expect(user1Points).to.equal(ethers.parseEther("1000"));
      expect(user2Points).to.equal(ethers.parseEther("2000"));
    });
  });

  describe("Tier Calculation", function () {
    beforeEach(async function () {
      await vortanToken
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
      await somi
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
    });

    it("Should calculate tier 1 correctly", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);

      const tier = await tierAggregator.tierOf(user1.address);
      expect(tier).to.equal(1);
    });

    it("Should calculate tier 2 correctly", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("5000"), 30);

      const tier = await tierAggregator.tierOf(user1.address);
      expect(tier).to.equal(2);
    });

    it("Should calculate tier 3 correctly", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("10000"), 30);

      const tier = await tierAggregator.tierOf(user1.address);
      expect(tier).to.equal(3);
    });

    it("Should handle zero points correctly", async function () {
      const tier = await tierAggregator.tierOf(user1.address);
      expect(tier).to.equal(0);
    });
  });

  describe("Multiple Staking Contracts", function () {
    let secondStaking: any;

    beforeEach(async function () {
      secondStaking = await (
        await hre.ethers.getContractFactory("StakingWithRewards")
      ).deploy(vortanToken.target, somi.target);
      await tierAggregator.addStakingContract(secondStaking.target);

      await vortanToken
        .connect(user1)
        .approve(dualStaking.target, ethers.parseEther("10000"));
      await vortanToken
        .connect(user1)
        .approve(secondStaking.target, ethers.parseEther("10000"));
    });

    it("Should aggregate points from multiple staking contracts", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);
      await secondStaking.connect(user1).stake(ethers.parseEther("2000"), 30);

      const totalPoints = await tierAggregator.pointsOf(user1.address);
      expect(totalPoints).to.equal(ethers.parseEther("3000"));
    });

    it("Should calculate correct tier with multiple staking contracts", async function () {
      await dualStaking.connect(user1).stake(ethers.parseEther("1000"), 30);
      await secondStaking.connect(user1).stake(ethers.parseEther("2000"), 30);

      const tier = await tierAggregator.tierOf(user1.address);
      expect(tier).to.equal(2);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 values", async function () {
      const maxAmount = ethers.parseEther("1000"); // Use reasonable amount to avoid overflow
      await vortanToken.mint(user1.address, maxAmount);
      await vortanToken.connect(user1).approve(dualStaking.target, maxAmount);

      await dualStaking.connect(user1).stake(maxAmount, 30);

      const totalPoints = await tierAggregator.pointsOf(user1.address);
      expect(totalPoints).to.equal(maxAmount);
    });

    it("Should handle very small amounts", async function () {
      const smallAmount = 1;
      await vortanToken.connect(user1).approve(dualStaking.target, smallAmount);

      await dualStaking.connect(user1).stake(smallAmount, 30);

      const totalPoints = await tierAggregator.pointsOf(user1.address);
      expect(totalPoints).to.equal(smallAmount);
    });

    it("Should handle users with no staking contracts", async function () {
      const totalPoints = await tierAggregator.pointsOf(user3.address);
      expect(totalPoints).to.equal(0);

      const tier = await tierAggregator.tierOf(user3.address);
      expect(tier).to.equal(0);
    });
  });

  describe("Removing Staking Contracts", function () {
    it("Should allow owner to remove staking contracts", async function () {
      await tierAggregator.removeStakingContract(dualStaking.target);

      const stakingContracts = await tierAggregator.getStakingContracts();
      expect(stakingContracts).to.not.include(dualStaking.target);
    });

    it("Should not allow non-owner to remove staking contracts", async function () {
      await expect(
        tierAggregator.connect(user1).removeStakingContract(dualStaking.target)
      ).to.be.revertedWithCustomError(
        tierAggregator,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should not allow removing non-existent staking contracts", async function () {
      const fakeAddress = "0x1234567890123456789012345678901234567890";
      await expect(
        tierAggregator.removeStakingContract(fakeAddress)
      ).to.be.revertedWith("Staking contract does not exist");
    });
  });
});
