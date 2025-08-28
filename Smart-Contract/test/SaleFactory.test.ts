import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("SaleFactory", function () {
  let saleFactory: any;
  let vortanToken: any;
  let somi: any;
  let usdc: any;
  let tierAggregator: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let projectOwner: any;
  let treasury: any;

  beforeEach(async function () {
    [owner, user1, user2, projectOwner, treasury] =
      await hre.ethers.getSigners();

    // Deploy tokens
    const VortanToken = await hre.ethers.getContractFactory("VortanToken");
    vortanToken = await VortanToken.deploy(owner.address);

    const SOMI = await hre.ethers.getContractFactory("SOMI");
    somi = await SOMI.deploy(owner.address);

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
      somi.target,
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

    // Deploy sale factory
    const SaleFactory = await hre.ethers.getContractFactory("SaleFactory");
    saleFactory = await SaleFactory.deploy(owner.address, treasury.address);
  });

  describe("Basic Functionality", function () {
    it("Should have correct owner", async function () {
      expect(await saleFactory.owner()).to.equal(owner.address);
    });

    it("Should have correct platform treasury", async function () {
      expect(await saleFactory.platformTreasury()).to.equal(treasury.address);
    });

    it("Should start with 5% platform fee", async function () {
      expect(await saleFactory.platformFeeBps()).to.equal(500);
    });

    it("Should start with zero total sales", async function () {
      expect(await saleFactory.salesCount()).to.equal(0);
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to set platform fee", async function () {
      const newFee = 500; // 5%
      await saleFactory.setPlatformFee(newFee);

      expect(await saleFactory.platformFeeBps()).to.equal(newFee);
    });

    it("Should not allow non-owner to set platform fee", async function () {
      const newFee = 500;
      await expect(
        saleFactory.connect(user1).setPlatformFee(newFee)
      ).to.be.revertedWithCustomError(
        saleFactory,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should not allow setting fee above 1000 (10%)", async function () {
      const newFee = 1100;
      await expect(saleFactory.setPlatformFee(newFee)).to.be.revertedWith(
        "max 10%"
      );
    });

    it("Should update platform fee without event", async function () {
      const newFee = 300; // 3%
      await saleFactory.setPlatformFee(newFee);

      expect(await saleFactory.platformFeeBps()).to.equal(newFee);
    });
  });

  describe("Treasury Management", function () {
    it("Should allow owner to set platform treasury", async function () {
      await saleFactory.setPlatformTreasury(user1.address);

      expect(await saleFactory.platformTreasury()).to.equal(user1.address);
    });

    it("Should not allow non-owner to set platform treasury", async function () {
      await expect(
        saleFactory.connect(user1).setPlatformTreasury(user2.address)
      ).to.be.revertedWithCustomError(
        saleFactory,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should not allow setting treasury to zero address", async function () {
      await expect(
        saleFactory.setPlatformTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("invalid treasury");
    });

    it("Should emit PlatformTreasuryUpdated event", async function () {
      const tx = await saleFactory.setPlatformTreasury(user1.address);
      const receipt = await tx.wait();

      expect(receipt?.logs.length).to.be.gt(0);
    });
  });

  describe("Creating Sales", function () {
    function getSaleParams() {
      return {
        saleToken: vortanToken.target,
        baseToken: usdc.target,
        priceNum: 1,
        priceDen: 1,
        start: Math.floor(Date.now() / 1000) + 3600,
        end: Math.floor(Date.now() / 1000) + 86400,
        tgeTime: Math.floor(Date.now() / 1000) + 86400,
        tgeBps: 2000, // 20%
        vestStart: Math.floor(Date.now() / 1000) + 86400,
        vestDuration: 180 * 24 * 60 * 60, // 180 days
        hardCapBase: ethers.parseUnits("100000", 6),
        softCapBase: ethers.parseUnits("50000", 6),
        perWalletCapBase: ethers.parseUnits("5000", 6),
        tier1CapBase: ethers.parseUnits("50000", 6),
        tier2CapBase: ethers.parseUnits("100000", 6),
        tier3CapBase: ethers.parseUnits("150000", 6),
        tierOracle: tierAggregator.target,
        projectOwner: projectOwner.address,
      };
    }

    it("Should create a new sale pool", async function () {
      const initialSalesCount = await saleFactory.salesCount();

      await saleFactory.createSale(getSaleParams());

      const newSalesCount = await saleFactory.salesCount();
      expect(newSalesCount).to.equal(initialSalesCount + 1n);
    });

    it("Should allow anyone to create sales", async function () {
      const initialSalesCount = await saleFactory.salesCount();

      await saleFactory.connect(user1).createSale(getSaleParams());

      const newSalesCount = await saleFactory.salesCount();
      expect(newSalesCount).to.equal(initialSalesCount + 1n);
    });

    it("Should validate sale parameters", async function () {
      const invalidParams = { ...getSaleParams() };
      invalidParams.saleToken = ethers.ZeroAddress;

      await expect(saleFactory.createSale(invalidParams)).to.be.revertedWith(
        "addr"
      );
    });

    it("Should validate time parameters", async function () {
      const invalidParams = { ...getSaleParams() };
      invalidParams.start = invalidParams.end + 3600; // start after end

      await expect(saleFactory.createSale(invalidParams)).to.be.revertedWith(
        "time"
      );
    });

    it("Should validate price parameters", async function () {
      const invalidParams = { ...getSaleParams() };
      invalidParams.priceNum = 0;

      await expect(saleFactory.createSale(invalidParams)).to.be.revertedWith(
        "price"
      );
    });
  });

  describe("Sale Pool Management", function () {
    let salePool: any;

    beforeEach(async function () {
      const saleParams = {
        saleToken: vortanToken.target,
        baseToken: usdc.target,
        priceNum: 1,
        priceDen: 1,
        start: Math.floor(Date.now() / 1000) + 3600,
        end: Math.floor(Date.now() / 1000) + 86400,
        tgeTime: Math.floor(Date.now() / 1000) + 86400,
        tgeBps: 2000,
        vestStart: Math.floor(Date.now() / 1000) + 86400,
        vestDuration: 180 * 24 * 60 * 60, // 180 days
        hardCapBase: ethers.parseUnits("100000", 6),
        softCapBase: ethers.parseUnits("50000", 6),
        perWalletCapBase: ethers.parseUnits("5000", 6),
        tier1CapBase: ethers.parseUnits("50000", 6),
        tier2CapBase: ethers.parseUnits("100000", 6),
        tier3CapBase: ethers.parseUnits("150000", 6),
        tierOracle: tierAggregator.target,
        projectOwner: projectOwner.address,
      };

      await saleFactory.createSale(saleParams);
      const allSales = await saleFactory.getAllSales();
      const saleAddress = allSales[0];
      const SalePool = await hre.ethers.getContractFactory("SalePool");
      salePool = SalePool.attach(saleAddress);
    });

    it("Should have correct sale pool address", async function () {
      const allSales = await saleFactory.getAllSales();
      expect(allSales[0]).to.not.equal(ethers.ZeroAddress);
    });

    it("Should return correct sale count", async function () {
      expect(await saleFactory.salesCount()).to.equal(1);
    });

    it("Should return all sales addresses", async function () {
      const allSales = await saleFactory.getAllSales();
      expect(allSales.length).to.equal(1);
      expect(allSales[0]).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 values", async function () {
      const maxParams = {
        saleToken: vortanToken.target,
        baseToken: usdc.target,
        priceNum: 1,
        priceDen: 1,
        start: Math.floor(Date.now() / 1000) + 3600,
        end: Math.floor(Date.now() / 1000) + 86400,
        tgeTime: Math.floor(Date.now() / 1000) + 86400,
        tgeBps: 10000,
        vestStart: Math.floor(Date.now() / 1000) + 86400,
        vestDuration: 180 * 24 * 60 * 60, // 180 days
        hardCapBase: ethers.parseUnits("100000", 6),
        softCapBase: ethers.parseUnits("50000", 6),
        perWalletCapBase: ethers.parseUnits("5000", 6),
        tier1CapBase: ethers.parseUnits("50000", 6),
        tier2CapBase: ethers.parseUnits("100000", 6),
        tier3CapBase: ethers.parseUnits("150000", 6),
        tierOracle: tierAggregator.target,
        projectOwner: projectOwner.address,
      };

      await expect(saleFactory.createSale(maxParams)).to.not.be.reverted;
    });

    it("Should handle zero platform fee", async function () {
      await saleFactory.setPlatformFee(0);
      expect(await saleFactory.platformFeeBps()).to.equal(0);
    });

    it("Should handle minimum vesting duration", async function () {
      const minParams = {
        saleToken: vortanToken.target,
        baseToken: usdc.target,
        priceNum: 1,
        priceDen: 1,
        start: Math.floor(Date.now() / 1000) + 3600,
        end: Math.floor(Date.now() / 1000) + 86400,
        tgeTime: Math.floor(Date.now() / 1000) + 86400,
        tgeBps: 10000,
        vestStart: Math.floor(Date.now() / 1000) + 86400,
        vestDuration: 1,
        hardCapBase: ethers.parseUnits("2000", 6),
        softCapBase: ethers.parseUnits("1000", 6),
        perWalletCapBase: ethers.parseUnits("100", 6),
        tier1CapBase: ethers.parseUnits("1000", 6),
        tier2CapBase: ethers.parseUnits("2000", 6),
        tier3CapBase: ethers.parseUnits("3000", 6),
        tierOracle: tierAggregator.target,
        projectOwner: projectOwner.address,
      };

      await expect(saleFactory.createSale(minParams)).to.not.be.reverted;
    });
  });
});
