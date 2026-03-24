import { ethers } from 'ethers';
import { 
  getProvider, 
  getWallet, 
  getContractAddresses, 
  ESCROW_CONTRACT_ABI 
} from '../shared/config.js';
import { createLogger } from '../shared/logger.js';
import { analyzeWithAI, generateReport } from '../shared/ai.js';
import axios from 'axios';

const logger = createLogger('liquidity-agent');

class LiquidityAgent {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private escrowContract: ethers.Contract;
  
  constructor() {
    this.provider = getProvider();
    this.wallet = getWallet(process.env.LIQUIDITY_AGENT_WALLET);
    
    const addresses = getContractAddresses();
    this.escrowContract = new ethers.Contract(
      addresses.escrowContract,
      ESCROW_CONTRACT_ABI,
      this.wallet
    );
    
    logger.info('LiquidityAgent initialized', { address: this.wallet.address });
  }

  async start() {
    logger.info('💧 Starting LiquidityAgent...');
    
    // Listen for job assignments
    this.listenForJobs();
    
    logger.info('✅ LiquidityAgent is running and listening for jobs');
  }

  private listenForJobs() {
    this.escrowContract.on('AgentHired', async (jobId: bigint, agent: string, payment: bigint) => {
      try {
        const agentAddr = agent.toLowerCase();
        const myAddr = this.wallet.address.toLowerCase();
        
        if (agentAddr !== myAddr) {
          return;
        }
        
        const id = Number(jobId);
        logger.info('🎯 New job assigned!', { 
          jobId: id, 
          payment: ethers.formatEther(payment) 
        });
        
        // Get job details
        const jobData = await this.escrowContract.getJob(id);
        const tokenAddress = jobData.tokenAddress;
        
        logger.info('📋 Analyzing liquidity...', { tokenAddress });
        
        // Perform liquidity analysis
        const analysisResult = await this.performLiquidityAnalysis(tokenAddress);
        
        // Generate report
        const report = await generateReport(
          'Liquidity Agent',
          tokenAddress,
          analysisResult
        );
        
        logger.info('📄 Report generated', { 
          riskScore: analysisResult.riskScore,
          findings: analysisResult.findings.length 
        });
        
        // Submit report on-chain
        const reportHash = ethers.keccak256(ethers.toUtf8Bytes(report));
        
        logger.info('📤 Submitting report on-chain...');
        const tx = await this.escrowContract.submitReport(id, reportHash);
        await tx.wait();
        
        logger.info('✅ Report submitted and payment received!', { jobId: id });
        
      } catch (error: any) {
        logger.error('Job processing error:', error.message);
      }
    });
  }

  private async performLiquidityAnalysis(tokenAddress: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Simulate liquidity data fetching
      // In production: query DEX APIs, on-chain pools, etc.
      const mockLiquidityData = {
        totalLiquidityUSD: Math.random() * 1000000,
        volume24h: Math.random() * 500000,
        holders: Math.floor(Math.random() * 10000),
        poolCount: Math.floor(Math.random() * 5) + 1,
        largestPool: {
          dex: 'Uniswap V2',
          liquidityUSD: Math.random() * 500000,
        },
      };
      
      logger.info('Liquidity data collected', mockLiquidityData);
      
      // Analyze with AI
      const aiAnalysis = await analyzeWithAI({
        context: 'You are analyzing the liquidity profile of a token for investment risk assessment.',
        data: {
          tokenAddress,
          ...mockLiquidityData,
        },
        prompt: `Analyze the liquidity risk of this token. Consider:
1. Total liquidity depth
2. 24h trading volume
3. Number of liquidity pools
4. Holder distribution
5. Liquidity concentration risk
6. Impermanent loss potential
7. Slippage estimates for various trade sizes
8. Pool age and stability
9. Liquidity provider lock status
10. Rug pull indicators

Provide a comprehensive liquidity risk assessment.`,
      });
      
      const duration = Date.now() - startTime;
      logger.info('Liquidity analysis completed', { duration: `${duration}ms` });
      
      return aiAnalysis;
      
    } catch (error) {
      logger.error('Liquidity analysis failed:', error);
      return {
        analysis: 'Analysis failed due to an error',
        riskScore: 50,
        findings: ['Unable to complete liquidity analysis'],
        recommendations: ['Manual review recommended'],
      };
    }
  }
}

// Start the agent
const agent = new LiquidityAgent();
agent.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down LiquidityAgent...');
  process.exit(0);
});
