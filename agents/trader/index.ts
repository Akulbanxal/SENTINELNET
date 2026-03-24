import { ethers } from 'ethers';
import { 
  getProvider, 
  getWallet, 
  getContractAddresses, 
  AGENT_MARKETPLACE_ABI,
  ESCROW_CONTRACT_ABI,
  AgentType 
} from '../shared/config.js';
import { createLogger } from '../shared/logger.js';
import cron from 'node-cron';
import axios from 'axios';

const logger = createLogger('trader-agent');

interface Token {
  address: string;
  name: string;
  symbol: string;
  discoveredAt: number;
}

interface VerificationJob {
  jobId: number;
  tokenAddress: string;
  agents: string[];
  status: 'pending' | 'completed' | 'failed';
  reports: Map<string, any>;
  createdAt: number;
}

class TraderAgent {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private marketplaceContract: ethers.Contract;
  private escrowContract: ethers.Contract;
  private jobs: Map<number, VerificationJob> = new Map();
  
  constructor() {
    this.provider = getProvider();
    this.wallet = getWallet();
    
    const addresses = getContractAddresses();
    this.marketplaceContract = new ethers.Contract(
      addresses.agentMarketplace,
      AGENT_MARKETPLACE_ABI,
      this.wallet
    );
    
    this.escrowContract = new ethers.Contract(
      addresses.escrowContract,
      ESCROW_CONTRACT_ABI,
      this.wallet
    );
    
    logger.info('TraderAgent initialized', { address: this.wallet.address });
  }

  async start() {
    logger.info('🚀 Starting TraderAgent...');
    
    // Listen for new tokens (simulated)
    this.startTokenDiscovery();
    
    // Listen for job completions
    this.listenForJobCompletions();
    
    logger.info('✅ TraderAgent is running');
  }

