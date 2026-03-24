import { ethers } from 'ethers';
import { tradeExecutorContract, TradeDirection, TradeStatus } from '../config/contracts.js';
import { auditService } from './auditService.js';
import { logger } from '../utils/logger.js';
import { ContractError, ValidationError } from '../utils/errors.js';
import { wallet } from '../config/index.js';

export interface TradeEvaluation {
  tokenAddress: string;
  canTrade: boolean;
  reason: string;
  riskAssessment: {
    isSafe: boolean;
    hasConsensus: boolean;
    isBlacklisted: boolean;
    auditCount: number;
    overallScore?: number;
    riskLevel?: string;
  };
  recommendation: 'EXECUTE' | 'REJECT' | 'CAUTION';
}

export interface TradeOrder {
  orderId: string;
  trader: string;
  token: string;
  direction: number;
  directionName: string;
  amount: string;
  minAmountOut: string;
  deadline: number;
  status: number;
  statusName: string;
  executedAmount: string;
  timestamp: number;
}

export class TradeService {
  /**
   * Evaluate if a token is safe to trade
   */
  async evaluateTrade(tokenAddress: string): Promise<TradeEvaluation> {
    try {
      logger.info('Evaluating trade for token', { tokenAddress });

      // Get audit reports
      let tokenAudits;
      try {
        tokenAudits = await auditService.getTokenAudits(tokenAddress);
      } catch (error) {
        // No audits found
        return {
          tokenAddress,
          canTrade: false,
          reason: 'No audit reports found for this token',
          riskAssessment: {
            isSafe: false,
            hasConsensus: false,
            isBlacklisted: false,
            auditCount: 0,
          },
          recommendation: 'REJECT',
        };
      }

      // Get safety status
      const safetyCheck = await auditService.isTokenSafe(tokenAddress);

      // Determine if trade should be executed
      let canTrade = true;
      let reason = 'Token passes all safety checks';
      let recommendation: 'EXECUTE' | 'REJECT' | 'CAUTION' = 'EXECUTE';

      if (safetyCheck.isBlacklisted) {
        canTrade = false;
        reason = 'Token is blacklisted - DO NOT TRADE';
        recommendation = 'REJECT';
      } else if (!safetyCheck.isSafe) {
        canTrade = false;
        reason = safetyCheck.reason || 'Token failed safety checks';
        recommendation = 'REJECT';
      } else if (safetyCheck.auditCount < 3) {
        canTrade = false;
        reason = `Insufficient audits (${safetyCheck.auditCount}/3 required)`;
        recommendation = 'REJECT';
      } else if (!safetyCheck.hasConsensus) {
        canTrade = false;
        reason = 'Auditors have not reached consensus';
        recommendation = 'CAUTION';
      }

      // Check aggregated scores
      const overallScore = tokenAudits.aggregatedScores?.avgOverallScore || 0;
      if (canTrade && overallScore < 70) {
        canTrade = false;
        reason = `Overall risk score too low: ${overallScore}/100 (minimum 70 required)`;
        recommendation = 'REJECT';
      } else if (canTrade && overallScore < 80) {
        recommendation = 'CAUTION';
        reason = `Moderate risk score: ${overallScore}/100. Proceed with caution.`;
      }

      return {
        tokenAddress,
        canTrade,
        reason,
        riskAssessment: {
          ...safetyCheck,
          overallScore,
          riskLevel: tokenAudits.aggregatedScores?.overallRiskLevel,
        },
        recommendation,
      };
    } catch (error: any) {
      logger.error('Failed to evaluate trade', { tokenAddress, error: error.message });
      throw new ContractError('Failed to evaluate trade');
    }
  }

  /**
   * Create a trade order (requires wallet)
   */
  async createTradeOrder(
    tokenAddress: string,
    direction: TradeDirection,
    amount: string,
    minAmountOut: string,
    deadline: number
  ): Promise<{ orderId: string; txHash: string }> {
    if (!wallet) {
      throw new ValidationError('Backend wallet not configured. Cannot create trade orders.');
    }

    try {
      logger.info('Creating trade order', {
        tokenAddress,
        direction: direction === TradeDirection.Buy ? 'Buy' : 'Sell',
        amount,
      });

      // First evaluate the trade
      const evaluation = await this.evaluateTrade(tokenAddress);
      
      if (!evaluation.canTrade) {
        throw new ValidationError(`Trade rejected: ${evaluation.reason}`);
      }

      // Create trade order
      const amountWei = ethers.parseEther(amount);
      const minAmountOutWei = ethers.parseEther(minAmountOut);

      const tx = await tradeExecutorContract.createTradeOrder(
        tokenAddress,
        direction,
        amountWei,
        minAmountOutWei,
        deadline,
        { value: direction === TradeDirection.Buy ? amountWei : 0n }
      );

      const receipt = await tx.wait();
      
      // Extract orderId from event
      let orderId = '0';
      for (const log of receipt.logs) {
        try {
          const parsed = tradeExecutorContract.interface.parseLog(log);
          if (parsed?.name === 'TradeOrderCreated') {
            orderId = parsed.args[0].toString();
            break;
          }
        } catch (e) {
          // Not our event, continue
        }
      }

      logger.info('Trade order created', { orderId, txHash: receipt.hash });

      return {
        orderId,
        txHash: receipt.hash,
      };
    } catch (error: any) {
      logger.error('Failed to create trade order', { error: error.message });
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new ContractError('Failed to create trade order');
    }
  }

  /**
   * Get trade order details
   */
  async getTradeOrder(orderId: string): Promise<TradeOrder> {
    try {
      logger.debug('Fetching trade order', { orderId });
      
      const orderData = await tradeExecutorContract.getTradeOrder(orderId);

      const order: TradeOrder = {
        orderId,
        trader: orderData.trader,
        token: orderData.token,
        direction: Number(orderData.direction),
        directionName: Number(orderData.direction) === TradeDirection.Buy ? 'Buy' : 'Sell',
        amount: ethers.formatEther(orderData.amount),
        minAmountOut: ethers.formatEther(orderData.minAmountOut),
        deadline: Number(orderData.deadline),
        status: Number(orderData.status),
        statusName: this.getStatusName(Number(orderData.status)),
        executedAmount: ethers.formatEther(orderData.executedAmount),
        timestamp: Number(orderData.timestamp),
      };

      return order;
    } catch (error: any) {
      logger.error('Failed to fetch trade order', { orderId, error: error.message });
      throw new ContractError('Failed to fetch trade order');
    }
  }

  /**
   * Get trade status name
   */
  private getStatusName(status: number): string {
    const statusNames = ['Pending', 'Approved', 'Executed', 'Cancelled', 'Failed', 'Expired'];
    return statusNames[status] || 'Unknown';
  }
}

export const tradeService = new TradeService();
