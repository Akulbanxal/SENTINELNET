const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("AuditRegistry", function () {
  async function deployAuditRegistryFixture() {
    const [owner, agent1, agent2, agent3, auditor, user] = await ethers.getSigners();

    const AuditRegistry = await ethers.getContractFactory("AuditRegistry");
    const auditRegistry = await AuditRegistry.deploy();

    // Grant roles
    const AGENT_ROLE = await auditRegistry.AGENT_ROLE();
    const AUDITOR_ROLE = await auditRegistry.AUDITOR_ROLE();
    
    await auditRegistry.grantAgentRole(agent1.address);
    await auditRegistry.grantAgentRole(agent2.address);
    await auditRegistry.grantAgentRole(agent3.address);
    await auditRegistry.grantAuditorRole(auditor.address);

    // Mock token address
    const mockToken = "0x" + "1".repeat(40);

    return { auditRegistry, owner, agent1, agent2, agent3, auditor, user, mockToken, AGENT_ROLE, AUDITOR_ROLE };
  }

  describe("Deployment", function () {
    it("Should deploy with correct admin", async function () {
      const { auditRegistry, owner } = await loadFixture(deployAuditRegistryFixture);
      const DEFAULT_ADMIN_ROLE = await auditRegistry.DEFAULT_ADMIN_ROLE();
      expect(await auditRegistry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set correct constants", async function () {
      const { auditRegistry } = await loadFixture(deployAuditRegistryFixture);
      expect(await auditRegistry.MIN_SCORE_THRESHOLD()).to.equal(60);
      expect(await auditRegistry.CONSENSUS_THRESHOLD()).to.equal(3);
    });
  });

  describe("Role Management", function () {
    it("Should grant agent role", async function () {
      const { auditRegistry, agent1, AGENT_ROLE } = await loadFixture(deployAuditRegistryFixture);
      expect(await auditRegistry.hasRole(AGENT_ROLE, agent1.address)).to.be.true;
    });

    it("Should grant auditor role", async function () {
      const { auditRegistry, auditor, AUDITOR_ROLE } = await loadFixture(deployAuditRegistryFixture);
      expect(await auditRegistry.hasRole(AUDITOR_ROLE, auditor.address)).to.be.true;
    });

    it("Should emit event when granting roles", async function () {
      const { auditRegistry, user } = await loadFixture(deployAuditRegistryFixture);
      await expect(auditRegistry.grantAgentRole(user.address))
        .to.emit(auditRegistry, "AgentRoleGranted")
        .withArgs(user.address);
    });
  });

  describe("Audit Report Submission", function () {
    it("Should submit audit report", async function () {
      const { auditRegistry, agent1, mockToken } = await loadFixture(deployAuditRegistryFixture);

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
        criticalIssues: ["None found"],
        warnings: ["Low liquidity on DEX"],
        recommendations: ["Increase liquidity pool"],
        methodology: "Automated scanning with manual review",
        analysisDepth: 4,
      };

      await expect(
        auditRegistry.connect(agent1).submitAuditReport(
          1, // jobId
          mockToken,
          riskScores,
          findings,
          "QmTest123456789" // IPFS hash
        )
      ).to.emit(auditRegistry, "AuditReportSubmitted");
    });

    it("Should increment report counter", async function () {
      const { auditRegistry, agent1, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest1");
      expect(await auditRegistry.reportCounter()).to.equal(1);

      await auditRegistry.connect(agent1).submitAuditReport(2, mockToken, riskScores, findings, "QmTest2");
      expect(await auditRegistry.reportCounter()).to.equal(2);
    });

    it("Should revert if not agent", async function () {
      const { auditRegistry, user, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await expect(
        auditRegistry.connect(user).submitAuditReport(1, mockToken, riskScores, findings, "QmTest")
      ).to.be.reverted;
    });

    it("Should revert with invalid token address", async function () {
      const { auditRegistry, agent1 } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await expect(
        auditRegistry.connect(agent1).submitAuditReport(
          1,
          ethers.ZeroAddress,
          riskScores,
          findings,
          "QmTest"
        )
      ).to.be.revertedWith("Invalid token address");
    });
  });

  describe("Report Finalization", function () {
    it("Should finalize report", async function () {
      const { auditRegistry, agent1, auditor, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest");

      await expect(auditRegistry.connect(auditor).finalizeReport(1))
        .to.emit(auditRegistry, "ReportFinalized")
        .withArgs(1, mockToken, 1);
    });

    it("Should not finalize twice", async function () {
      const { auditRegistry, agent1, auditor, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest");
      await auditRegistry.connect(auditor).finalizeReport(1);

      await expect(auditRegistry.connect(auditor).finalizeReport(1)).to.be.revertedWith(
        "Report already finalized"
      );
    });
  });

  describe("Token Safety Check", function () {
    it("Should return false for token with no audits", async function () {
      const { auditRegistry, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const [isSafe, overallScore] = await auditRegistry.isTokenSafe(mockToken);
      expect(isSafe).to.be.false;
      expect(overallScore).to.equal(0);
    });

    it("Should return false for token with insufficient audits", async function () {
      const { auditRegistry, agent1, auditor, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      // Submit only 1 report (need 3 for consensus)
      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest");
      await auditRegistry.connect(auditor).finalizeReport(1);

      const [isSafe, overallScore] = await auditRegistry.isTokenSafe(mockToken);
      expect(isSafe).to.be.false;
    });

    it("Should return true for safe token with consensus", async function () {
      const { auditRegistry, agent1, agent2, agent3, auditor, mockToken } = await loadFixture(
        deployAuditRegistryFixture
      );

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      // Submit 3 reports for consensus
      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest1");
      await auditRegistry.connect(auditor).finalizeReport(1);

      await auditRegistry.connect(agent2).submitAuditReport(2, mockToken, riskScores, findings, "QmTest2");
      await auditRegistry.connect(auditor).finalizeReport(2);

      await auditRegistry.connect(agent3).submitAuditReport(3, mockToken, riskScores, findings, "QmTest3");
      await auditRegistry.connect(auditor).finalizeReport(3);

      const [isSafe, overallScore] = await auditRegistry.isTokenSafe(mockToken);
      expect(isSafe).to.be.true;
      expect(overallScore).to.be.gt(60);
    });
  });

  describe("Blacklisting", function () {
    it("Should blacklist token", async function () {
      const { auditRegistry, owner, mockToken } = await loadFixture(deployAuditRegistryFixture);

      await expect(auditRegistry.connect(owner).blacklistToken(mockToken, "Scam detected"))
        .to.emit(auditRegistry, "TokenBlacklisted")
        .withArgs(mockToken, "Scam detected");
    });

    it("Should return false for blacklisted token", async function () {
      const { auditRegistry, owner, mockToken } = await loadFixture(deployAuditRegistryFixture);

      await auditRegistry.connect(owner).blacklistToken(mockToken, "Scam");

      const [isSafe] = await auditRegistry.isTokenSafe(mockToken);
      expect(isSafe).to.be.false;
    });

    it("Should whitelist token", async function () {
      const { auditRegistry, owner, mockToken } = await loadFixture(deployAuditRegistryFixture);

      await auditRegistry.connect(owner).blacklistToken(mockToken, "Scam");
      await expect(auditRegistry.connect(owner).whitelistToken(mockToken))
        .to.emit(auditRegistry, "TokenWhitelisted")
        .withArgs(mockToken);
    });
  });

  describe("View Functions", function () {
    it("Should get token audits", async function () {
      const { auditRegistry, agent1, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest1");
      await auditRegistry.connect(agent1).submitAuditReport(2, mockToken, riskScores, findings, "QmTest2");

      const audits = await auditRegistry.getTokenAudits(mockToken);
      expect(audits.length).to.equal(2);
    });

    it("Should get auditor reports", async function () {
      const { auditRegistry, agent1, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest1");
      await auditRegistry.connect(agent1).submitAuditReport(2, mockToken, riskScores, findings, "QmTest2");

      const reports = await auditRegistry.getAuditorReports(agent1.address);
      expect(reports.length).to.equal(2);
    });

    it("Should get audit report details", async function () {
      const { auditRegistry, agent1, mockToken } = await loadFixture(deployAuditRegistryFixture);

      const riskScores = {
        securityScore: 80,
        liquidityScore: 75,
        tokenomicsScore: 70,
        marketScore: 65,
        technicalScore: 85,
        overallScore: 75,
        riskLevel: 1,
      };

      const findings = {
        criticalIssues: [],
        warnings: [],
        recommendations: [],
        methodology: "Test",
        analysisDepth: 3,
      };

      await auditRegistry.connect(agent1).submitAuditReport(1, mockToken, riskScores, findings, "QmTest");

      const report = await auditRegistry.getAuditReport(1);
      expect(report.tokenAddress).to.equal(mockToken);
      expect(report.auditor).to.equal(agent1.address);
      expect(report.riskScores.overallScore).to.equal(75);
    });
  });
});
