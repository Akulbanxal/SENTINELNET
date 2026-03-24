import { ethers } from 'ethers';
import { 
  getWallet, 
  getContractAddresses, 
  AGENT_MARKETPLACE_ABI,
  REPUTATION_REGISTRY_ABI,
  AgentType 
} from '../shared/config.js';

interface AgentConfig {
  name: string;
  endpoint: string;
  type: AgentType;
  price: string; // in ETH
  privateKey: string;
}

const agents: AgentConfig[] = [
  {
    name: 'SecurityBot Alpha',
    endpoint: 'https://api.sentinelnet.io/security',
    type: AgentType.Security,
    price: '0.01',
    privateKey: process.env.SECURITY_AGENT_WALLET || process.env.PRIVATE_KEY!,
  },
  {
    name: 'LiquidityScanner Pro',
    endpoint: 'https://api.sentinelnet.io/liquidity',
    type: AgentType.Liquidity,
    price: '0.015',
    privateKey: process.env.LIQUIDITY_AGENT_WALLET || process.env.PRIVATE_KEY!,
  },
  {
    name: 'TokenomicsAnalyzer',
    endpoint: 'https://api.sentinelnet.io/tokenomics',
    type: AgentType.Tokenomics,
    price: '0.012',
    privateKey: process.env.TOKENOMICS_AGENT_WALLET || process.env.PRIVATE_KEY!,
  },
];

async function registerAgent(agent: AgentConfig) {
  try {
    console.log(`\n📝 Registering ${agent.name}...`);
    
    const wallet = getWallet(agent.privateKey);
    const addresses = getContractAddresses();
    
    const marketplace = new ethers.Contract(
      addresses.agentMarketplace,
      AGENT_MARKETPLACE_ABI,
      wallet
    );
    
    const reputationRegistry = new ethers.Contract(
      addresses.reputationRegistry,
      REPUTATION_REGISTRY_ABI,
      wallet
    );
    
    // Check if already registered
    try {
      const existingAgent = await marketplace.getAgent(wallet.address);
      if (existingAgent.agentAddress !== ethers.ZeroAddress) {
        console.log(`✅ ${agent.name} is already registered at ${wallet.address}`);
        return;
      }
    } catch (error) {
      // Agent not registered, continue
    }
    
    // Register agent
    const priceInWei = ethers.parseEther(agent.price);
    const tx = await marketplace.registerAgent(
      agent.name,
      agent.endpoint,
      agent.type,
      priceInWei
    );
    
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    await tx.wait();
    
    console.log(`✅ ${agent.name} registered successfully!`);
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Type: ${AgentType[agent.type]}`);
    console.log(`   Price: ${agent.price} ETH`);
    
    // Initialize reputation
    try {
      const repTx = await reputationRegistry.initializeReputation(wallet.address);
      await repTx.wait();
      console.log(`   Reputation initialized`);
    } catch (error: any) {
      if (error.message.includes('Already initialized')) {
        console.log(`   Reputation already initialized`);
      } else {
        console.log(`   Warning: Could not initialize reputation: ${error.message}`);
      }
    }
    
  } catch (error: any) {
    console.error(`❌ Error registering ${agent.name}:`, error.message);
  }
}

async function main() {
  console.log('🚀 SentinelNet Agent Registration Script\n');
  console.log('=' .repeat(50));
  
  const addresses = getContractAddresses();
  console.log('\n📍 Contract Addresses:');
  console.log(`   Marketplace: ${addresses.agentMarketplace}`);
  console.log(`   Reputation:  ${addresses.reputationRegistry}`);
  
  if (!addresses.agentMarketplace || !addresses.reputationRegistry) {
    console.error('\n❌ Contract addresses not configured!');
    console.error('Please deploy contracts first and update .env file');
    process.exit(1);
  }
  
  console.log('\n' + '='.repeat(50));
  
  for (const agent of agents) {
    await registerAgent(agent);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between registrations
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n🎉 Agent registration complete!\n');
  
  console.log('📋 Next steps:');
  console.log('   1. Start the verification agents:');
  console.log('      npm run start:security');
  console.log('      npm run start:liquidity');
  console.log('      npm run start:tokenomics');
  console.log('   2. Start the trader agent:');
  console.log('      npm run start:trader');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
