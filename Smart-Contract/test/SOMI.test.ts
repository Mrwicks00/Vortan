import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("SOMI Token", function () {
  let somi: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await hre.ethers.getSigners();

    const SOMI = await hre.ethers.getContractFactory("SOMI");
    somi = await SOMI.deploy(owner.address);
  });

  describe("Basic ERC20 Functionality", function () {
    it("Should have correct name and symbol", async function () {
      expect(await somi.name()).to.equal("SOMI (Mock)");
      expect(await somi.symbol()).to.equal("SOMI");
      expect(await somi.decimals()).to.equal(18);
    });

    it("Should have correct initial owner", async function () {
      expect(await somi.owner()).to.equal(owner.address);
    });

    it("Should start with zero total supply", async function () {
      expect(await somi.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await somi.mint(user1.address, mintAmount);
      
      expect(await somi.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await somi.totalSupply()).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        somi.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(somi, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = ethers.parseEther("1000");
      const tx = await somi.mint(user1.address, mintAmount);
      const receipt = await tx.wait();
      
      expect(receipt?.logs.length).to.be.gt(0);
    });

    it("Should allow minting to zero address", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(somi.mint(ethers.ZeroAddress, mintAmount)).to.not.be.reverted;
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      await somi.mint(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to transfer tokens", async function () {
      const transferAmount = ethers.parseEther("100");
      await somi.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await somi.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
      expect(await somi.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should not allow transfer with insufficient balance", async function () {
      const transferAmount = ethers.parseEther("2000");
      await expect(
        somi.connect(user1).transfer(user2.address, transferAmount)
      ).to.be.revertedWithCustomError(somi, "ERC20InsufficientBalance");
    });

    it("Should not allow transfer to zero address", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        somi.connect(user1).transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(somi, "ERC20InvalidReceiver");
    });

    it("Should allow transfer to self", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        somi.connect(user1).transfer(user1.address, transferAmount)
      ).to.not.be.reverted;
    });
  });

  describe("Approve and TransferFrom", function () {
    beforeEach(async function () {
      await somi.mint(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow approval and transferFrom", async function () {
      const approveAmount = ethers.parseEther("100");
      await somi.connect(user1).approve(user2.address, approveAmount);
      
      expect(await somi.allowance(user1.address, user2.address)).to.equal(approveAmount);
      
      const transferAmount = ethers.parseEther("50");
      await somi.connect(user2).transferFrom(user1.address, user3.address, transferAmount);
      
      expect(await somi.balanceOf(user3.address)).to.equal(transferAmount);
      expect(await somi.allowance(user1.address, user2.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should not allow transferFrom with insufficient allowance", async function () {
      await somi.connect(user1).approve(user2.address, ethers.parseEther("50"));
      
      await expect(
        somi.connect(user2).transferFrom(user1.address, user3.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(somi, "ERC20InsufficientAllowance");
    });

    it("Should not allow transferFrom with insufficient balance", async function () {
      await somi.connect(user1).approve(user2.address, ethers.parseEther("1000"));
      
      await expect(
        somi.connect(user2).transferFrom(user1.address, user3.address, ethers.parseEther("2000"))
      ).to.be.revertedWithCustomError(somi, "ERC20InsufficientBalance");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount transfers", async function () {
      await somi.mint(user1.address, ethers.parseEther("1000"));
      await expect(
        somi.connect(user1).transfer(user2.address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle zero amount approvals", async function () {
      await expect(
        somi.connect(user1).approve(user2.address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle maximum uint256 values", async function () {
      const maxAmount = ethers.MaxUint256;
      await somi.mint(user1.address, maxAmount);
      
      expect(await somi.balanceOf(user1.address)).to.equal(maxAmount);
      expect(await somi.totalSupply()).to.equal(maxAmount);
    });
  });
});
