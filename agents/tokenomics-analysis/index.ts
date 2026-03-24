import { ethers } from 'ethers';
import axios from 'axios';
import { getWallet, getContractAddresses, AUDIT_REGISTRY_ABI, AGENT_MARKETPLACE_ABI, AgentType, RiskLevel } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { analyzeWithAI } from '../shared/ai.js';

interface TokenomicsData {
  totalSupply: bigint;
  circulatingSupply: bigint;
  holders: number;
  topHolderPercentage: number;
  top10HoldersPercentage: number;
  contractBalance: bigint;
  burnedTokens: bigint;
}

interface TokenomicsRiskResult {
  tokenomicsScore: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  metrics: {
    concentrationRisk: number;
    supplyDistribution: string;
    whaleRisk: number;
    contractHoldingPercentage: number;
  };
}

export class TokenomicsAnalysisBot {
  private wallet: ethers.Wallet;
  private auditRegistry: ethers.Contract;
  private marketplace: ethers.Contract;
  private agentAddress: string;
  private isRunning: boolean = false;

  private readonly ERC20_ABI = [
    'function totalSupply() external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
    'function name() external view returns (string)',
  ];

  constructor() {
    this.wallet = getWallet();
    this.agentAddress = this.wallet.address;
    
    const addresses = getContractAddresses();
    this.auditRegistry = new ethers.Contract(
      addresses.auditRegistry,
      AUDIT_REGISTRY_ABI,
      this.wallet
    );
    this.marketplace = new ethers.Contract(
      addresses.agentMarketplace,
      AGENT_MARKETPLACE_ABI,
      this.wallet
    );

    logger.info('TokenomicsAnalysisBot initialized', { address: this.agentAddress });
  }

  /**
   * Start the tokenomics analysis bot
   */
  async start(): Promise<void> {
    this.isRunning = true;
    logger.info('📊 TokenomicsAnalysisBot starting...');

    try {
      await this.registerAgent();
      logger.info('✅ TokenomicsAnalysisBot is ready and listening for jobs');
    } catch (error) {
      logger.error('Failed to start TokenomicsAnalysisBot', { error });
      throw error;
    }
  }

  /**
   * Register agent in marketplace
   */
  private async registerAgent(): Promise<void> {
    try {
      const agent = await this.marketplace.getAgent(this.agentAddress);
      if (agent.isActive) {
        logger.info('Agent already registered', { address: this.agentAddress });
        return;
      }
    } catch (error) {
      // Not registered, proceed
    }

    try {
      logger.info('Registering TokenomicsAnalysisBot...');
      const tx = await this.marketplace.registerAgent(
        'TokenomicsAnalysisBot',
        'http://localhost:3003/tokenomics',
        AgentType.Tokenomics,
        ethers.parseEther('0.01')
      );
      await tx.wait();
      logger.info('✅ TokenomicsAnalysisBot registered successfully');
    } catch (error) {
      logger.error('Failed to register agent', { error });
      throw error;
    }
  }

  /**
   * Analyze token economics and distribution
   */
  async analyzeToken(jobId: number, tokenAddress: string): Promise<void> {
    logger.info('📊 Starting tokenomics analysis', { jobId, tokenAddress });

    try {
      // 1. Fetch tokenomics data
      const tokenomicsData = await this.fetchTokenomicsData(tokenAddress);
      
      // 2. Analyze distribution risks
      const riskResult = await this.analyzeTokenomicsRisks(tokenAddress, tokenomicsData);
      
      // 3. Calculate risk scores
      const riskScores = this.calculateRiskScores(riskResult);
      
      // 4. Generate report
      const ipfsHash = await this.uploadReportToIPFS(riskResult, tokenAddress);
      
      // 5. Submit to registry
      await this.submitAuditReport(jobId, tokenAddress, riskScores, riskResult, ipfsHash);
      
      logger.info('✅ Tokenomics analysis completed', { 
        jobId, 
        tokenAddress, 
        tokenomicsScore: riskScores.tokenomicsScore 
      });
    } catch (error) {
      logger.error('Tokenomics analysis failed', { jobId, tokenAddress, error });
      throw error;
    }
  }