  private startTokenDiscovery() {
    // Simulate discovering new tokens every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      try {
        logger.info('🔍 Scanning for new tokens...');
        
        // In production, this would scan DEX events, new pairs, etc.
        const mockToken = this.generateMockToken();
        
        logger.info('🎯 New token discovered!', mockToken);
        
        await this.verifyToken(mockToken);
      } catch (error) {
        logger.error('Token discovery error:', error);
      }
    });
  }

  private generateMockToken(): Token {
    const randomAddress = ethers.Wallet.createRandom().address;
    return {
      address: randomAddress,
      name: `MockToken${Date.now()}`,
      symbol: 'MOCK',
      discoveredAt: Date.now(),
    };
  }

  private async verifyToken(token: Token) {
    try {
      logger.info('🔎 Starting verification process for token', { address: token.address });
      
      // Step 1: Query marketplace for agents
      const securityAgents = await this.marketplaceContract.getAgentsByType(AgentType.Security);
      const liquidityAgents = await this.marketplaceContract.getAgentsByType(AgentType.Liquidity);
      const tokenomicsAgents = await this.marketplaceContract.getAgentsByType(AgentType.Tokenomics);
      
      logger.info('📋 Available agents:', {
        security: securityAgents.length,
        liquidity: liquidityAgents.length,
        tokenomics: tokenomicsAgents.length,
      });
      
      if (securityAgents.length === 0 || liquidityAgents.length === 0 || tokenomicsAgents.length === 0) {
        logger.warn('⚠️  Not enough agents available, skipping verification');
        return;
      }
      
      // Step 2: Select best agents based on reputation
      const selectedAgents = [
        securityAgents[0],
        liquidityAgents[0],
        tokenomicsAgents[0],
      ];
      
      // Step 3: Get agent pricing
      const agentPrices = await Promise.all(
        selectedAgents.map(async (agentAddr) => {
          const agentData = await this.marketplaceContract.getAgent(agentAddr);
          return agentData.pricePerVerification;
        })
      );
      
      logger.info('💰 Agent pricing:', {
        agents: selectedAgents,
        prices: agentPrices.map(p => ethers.formatEther(p)),
      });
      
      // Step 4: Create escrow job
      const totalPayment = agentPrices.reduce((sum, price) => sum + price, 0n);
      const platformFee = (totalPayment * 250n) / 10000n; // 2.5%
      const totalRequired = totalPayment + platformFee;
      
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      
      logger.info('📝 Creating escrow job...');
      
      const tx = await this.escrowContract.createJob(
        token.address,
        selectedAgents,
        agentPrices,
        deadline,
        { value: totalRequired }
      );
      
      const receipt = await tx.wait();
      
      // Extract jobId from event
      const jobCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.escrowContract.interface.parseLog(log);
          return parsed?.name === 'JobCreated';
        } catch {
          return false;
        }
      });
      
      let jobId = 0;
      if (jobCreatedEvent) {
        const parsed = this.escrowContract.interface.parseLog(jobCreatedEvent);
        jobId = Number(parsed?.args[0]);
      }
      
      logger.info('✅ Escrow job created', { 
        jobId,
        totalCost: ethers.formatEther(totalRequired),
      });
      
      // Store job for monitoring
      this.jobs.set(jobId, {
        jobId,
        tokenAddress: token.address,
        agents: selectedAgents,
        status: 'pending',
        reports: new Map(),
        createdAt: Date.now(),
      });
      
    } catch (error: any) {
      logger.error('Token verification error:', error.message);
    }
  }

  private listenForJobCompletions() {
    this.escrowContract.on('JobCompleted', async (jobId: bigint) => {
      try {
        const id = Number(jobId);
        logger.info('🎉 Job completed!', { jobId: id });
        
        const job = this.jobs.get(id);
        if (!job) {
          logger.warn('Job not found in local cache', { jobId: id });
          return;
        }
        
        // Fetch all agent reports
        const reports = await this.fetchAgentReports(id, job.agents);
        
        // Aggregate risk scores
        const aggregatedRisk = this.aggregateRiskScores(reports);
        
        logger.info('📊 Risk Assessment Complete', {
          jobId: id,
          tokenAddress: job.tokenAddress,
          aggregatedRisk,
        });
        
        // Make trading decision
        await this.makeTradeDecision(job.tokenAddress, aggregatedRisk);
        
        job.status = 'completed';
        
      } catch (error) {
        logger.error('Job completion handler error:', error);
      }
    });
  }

  private async fetchAgentReports(jobId: number, agents: string[]): Promise<any[]> {
    const reports = [];
    
    for (const agentAddr of agents) {
      try {
        const reportHash = await this.escrowContract.getAgentReport(jobId, agentAddr);
        
        // In production, fetch full report from IPFS or storage
        reports.push({
          agent: agentAddr,
          reportHash,
          // Mock risk score for demo
          riskScore: Math.floor(Math.random() * 30) + 70, // 70-100
        });
      } catch (error) {
        logger.error('Failed to fetch report from agent', { agent: agentAddr, error });
      }
    }
    
    return reports;
  }

  private aggregateRiskScores(reports: any[]): number {
    if (reports.length === 0) return 0;
    
    const totalScore = reports.reduce((sum, report) => sum + report.riskScore, 0);
    return Math.floor(totalScore / reports.length);
  }

  private async makeTradeDecision(tokenAddress: string, riskScore: number) {
    logger.info('🤔 Making trade decision...', { tokenAddress, riskScore });
    
    if (riskScore >= 80) {
      logger.info('✅ EXECUTING TRADE - Low Risk', { riskScore });
      logger.info('💰 Simulated trade: Buy 1% position');
    } else if (riskScore >= 60) {
      logger.info('⚠️  EXECUTING SMALL TRADE - Medium Risk', { riskScore });
      logger.info('💰 Simulated trade: Buy 0.25% position');
    } else {
      logger.info('❌ SKIPPING TRADE - High Risk', { riskScore });
    }
  }
}

// Start the agent
const agent = new TraderAgent();
agent.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down TraderAgent...');
  process.exit(0);
});
