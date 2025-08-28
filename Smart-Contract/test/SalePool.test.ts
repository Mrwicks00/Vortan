import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SalePool", function () {
  let salePool: any;
  let vortanToken: any;
  let usdc: any;
  let tierAggregator: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;
  let projectOwner: any;
  let treasury: any;

  beforeEach(async function () {
    [owner, user1, user2, user3, projectOwner, treasury] =
      await hre.ethers.getSigners();

    // Deploy tokens
    const VortanToken = await hre.ethers.getContractFactory("VortanToken");
    vortanToken = await VortanToken.deploy(owner.address);

    const USDC = await hre.ethers.getContractFactory("USDC");
    usdc = await USDC.deploy(owner.address);

    // Deploy staking contracts first (needed for TierAggregator)
    const StakingWithRewards = await hre.ethers.getContractFactory(
      "StakingWithRewards"
    );
    const vortStaking = await StakingWithRewards.deploy(
      vortanToken.target,
      vortanToken.target,
      owner.address
    );
    const somiStaking = await StakingWithRewards.deploy(
      vortanToken.target,
      vortanToken.target,
      owner.address
    );

    // Deploy tier aggregator
    const TierAggregator = await hre.ethers.getContractFactory(
      "TierAggregator"
    );
    tierAggregator = await TierAggregator.deploy(
      vortStaking.target,
      somiStaking.target
    );

    // Deploy sale pool
    const SalePool = await hre.ethers.getContractFactory("SalePool");
    const currentTime = await time.latest();

    salePool = await SalePool.deploy({
      saleToken: vortanToken.target,
      baseToken: usdc.target,
      priceNum: 1,
      priceDen: 1,
      start: currentTime + 3600,
      end: currentTime + 86400,
      tgeTime: currentTime + 86400,
      tgeBps: 2000, // 20%
      vestStart: currentTime + 86400,
      vestDuration: 180 * 24 * 60 * 60, // 180 days
      hardCapBase: ethers.parseUnits("100000", 6),
      softCapBase: ethers.parseUnits("50000", 6),
      perWalletCapBase: ethers.parseUnits("5000", 6),
      tier1CapBase: ethers.parseUnits("50000", 6),
      tier2CapBase: ethers.parseUnits("100000", 6),
      tier3CapBase: ethers.parseUnits("150000", 6),
      tierOracle: tierAggregator.target,
      projectOwner: projectOwner.address,
      feeTokenBps: 500, // 5%
      feeRecipient: treasury.address,
    });

    // Mint tokens to users
    await vortanToken.mint(user1.address, ethers.parseEther("10000"));
    await vortanToken.mint(user2.address, ethers.parseEther("10000"));
    await vortanToken.mint(user3.address, ethers.parseEther("10000"));
    await usdc.mint(user1.address, ethers.parseUnits("10000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("10000", 6));
    await usdc.mint(user3.address, ethers.parseUnits("10000", 6));

    // Mint sale tokens to project owner
    await vortanToken.mint(projectOwner.address, ethers.parseEther("100000"));
  });

  describe("Basic Functionality", function () {
    it("Should have correct sale token", async function () {
      expect(await salePool.saleToken()).to.equal(vortanToken.target);
    });

    it("Should have correct base token", async function () {
      expect(await salePool.baseToken()).to.equal(usdc.target);
    });

    it("Should have correct project owner", async function () {
      expect(await salePool.projectOwner()).to.equal(projectOwner.address);
    });

    it("Should start with zero raised amount", async function () {
      expect(await salePool.totalRaisedBase()).to.equal(0);
    });

    it("Should start with zero total tokens sold", async function () {
      expect(await salePool.totalTokensSold()).to.equal(0);
    });
  });

  describe("Sale Parameters", function () {
    it("Should have correct soft cap", async function () {
      expect(await salePool.softCapBase()).to.equal(
        ethers.parseUnits("50000", 6)
      );
    });

    it("Should have correct hard cap", async function () {
      expect(await salePool.hardCapBase()).to.equal(
        ethers.parseUnits("100000", 6)
      );
    });

    it("Should have correct per wallet cap", async function () {
      expect(await salePool.perWalletCapBase()).to.equal(
        ethers.parseUnits("5000", 6)
      );
    });

    it("Should have correct tier caps", async function () {
      expect(await salePool.tier1CapBase()).to.equal(
        ethers.parseUnits("50000", 6)
      );
      expect(await salePool.tier2CapBase()).to.equal(
        ethers.parseUnits("100000", 6)
      );
      expect(await salePool.tier3CapBase()).to.equal(
        ethers.parseUnits("150000", 6)
      );
    });

    it("Should have correct TGE percentage", async function () {
      expect(await salePool.tgeBps()).to.equal(2000);
    });
  });

  describe("Token Deposit", function () {
    it("Should allow project owner to deposit sale tokens", async function () {
      const depositAmount = ethers.parseEther("50000");
      await vortanToken
        .connect(projectOwner)
        .approve(salePool.target, depositAmount);

      await salePool.connect(projectOwner).depositSaleTokens(depositAmount);

      expect(await salePool.totalSaleTokensDeposited()).to.equal(depositAmount);
    });

    it("Should not allow non-project owner to deposit tokens", async function () {
      const depositAmount = ethers.parseEther("50000");
      await vortanToken.connect(user1).approve(salePool.target, depositAmount);

      await expect(
        salePool.connect(user1).depositSaleTokens(depositAmount)
      ).to.be.revertedWith("owner");
    });

    it("Should not allow deposit after sale starts", async function () {
      await time.increase(3600); // Advance to sale start

      const depositAmount = ethers.parseEther("50000");
      await vortanToken
        .connect(projectOwner)
        .approve(salePool.target, depositAmount);

      await expect(
        salePool.connect(projectOwner).depositSaleTokens(depositAmount)
      ).to.be.revertedWith("started");
    });
  });

  describe("Buying Tokens", function () {
    beforeEach(async function () {
      // Deposit sale tokens first
      const depositAmount = ethers.parseEther("50000");
      await vortanToken
        .connect(projectOwner)
        .approve(salePool.target, depositAmount);
      await salePool.connect(projectOwner).depositSaleTokens(depositAmount);

      // Approve USDC spending
      await usdc
        .connect(user1)
        .approve(salePool.target, ethers.parseUnits("10000", 6));
      await usdc
        .connect(user2)
        .approve(salePool.target, ethers.parseUnits("10000", 6));
      await usdc
        .connect(user3)
        .approve(salePool.target, ethers.parseUnits("10000", 6));

      // Advance time to sale start
      await time.increase(3600);
    });

    it("Should allow users to buy tokens", async function () {
      const buyAmount = ethers.parseUnits("1000", 6);
      const initialRaised = await salePool.totalRaisedBase();

      await salePool.connect(user1).buy(buyAmount);

      const newRaised = await salePool.totalRaisedBase();
      expect(newRaised).to.equal(initialRaised + buyAmount);

      const purchased = await salePool.purchasedBase(user1.address);
      expect(purchased).to.equal(buyAmount);
    });

    it("Should not allow buying before sale starts", async function () {
      // Create a new sale pool with future start time
      const SalePool = await hre.ethers.getContractFactory("SalePool");
      const futureSalePool = await SalePool.deploy({
        saleToken: vortanToken.target,
        baseToken: usdc.target,
        priceNum: 1,
        priceDen: 1,
        start: (await time.latest()) + 7200, // 2 hours from now
        end: (await time.latest()) + 86400,
        tgeTime: (await time.latest()) + 86400,
        tgeBps: 2000,
        vestStart: (await time.latest()) + 86400,
        vestDuration: 180 * 24 * 60 * 60,
        hardCapBase: ethers.parseUnits("100000", 6),
        softCapBase: ethers.parseUnits("50000", 6),
        perWalletCapBase: ethers.parseUnits("5000", 6),
        tier1CapBase: ethers.parseUnits("50000", 6),
        tier2CapBase: ethers.parseUnits("100000", 6),
        tier3CapBase: ethers.parseUnits("150000", 6),
        tierOracle: tierAggregator.target,
        projectOwner: projectOwner.address,
        feeTokenBps: 500,
        feeRecipient: treasury.address,
      });

      // Deposit tokens
      await vortanToken
        .connect(projectOwner)
        .approve(futureSalePool.target, ethers.parseEther("50000"));
      await futureSalePool
        .connect(projectOwner)
        .depositSaleTokens(ethers.parseEther("50000"));

      // Approve USDC
      await usdc
        .connect(user1)
        .approve(futureSalePool.target, ethers.parseUnits("1000", 6));

      const buyAmount = ethers.parseUnits("1000", 6);
      await expect(
        futureSalePool.connect(user1).buy(buyAmount)
      ).to.be.revertedWith("time");
    });

    it("Should not allow buying after sale ends", async function () {
      // Advance time past sale end
      await time.increase(86400);

      const buyAmount = ethers.parseUnits("1000", 6);
      await expect(salePool.connect(user1).buy(buyAmount)).to.be.revertedWith(
        "time"
      );
    });

    it("Should not allow buying more than hard cap", async function () {
      const buyAmount = ethers.parseUnits("150000", 6); // More than hard cap
      await expect(salePool.connect(user1).buy(buyAmount)).to.be.revertedWith(
        "hardcap"
      );
    });

    it("Should not allow buying zero amount", async function () {
      await expect(salePool.connect(user1).buy(0)).to.be.revertedWith("amt");
    });
  });

  describe("Sale Completion", function () {
    beforeEach(async function () {
      // Deposit sale tokens first
      const depositAmount = ethers.parseEther("50000");
      await vortanToken
        .connect(projectOwner)
        .approve(salePool.target, depositAmount);
      await salePool.connect(projectOwner).depositSaleTokens(depositAmount);

      // Approve USDC spending
      await usdc
        .connect(user1)
        .approve(salePool.target, ethers.parseUnits("10000", 6));

      // Advance time to sale start
      await time.increase(3600);
    });

    it("Should allow multiple purchases within per-wallet cap", async function () {
      const buyAmount = ethers.parseUnits("2000", 6); // Within per-wallet cap

      // First purchase
      await salePool.connect(user1).buy(buyAmount);
      expect(await salePool.purchasedBase(user1.address)).to.equal(buyAmount);

      // Second purchase (still within cap)
      await salePool.connect(user1).buy(buyAmount);
      expect(await salePool.purchasedBase(user1.address)).to.equal(
        buyAmount * 2n
      );
    });

    it("Should enforce per-wallet cap", async function () {
      const buyAmount = ethers.parseUnits("3000", 6); // Within per-wallet cap

      // First purchase
      await salePool.connect(user1).buy(buyAmount);

      // Second purchase that would exceed cap
      await expect(salePool.connect(user1).buy(buyAmount)).to.be.revertedWith(
        "walletcap"
      );
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small amounts", async function () {
      // Deposit sale tokens first
      const depositAmount = ethers.parseEther("50000");
      await vortanToken
        .connect(projectOwner)
        .approve(salePool.target, depositAmount);
      await salePool.connect(projectOwner).depositSaleTokens(depositAmount);

      await usdc.connect(user1).approve(salePool.target, 1);
      await time.increase(3600);

      await expect(salePool.connect(user1).buy(1)).to.not.be.reverted;
    });
  });
});
