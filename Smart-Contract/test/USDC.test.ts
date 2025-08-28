import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("USDC Token", function () {
  let usdc: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await hre.ethers.getSigners();

    const USDC = await hre.ethers.getContractFactory("USDC");
    usdc = await USDC.deploy(owner.address);
  });

  describe("Basic ERC20 Functionality", function () {
    it("Should have correct name and symbol", async function () {
      expect(await usdc.name()).to.equal("USD Coin (Mock)");
      expect(await usdc.symbol()).to.equal("USDC");
      expect(await usdc.decimals()).to.equal(6);
    });

    it("Should have correct initial owner", async function () {
      expect(await usdc.owner()).to.equal(owner.address);
    });

    it("Should start with zero total supply", async function () {
      expect(await usdc.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await usdc.mint(user1.address, mintAmount);
      
      expect(await usdc.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await usdc.totalSupply()).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await expect(
        usdc.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(usdc, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      const tx = await usdc.mint(user1.address, mintAmount);
      const receipt = await tx.wait();
      
      expect(receipt?.logs.length).to.be.gt(0);
    });

    it("Should allow minting to zero address", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await expect(usdc.mint(ethers.ZeroAddress, mintAmount)).to.not.be.reverted;
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
    });

    it("Should allow users to transfer tokens", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      await usdc.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await usdc.balanceOf(user1.address)).to.equal(ethers.parseUnits("900", 6));
      expect(await usdc.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should not allow transfer with insufficient balance", async function () {
      const transferAmount = ethers.parseUnits("2000", 6);
      await expect(
        usdc.connect(user1).transfer(user2.address, transferAmount)
      ).to.be.revertedWithCustomError(usdc, "ERC20InsufficientBalance");
    });

    it("Should not allow transfer to zero address", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      await expect(
        usdc.connect(user1).transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(usdc, "ERC20InvalidReceiver");
    });

    it("Should allow transfer to self", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      await expect(
        usdc.connect(user1).transfer(user1.address, transferAmount)
      ).to.not.be.reverted;
    });
  });

  describe("Approve and TransferFrom", function () {
    beforeEach(async function () {
      await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
    });

    it("Should allow approval and transferFrom", async function () {
      const approveAmount = ethers.parseUnits("100", 6);
      await usdc.connect(user1).approve(user2.address, approveAmount);
      
      expect(await usdc.allowance(user1.address, user2.address)).to.equal(approveAmount);
      
      const transferAmount = ethers.parseUnits("50", 6);
      await usdc.connect(user2).transferFrom(user1.address, user3.address, transferAmount);
      
      expect(await usdc.balanceOf(user3.address)).to.equal(transferAmount);
      expect(await usdc.allowance(user1.address, user2.address)).to.equal(ethers.parseUnits("50", 6));
    });

    it("Should not allow transferFrom with insufficient allowance", async function () {
      await usdc.connect(user1).approve(user2.address, ethers.parseUnits("50", 6));
      
      await expect(
        usdc.connect(user2).transferFrom(user1.address, user3.address, ethers.parseUnits("100", 6))
      ).to.be.revertedWithCustomError(usdc, "ERC20InsufficientAllowance");
    });

    it("Should not allow transferFrom with insufficient balance", async function () {
      await usdc.connect(user1).approve(user2.address, ethers.parseUnits("1000", 6));
      
      await expect(
        usdc.connect(user2).transferFrom(user1.address, user3.address, ethers.parseUnits("2000", 6))
      ).to.be.revertedWithCustomError(usdc, "ERC20InsufficientBalance");
    });
  });

  describe("6 Decimal Precision", function () {
    it("Should handle small amounts correctly", async function () {
      const smallAmount = 1; // 0.000001 USDC
      await usdc.mint(user1.address, smallAmount);
      
      expect(await usdc.balanceOf(user1.address)).to.equal(smallAmount);
    });

    it("Should handle large amounts correctly", async function () {
      const largeAmount = ethers.parseUnits("1000000", 6); // 1M USDC
      await usdc.mint(user1.address, largeAmount);
      
      expect(await usdc.balanceOf(user1.address)).to.equal(largeAmount);
    });

    it("Should format amounts correctly", async function () {
      const amount = ethers.parseUnits("123.456789", 6);
      await usdc.mint(user1.address, amount);
      
      expect(await usdc.balanceOf(user1.address)).to.equal(123456789); // 123.456789 USDC
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount transfers", async function () {
      await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
      await expect(
        usdc.connect(user1).transfer(user2.address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle zero amount approvals", async function () {
      await expect(
        usdc.connect(user1).approve(user2.address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle maximum uint256 values", async function () {
      const maxAmount = ethers.MaxUint256;
      await usdc.mint(user1.address, maxAmount);
      
      expect(await usdc.balanceOf(user1.address)).to.equal(maxAmount);
      expect(await usdc.totalSupply()).to.equal(maxAmount);
    });
  });
});
