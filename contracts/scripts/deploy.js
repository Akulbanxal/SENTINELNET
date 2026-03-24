const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting SentinelNet deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy ReputationRegistry
  console.log("📜 Deploying ReputationRegistry...");
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationAddress = await reputationRegistry.getAddress();
  console.log("✅ ReputationRegistry deployed to:", reputationAddress);
  console.log("");

  // Deploy AgentMarketplace
  console.log("📜 Deploying AgentMarketplace...");
  const AgentMarketplace = await hre.ethers.getContractFactory("AgentMarketplace");
  const agentMarketplace = await AgentMarketplace.deploy();
  await agentMarketplace.waitForDeployment();
  const marketplaceAddress = await agentMarketplace.getAddress();
  console.log("✅ AgentMarketplace deployed to:", marketplaceAddress);
  console.log("");

  // Deploy EscrowContract
  console.log("📜 Deploying EscrowContract...");
  const EscrowContract = await hre.ethers.getContractFactory("EscrowContract");
  const escrowContract = await EscrowContract.deploy(deployer.address); // Platform wallet
  await escrowContract.waitForDeployment();
  const escrowAddress = await escrowContract.getAddress();
  console.log("✅ EscrowContract deployed to:", escrowAddress);
  console.log("");

  // Save deployment addresses
  const deployment = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ReputationRegistry: reputationAddress,
      AgentMarketplace: marketplaceAddress,
      EscrowContract: escrowAddress,
    },
  };

  const deploymentPath = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("📄 Deployment info saved to:", deploymentPath);
  console.log("");

  // Authorize EscrowContract to update reputations
  console.log("🔧 Configuring contracts...");
  const tx = await reputationRegistry.authorizeUpdater(escrowAddress);
  await tx.wait();
  console.log("✅ EscrowContract authorized to update reputations");
  console.log("");

  console.log("🎉 Deployment completed successfully!\n");
  console.log("📋 Summary:");
  console.log("   ReputationRegistry:", reputationAddress);
  console.log("   AgentMarketplace:  ", marketplaceAddress);
  console.log("   EscrowContract:    ", escrowAddress);
  console.log("");
  console.log("💡 Next steps:");
  console.log("   1. Update your .env file with these addresses");
  console.log("   2. Verify contracts on Etherscan (if on testnet)");
  console.log("   3. Register agents using the marketplace");
  console.log("");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await reputationRegistry.deploymentTransaction().wait(5);
    
    console.log("🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: reputationAddress,
        constructorArguments: [],
      });
      console.log("✅ ReputationRegistry verified");
    } catch (e) {
      console.log("⚠️  ReputationRegistry verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [],
      });
      console.log("✅ AgentMarketplace verified");
    } catch (e) {
      console.log("⚠️  AgentMarketplace verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ EscrowContract verified");
    } catch (e) {
      console.log("⚠️  EscrowContract verification failed:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
