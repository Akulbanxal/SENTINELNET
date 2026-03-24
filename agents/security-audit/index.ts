import { ethers } from 'ethers';
import axios from 'axios';
import { getWallet, getContractAddresses, AUDIT_REGISTRY_ABI, AGENT_MARKETPLACE_ABI, AgentType, RiskLevel } from '../shared/config.js';
import { logger } from '../shared/logger.js';
import { analyzeWithAI, generateReport } from '../shared/ai.js';

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  location?: string;
}

interface SecurityAuditResult {
  securityScore: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  detectedPatterns: {
    hasReentrancy: boolean;
    hasDangerousOwner: boolean;
    hasUnlimitedMint: boolean;
    hasHiddenFunctions: boolean;
    hasProxyPattern: boolean;
  };
}

export class SecurityAuditBot {
  private wallet: ethers.Wallet;
  private auditRegistry: ethers.Contract;
  private marketplace: ethers.Contract;
  private agentAddress: string;
  private isRunning: boolean = false;

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

    logger.info('SecurityAuditBot initialized', { address: this.agentAddress });
  }

  /**
   * Start the security audit bot
   */
  async start(): Promise<void> {
    this.isRunning = true;
    logger.info('🔐 SecurityAuditBot starting...');

    try {
      // Register agent if not already registered
      await this.registerAgent();
      
      logger.info('✅ SecurityAuditBot is ready and listening for jobs');
      
      // In production, this would listen for events
      // For now, we'll provide a method to audit on demand
    } catch (error) {
      logger.error('Failed to start SecurityAuditBot', { error });
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
      // Agent not registered, proceed with registration
    }

    try {
      logger.info('Registering SecurityAuditBot...');
      const tx = await this.marketplace.registerAgent(
        'SecurityAuditBot',
        'http://localhost:3001/security',
        AgentType.Security,
        ethers.parseEther('0.01') // Price per audit
      );
      await tx.wait();
      logger.info('✅ SecurityAuditBot registered successfully');
    } catch (error) {
      logger.error('Failed to register agent', { error });
      throw error;
    }
  }

  /**
   * Audit a token contract for security vulnerabilities
   */
  async auditToken(jobId: number, tokenAddress: string): Promise<void> {
    logger.info('🔍 Starting security audit', { jobId, tokenAddress });

    try {
      // 1. Fetch contract code
      const contractCode = await this.fetchContractCode(tokenAddress);
      
      // 2. Analyze for vulnerabilities
      const auditResult = await this.analyzeContract(tokenAddress, contractCode);
      
      // 3. Calculate risk score
      const riskScores = this.calculateRiskScores(auditResult);
      
      // 4. Generate detailed report
      const ipfsHash = await this.uploadReportToIPFS(auditResult, tokenAddress);
      
      // 5. Submit to AuditRegistry
      await this.submitAuditReport(jobId, tokenAddress, riskScores, auditResult, ipfsHash);
      
      logger.info('✅ Security audit completed', { 
        jobId, 
        tokenAddress, 
        securityScore: riskScores.securityScore 
      });
    } catch (error) {
      logger.error('Security audit failed', { jobId, tokenAddress, error });
      throw error;
    }
  }

  /**
   * Fetch contract source code from Etherscan
   */
  private async fetchContractCode(tokenAddress: string): Promise<string> {
    try {
      const apiKey = process.env.ETHERSCAN_API_KEY;
      if (!apiKey) {
        throw new Error('Etherscan API key not found');
      }

      const response = await axios.get(
        `https://api-sepolia.etherscan.io/api`,
        {
          params: {
            module: 'contract',
            action: 'getsourcecode',
            address: tokenAddress,
            apikey: apiKey,
          },
        }
      );

      if (response.data.status === '1' && response.data.result[0].SourceCode) {
        return response.data.result[0].SourceCode;
      } else {
        // If source not available, return bytecode indicator
        logger.warn('Source code not verified on Etherscan', { tokenAddress });
        return 'BYTECODE_ONLY';
      }
    } catch (error) {
      logger.error('Failed to fetch contract code', { tokenAddress, error });
      return 'FETCH_FAILED';
    }
  }

  /**
   * Analyze contract for security vulnerabilities
   */
  private async analyzeContract(
    tokenAddress: string,
    contractCode: string
  ): Promise<SecurityAuditResult> {
    const issues: SecurityIssue[] = [];
    const detectedPatterns = {
      hasReentrancy: false,
      hasDangerousOwner: false,
      hasUnlimitedMint: false,
      hasHiddenFunctions: false,
      hasProxyPattern: false,
    };

    if (contractCode === 'BYTECODE_ONLY' || contractCode === 'FETCH_FAILED') {
      issues.push({
        severity: 'critical',
        type: 'UNVERIFIED_CONTRACT',
        description: 'Contract source code is not verified. Cannot perform thorough security analysis.',
      });

      return {
        securityScore: 20,
        criticalIssues: ['Contract source code not verified on Etherscan'],
        warnings: ['Unable to perform comprehensive security analysis'],
        recommendations: ['Verify contract source code on Etherscan before trading'],
        detectedPatterns,
      };
    }

    // Pattern detection
    detectedPatterns.hasReentrancy = this.detectReentrancy(contractCode);
    detectedPatterns.hasDangerousOwner = this.detectDangerousOwner(contractCode);
    detectedPatterns.hasUnlimitedMint = this.detectUnlimitedMint(contractCode);
    detectedPatterns.hasHiddenFunctions = this.detectHiddenFunctions(contractCode);
    detectedPatterns.hasProxyPattern = this.detectProxyPattern(contractCode);

    // Check for reentrancy
    if (detectedPatterns.hasReentrancy) {
      issues.push({
        severity: 'critical',
        type: 'REENTRANCY',
        description: 'Potential reentrancy vulnerability detected. External calls without proper guards.',
      });
    }

    // Check for dangerous owner privileges
    if (detectedPatterns.hasDangerousOwner) {
      issues.push({
        severity: 'high',
        type: 'CENTRALIZATION_RISK',
        description: 'Owner has excessive privileges including ability to modify critical parameters.',
      });
    }

    // Check for unlimited mint
    if (detectedPatterns.hasUnlimitedMint) {
      issues.push({
        severity: 'high',
        type: 'UNLIMITED_MINT',
        description: 'Contract has unlimited minting capability without restrictions.',
      });
    }

    // Check for hidden functions
    if (detectedPatterns.hasHiddenFunctions) {
      issues.push({
        severity: 'medium',
        type: 'HIDDEN_FUNCTIONS',
        description: 'Contract contains suspicious hidden or obfuscated functions.',
      });
    }

    // Use AI for deeper analysis
    const aiAnalysis = await this.performAIAnalysis(contractCode);

    // Compile results
    const criticalIssues = issues
      .filter(i => i.severity === 'critical')
      .map(i => `${i.type}: ${i.description}`);
    
    const warnings = issues
      .filter(i => i.severity === 'high' || i.severity === 'medium')
      .map(i => `${i.type}: ${i.description}`);

    const recommendations = this.generateRecommendations(issues, detectedPatterns);

    // Calculate security score
    const securityScore = this.calculateSecurityScore(issues, aiAnalysis);

    return {
      securityScore,
      criticalIssues: criticalIssues.length > 0 ? criticalIssues : ['No critical issues detected'],
      warnings: warnings.length > 0 ? warnings : ['No major warnings'],
      recommendations,
      detectedPatterns,
    };
  }

  /**
   * Detect reentrancy vulnerabilities
   */
  private detectReentrancy(code: string): boolean {
    // Look for external calls before state changes
    const patterns = [
      /\.call\{value:/gi,
      /\.transfer\(/gi,
      /\.send\(/gi,
    ];

    const hasExternalCall = patterns.some(pattern => pattern.test(code));
    const lacksReentrancyGuard = !code.includes('ReentrancyGuard') && 
                                  !code.includes('nonReentrant') &&
                                  !code.includes('_reentrancyGuard');

    return hasExternalCall && lacksReentrancyGuard;
  }

  /**
   * Detect dangerous owner privileges
   */
  private detectDangerousOwner(code: string): boolean {
    const dangerousPatterns = [
      /function\s+\w*mint\w*.*onlyOwner/gi,
      /function\s+\w*burn\w*.*onlyOwner/gi,
      /function\s+setFee.*onlyOwner/gi,
      /function\s+withdraw.*onlyOwner/gi,
      /function\s+changeOwner.*onlyOwner/gi,
    ];

    let dangerousFunctionsCount = 0;
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(code)) dangerousFunctionsCount++;
    });

    return dangerousFunctionsCount >= 3;
  }

  /**
   * Detect unlimited mint capability
   */
  private detectUnlimitedMint(code: string): boolean {
    const hasMintFunction = /function\s+mint\(/gi.test(code);
    const hasMaxSupply = /maxSupply|MAX_SUPPLY|_maxSupply/gi.test(code);
    const hasMintCap = /mintCap|MINT_CAP|_mintCap/gi.test(code);

    return hasMintFunction && !hasMaxSupply && !hasMintCap;
  }

  /**
   * Detect hidden or suspicious functions
   */
  private detectHiddenFunctions(code: string): boolean {
    const suspiciousPatterns = [
      /function\s+_0x[a-fA-F0-9]+/g, // Obfuscated function names
      /function\s+\w{40,}/g, // Very long function names
      /selfdestruct\(/gi,
      /delegatecall\(/gi,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Detect proxy pattern (upgradeable contracts)
   */
  private detectProxyPattern(code: string): boolean {
    const proxyPatterns = [
      /ERC1967Upgrade/gi,
      /UUPSUpgradeable/gi,
      /TransparentUpgradeableProxy/gi,
      /delegatecall/gi,
    ];

    return proxyPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Perform AI-powered analysis
   */
  private async performAIAnalysis(code: string): Promise<string> {
    try {
      const aiResponse = await analyzeWithAI({
        context: 'Security audit of smart contract',
        data: { code: code.substring(0, 2000) },
        prompt: `Analyze this Solidity smart contract for security vulnerabilities. 
Focus on:
1. Reentrancy attacks
2. Access control issues
3. Integer overflow/underflow
4. Unchecked external calls
5. Centralization risks

Provide a brief security assessment.`
      });

      return aiResponse.analysis;
    } catch (error) {
      logger.warn('AI analysis failed, using pattern-based analysis only', { error });
      return 'AI analysis unavailable';
    }
  }

  /**
   * Calculate security score from issues
   */
  private calculateSecurityScore(issues: SecurityIssue[], aiAnalysis: string): number {
    let score = 100;

    // Deduct points based on severity
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 7;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });

    // AI analysis adjustments
    if (aiAnalysis.toLowerCase().includes('critical') || 
        aiAnalysis.toLowerCase().includes('severe')) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(
    issues: SecurityIssue[],
    patterns: any
  ): string[] {
    const recommendations: string[] = [];

    if (patterns.hasReentrancy) {
      recommendations.push('Implement ReentrancyGuard or checks-effects-interactions pattern');
    }

    if (patterns.hasDangerousOwner) {
      recommendations.push('Consider implementing timelock or multi-sig for owner functions');
      recommendations.push('Document all owner privileges clearly');
    }

    if (patterns.hasUnlimitedMint) {
      recommendations.push('Implement maximum supply cap to prevent unlimited minting');
    }

    if (patterns.hasProxyPattern) {
      recommendations.push('Ensure upgrade mechanisms are properly secured');
      recommendations.push('Consider using immutable contracts for higher security');
    }

    if (issues.some(i => i.severity === 'critical')) {
      recommendations.push('⚠️ CRITICAL: Do not trade this token until issues are resolved');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring the contract for any changes');
      recommendations.push('Verify contract interactions are secure');
    }

    return recommendations;
  }

  /**
   * Calculate comprehensive risk scores
   */
  private calculateRiskScores(auditResult: SecurityAuditResult) {
    const securityScore = auditResult.securityScore;
    
    // Technical score based on code quality
    let technicalScore = 80;
    if (auditResult.detectedPatterns.hasProxyPattern) technicalScore -= 10;
    if (auditResult.detectedPatterns.hasHiddenFunctions) technicalScore -= 20;
    
    // Market score (placeholder - would integrate with actual market data)
    const marketScore = 70;
    
    // Overall score (security weighted heavily)
    const overallScore = Math.round(
      (securityScore * 0.6) + 
      (technicalScore * 0.3) + 
      (marketScore * 0.1)
    );

    // Determine risk level
    let riskLevel: RiskLevel;
    if (overallScore >= 80) riskLevel = RiskLevel.VeryLow;
    else if (overallScore >= 65) riskLevel = RiskLevel.Low;
    else if (overallScore >= 50) riskLevel = RiskLevel.Medium;
    else if (overallScore >= 30) riskLevel = RiskLevel.High;
    else riskLevel = RiskLevel.Critical;

    return {
      securityScore,
      liquidityScore: 0, // Not applicable for security bot
      tokenomicsScore: 0, // Not applicable for security bot
      marketScore,
      technicalScore,
      overallScore,
      riskLevel,
    };
  }

  /**
   * Upload report to IPFS (mock implementation)
   */
  private async uploadReportToIPFS(
    auditResult: SecurityAuditResult,
    tokenAddress: string
  ): Promise<string> {
    // In production, upload to actual IPFS
    // For now, generate a mock hash
    const report = {
      tokenAddress,
      timestamp: Date.now(),
      agent: 'SecurityAuditBot',
      ...auditResult,
    };

    const reportString = JSON.stringify(report, null, 2);
    const hash = ethers.keccak256(ethers.toUtf8Bytes(reportString));
    
    logger.info('Report uploaded to IPFS (mock)', { hash: hash.slice(0, 10) + '...' });
    
    // Return mock IPFS hash
    return `Qm${hash.slice(2, 48)}`;
  }

  /**
   * Submit audit report to AuditRegistry
   */
  private async submitAuditReport(
    jobId: number,
    tokenAddress: string,
    riskScores: any,
    auditResult: SecurityAuditResult,
    ipfsHash: string
  ): Promise<void> {
    try {
      const findings = {
        criticalIssues: auditResult.criticalIssues,
        warnings: auditResult.warnings,
        recommendations: auditResult.recommendations,
        methodology: 'Automated pattern detection + AI analysis',
        analysisDepth: 4,
      };

      logger.info('Submitting audit report to registry', { jobId, tokenAddress });

      const tx = await this.auditRegistry.submitAuditReport(
        jobId,
        tokenAddress,
        riskScores,
        findings,
        ipfsHash
      );

      const receipt = await tx.wait();
      logger.info('✅ Audit report submitted successfully', { 
        txHash: receipt.hash,
        jobId 
      });
    } catch (error) {
      logger.error('Failed to submit audit report', { error });
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  stop(): void {
    this.isRunning = false;
    logger.info('SecurityAuditBot stopped');
  }
}

// Run bot if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new SecurityAuditBot();
  
  bot.start().catch(error => {
    logger.error('Fatal error in SecurityAuditBot', { error });
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down...');
    bot.stop();
    process.exit(0);
  });
}