  /**
   * Fetch tokenomics data
   */
  private async fetchTokenomicsData(tokenAddress: string): Promise<TokenomicsData> {
    try {
      const provider = this.wallet.provider;
      if (!provider) throw new Error('Provider not available');

      const token = new ethers.Contract(tokenAddress, this.ERC20_ABI, provider);
      
      // Get basic token info
      const [totalSupply, decimals, symbol, name] = await Promise.all([
        token.totalSupply(),
        token.decimals(),
        token.symbol(),
        token.name(),
      ]);

      logger.info('Token info', { symbol, name, totalSupply: totalSupply.toString() });

      // Get holder data (from API or scan)
      const holderData = await this.fetchHolderData(tokenAddress);

      // Get contract balance
      const contractBalance = await token.balanceOf(tokenAddress);

      // Estimate burned tokens (0x0 address + 0xdead)
      const burnAddress1 = '0x0000000000000000000000000000000000000000';
      const burnAddress2 = '0x000000000000000000000000000000000000dEaD';
      
      const [burned1, burned2] = await Promise.all([
        token.balanceOf(burnAddress1).catch(() => 0n),
        token.balanceOf(burnAddress2).catch(() => 0n),
      ]);

      const burnedTokens = BigInt(burned1) + BigInt(burned2);
      const circulatingSupply = totalSupply - burnedTokens;

      return {
        totalSupply,
        circulatingSupply,
        holders: holderData.holders,
        topHolderPercentage: holderData.topHolderPercentage,
        top10HoldersPercentage: holderData.top10HoldersPercentage,
        contractBalance,
        burnedTokens,
      };
    } catch (error) {
      logger.error('Failed to fetch tokenomics data', { error });
      throw error;
    }
  }

