const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TradeExecutor", function () {
  async function deployTradeExecutorFixture() {
    const [owner, trader, riskManager, user] = await ethers.getSigners();

    // Deploy AuditRegistry first
    const AuditRegistry = await ethers.getContractFactory("AuditRegistry");
    const auditRegistry = await AuditRegistry.deploy();

    // Deploy TradeExecutor
    const TradeExecutor = await ethers.getContractFactory("TradeExecutor");
    const tradeExecutor = await TradeExecutor.deploy(await auditRegistry.getAddress());

    const TRADER_ROLE = await tradeExecutor.TRADER_ROLE();
    const RISK_MANAGER_ROLE = await tradeExecutor.RISK_MANAGER_ROLE();
    const AGENT_ROLE = await auditRegistry.AGENT_ROLE();
    const AUDITOR_ROLE = await auditRegistry.AUDITOR_ROLE();

    // Grant roles
    await tradeExecutor.grantRole(TRADER_ROLE, trader.address);
    await tradeExecutor.grantRole(RISK_MANAGER_ROLE, riskManager.address);
    await auditRegistry.grantAgentRole(owner.address);
    await auditRegistry.grantAuditorRole(owner.address);

    // Mock token address
    const mockToken = "0x" + "1".repeat(40);

    return {
      tradeExecutor,
      auditRegistry,
      owner,
      trader,
      riskManager,
      user,
      mockToken,
      TRADER_ROLE,
      RISK_MANAGER_ROLE,
    };
  }

  async function createSafeTokenFixture() {
    const fixture = await deployTradeExecutorFixture();
    const { auditRegistry, mockToken, owner } = fixture;

    // Create 3 audit reports with good scores to make token safe
    const riskScores = {
      securityScore: 80,
      liquidityScore: 75,
      tokenomicsScore: 70,
      marketScore: 65,
      technicalScore: 85,
      overallScore: 75,
      riskLevel: 1, // Low
    };

    const findings = {
      criticalIssues: [],
      warnings: [],
      recommendations: [],
      methodology: "Automated",
      analysisDepth: 3,
    };

    // Submit and finalize 3 reports for consensus
    for (let i = 1; i <= 3; i++) {
      await auditRegistry.submitAuditReport(i, mockToken, riskScores, findings, `QmTest${i}`);
      await auditRegistry.finalizeReport(i);
    }

    return fixture;
  }

  describe("Deployment", function () {
    it("Should deploy with correct audit registry", async function () {
      const { tradeExecutor, auditRegistry } = await loadFixture(deployTradeExecutorFixture);
      expect(await tradeExecutor.auditRegistry()).to.equal(await auditRegistry.getAddress());
    });

    it("Should set default risk thresholds", async function () {
      const { tradeExecutor } = await loadFixture(deployTradeExecutorFixture);
      const threshold = await tradeExecutor.riskThreshold();
      expect(threshold.minSafeScore).to.equal(60);
      expect(threshold.warningScore).to.equal(75);
      expect(threshold.maxTradeAmount).to.equal(ethers.parseEther("100"));
    });

    it("Should enable simulation mode by default", async function () {
      const { tradeExecutor } = await loadFixture(deployTradeExecutorFixture);
      expect(await tradeExecutor.simulationMode()).to.be.true;
    });

    it("Should enable trading by default", async function () {
      const { tradeExecutor } = await loadFixture(deployTradeExecutorFixture);
      expect(await tradeExecutor.tradingEnabled()).to.be.true;
    });
  });

  describe("Trade Order Creation", function () {
    it("Should create trade order for safe token", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await expect(
        tradeExecutor
          .connect(trader)
          .createTradeOrder(
            mockToken,
            0, // Buy
            ethers.parseEther("10"),
            ethers.parseEther("0.001"),
            100, // 1% slippage
            deadline
          )
      )
        .to.emit(tradeExecutor, "TradeOrderCreated")
        .withArgs(1, trader.address, mockToken, 0, ethers.parseEther("10"));
    });

    it("Should automatically approve safe token", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      const order = await tradeExecutor.getTradeOrder(1);
      expect(order.status).to.equal(1); // Approved
    });

    it("Should reject unsafe token", async function () {
      const { tradeExecutor, trader } = await loadFixture(deployTradeExecutorFixture);

      const unsafeToken = "0x" + "2".repeat(40);
      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(unsafeToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      const order = await tradeExecutor.getTradeOrder(1);
      expect(order.status).to.equal(3); // Rejected
    });

    it("Should revert if trading disabled", async function () {
      const { tradeExecutor, trader, mockToken, owner } = await loadFixture(createSafeTokenFixture);

      await tradeExecutor.connect(owner).toggleTrading(false);

      const deadline = (await time.latest()) + 3600;

      await expect(
        tradeExecutor
          .connect(trader)
          .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline)
      ).to.be.revertedWith("Trading is disabled");
    });

    it("Should revert if amount exceeds limit", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await expect(
        tradeExecutor
          .connect(trader)
          .createTradeOrder(
            mockToken,
            0,
            ethers.parseEther("101"), // Exceeds 100 ETH limit
            ethers.parseEther("0.001"),
            100,
            deadline
          )
      ).to.be.revertedWith("Amount exceeds limit");
    });

    it("Should revert if slippage too high", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await expect(
        tradeExecutor
          .connect(trader)
          .createTradeOrder(
            mockToken,
            0,
            ethers.parseEther("10"),
            ethers.parseEther("0.001"),
            1100, // 11% - too high
            deadline
          )
      ).to.be.revertedWith("Slippage too high");
    });
  });

  describe("Trade Execution", function () {
    it("Should execute simulated trade", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await expect(tradeExecutor.connect(trader).executeTrade(1))
        .to.emit(tradeExecutor, "TradeExecuted")
        .withArgs(1, trader.address, mockToken, ethers.parseEther("10"), ethers.parseEther("0.001"), true);
    });

    it("Should update statistics after execution", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await tradeExecutor.connect(trader).executeTrade(1);

      expect(await tradeExecutor.totalTradesExecuted()).to.equal(1);

      const [volume, , orderCount] = await tradeExecutor.getTraderStats(trader.address);
      expect(orderCount).to.equal(1);
    });

    it("Should not execute rejected trade", async function () {
      const { tradeExecutor, trader } = await loadFixture(deployTradeExecutorFixture);

      const unsafeToken = "0x" + "2".repeat(40);
      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(unsafeToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await expect(tradeExecutor.connect(trader).executeTrade(1)).to.be.revertedWith("Order not approved");
    });

    it("Should not execute expired trade", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      // Fast forward past deadline
      await time.increase(3601);

      await expect(tradeExecutor.connect(trader).executeTrade(1)).to.be.revertedWith("Order expired");
    });
  });

  describe("Trade Cancellation", function () {
    it("Should cancel pending trade", async function () {
      const { tradeExecutor, trader } = await loadFixture(deployTradeExecutorFixture);

      const unsafeToken = "0x" + "2".repeat(40);
      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(unsafeToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await expect(tradeExecutor.connect(trader).cancelTrade(1))
        .to.emit(tradeExecutor, "TradeCancelled")
        .withArgs(1, trader.address);
    });

    it("Should not cancel executed trade", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await tradeExecutor.connect(trader).executeTrade(1);

      await expect(tradeExecutor.connect(trader).cancelTrade(1)).to.be.revertedWith("Cannot cancel");
    });
  });

  describe("Risk Manager Functions", function () {
    it("Should manually approve trade", async function () {
      const { tradeExecutor, trader, riskManager } = await loadFixture(deployTradeExecutorFixture);

      const unsafeToken = "0x" + "2".repeat(40);
      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(unsafeToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await expect(tradeExecutor.connect(riskManager).manuallyApproveTrade(1))
        .to.emit(tradeExecutor, "TradeApproved")
        .withArgs(1, 0);

      const order = await tradeExecutor.getTradeOrder(1);
      expect(order.status).to.equal(1); // Approved
    });

    it("Should update risk threshold", async function () {
      const { tradeExecutor, riskManager } = await loadFixture(deployTradeExecutorFixture);

      await expect(
        tradeExecutor.connect(riskManager).updateRiskThreshold(70, 80, ethers.parseEther("50"))
      )
        .to.emit(tradeExecutor, "RiskThresholdUpdated")
        .withArgs(70, 80, ethers.parseEther("50"));

      const threshold = await tradeExecutor.riskThreshold();
      expect(threshold.minSafeScore).to.equal(70);
      expect(threshold.warningScore).to.equal(80);
      expect(threshold.maxTradeAmount).to.equal(ethers.parseEther("50"));
    });

    it("Should revert if warning score less than min", async function () {
      const { tradeExecutor, riskManager } = await loadFixture(deployTradeExecutorFixture);

      await expect(
        tradeExecutor.connect(riskManager).updateRiskThreshold(70, 60, ethers.parseEther("50"))
      ).to.be.revertedWith("Warning must be >= min");
    });
  });

  describe("Admin Functions", function () {
    it("Should toggle simulation mode", async function () {
      const { tradeExecutor, owner } = await loadFixture(deployTradeExecutorFixture);

      await expect(tradeExecutor.connect(owner).toggleSimulationMode(false))
        .to.emit(tradeExecutor, "SimulationModeToggled")
        .withArgs(false);

      expect(await tradeExecutor.simulationMode()).to.be.false;
    });

    it("Should toggle trading", async function () {
      const { tradeExecutor, owner } = await loadFixture(deployTradeExecutorFixture);

      await expect(tradeExecutor.connect(owner).toggleTrading(false))
        .to.emit(tradeExecutor, "TradingToggled")
        .withArgs(false);

      expect(await tradeExecutor.tradingEnabled()).to.be.false;
    });

    it("Should update audit registry", async function () {
      const { tradeExecutor, owner } = await loadFixture(deployTradeExecutorFixture);

      // Deploy new audit registry
      const AuditRegistry = await ethers.getContractFactory("AuditRegistry");
      const newRegistry = await AuditRegistry.deploy();

      await expect(tradeExecutor.connect(owner).updateAuditRegistry(await newRegistry.getAddress()))
        .to.emit(tradeExecutor, "AuditRegistryUpdated")
        .withArgs(await newRegistry.getAddress());
    });
  });

  describe("View Functions", function () {
    it("Should get trade order", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      const order = await tradeExecutor.getTradeOrder(1);
      expect(order.trader).to.equal(trader.address);
      expect(order.tokenAddress).to.equal(mockToken);
      expect(order.amount).to.equal(ethers.parseEther("10"));
    });

    it("Should get trader orders", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 1, ethers.parseEther("5"), ethers.parseEther("0.002"), 100, deadline);

      const orders = await tradeExecutor.getTraderOrders(trader.address);
      expect(orders.length).to.equal(2);
    });

    it("Should get token trades", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 1, ethers.parseEther("5"), ethers.parseEther("0.002"), 100, deadline);

      const trades = await tradeExecutor.getTokenTrades(mockToken);
      expect(trades.length).to.equal(2);
    });

    it("Should get platform stats", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      // Create and execute trade
      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await tradeExecutor.connect(trader).executeTrade(1);

      const [executed, rejected, volume, ordersCount] = await tradeExecutor.getPlatformStats();

      expect(executed).to.equal(1);
      expect(ordersCount).to.equal(1);
    });
  });

  describe("Batch Execution", function () {
    it("Should batch execute multiple trades", async function () {
      const { tradeExecutor, trader, mockToken } = await loadFixture(createSafeTokenFixture);

      const deadline = (await time.latest()) + 3600;

      // Create 3 trades
      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("10"), ethers.parseEther("0.001"), 100, deadline);

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 0, ethers.parseEther("5"), ethers.parseEther("0.002"), 100, deadline);

      await tradeExecutor
        .connect(trader)
        .createTradeOrder(mockToken, 1, ethers.parseEther("3"), ethers.parseEther("0.003"), 100, deadline);

      // Batch execute
      const results = await tradeExecutor.connect(trader).batchExecuteTrades([1, 2, 3]);

      expect(await tradeExecutor.totalTradesExecuted()).to.equal(3);
    });
  });
});
