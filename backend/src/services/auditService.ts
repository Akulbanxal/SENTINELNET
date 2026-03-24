import { ethers } from 'ethers';
import { auditRegistryContract, RiskLevel } from '../config/contracts.js';
import { cache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { ContractError, NotFoundError } from '../utils/errors.js';

export interface RiskScores {
  securityScore: number;
  liquidityScore: number;
  tokenomicsScore: number;
  marketScore: number;
  technicalScore: number;
  overallScore: number;
  riskLevel: number;
  riskLevelName: string;
}

export interface AuditReport {
  auditor: string;
  auditorName?: string;
  timestamp: number;
  riskScores: RiskScores;
  ipfsHash: string;
}

export interface TokenAuditSummary {
  tokenAddress: string;
  auditCount: number;
  isSafe: boolean;
  hasConsensus: boolean;
  isBlacklisted: boolean;
  reports: AuditReport[];
  aggregatedScores?: {
    avgSecurityScore: number;
    avgLiquidityScore: number;
    avgTokenomicsScore: number;
    avgOverallScore: number;
    overallRiskLevel: string;
  };
}

export class AuditService {
  /**
   * Get all audit reports for a token
   */
  async getTokenAudits(tokenAddress: string): Promise<TokenAuditSummary> {
    const cacheKey = `audits:${tokenAddress.toLowerCase()}`;
    const cached = cache.get<TokenAuditSummary>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      logger.info('Fetching audits for token', { tokenAddress });

      // Get all auditors for this token
      const auditors = await auditRegistryContract.getTokenAudits(tokenAddress);
      
      if (auditors.length === 0) {
        throw new NotFoundError(`No audits found for token ${tokenAddress}`);
      }

      // Fetch all audit reports
      const reports = await Promise.all(
        auditors.map((auditor: string) => this.getAuditReport(tokenAddress, auditor))
      );

      // Get token safety status
      const [isSafe, hasConsensus, isBlacklisted, auditCount] = await Promise.all([
        auditRegistryContract.isTokenSafe(tokenAddress),
        auditRegistryContract.hasConsensus(tokenAddress),
        auditRegistryContract.isBlacklisted(tokenAddress),
        auditRegistryContract.getAuditCount(tokenAddress),
      ]);

      // Calculate aggregated scores
      const aggregatedScores = this.calculateAggregatedScores(reports);

      const summary: TokenAuditSummary = {
        tokenAddress,
        auditCount: Number(auditCount),
        isSafe,
        hasConsensus,
        isBlacklisted,
        reports,
        aggregatedScores,
      };

      cache.set(cacheKey, summary, 180); // Cache for 3 minutes
      return summary;
    } catch (error: any) {
      logger.error('Failed to fetch token audits', { tokenAddress, error: error.message });
      
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      throw new ContractError('Failed to fetch audits from blockchain');
    }
  }

  /**
   * Get a specific audit report
   */
  async getAuditReport(tokenAddress: string, auditor: string): Promise<AuditReport> {
    try {
      logger.debug('Fetching audit report', { tokenAddress, auditor });
      
      const reportData = await auditRegistryContract.getAuditReport(tokenAddress, auditor);

      const report: AuditReport = {
        auditor,
        timestamp: Number(reportData.timestamp),
        riskScores: {
          securityScore: Number(reportData.riskScores.securityScore),
          liquidityScore: Number(reportData.riskScores.liquidityScore),
          tokenomicsScore: Number(reportData.riskScores.tokenomicsScore),
          marketScore: Number(reportData.riskScores.marketScore),
          technicalScore: Number(reportData.riskScores.technicalScore),
          overallScore: Number(reportData.riskScores.overallScore),
          riskLevel: Number(reportData.riskScores.riskLevel),
          riskLevelName: this.getRiskLevelName(Number(reportData.riskScores.riskLevel)),
        },
        ipfsHash: reportData.ipfsHash,
      };

      return report;
    } catch (error: any) {
      logger.error('Failed to fetch audit report', { tokenAddress, auditor, error: error.message });
      throw new ContractError('Failed to fetch audit report');
    }
  }

  /**
   * Check if token is safe to trade
   */
  async isTokenSafe(tokenAddress: string): Promise<{
    isSafe: boolean;
    hasConsensus: boolean;
    isBlacklisted: boolean;
    auditCount: number;
    reason?: string;
  }> {
    const cacheKey = `token:safe:${tokenAddress.toLowerCase()}`;
    const cached = cache.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      logger.info('Checking token safety', { tokenAddress });

      const [isSafe, hasConsensus, isBlacklisted, auditCount] = await Promise.all([
        auditRegistryContract.isTokenSafe(tokenAddress),
        auditRegistryContract.hasConsensus(tokenAddress),
        auditRegistryContract.isBlacklisted(tokenAddress),
        auditRegistryContract.getAuditCount(tokenAddress),
      ]);

      let reason: string | undefined;
      
      if (isBlacklisted) {
        reason = 'Token is blacklisted';
      } else if (!isSafe) {
        reason = 'Token failed safety checks';
      } else if (!hasConsensus) {
        reason = 'Auditors have not reached consensus';
      } else if (Number(auditCount) < 3) {
        reason = 'Insufficient audits (minimum 3 required)';
      }

      const result = {
        isSafe,
        hasConsensus,
        isBlacklisted,
        auditCount: Number(auditCount),
        reason,
      };

      cache.set(cacheKey, result, 120);
      return result;
    } catch (error: any) {
      logger.error('Failed to check token safety', { tokenAddress, error: error.message });
      throw new ContractError('Failed to check token safety');
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(): Promise<{
    totalAudits: number;
    totalTokens: number;
    safeTokens: number;
    blacklistedTokens: number;
    averageOverallScore: number;
  }> {
    const cacheKey = 'audits:stats';
    const cached = cache.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // This would require additional contract methods or indexing
    // For now, return placeholder data
    const stats = {
      totalAudits: 0,
      totalTokens: 0,
      safeTokens: 0,
      blacklistedTokens: 0,
      averageOverallScore: 0,
    };

    cache.set(cacheKey, stats, 600);
    return stats;
  }

  /**
   * Calculate aggregated scores from multiple reports
   */
  private calculateAggregatedScores(reports: AuditReport[]) {
    if (reports.length === 0) {
      return undefined;
    }

    const sum = reports.reduce(
      (acc, report) => ({
        security: acc.security + report.riskScores.securityScore,
        liquidity: acc.liquidity + report.riskScores.liquidityScore,
        tokenomics: acc.tokenomics + report.riskScores.tokenomicsScore,
        overall: acc.overall + report.riskScores.overallScore,
      }),
      { security: 0, liquidity: 0, tokenomics: 0, overall: 0 }
    );

    const count = reports.length;
    const avgOverall = Math.round(sum.overall / count);

    return {
      avgSecurityScore: Math.round(sum.security / count),
      avgLiquidityScore: Math.round(sum.liquidity / count),
      avgTokenomicsScore: Math.round(sum.tokenomics / count),
      avgOverallScore: avgOverall,
      overallRiskLevel: this.getRiskLevelName(this.scoreToRiskLevel(avgOverall)),
    };
  }

  /**
   * Convert score to risk level
   */
  private scoreToRiskLevel(score: number): number {
    if (score >= 80) return RiskLevel.VeryLow;
    if (score >= 65) return RiskLevel.Low;
    if (score >= 50) return RiskLevel.Medium;
    if (score >= 30) return RiskLevel.High;
    return RiskLevel.Critical;
  }

  /**
   * Get risk level name
   */
  private getRiskLevelName(riskLevel: number): string {
    const levels = ['Very Low', 'Low', 'Medium', 'High', 'Critical'];
    return levels[riskLevel] || 'Unknown';
  }
}

export const auditService = new AuditService();
