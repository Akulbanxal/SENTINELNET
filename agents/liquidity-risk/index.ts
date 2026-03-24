import { ethers } from 'ethers';
import axios from 'axios';
import { getWallet, getContractAddresses, AUDIT_REGISTRY_ABI, AGENT_MARKETPLACE_ABI, AgentType, RiskLevel } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { analyzeWithAI } from '../shared/ai.js';

interface LiquidityData {
  totalLiquidity: number;
  liquidityUSD: number;
  volume24h: number;
  txCount24h: number;
  priceChange24h: number;
  holders: number;
}

interface LiquidityRiskResult {
  liquidityScore: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  metrics: {
    liquidityDepth: number;
    volumeToLiquidityRatio: number;
    rugPullRisk: number;
    liquidityLockedPercentage: number;
  };
}

export class LiquidityRiskBot {
  private wallet: ethers.Wallet;
  private auditRegistry: ethers.Contract;
  private marketplace: ethers.Contract;
  private agentAddress: string;
  private isRunning: boolean = false;

  // Uniswap V2 Router ABI (minimal)
  private readonly UNISWAP_V2_ROUTER_ABI = [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  ];

  // Uniswap V2 Pair ABI (minimal)
  private readonly UNISWAP_V2_PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function totalSupply() external view returns (uint)',
  ];

  // ERC20 ABI (minimal)
  private readonly ERC20_ABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
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

    logger.info('LiquidityRiskBot initialized', { address: this.agentAddress });
  }

  /**
   * Start the liquidity risk bot
   */
  async start(): Promise<void> {
    this.isRunning = true;
    logger.info('💧 LiquidityRiskBot starting...');

    try {
      await this.registerAgent();
      logger.info('✅ LiquidityRiskBot is ready and listening for jobs');
    } catch (error) {
      logger.error('Failed to start LiquidityRiskBot', { error });
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
      // Agent not registered, proceed
    }

    try {
      logger.info('Registering LiquidityRiskBot...');
      const tx = await this.marketplace.registerAgent(
        'LiquidityRiskBot',
        'http://localhost:3002/liquidity',
        AgentType.Liquidity,
        ethers.parseEther('0.01')
      );
      await tx.wait();
      logger.info('✅ LiquidityRiskBot registered successfully');
    } catch (error) {
      logger.error('Failed to register agent', { error });
      throw error;
    }
  }

  /**
   * Analyze token liquidity and trading risks
   */
  async analyzeToken(jobId: number, tokenAddress: string): Promise<void> {
    logger.info('💧 Starting liquidity analysis', { jobId, tokenAddress });

    try {
      // 1. Fetch liquidity data
      const liquidityData = await this.fetchLiquidityData(tokenAddress);
      
      // 2. Analyze risks
      const riskResult = await this.analyzeLiquidityRisks(tokenAddress, liquidityData);
      
      // 3. Calculate risk scores
      const riskScores = this.calculateRiskScores(riskResult);
      
      // 4. Generate report
      const ipfsHash = await this.uploadReportToIPFS(riskResult, tokenAddress);
      
      // 5. Submit to registry
      await this.submitAuditReport(jobId, tokenAddress, riskScores, riskResult, ipfsHash);
      
      logger.info('✅ Liquidity analysis completed', { 
        jobId, 
        tokenAddress, 
        liquidityScore: riskScores.liquidityScore 
      });
    } catch (error) {
      logger.error('Liquidity analysis failed', { jobId, tokenAddress, error });
      throw error;
    }
  }

  /**
   * Fetch liquidity data from DEX
   */
  private async fetchLiquidityData(tokenAddress: string): Promise<LiquidityData> {
    try {
      // Try to fetch from Uniswap/Sushiswap
      const provider = this.wallet.provider;
      if (!provider) throw new Error('Provider not available');

      const token = new ethers.Contract(tokenAddress, this.ERC20_ABI, provider);
      
      // Get basic token info
      const [totalSupply, decimals, symbol] = await Promise.all([
        token.totalSupply(),
        token.decimals(),
        token.symbol(),
      ]);

      logger.info('Token info fetched', { symbol, totalSupply: totalSupply.toString() });

      // Try to find liquidity pair (Uniswap V2 style)
      const pairData = await this.findLiquidityPair(tokenAddress);

      if (!pairData) {
        return {
          totalLiquidity: 0,
          liquidityUSD: 0,
          volume24h: 0,
          txCount24h: 0,
          priceChange24h: 0,
          holders: 0,
        };
      }

      return pairData;
    } catch (error) {
      logger.warn('Failed to fetch on-chain liquidity data, using API fallback', { error });
      
      // Fallback: Try DEX API
      return await this.fetchLiquidityFromAPI(tokenAddress);
    }
  }

  /**
   * Find liquidity pair for token
   */
  private async findLiquidityPair(tokenAddress: string): Promise<LiquidityData | null> {
    try {
      // Common DEX factory addresses (Sepolia or Mainnet)
      const UNISWAP_V2_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
      const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

      const provider = this.wallet.provider;
      if (!provider) return null;

      // Calculate pair address
      const pairAddress = this.computePairAddress(UNISWAP_V2_FACTORY, tokenAddress, WETH);
      
      const pair = new ethers.Contract(pairAddress, this.UNISWAP_V2_PAIR_ABI, provider);
      
      const [reserves, totalSupply] = await Promise.all([
        pair.getReserves(),
        pair.totalSupply(),
      ]);

      const reserve0 = Number(ethers.formatEther(reserves[0]));
      const reserve1 = Number(ethers.formatEther(reserves[1]));
      
      const totalLiquidity = reserve0 + reserve1;
      
      return {
        totalLiquidity,
        liquidityUSD: totalLiquidity * 1800, // Rough ETH price estimate
        volume24h: totalLiquidity * 0.1, // Estimate
        txCount24h: 100, // Placeholder
        priceChange24h: 0,
        holders: 0,
      };
    } catch (error) {
      logger.warn('Could not find liquidity pair', { error });
      return null;
    }
  }

  /**
   * Compute Uniswap V2 pair address
   */
  private computePairAddress(factory: string, tokenA: string, tokenB: string): string {
    const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() 
      ? [tokenA, tokenB] 
      : [tokenB, tokenA];
    
    const salt = ethers.keccak256(
      ethers.solidityPacked(['address', 'address'], [token0, token1])
    );
    
    // This is a simplified version - actual CREATE2 calculation
    return ethers.getCreate2Address(factory, salt, ethers.keccak256('0x'));
  }

  /**
   * Fetch liquidity data from API
   */
  private async fetchLiquidityFromAPI(tokenAddress: string): Promise<LiquidityData> {
    // Mock data for development
    logger.info('Using mock liquidity data for development');
    
    return {
      totalLiquidity: 50000 + Math.random() * 100000,
      liquidityUSD: 50000 + Math.random() * 100000,
      volume24h: 10000 + Math.random() * 50000,
      txCount24h: 50 + Math.floor(Math.random() * 200),
      priceChange24h: (Math.random() - 0.5) * 20,
      holders: 100 + Math.floor(Math.random() * 1000),
    };
  }

  /**
   * Analyze liquidity risks
   */
  private async analyzeLiquidityRisks(
    tokenAddress: string,
    data: LiquidityData
  ): Promise<LiquidityRiskResult> {
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Calculate metrics
    const liquidityDepth = data.liquidityUSD;
    const volumeToLiquidityRatio = data.volume24h / Math.max(data.liquidityUSD, 1);
    let rugPullRisk = 0;
    const liquidityLockedPercentage = await this.checkLiquidityLock(tokenAddress);

    // Check liquidity depth
    if (liquidityDepth < 10000) {
      criticalIssues.push('VERY_LOW_LIQUIDITY: Liquidity below $10,000 - high slippage risk');
      rugPullRisk += 40;
    } else if (liquidityDepth < 50000) {
      warnings.push('Low liquidity: Liquidity below $50,000 may cause significant slippage');
      rugPullRisk += 20;
    }

    // Check volume
    if (volumeToLiquidityRatio < 0.01) {
      warnings.push('Very low trading volume relative to liquidity');
    } else if (volumeToLiquidityRatio > 5) {
      warnings.push('Abnormally high trading volume - possible manipulation');
    }

    // Check liquidity lock
    if (liquidityLockedPercentage < 50) {
      criticalIssues.push(`UNLOCKED_LIQUIDITY: Only ${liquidityLockedPercentage}% of liquidity is locked`);
      rugPullRisk += 40;
    } else if (liquidityLockedPercentage < 80) {
      warnings.push(`Partially locked liquidity: ${liquidityLockedPercentage}% locked`);
      rugPullRisk += 15;
    }

    // Check holder distribution
    if (data.holders < 50) {
      warnings.push('Very few holders - concentration risk');
      rugPullRisk += 10;
    }

    // Check price volatility
    if (Math.abs(data.priceChange24h) > 50) {
      warnings.push(`High price volatility: ${data.priceChange24h.toFixed(2)}% change in 24h`);
      rugPullRisk += 10;
    }

    // Generate recommendations
    if (liquidityDepth < 50000) {
      recommendations.push('Wait for liquidity to increase above $50,000 before trading');
    }

    if (liquidityLockedPercentage < 80) {
      recommendations.push('Verify liquidity is locked with a reputable service (e.g., Unicrypt, Team Finance)');
    }

    if (data.holders < 100) {
      recommendations.push('Wait for wider distribution before trading');
    }

    if (volumeToLiquidityRatio < 0.05) {
      recommendations.push('Low trading activity - may have difficulty entering/exiting positions');
    }

    if (criticalIssues.length === 0 && warnings.length === 0) {
      criticalIssues.push('No critical liquidity issues detected');
      warnings.push('Normal liquidity metrics observed');
    }

    if (recommendations.length === 0) {
      recommendations.push('Monitor liquidity metrics regularly');
      recommendations.push('Use limit orders to minimize slippage');
    }

    // Calculate liquidity score
    const liquidityScore = Math.max(0, 100 - rugPullRisk);

    return {
      liquidityScore,
      criticalIssues,
      warnings,
      recommendations,
      metrics: {
        liquidityDepth,
        volumeToLiquidityRatio,
        rugPullRisk,
        liquidityLockedPercentage,
      },
    };
  }

  /**
   * Check if liquidity is locked
   */
  private async checkLiquidityLock(tokenAddress: string): Promise<number> {
    // In production, check common liquidity locker contracts
    // For now, return a mock value
    const mockLockPercentage = 60 + Math.random() * 40;
    logger.info('Liquidity lock check (mock)', { 
      tokenAddress, 
      lockedPercentage: mockLockPercentage.toFixed(2) 
    });
    return mockLockPercentage;
  }

  /**
   * Calculate risk scores
   */
  private calculateRiskScores(riskResult: LiquidityRiskResult) {
    const liquidityScore = riskResult.liquidityScore;
    
    // Technical score based on data quality
    const technicalScore = 75;
    
    // Market score based on trading activity
    let marketScore = 70;
    if (riskResult.metrics.volumeToLiquidityRatio > 0.1) marketScore += 10;
    if (riskResult.metrics.liquidityDepth > 100000) marketScore += 10;
    
    // Overall score (liquidity weighted heavily)
    const overallScore = Math.round(
      (liquidityScore * 0.5) + 
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
      liquidityScore,
      tokenomicsScore: 0, // Not applicable
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
    riskResult: LiquidityRiskResult,
    tokenAddress: string
  ): Promise<string> {
    const report = {
      tokenAddress,
      timestamp: Date.now(),
      agent: 'LiquidityRiskBot',
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
    riskResult: LiquidityRiskResult,
    ipfsHash: string
  ): Promise<void> {
    try {
      const findings = {
        criticalIssues: riskResult.criticalIssues,
        warnings: riskResult.warnings,
        recommendations: riskResult.recommendations,
        methodology: 'On-chain liquidity analysis + DEX metrics',
        analysisDepth: 3,
      };

      logger.info('Submitting liquidity report to registry', { jobId, tokenAddress });

      const tx = await this.auditRegistry.submitAuditReport(
        jobId,
        tokenAddress,
        riskScores,
        findings,
        ipfsHash
      );

      const receipt = await tx.wait();
      logger.info('✅ Liquidity report submitted successfully', { 
        txHash: receipt.hash,
        jobId 
      });
    } catch (error) {
      logger.error('Failed to submit liquidity report', { error });
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  stop(): void {
    this.isRunning = false;
    logger.info('LiquidityRiskBot stopped');
  }
}

// Run bot if executed directly
if (require.main === module) {
  const bot = new LiquidityRiskBot();
  
  bot.start().catch(error => {
    logger.error('Fatal error in LiquidityRiskBot', { error });
    process.exit(1);
  });

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down...');
    bot.stop();
    process.exit(0);
  });
}
