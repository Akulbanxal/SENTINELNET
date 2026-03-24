import { ethers } from 'ethers';
import { provider, wallet, config } from './index.js';

// Agent Marketplace ABI
export const AGENT_MARKETPLACE_ABI = [
  'function getAgent(address agentAddress) external view returns (tuple(string name, string endpoint, uint8 agentType, uint256 pricePerVerification, uint256 reputation, uint256 totalJobs, bool isActive))',
  'function getAgentsByType(uint8 agentType) external view returns (address[] memory)',
  'function getAllAgents() external view returns (address[] memory)',
  'function isAgentActive(address agentAddress) external view returns (bool)',
  'event AgentRegistered(address indexed agent, string name, uint8 indexed agentType)',
  'event AgentUpdated(address indexed agent)',
  'event ReputationUpdated(address indexed agent, uint256 newReputation)',
];

// Audit Registry ABI
export const AUDIT_REGISTRY_ABI = [
  'function getAuditReport(address tokenAddress, address auditor) external view returns (tuple(address auditor, uint256 timestamp, tuple(uint256 securityScore, uint256 liquidityScore, uint256 tokenomicsScore, uint256 marketScore, uint256 technicalScore, uint256 overallScore, uint8 riskLevel) riskScores, string ipfsHash))',
  'function getTokenAudits(address tokenAddress) external view returns (address[] memory)',
  'function isTokenSafe(address tokenAddress) external view returns (bool)',
  'function hasConsensus(address tokenAddress) external view returns (bool)',
  'function getAuditCount(address tokenAddress) external view returns (uint256)',
  'function isBlacklisted(address tokenAddress) external view returns (bool)',
  'event AuditReported(address indexed auditor, address indexed tokenAddress, uint256 indexed jobId, uint256 overallScore)',
];

// Trade Executor ABI
export const TRADE_EXECUTOR_ABI = [
  'function getTradeOrder(uint256 orderId) external view returns (tuple(address trader, address token, uint8 direction, uint256 amount, uint256 minAmountOut, uint256 deadline, uint8 status, uint256 executedAmount, uint256 timestamp))',
  'function createTradeOrder(address token, uint8 direction, uint256 amount, uint256 minAmountOut, uint256 deadline) external payable returns (uint256)',
  'function executeTrade(uint256 orderId) external returns (uint256)',
  'function cancelOrder(uint256 orderId) external',
  'event TradeOrderCreated(uint256 indexed orderId, address indexed trader, address indexed token)',
  'event TradeExecuted(uint256 indexed orderId, uint256 amountOut)',
];

// Agent Types Enum
export enum AgentType {
  Security = 0,
  Liquidity = 1,
  Tokenomics = 2,
  Market = 3,
}

// Risk Level Enum
export enum RiskLevel {
  VeryLow = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

// Trade Direction Enum
export enum TradeDirection {
  Buy = 0,
  Sell = 1,
}

// Trade Status Enum
export enum TradeStatus {
  Pending = 0,
  Approved = 1,
  Executed = 2,
  Cancelled = 3,
  Failed = 4,
  Expired = 5,
}

// Contract instances
export const agentMarketplaceContract = new ethers.Contract(
  config.contracts.agentMarketplace,
  AGENT_MARKETPLACE_ABI,
  provider
);

export const auditRegistryContract = new ethers.Contract(
  config.contracts.auditRegistry,
  AUDIT_REGISTRY_ABI,
  provider
);

export const tradeExecutorContract = new ethers.Contract(
  config.contracts.tradeExecutor,
  TRADE_EXECUTOR_ABI,
  wallet || provider
);

// Helper function to get contract with signer
export function getContractWithSigner(contractAddress: string, abi: any[]) {
  if (!wallet) {
    throw new Error('Wallet not configured. Set PRIVATE_KEY in environment variables.');
  }
  return new ethers.Contract(contractAddress, abi, wallet);
}
