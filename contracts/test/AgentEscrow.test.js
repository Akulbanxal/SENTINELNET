const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("AgentEscrow", function () {
  async function deployAgentEscrowFixture() {
    const [owner, platformWallet, requester, provider, arbitrator, user] = await ethers.getSigners();

    const AgentEscrow = await ethers.getContractFactory("AgentEscrow");
    const agentEscrow = await AgentEscrow.deploy(platformWallet.address);

    const ARBITRATOR_ROLE = await agentEscrow.ARBITRATOR_ROLE();
    await agentEscrow.grantArbitratorRole(arbitrator.address);

    return { agentEscrow, owner, platformWallet, requester, provider, arbitrator, user, ARBITRATOR_ROLE };
  }

  async function deployMockTokenFixture() {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Mock Token", "MTK");
    return mockToken;
  }

  describe("Deployment", function () {
    it("Should deploy with correct platform wallet", async function () {
      const { agentEscrow, platformWallet } = await loadFixture(deployAgentEscrowFixture);
      expect(await agentEscrow.platformWallet()).to.equal(platformWallet.address);
    });

    it("Should set default platform fee", async function () {
      const { agentEscrow } = await loadFixture(deployAgentEscrowFixture);
      expect(await agentEscrow.platformFeePercent()).to.equal(250); // 2.5%
    });

    it("Should revert with zero address platform wallet", async function () {
      const AgentEscrow = await ethers.getContractFactory("AgentEscrow");
      await expect(AgentEscrow.deploy(ethers.ZeroAddress)).to.be.revertedWith("Invalid platform wallet");
    });
  });

  describe("ETH Escrow Creation", function () {
    it("Should create ETH escrow", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400; // 1 day

      await expect(
        agentEscrow
          .connect(requester)
          .createEscrowETH(provider.address, deadline, "Security audit service", { value: amount })
      )
        .to.emit(agentEscrow, "EscrowCreated")
        .withArgs(1, requester.address, provider.address, ethers.parseEther("0.975"), ethers.ZeroAddress);
    });

    it("Should increment escrow counter", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service 1", { value: amount });

      expect(await agentEscrow.escrowCounter()).to.equal(1);

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service 2", { value: amount });

      expect(await agentEscrow.escrowCounter()).to.equal(2);
    });

    it("Should revert if amount too low", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("0.0001"); // Below MIN_ESCROW_AMOUNT
      const deadline = (await time.latest()) + 86400;

      await expect(
        agentEscrow
          .connect(requester)
          .createEscrowETH(provider.address, deadline, "Service", { value: amount })
      ).to.be.revertedWith("Amount too low");
    });

    it("Should revert if escrow to self", async function () {
      const { agentEscrow, requester } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await expect(
        agentEscrow
          .connect(requester)
          .createEscrowETH(requester.address, deadline, "Service", { value: amount })
      ).to.be.revertedWith("Cannot escrow to self");
    });

    it("Should revert with invalid deadline", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) - 1; // Past deadline

      await expect(
        agentEscrow
          .connect(requester)
          .createEscrowETH(provider.address, deadline, "Service", { value: amount })
      ).to.be.revertedWith("Invalid deadline");
    });
  });

  describe("Work Lifecycle", function () {
    it("Provider should start work", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);

      const escrow = await agentEscrow.getEscrow(1);
      expect(escrow.status).to.equal(1); // Active
    });

    it("Provider should complete work", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);
      await agentEscrow.connect(provider).completeWork(1);

      const escrow = await agentEscrow.getEscrow(1);
      expect(escrow.status).to.equal(2); // Completed
    });

    it("Should revert if non-provider starts work", async function () {
      const { agentEscrow, requester, provider, user } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await expect(agentEscrow.connect(user).startWork(1)).to.be.revertedWith("Only provider");
    });
  });

  describe("Payment Release", function () {
    it("Should release payment after completion", async function () {
      const { agentEscrow, requester, provider, platformWallet } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);
      await agentEscrow.connect(provider).completeWork(1);

      const providerBalanceBefore = await ethers.provider.getBalance(provider.address);
      const platformBalanceBefore = await ethers.provider.getBalance(platformWallet.address);

      await expect(agentEscrow.connect(requester).releasePayment(1))
        .to.emit(agentEscrow, "PaymentReleased")
        .withArgs(1, provider.address, ethers.parseEther("0.975"), ethers.parseEther("0.025"));

      const providerBalanceAfter = await ethers.provider.getBalance(provider.address);
      const platformBalanceAfter = await ethers.provider.getBalance(platformWallet.address);

      expect(providerBalanceAfter - providerBalanceBefore).to.equal(ethers.parseEther("0.975"));
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(ethers.parseEther("0.025"));
    });

    it("Should update agent stats after payment", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);
      await agentEscrow.connect(provider).completeWork(1);
      await agentEscrow.connect(requester).releasePayment(1);

      const [earnings, completedJobs] = await agentEscrow.getAgentStats(provider.address);
      expect(earnings).to.equal(ethers.parseEther("0.975"));
      expect(completedJobs).to.equal(1);
    });

    it("Should not release payment twice", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);
      await agentEscrow.connect(provider).completeWork(1);
      await agentEscrow.connect(requester).releasePayment(1);

      await expect(agentEscrow.connect(requester).releasePayment(1)).to.be.revertedWith("No funds to release");
    });
  });

  describe("Milestones", function () {
    it("Should add milestone", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      const milestoneDeadline = (await time.latest()) + 43200;

      await expect(
        agentEscrow
          .connect(requester)
          .addMilestone(1, "Phase 1 completion", ethers.parseEther("0.5"), milestoneDeadline)
      )
        .to.emit(agentEscrow, "MilestoneAdded")
        .withArgs(1, 0, "Phase 1 completion", ethers.parseEther("0.5"));
    });

    it("Should complete milestone and release payment", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      const milestoneDeadline = (await time.latest()) + 43200;
      await agentEscrow
        .connect(requester)
        .addMilestone(1, "Phase 1", ethers.parseEther("0.5"), milestoneDeadline);

      await agentEscrow.connect(provider).startWork(1);

      const providerBalanceBefore = await ethers.provider.getBalance(provider.address);

      await expect(agentEscrow.connect(requester).completeMilestone(1, 0))
        .to.emit(agentEscrow, "MilestoneCompleted")
        .withArgs(1, 0, ethers.parseEther("0.5"));

      const providerBalanceAfter = await ethers.provider.getBalance(provider.address);
      expect(providerBalanceAfter - providerBalanceBefore).to.equal(ethers.parseEther("0.5"));
    });

    it("Should not add milestone after work starts", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);

      const milestoneDeadline = (await time.latest()) + 43200;

      await expect(
        agentEscrow
          .connect(requester)
          .addMilestone(1, "Phase 1", ethers.parseEther("0.5"), milestoneDeadline)
      ).to.be.revertedWith("Cannot add milestones");
    });
  });

  describe("Disputes", function () {
    it("Should raise dispute", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);

      await expect(agentEscrow.connect(requester).raiseDispute(1, "Work not satisfactory"))
        .to.emit(agentEscrow, "DisputeRaised")
        .withArgs(1, requester.address, "Work not satisfactory");
    });

    it("Arbitrator should resolve dispute in favor of provider", async function () {
      const { agentEscrow, requester, provider, arbitrator, platformWallet } = await loadFixture(
        deployAgentEscrowFixture
      );

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);
      await agentEscrow.connect(requester).raiseDispute(1, "Dispute");

      const providerBalanceBefore = await ethers.provider.getBalance(provider.address);

      await expect(agentEscrow.connect(arbitrator).resolveDispute(1, true))
        .to.emit(agentEscrow, "DisputeResolved")
        .withArgs(1, arbitrator.address, true);

      const providerBalanceAfter = await ethers.provider.getBalance(provider.address);
      expect(providerBalanceAfter - providerBalanceBefore).to.equal(ethers.parseEther("0.975"));
    });

    it("Arbitrator should resolve dispute in favor of requester", async function () {
      const { agentEscrow, requester, provider, arbitrator } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);
      await agentEscrow.connect(requester).raiseDispute(1, "Dispute");

      const requesterBalanceBefore = await ethers.provider.getBalance(requester.address);

      await agentEscrow.connect(arbitrator).resolveDispute(1, false);

      const requesterBalanceAfter = await ethers.provider.getBalance(requester.address);
      expect(requesterBalanceAfter - requesterBalanceBefore).to.equal(ethers.parseEther("1.0"));
    });
  });

  describe("Cancellation and Refund", function () {
    it("Should cancel escrow before work starts", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      const requesterBalanceBefore = await ethers.provider.getBalance(requester.address);

      await expect(agentEscrow.connect(requester).cancelEscrow(1)).to.emit(agentEscrow, "EscrowCancelled");

      const requesterBalanceAfter = await ethers.provider.getBalance(requester.address);
      expect(requesterBalanceAfter).to.be.gt(requesterBalanceBefore); // Got refund minus gas
    });

    it("Should not cancel after work starts", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      await agentEscrow.connect(provider).startWork(1);

      await expect(agentEscrow.connect(requester).cancelEscrow(1)).to.be.revertedWith("Cannot cancel");
    });
  });

  describe("View Functions", function () {
    it("Should get escrow details", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service", { value: amount });

      const escrow = await agentEscrow.getEscrow(1);
      expect(escrow.requester).to.equal(requester.address);
      expect(escrow.provider).to.equal(provider.address);
      expect(escrow.totalAmount).to.equal(ethers.parseEther("0.975"));
    });

    it("Should get requester escrows", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service 1", { value: amount });

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service 2", { value: amount });

      const escrows = await agentEscrow.getRequesterEscrows(requester.address);
      expect(escrows.length).to.equal(2);
    });

    it("Should get provider escrows", async function () {
      const { agentEscrow, requester, provider } = await loadFixture(deployAgentEscrowFixture);

      const amount = ethers.parseEther("1.0");
      const deadline = (await time.latest()) + 86400;

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service 1", { value: amount });

      await agentEscrow
        .connect(requester)
        .createEscrowETH(provider.address, deadline, "Service 2", { value: amount });

      const escrows = await agentEscrow.getProviderEscrows(provider.address);
      expect(escrows.length).to.equal(2);
    });
  });

  describe("Admin Functions", function () {
    it("Should update platform fee", async function () {
      const { agentEscrow, owner } = await loadFixture(deployAgentEscrowFixture);

      await expect(agentEscrow.connect(owner).updatePlatformFee(500))
        .to.emit(agentEscrow, "PlatformFeeUpdated")
        .withArgs(500);

      expect(await agentEscrow.platformFeePercent()).to.equal(500);
    });

    it("Should not allow fee above max", async function () {
      const { agentEscrow, owner } = await loadFixture(deployAgentEscrowFixture);

      await expect(agentEscrow.connect(owner).updatePlatformFee(1100)).to.be.revertedWith("Fee too high");
    });

    it("Should update platform wallet", async function () {
      const { agentEscrow, owner, user } = await loadFixture(deployAgentEscrowFixture);

      await expect(agentEscrow.connect(owner).updatePlatformWallet(user.address))
        .to.emit(agentEscrow, "PlatformWalletUpdated")
        .withArgs(user.address);

      expect(await agentEscrow.platformWallet()).to.equal(user.address);
    });
  });
});

// Mock ERC20 Token for testing
const MockERC20Code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
`;
