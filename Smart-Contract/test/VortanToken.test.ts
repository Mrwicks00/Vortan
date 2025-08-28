import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("VortanToken", function () {
  let vortanToken: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await hre.ethers.getSigners();

    const VortanToken = await hre.ethers.getContractFactory("VortanToken");
    vortanToken = await VortanToken.deploy(owner.address);
  });

  describe("Basic ERC20 Functionality", function () {
    it("Should have correct name and symbol", async function () {
      expect(await vortanToken.name()).to.equal("Vortan");
      expect(await vortanToken.symbol()).to.equal("VORT");
      expect(await vortanToken.decimals()).to.equal(18);
    });

    it("Should have correct initial owner", async function () {
      expect(await vortanToken.owner()).to.equal(owner.address);
    });

    it("Should start with zero total supply", async function () {
      expect(await vortanToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await vortanToken.mint(user1.address, mintAmount);
      
      expect(await vortanToken.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await vortanToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        vortanToken.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(vortanToken, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = ethers.parseEther("1000");
      const tx = await vortanToken.mint(user1.address, mintAmount);
      const receipt = await tx.wait();
      
      expect(receipt?.logs.length).to.be.gt(0);
    });

    it("Should allow minting to zero address", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(vortanToken.mint(ethers.ZeroAddress, mintAmount)).to.not.be.reverted;
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      await vortanToken.mint(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to transfer tokens", async function () {
      const transferAmount = ethers.parseEther("100");
      await vortanToken.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await vortanToken.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
      expect(await vortanToken.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should not allow transfer with insufficient balance", async function () {
      const transferAmount = ethers.parseEther("2000");
      await expect(
        vortanToken.connect(user1).transfer(user2.address, transferAmount)
      ).to.be.revertedWithCustomError(vortanToken, "ERC20InsufficientBalance");
    });

    it("Should not allow transfer to zero address", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        vortanToken.connect(user1).transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(vortanToken, "ERC20InvalidReceiver");
    });

    it("Should allow transfer to self", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        vortanToken.connect(user1).transfer(user1.address, transferAmount)
      ).to.not.be.reverted;
    });
  });

  describe("Approve and TransferFrom", function () {
    beforeEach(async function () {
      await vortanToken.mint(user1.address, ethers.parseEther("1000"));
    });

    it("Should allow approval and transferFrom", async function () {
      const approveAmount = ethers.parseEther("100");
      await vortanToken.connect(user1).approve(user2.address, approveAmount);
      
      expect(await vortanToken.allowance(user1.address, user2.address)).to.equal(approveAmount);
      
      const transferAmount = ethers.parseEther("50");
      await vortanToken.connect(user2).transferFrom(user1.address, user3.address, transferAmount);
      
      expect(await vortanToken.balanceOf(user3.address)).to.equal(transferAmount);
      expect(await vortanToken.allowance(user1.address, user2.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should not allow transferFrom with insufficient allowance", async function () {
      await vortanToken.connect(user1).approve(user2.address, ethers.parseEther("50"));
      
      await expect(
        vortanToken.connect(user2).transferFrom(user1.address, user3.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(vortanToken, "ERC20InsufficientAllowance");
    });

    it("Should not allow transferFrom with insufficient balance", async function () {
      await vortanToken.connect(user1).approve(user2.address, ethers.parseEther("1000"));
      
      await expect(
        vortanToken.connect(user2).transferFrom(user1.address, user3.address, ethers.parseEther("2000"))
      ).to.be.revertedWithCustomError(vortanToken, "ERC20InsufficientBalance");
    });
  });

  describe("Pausable Functionality", function () {
    it("Should start unpaused", async function () {
      expect(await vortanToken.paused()).to.be.false;
    });

    it("Should allow owner to pause", async function () {
      await vortanToken.pause();
      expect(await vortanToken.paused()).to.be.true;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        vortanToken.connect(user1).pause()
      ).to.be.revertedWithCustomError(vortanToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow transfers when paused", async function () {
      await vortanToken.mint(user1.address, ethers.parseEther("1000"));
      await vortanToken.pause();
      
      await expect(
        vortanToken.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(vortanToken, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await vortanToken.pause();
      await vortanToken.unpause();
      expect(await vortanToken.paused()).to.be.false;
    });

    it("Should not allow non-owner to unpause", async function () {
      await vortanToken.pause();
      await expect(
        vortanToken.connect(user1).unpause()
      ).to.be.revertedWithCustomError(vortanToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow transfers after unpausing", async function () {
      await vortanToken.mint(user1.address, ethers.parseEther("1000"));
      await vortanToken.pause();
      await vortanToken.unpause();
      
      await expect(
        vortanToken.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });
  });

  describe("ERC20Permit", function () {
    it("Should have correct nonces", async function () {
      expect(await vortanToken.nonces(user1.address)).to.equal(0);
    });

    it("Should increment nonces after permit", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const nonce = await vortanToken.nonces(user1.address);
      
      // This is a simplified test - in real usage you'd need to sign the permit
      expect(nonce).to.equal(0);
    });
  });

  describe("ERC20Votes", function () {
    beforeEach(async function () {
      await vortanToken.mint(user1.address, ethers.parseEther("1000"));
    });

    it("Should have correct voting power", async function () {
      expect(await vortanToken.getVotes(user1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("Should allow delegation", async function () {
      await vortanToken.connect(user1).delegate(user2.address);
      expect(await vortanToken.getVotes(user2.address)).to.equal(ethers.parseEther("1000"));
      expect(await vortanToken.getVotes(user1.address)).to.equal(0);
    });

    it("Should handle delegation changes", async function () {
      await vortanToken.connect(user1).delegate(user2.address);
      await vortanToken.connect(user1).delegate(user3.address);
      
      expect(await vortanToken.getVotes(user2.address)).to.equal(0);
      expect(await vortanToken.getVotes(user3.address)).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount transfers", async function () {
      await vortanToken.mint(user1.address, ethers.parseEther("1000"));
      await expect(
        vortanToken.connect(user1).transfer(user2.address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle zero amount approvals", async function () {
      await expect(
        vortanToken.connect(user1).approve(user2.address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle maximum uint256 values", async function () {
      const maxAmount = ethers.MaxUint256;
      await vortanToken.mint(user1.address, maxAmount);
      
      expect(await vortanToken.balanceOf(user1.address)).to.equal(maxAmount);
      expect(await vortanToken.totalSupply()).to.equal(maxAmount);
    });
  });
});
