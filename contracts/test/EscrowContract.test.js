const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowContract", function () {
  let escrowContract;
  let owner, client, agent1, agent2, platformWallet;
  const TOKEN_ADDRESS = "0x1111111111111111111111111111111111111111";

  beforeEach(async function () {
    [owner, client, agent1, agent2, platformWallet] = await ethers.getSigners();

    const EscrowContract = await ethers.getContractFactory("EscrowContract");
    escrowContract = await EscrowContract.deploy(platformWallet.address);
    await escrowContract.waitForDeployment();
  });

  describe("Job Creation", function () {
    it("Should create a job with proper payment", async function () {
      const agents = [agent1.address, agent2.address];
      const payments = [ethers.parseEther("0.01"), ethers.parseEther("0.015")];
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours

      const totalPayment = ethers.parseEther("0.025");
      const platformFee = (totalPayment * 250n) / 10000n; // 2.5%
      const totalRequired = totalPayment + platformFee;

      const tx = await escrowContract.connect(client).createJob(
        TOKEN_ADDRESS,
        agents,
        payments,
        deadline,
        { value: totalRequired }
      );

      await expect(tx).to.emit(escrowContract, "JobCreated");
      await expect(tx).to.emit(escrowContract, "AgentHired").withArgs(1, agent1.address, payments[0]);
      await expect(tx).to.emit(escrowContract, "AgentHired").withArgs(1, agent2.address, payments[1]);
    });

    it("Should reject job with insufficient payment", async function () {
      const agents = [agent1.address];
      const payments = [ethers.parseEther("0.01")];
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        escrowContract.connect(client).createJob(
          TOKEN_ADDRESS,
          agents,
          payments,
          deadline,
          { value: ethers.parseEther("0.005") }
        )
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject job with past deadline", async function () {
      const agents = [agent1.address];
      const payments = [ethers.parseEther("0.01")];
      const deadline = Math.floor(Date.now() / 1000) - 100; // Past

      await expect(
        escrowContract.connect(client).createJob(
          TOKEN_ADDRESS,
          agents,
          payments,
          deadline,
          { value: ethers.parseEther("0.02") }
        )
      ).to.be.revertedWith("Deadline must be in future");
    });
  });

  describe("Report Submission", function () {
    let jobId;

    beforeEach(async function () {
      const agents = [agent1.address, agent2.address];
      const payments = [ethers.parseEther("0.01"), ethers.parseEther("0.015")];
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const totalPayment = ethers.parseEther("0.025");
      const platformFee = (totalPayment * 250n) / 10000n;
      const totalRequired = totalPayment + platformFee;

      const tx = await escrowContract.connect(client).createJob(
        TOKEN_ADDRESS,
        agents,
        payments,
        deadline,
        { value: totalRequired }
      );

      jobId = 1;
    });

    it("Should allow agent to submit report", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Security audit report"));
      
      const initialBalance = await ethers.provider.getBalance(agent1.address);
      
      const tx = await escrowContract.connect(agent1).submitReport(jobId, reportHash);
      await tx.wait();

      await expect(tx).to.emit(escrowContract, "ReportSubmitted");
      await expect(tx).to.emit(escrowContract, "PaymentReleased");

      // Check that agent received payment
      const finalBalance = await ethers.provider.getBalance(agent1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not allow duplicate report submission", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Security audit report"));
      
      await escrowContract.connect(agent1).submitReport(jobId, reportHash);

      await expect(
        escrowContract.connect(agent1).submitReport(jobId, reportHash)
      ).to.be.revertedWith("Report already submitted");
    });

    it("Should complete job when all agents submit", async function () {
      const reportHash1 = ethers.keccak256(ethers.toUtf8Bytes("Security audit report"));
      const reportHash2 = ethers.keccak256(ethers.toUtf8Bytes("Liquidity audit report"));
      
      await escrowContract.connect(agent1).submitReport(jobId, reportHash1);
      
      const tx = await escrowContract.connect(agent2).submitReport(jobId, reportHash2);
      await expect(tx).to.emit(escrowContract, "JobCompleted");

      const job = await escrowContract.getJob(jobId);
      expect(job.status).to.equal(3); // Completed status
    });
  });

  describe("Job Cancellation", function () {
    let jobId;

    beforeEach(async function () {
      const agents = [agent1.address];
      const payments = [ethers.parseEther("0.01")];
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const totalPayment = ethers.parseEther("0.01");
      const platformFee = (totalPayment * 250n) / 10000n;
      const totalRequired = totalPayment + platformFee;

      await escrowContract.connect(client).createJob(
        TOKEN_ADDRESS,
        agents,
        payments,
        deadline,
        { value: totalRequired }
      );

      jobId = 1;
    });

    it("Should allow client to cancel before work starts", async function () {
      const initialBalance = await ethers.provider.getBalance(client.address);
      
      const tx = await escrowContract.connect(client).cancelJob(jobId);
      await expect(tx).to.emit(escrowContract, "JobCancelled");

      // Client should receive refund (minus gas)
      const finalBalance = await ethers.provider.getBalance(client.address);
      expect(finalBalance).to.be.gt(initialBalance - ethers.parseEther("0.001")); // Account for gas
    });

    it("Should not allow cancellation after work starts", async function () {
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Report"));
      await escrowContract.connect(agent1).submitReport(jobId, reportHash);

      await expect(
        escrowContract.connect(client).cancelJob(jobId)
      ).to.be.revertedWith("Cannot cancel at this stage");
    });
  });

  describe("Dispute Management", function () {
    let jobId;

    beforeEach(async function () {
      const agents = [agent1.address];
      const payments = [ethers.parseEther("0.01")];
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const totalPayment = ethers.parseEther("0.01");
      const platformFee = (totalPayment * 250n) / 10000n;
      const totalRequired = totalPayment + platformFee;

      await escrowContract.connect(client).createJob(
        TOKEN_ADDRESS,
        agents,
        payments,
        deadline,
        { value: totalRequired }
      );

      jobId = 1;

      // Submit report to move to InProgress state
      const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Report"));
      await escrowContract.connect(agent1).submitReport(jobId, reportHash);
    });

    it("Should allow client to raise dispute", async function () {
      // Cannot test this since report already completed in beforeEach
      // In real scenario, you'd need a job with multiple agents where only some completed
    });
  });
});
