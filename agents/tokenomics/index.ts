import { ethers } from 'ethers';
import { 
  getProvider, 
  getWallet, 
  getContractAddresses, 
  ESCROW_CONTRACT_ABI 
} from '../shared/config.js';
import { createLogger } from '../shared/logger.js';
import { analyzeWithAI, generateReport } from '../shared/ai.js';

const logger = createLogger('tokenomics-agent');

class TokenomicsAgent {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private escrowContract: ethers.Contract;
  
  constructor() {
    this.provider = getProvider();
    this.wallet = getWallet(process.env.TOKENOMICS_AGENT_WALLET);
    
    const addresses = getContractAddresses();
    this.escrowContract = new ethers.Contract(
      addresses.escrowContract,
      ESCROW_CONTRACT_ABI,
      this.wallet
    );
    
    logger.info('TokenomicsAgent initialized', { address: this.wallet.address });
  }

  async start() {
    logger.info('📊 Starting TokenomicsAgent...');
    
    // Listen for job assignments
    this.listenForJobs();
    
    logger.info('✅ TokenomicsAgent is running and listening for jobs');
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
        
        logger.info('📋 Analyzing tokenomics...', { tokenAddress });
        
        // Perform tokenomics analysis
        const analysisResult = await this.performTokenomicsAnalysis(tokenAddress);
        
        // Generate report
        const report = await generateReport(
          'Tokenomics Agent',
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

  private async performTokenomicsAnalysis(tokenAddress: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Simulate tokenomics data
      // In production: fetch from blockchain, APIs, etc.
      const mockTokenomicsData = {
        totalSupply: '1000000000',
        circulatingSupply: Math.floor(Math.random() * 800000000) + 200000000,
        maxSupply: '1000000000',
        marketCapUSD: Math.random() * 10000000,
        holderDistribution: {
          top10Holdings: Math.random() * 60 + 20, // 20-80%
          top100Holdings: Math.random() * 20 + 70, // 70-90%
        },
        tokenomicFeatures: {
          hasTransferTax: Math.random() > 0.5,
          hasBuyback: Math.random() > 0.7,
          hasStaking: Math.random() > 0.6,
          hasBurn: Math.random() > 0.5,
        },
        vestingSchedule: {
          teamTokensLocked: Math.random() > 0.3,
          unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
      
      logger.info('Tokenomics data collected', mockTokenomicsData);
      
      // Analyze with AI
      const aiAnalysis = await analyzeWithAI({
        context: 'You are analyzing the tokenomics design and distribution of a cryptocurrency token.',
        data: {
          tokenAddress,
          ...mockTokenomicsData,
        },
        prompt: `Analyze the tokenomics risk profile of this token. Evaluate:
1. Total supply and distribution model
2. Token holder concentration
3. Circulating vs total supply ratio
4. Inflation/deflation mechanisms
5. Transfer taxes and fees
6. Vesting schedules for team/advisors
7. Liquidity lock status
8. Utility and value accrual mechanisms
9. Governance structure
10. Potential for manipulation

Provide a thorough tokenomics risk assessment.`,
      });
      
      const duration = Date.now() - startTime;
      logger.info('Tokenomics analysis completed', { duration: `${duration}ms` });
      
      return aiAnalysis;
      
    } catch (error) {
      logger.error('Tokenomics analysis failed:', error);
      return {
        analysis: 'Analysis failed due to an error',
        riskScore: 50,
        findings: ['Unable to complete tokenomics analysis'],
        recommendations: ['Manual review recommended'],
      };
    }
  }
}

// Start the agent
const agent = new TokenomicsAgent();
agent.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down TokenomicsAgent...');
  process.exit(0);
});