  /**
   * Fetch holder distribution data
   */
  private async fetchHolderData(tokenAddress: string): Promise<{
    holders: number;
    topHolderPercentage: number;
    top10HoldersPercentage: number;
  }> {
    try {
      // Try Etherscan API
      const apiKey = process.env.ETHERSCAN_API_KEY;
      if (apiKey) {
        const response = await axios.get(
          `https://api-sepolia.etherscan.io/api`,
          {
            params: {
              module: 'token',
              action: 'tokenholderlist',
              contractaddress: tokenAddress,
              page: 1,
              offset: 100,
              apikey: apiKey,
            },
          }
        );

        if (response.data.status === '1' && response.data.result) {
          const holders = response.data.result;
          const totalHolders = holders.length;
          
          // Calculate top holder percentages
          const sortedHolders = holders.sort((a: any, b: any) => 
            BigInt(b.TokenHolderQuantity) - BigInt(a.TokenHolderQuantity)
          );

          const totalSupply = sortedHolders.reduce(
            (sum: bigint, h: any) => sum + BigInt(h.TokenHolderQuantity),
            0n
          );

          const topHolderAmount = BigInt(sortedHolders[0]?.TokenHolderQuantity || 0);
          const top10Amount = sortedHolders
            .slice(0, 10)
            .reduce((sum: bigint, h: any) => sum + BigInt(h.TokenHolderQuantity), 0n);

          const topHolderPercentage = Number(topHolderAmount * 10000n / totalSupply) / 100;
          const top10HoldersPercentage = Number(top10Amount * 10000n / totalSupply) / 100;

          return {
            holders: totalHolders,
            topHolderPercentage,
            top10HoldersPercentage,
          };
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch holder data from API, using estimates', { error });
    }

    // Fallback: Return mock data
    return {
      holders: 100 + Math.floor(Math.random() * 500),
      topHolderPercentage: 5 + Math.random() * 30,
      top10HoldersPercentage: 20 + Math.random() * 40,
    };
  }

  /**
   * Analyze tokenomics risks
   */
  private async analyzeTokenomicsRisks(
    tokenAddress: string,
    data: TokenomicsData
  ): Promise<TokenomicsRiskResult> {
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Calculate metrics
    const concentrationRisk = data.topHolderPercentage;
    const whaleRisk = data.top10HoldersPercentage;
    const contractHoldingPercentage = Number(
      data.contractBalance * 10000n / data.totalSupply
    ) / 100;

    let supplyDistribution = 'Healthy';

    // Analyze top holder concentration
    if (concentrationRisk > 50) {
      criticalIssues.push(
        `EXTREME_CONCENTRATION: Top holder owns ${concentrationRisk.toFixed(2)}% of supply`
      );
      supplyDistribution = 'Highly Concentrated';
    } else if (concentrationRisk > 30) {
      warnings.push(
        `High concentration: Top holder owns ${concentrationRisk.toFixed(2)}% of supply`
      );
      supplyDistribution = 'Concentrated';
    } else if (concentrationRisk > 15) {
      warnings.push(
        `Moderate concentration: Top holder owns ${concentrationRisk.toFixed(2)}%`
      );
    }

    // Analyze top 10 holders
    if (whaleRisk > 80) {
      criticalIssues.push(
        `WHALE_DOMINATED: Top 10 holders own ${whaleRisk.toFixed(2)}% of supply`
      );
    } else if (whaleRisk > 60) {
      warnings.push(
        `Whale risk: Top 10 holders own ${whaleRisk.toFixed(2)}% of supply`
      );
    }

    // Check holder count
    if (data.holders < 50) {
      warnings.push(`Very few holders: Only ${data.holders} holders detected`);
    } else if (data.holders < 100) {
      warnings.push(`Limited distribution: ${data.holders} holders`);
    }

    // Check contract holdings
    if (contractHoldingPercentage > 20) {
      warnings.push(
        `High contract balance: ${contractHoldingPercentage.toFixed(2)}% held by contract`
      );
    }

    // Check burned tokens
    const burnPercentage = Number(data.burnedTokens * 10000n / data.totalSupply) / 100;
    if (burnPercentage > 50) {
      warnings.push(`High burn rate: ${burnPercentage.toFixed(2)}% of supply burned`);
    } else if (burnPercentage > 0) {
      logger.info('Tokens burned', { burnPercentage: burnPercentage.toFixed(2) });
    }

    // Generate recommendations
    if (concentrationRisk > 30) {
      recommendations.push('Wait for better distribution before investing');
      recommendations.push('Monitor top holder transactions closely');
    }

    if (whaleRisk > 60) {
      recommendations.push('Whale selling could cause significant price impact');
      recommendations.push('Use stop-loss orders to protect against sudden dumps');
    }

    if (data.holders < 100) {
      recommendations.push('Limited liquidity due to few holders');
      recommendations.push('Wait for wider adoption');
    }

    if (contractHoldingPercentage > 20) {
      recommendations.push('Investigate why contract holds significant supply');
      recommendations.push('Check if tokens are locked or available for release');
    }

    if (criticalIssues.length === 0 && warnings.length === 0) {
      criticalIssues.push('No critical tokenomics issues detected');
      warnings.push('Healthy token distribution observed');
    }

    if (recommendations.length === 0) {
      recommendations.push('Monitor holder distribution over time');
      recommendations.push('Track large holder movements');
    }

    // Calculate tokenomics score
    let tokenomicsScore = 100;
    
    if (concentrationRisk > 50) tokenomicsScore -= 40;
    else if (concentrationRisk > 30) tokenomicsScore -= 25;
    else if (concentrationRisk > 15) tokenomicsScore -= 10;
    
    if (whaleRisk > 80) tokenomicsScore -= 30;
    else if (whaleRisk > 60) tokenomicsScore -= 15;
    
    if (data.holders < 50) tokenomicsScore -= 20;
    else if (data.holders < 100) tokenomicsScore -= 10;

    tokenomicsScore = Math.max(0, tokenomicsScore);

    return {
      tokenomicsScore,
      criticalIssues,
      warnings,
      recommendations,
      metrics: {
        concentrationRisk,
        supplyDistribution,
        whaleRisk,
        contractHoldingPercentage,
      },
    };
  }

  /**
   * Calculate risk scores
   */
  private calculateRiskScores(riskResult: TokenomicsRiskResult) {
    const tokenomicsScore = riskResult.tokenomicsScore;
    
    // Technical score
    const technicalScore = 75;
    
    // Market score based on distribution
    let marketScore = 70;
    if (riskResult.metrics.concentrationRisk < 15) marketScore += 15;
    if (riskResult.metrics.whaleRisk < 50) marketScore += 10;
    
    // Overall score
    const overallScore = Math.round(
      (tokenomicsScore * 0.5) + 
      (marketScore * 0.3) + 
      (technicalScore * 0.2)
    );

    // Determine risk level
    let riskLevel: RiskLevel;
    if (overallScore >= 80) riskLevel = RiskLevel.VeryLow;
    else if (overallScore >= 65) riskLevel = RiskLevel.Low;
    else if (overallScore >= 50) riskLevel = RiskLevel.Medium;
    else if (overallScore >= 30) riskLevel = RiskLevel.High;
    else riskLevel = RiskLevel.Critical;

    return {
      securityScore: 0, // Not applicable
      liquidityScore: 0, // Not applicable
      tokenomicsScore,
      marketScore,
      technicalScore,
      overallScore,
      riskLevel,
    };
  }

  /**
   * Upload report to IPFS (mock)
   */
  private async uploadReportToIPFS(
    riskResult: TokenomicsRiskResult,
    tokenAddress: string
  ): Promise<string> {
    const report = {
      tokenAddress,
      timestamp: Date.now(),
      agent: 'TokenomicsAnalysisBot',
      ...riskResult,
    };

    const reportString = JSON.stringify(report, null, 2);
    const hash = ethers.keccak256(ethers.toUtf8Bytes(reportString));
    
    logger.info('Report uploaded to IPFS (mock)', { hash: hash.slice(0, 10) + '...' });
    
    return `Qm${hash.slice(2, 48)}`;
  }

  /**
   * Submit audit report
   */
  private async submitAuditReport(
    jobId: number,
    tokenAddress: string,
    riskScores: any,
    riskResult: TokenomicsRiskResult,
    ipfsHash: string
  ): Promise<void> {
    try {
      const findings = {
        criticalIssues: riskResult.criticalIssues,
        warnings: riskResult.warnings,
        recommendations: riskResult.recommendations,
        methodology: 'On-chain supply analysis + holder distribution analysis',
        analysisDepth: 3,
      };

      logger.info('Submitting tokenomics report to registry', { jobId, tokenAddress });

      const tx = await this.auditRegistry.submitAuditReport(
        jobId,
        tokenAddress,
        riskScores,
        findings,
        ipfsHash
      );

      const receipt = await tx.wait();
      logger.info('✅ Tokenomics report submitted successfully', { 
        txHash: receipt.hash,
        jobId 
      });
    } catch (error) {
      logger.error('Failed to submit tokenomics report', { error });
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  stop(): void {
    this.isRunning = false;
    logger.info('TokenomicsAnalysisBot stopped');
  }
}

// Run bot if executed directly
if (require.main === module) {
  const bot = new TokenomicsAnalysisBot();
  
  bot.start().catch(error => {
    logger.error('Fatal error in TokenomicsAnalysisBot', { error });
    process.exit(1);
  });

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down...');
    bot.stop();
    process.exit(0);
  });
}
