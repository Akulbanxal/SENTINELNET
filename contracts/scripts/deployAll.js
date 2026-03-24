const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting SentinelNet Smart Contract Deployment");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  const deployedAddresses = {};
  const startTime = Date.now();

  // ========================================
  // 1. Deploy ReputationRegistry
  // ========================================
  console.log("📦 Deploying ReputationRegistry...");
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const repRegistryAddress = await reputationRegistry.getAddress();
  deployedAddresses.ReputationRegistry = repRegistryAddress;
  console.log("✅ ReputationRegistry deployed to:", repRegistryAddress);

  // ========================================
  // 2. Deploy AuditRegistry
  // ========================================
  console.log("\n📦 Deploying AuditRegistry...");
  const AuditRegistry = await hre.ethers.getContractFactory("AuditRegistry");
  const auditRegistry = await AuditRegistry.deploy();
  await auditRegistry.waitForDeployment();
  const auditRegistryAddress = await auditRegistry.getAddress();
  deployedAddresses.AuditRegistry = auditRegistryAddress;
  console.log("✅ AuditRegistry deployed to:", auditRegistryAddress);

  // ========================================
  // 3. Deploy AgentMarketplace
  // ========================================
  console.log("\n📦 Deploying AgentMarketplace...");
  const AgentMarketplace = await hre.ethers.getContractFactory("AgentMarketplace");
  const agentMarketplace = await AgentMarketplace.deploy(repRegistryAddress);
  await agentMarketplace.waitForDeployment();
  const marketplaceAddress = await agentMarketplace.getAddress();
  deployedAddresses.AgentMarketplace = marketplaceAddress;
  console.log("✅ AgentMarketplace deployed to:", marketplaceAddress);

  // ========================================
  // 4. Deploy AgentEscrow
  // ========================================
  console.log("\n📦 Deploying AgentEscrow...");
  const platformWallet = deployer.address; // Using deployer as platform wallet for now
  const AgentEscrow = await hre.ethers.getContractFactory("AgentEscrow");
  const agentEscrow = await AgentEscrow.deploy(platformWallet);
  await agentEscrow.waitForDeployment();
  const escrowAddress = await agentEscrow.getAddress();
  deployedAddresses.AgentEscrow = escrowAddress;
  console.log("✅ AgentEscrow deployed to:", escrowAddress);
  console.log("   Platform wallet:", platformWallet);

  // ========================================
  // 5. Deploy EscrowContract (legacy)
  // ========================================
  console.log("\n📦 Deploying EscrowContract (legacy)...");
  const EscrowContract = await hre.ethers.getContractFactory("EscrowContract");
  const escrowContract = await EscrowContract.deploy(platformWallet);
  await escrowContract.waitForDeployment();
  const escrowContractAddress = await escrowContract.getAddress();
  deployedAddresses.EscrowContract = escrowContractAddress;
  console.log("✅ EscrowContract deployed to:", escrowContractAddress);

  // ========================================
  // 6. Deploy TradeExecutor
  // ========================================
  console.log("\n📦 Deploying TradeExecutor...");
  const TradeExecutor = await hre.ethers.getContractFactory("TradeExecutor");
  const tradeExecutor = await TradeExecutor.deploy(auditRegistryAddress);
  await tradeExecutor.waitForDeployment();
  const tradeExecutorAddress = await tradeExecutor.getAddress();
  deployedAddresses.TradeExecutor = tradeExecutorAddress;
  console.log("✅ TradeExecutor deployed to:", tradeExecutorAddress);

  // ========================================
  // Post-Deployment Configuration
  // ========================================
  console.log("\n⚙️  Configuring contracts...");

  // Grant roles in AuditRegistry
  console.log("   Setting up AuditRegistry roles...");
  const AGENT_ROLE = await auditRegistry.AGENT_ROLE();
  const AUDITOR_ROLE = await auditRegistry.AUDITOR_ROLE();
  
  // Grant deployer agent and auditor roles for initial setup
  await auditRegistry.grantAgentRole(deployer.address);
  await auditRegistry.grantAuditorRole(deployer.address);
  console.log("   ✓ Agent and Auditor roles granted to deployer");

  // Grant roles in TradeExecutor
  console.log("   Setting up TradeExecutor roles...");
  const TRADER_ROLE = await tradeExecutor.TRADER_ROLE();
  const RISK_MANAGER_ROLE = await tradeExecutor.RISK_MANAGER_ROLE();
  
  await tradeExecutor.grantRole(TRADER_ROLE, deployer.address);
  await tradeExecutor.grantRole(RISK_MANAGER_ROLE, deployer.address);
  console.log("   ✓ Trader and Risk Manager roles granted to deployer");

  // Configure ReputationRegistry
  console.log("   Authorizing updaters in ReputationRegistry...");
  await reputationRegistry.authorizeUpdater(marketplaceAddress);
  await reputationRegistry.authorizeUpdater(escrowAddress);
  console.log("   ✓ Marketplace and Escrow authorized as reputation updaters");

  // ========================================
  // Save Deployment Information
  // ========================================
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contracts: deployedAddresses,
    configuration: {
      platformWallet,
      roles: {
        AuditRegistry: {
          AGENT_ROLE: AGENT_ROLE,
          AUDITOR_ROLE: AUDITOR_ROLE,
        },
        TradeExecutor: {
          TRADER_ROLE: TRADER_ROLE,
          RISK_MANAGER_ROLE: RISK_MANAGER_ROLE,
        },
      },
    },
  };

  // Save to JSON file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `deployment-${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest
  const latestFilepath = path.join(deploymentsDir, `deployment-${hre.network.name}-latest.json`);
  fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:");
  console.log("   ", filepath);
  console.log("   ", latestFilepath);

  // ========================================
  // Display Summary
  // ========================================
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   ReputationRegistry:  ", repRegistryAddress);
  console.log("   AuditRegistry:       ", auditRegistryAddress);
  console.log("   AgentMarketplace:    ", marketplaceAddress);
  console.log("   AgentEscrow:         ", escrowAddress);
  console.log("   EscrowContract:      ", escrowContractAddress);
  console.log("   TradeExecutor:       ", tradeExecutorAddress);

  console.log("\n⏱️  Total deployment time:", duration, "seconds");
  console.log("\n📝 Next Steps:");
  console.log("   1. Verify contracts on Etherscan (if on public network)");
  console.log("   2. Update .env files with contract addresses");
  console.log("   3. Register agents using the AgentMarketplace");
  console.log("   4. Configure agent applications with new addresses");
  console.log("   5. Run integration tests");

  console.log("\n🔐 Security Reminders:");
  console.log("   - Transfer admin roles to secure multisig wallet");
  console.log("   - Set up proper access controls for production");
  console.log("   - Consider time-locked governance for critical functions");
  console.log("   - Conduct security audit before mainnet deployment");

  // ========================================
  // Verification Commands
  // ========================================
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verify contracts with these commands:");
    console.log("\n   npx hardhat verify --network", hre.network.name, repRegistryAddress);
    console.log("   npx hardhat verify --network", hre.network.name, auditRegistryAddress);
    console.log("   npx hardhat verify --network", hre.network.name, marketplaceAddress, repRegistryAddress);
    console.log("   npx hardhat verify --network", hre.network.name, escrowAddress, platformWallet);
    console.log("   npx hardhat verify --network", hre.network.name, escrowContractAddress, platformWallet);
    console.log("   npx hardhat verify --network", hre.network.name, tradeExecutorAddress, auditRegistryAddress);
  }

  console.log("\n" + "=".repeat(60));

  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
