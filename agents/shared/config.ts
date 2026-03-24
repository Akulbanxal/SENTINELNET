import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export interface ContractAddresses {
  agentMarketplace: string;
  escrowContract: string;
  reputationRegistry: string;
  auditRegistry: string;
  agentEscrow: string;
  tradeExecutor: string;
}

export function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'http://localhost:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getWallet(privateKey?: string): ethers.Wallet {
  const provider = getProvider();
  const key = privateKey || process.env.PRIVATE_KEY;
  
  if (!key) {
    throw new Error('Private key not found in environment variables');
  }
  
  return new ethers.Wallet(key, provider);
}

export function getContractAddresses(): ContractAddresses {
  return {
    agentMarketplace: process.env.AGENT_MARKETPLACE_ADDRESS || '',
    escrowContract: process.env.ESCROW_CONTRACT_ADDRESS || '',
    reputationRegistry: process.env.REPUTATION_REGISTRY_ADDRESS || '',
    auditRegistry: process.env.AUDIT_REGISTRY_ADDRESS || '',
    agentEscrow: process.env.AGENT_ESCROW_ADDRESS || '',
    tradeExecutor: process.env.TRADE_EXECUTOR_ADDRESS || '',
  };
}

export const AGENT_MARKETPLACE_ABI = [
  "function registerAgent(string name, string endpoint, uint8 agentType, uint256 pricePerVerification) external",
  "function getAgent(address agentAddress) external view returns (tuple(address agentAddress, string name, string endpoint, uint8 agentType, uint256 pricePerVerification, uint256 reputationScore, uint256 totalJobs, uint256 successfulJobs, bool isActive, uint256 registeredAt))",
  "function getAgentsByType(uint8 agentType) external view returns (address[])",
  "function getTopAgents(uint256 limit) external view returns (address[])",
  "function updateAgentPrice(uint256 newPrice) external",
  "function deactivateAgent() external",
  "event AgentRegistered(address indexed agentAddress, string name, uint8 agentType)",
];

export const ESCROW_CONTRACT_ABI = [
  "function createJob(address tokenAddress, address[] agents, uint256[] payments, uint256 deadline) external payable returns (uint256)",
  "function submitReport(uint256 jobId, bytes32 reportHash) external",
  "function getJob(uint256 jobId) external view returns (address client, address tokenAddress, address[] hiredAgents, uint256 totalBudget, uint256 remainingBudget, uint8 status, uint256 deadline, uint256 completedAgents)",
  "function getAgentReport(uint256 jobId, address agent) external view returns (bytes32)",
  "function hasAgentCompleted(uint256 jobId, address agent) external view returns (bool)",
  "function cancelJob(uint256 jobId) external",
  "event JobCreated(uint256 indexed jobId, address indexed client, address tokenAddress, uint256 budget)",
  "event AgentHired(uint256 indexed jobId, address indexed agent, uint256 payment)",
  "event ReportSubmitted(uint256 indexed jobId, address indexed agent, bytes32 reportHash)",
  "event PaymentReleased(uint256 indexed jobId, address indexed agent, uint256 amount)",
  "event JobCompleted(uint256 indexed jobId)",
];

export const REPUTATION_REGISTRY_ABI = [
  "function initializeReputation(address agent) external",
  "function updateReputation(address agent, bool success, uint256 earnings, uint256 responseTime) external",
  "function getReputation(address agent) external view returns (tuple(uint256 score, uint256 totalJobs, uint256 successfulJobs, uint256 failedJobs, uint256 totalEarnings, uint256 averageResponseTime, uint256 lastUpdated, bool isVerified))",
  "function getSuccessRate(address agent) external view returns (uint256)",
  "function addReview(address agent, uint256 jobId, uint8 rating, string comment) external",
  "function getAverageRating(address agent) external view returns (uint256)",
];

export enum AgentType {
  Security = 0,
  Liquidity = 1,
  Tokenomics = 2,
  General = 3,
}

export enum JobStatus {
  Created = 0,
  AgentsHired = 1,
  InProgress = 2,
  Completed = 3,
  Disputed = 4,
  Cancelled = 5,
}

// New contract ABIs
export const AUDIT_REGISTRY_ABI = [
  "function submitAuditReport(uint256 jobId, address tokenAddress, tuple(uint8 securityScore, uint8 liquidityScore, uint8 tokenomicsScore, uint8 marketScore, uint8 technicalScore, uint8 overallScore, uint8 riskLevel) riskScores, tuple(string[] criticalIssues, string[] warnings, string[] recommendations, string methodology, uint256 analysisDepth) findings, string ipfsHash) external returns (uint256)",
  "function finalizeReport(uint256 reportId) external",
  "function isTokenSafe(address tokenAddress) external view returns (bool isSafe, uint8 overallScore)",
  "function getTokenAudits(address tokenAddress) external view returns (uint256[])",
  "function getAuditReport(uint256 reportId) external view returns (uint256 reportId, uint256 jobId, address tokenAddress, address auditor, tuple(uint8 securityScore, uint8 liquidityScore, uint8 tokenomicsScore, uint8 marketScore, uint8 technicalScore, uint8 overallScore, uint8 riskLevel) riskScores, string ipfsHash, uint256 timestamp, bool isFinalized, bool disputed)",
  "event AuditReportSubmitted(uint256 indexed reportId, uint256 indexed jobId, address indexed tokenAddress, address auditor, uint8 overallScore)",
];

export const TRADE_EXECUTOR_ABI = [
  "function createTradeOrder(address tokenAddress, uint8 direction, uint256 amount, uint256 expectedPrice, uint256 slippage, uint256 deadline) external returns (uint256)",
  "function executeTrade(uint256 orderId) external returns (tuple(uint256 orderId, bool success, uint256 executedAmount, uint256 executedPrice, uint256 totalCost, uint256 gasUsed, string message))",
  "function getTradeOrder(uint256 orderId) external view returns (tuple(uint256 orderId, address trader, address tokenAddress, uint8 direction, uint256 amount, uint256 expectedPrice, uint256 slippage, uint256 deadline, uint8 status, uint256 createdAt, uint256 executedAt, uint256 actualPrice, uint8 riskScore, bool isSimulation, string rejectionReason))",
  "function isTokenSafe(address tokenAddress) external view returns (bool isSafe, uint8 overallScore)",
  "event TradeOrderCreated(uint256 indexed orderId, address indexed trader, address indexed tokenAddress, uint8 direction, uint256 amount)",
  "event TradeApproved(uint256 indexed orderId, uint8 riskScore)",
  "event TradeRejected(uint256 indexed orderId, string reason, uint8 riskScore)",
  "event TradeExecuted(uint256 indexed orderId, address indexed trader, address indexed tokenAddress, uint256 amount, uint256 price, bool isSimulation)",
];

export enum RiskLevel {
  VeryLow = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export enum TradeDirection {
  Buy = 0,
  Sell = 1,
}

export enum TradeStatus {
  Pending = 0,
  Approved = 1,
  Executed = 2,
  Rejected = 3,
  Failed = 4,
  Cancelled = 5,
}
