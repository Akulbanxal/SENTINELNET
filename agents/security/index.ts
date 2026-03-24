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

const logger = createLogger('security-agent');

interface SecurityAnalysisData {
  contractCode: string;
  tokenAddress: string;
  network: string;
}

class SecurityAgent {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private escrowContract: ethers.Contract;
  
  constructor() {
    this.provider = getProvider();
    this.wallet = getWallet(process.env.SECURITY_AGENT_WALLET);
    
    const addresses = getContractAddresses();
    this.escrowContract = new ethers.Contract(
      addresses.escrowContract,
      ESCROW_CONTRACT_ABI,
      this.wallet
    );
    
    logger.info('SecurityAgent initialized', { address: this.wallet.address });
  }

  async start() {
    logger.info('🔐 Starting SecurityAgent...');
    
    // Listen for job assignments
    this.listenForJobs();
    
    logger.info('✅ SecurityAgent is running and listening for jobs');
  }

  private listenForJobs() {
    this.escrowContract.on('AgentHired', async (jobId: bigint, agent: string, payment: bigint) => {
      try {
        const agentAddr = agent.toLowerCase();
        const myAddr = this.wallet.address.toLowerCase();
        
        if (agentAddr !== myAddr) {
          return; // Not for us
        }
        
        const id = Number(jobId);
        logger.info('🎯 New job assigned!', { 
          jobId: id, 
          payment: ethers.formatEther(payment) 
        });
        
        // Get job details
        const jobData = await this.escrowContract.getJob(id);
        const tokenAddress = jobData.tokenAddress;
        
        logger.info('📋 Analyzing token...', { tokenAddress });
        
        // Perform security analysis
        const analysisResult = await this.performSecurityAnalysis(tokenAddress);
        
        // Generate report
        const report = await generateReport(
          'Security Agent',
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

  private async performSecurityAnalysis(tokenAddress: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Fetch contract code
      const code = await this.provider.getCode(tokenAddress);
      
      if (code === '0x') {
        logger.warn('No contract code found at address', { tokenAddress });
        return {
          analysis: 'No contract code found at the specified address',
          riskScore: 0,
          findings: ['Contract does not exist or is not verified'],
          recommendations: ['Verify the contract address', 'Check if contract is deployed'],
        };
      }
      
      // Analyze with AI
      const aiAnalysis = await analyzeWithAI({
        context: 'You are performing a security audit of a smart contract. Analyze for common vulnerabilities.',
        data: {
          contractAddress: tokenAddress,
          codeSize: code.length,
          // In production, decompile or fetch verified source
          hasCode: code !== '0x',
        },
        prompt: `Analyze this smart contract for security vulnerabilities. Check for:
1. Reentrancy vulnerabilities
2. Access control issues
3. Integer overflow/underflow
4. Unchecked external calls
5. Selfdestruct functionality
6. Delegatecall to untrusted contracts
7. Front-running vulnerabilities
8. Timestamp dependence
9. tx.origin authentication
10. DoS attacks

Provide a detailed risk assessment.`,
      });
      
      const duration = Date.now() - startTime;
      logger.info('Security analysis completed', { duration: `${duration}ms` });
      
      return aiAnalysis;
      
    } catch (error) {
      logger.error('Security analysis failed:', error);
      return {
        analysis: 'Analysis failed due to an error',
        riskScore: 50,
        findings: ['Unable to complete security analysis'],
        recommendations: ['Manual review recommended'],
      };
    }
  }
}

// Start the agent
const agent = new SecurityAgent();
agent.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down SecurityAgent...');
  process.exit(0);
});
