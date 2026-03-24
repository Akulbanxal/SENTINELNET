const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentMarketplace", function () {
  let agentMarketplace;
  let owner, agent1, agent2, client;

  beforeEach(async function () {
    [owner, agent1, agent2, client] = await ethers.getSigners();

    const AgentMarketplace = await ethers.getContractFactory("AgentMarketplace");
    agentMarketplace = await AgentMarketplace.deploy();
    await agentMarketplace.waitForDeployment();
  });

  describe("Agent Registration", function () {
    it("Should register a new agent", async function () {
      await agentMarketplace.connect(agent1).registerAgent(
        "SecurityBot",
        "https://api.securitybot.io",
        0, // Security type
        ethers.parseEther("0.01")
      );

      const agentData = await agentMarketplace.getAgent(agent1.address);
      expect(agentData.name).to.equal("SecurityBot");
      expect(agentData.agentType).to.equal(0);
      expect(agentData.isActive).to.equal(true);
    });

    it("Should not allow duplicate registration", async function () {
      await agentMarketplace.connect(agent1).registerAgent(
        "SecurityBot",
        "https://api.securitybot.io",
        0,
        ethers.parseEther("0.01")
      );

      await expect(
        agentMarketplace.connect(agent1).registerAgent(
          "SecurityBot2",
          "https://api.securitybot2.io",
          0,
          ethers.parseEther("0.01")
        )
      ).to.be.revertedWith("Agent already registered");
    });

    it("Should require positive price", async function () {
      await expect(
        agentMarketplace.connect(agent1).registerAgent(
          "SecurityBot",
          "https://api.securitybot.io",
          0,
          0
        )
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Agent Discovery", function () {
    beforeEach(async function () {
      await agentMarketplace.connect(agent1).registerAgent(
        "SecurityBot",
        "https://api.securitybot.io",
        0, // Security
        ethers.parseEther("0.01")
      );

      await agentMarketplace.connect(agent2).registerAgent(
        "LiquidityBot",
        "https://api.liquiditybot.io",
        1, // Liquidity
        ethers.parseEther("0.015")
      );
    });

    it("Should get agents by type", async function () {
      const securityAgents = await agentMarketplace.getAgentsByType(0);
      expect(securityAgents.length).to.equal(1);
      expect(securityAgents[0]).to.equal(agent1.address);

      const liquidityAgents = await agentMarketplace.getAgentsByType(1);
      expect(liquidityAgents.length).to.equal(1);
      expect(liquidityAgents[0]).to.equal(agent2.address);
    });

    it("Should get total agents count", async function () {
      const total = await agentMarketplace.getTotalAgents();
      expect(total).to.equal(2);
    });
  });

  describe("Agent Management", function () {
    beforeEach(async function () {
      await agentMarketplace.connect(agent1).registerAgent(
        "SecurityBot",
        "https://api.securitybot.io",
        0,
        ethers.parseEther("0.01")
      );
    });

    it("Should update agent price", async function () {
      await agentMarketplace.connect(agent1).updateAgentPrice(ethers.parseEther("0.02"));
      
      const agentData = await agentMarketplace.getAgent(agent1.address);
      expect(agentData.pricePerVerification).to.equal(ethers.parseEther("0.02"));
    });

    it("Should deactivate agent", async function () {
      await agentMarketplace.connect(agent1).deactivateAgent();
      
      const agentData = await agentMarketplace.getAgent(agent1.address);
      expect(agentData.isActive).to.equal(false);
    });

    it("Should update reputation", async function () {
      const initialData = await agentMarketplace.getAgent(agent1.address);
      const initialScore = initialData.reputationScore;

      await agentMarketplace.updateReputation(agent1.address, true);
      
      const updatedData = await agentMarketplace.getAgent(agent1.address);
      expect(updatedData.reputationScore).to.be.gt(initialScore);
      expect(updatedData.totalJobs).to.equal(1n);
      expect(updatedData.successfulJobs).to.equal(1n);
    });
  });

  describe("Job Creation", function () {
    it("Should create a job with payment", async function () {
      const tx = await agentMarketplace.connect(client).createJob(0, { 
        value: ethers.parseEther("0.1") 
      });
      
      await expect(tx).to.emit(agentMarketplace, "JobCreated");
    });

    it("Should not create job without payment", async function () {
      await expect(
        agentMarketplace.connect(client).createJob(0, { value: 0 })
      ).to.be.revertedWith("Must send payment");
    });
  });
});
