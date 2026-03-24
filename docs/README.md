# SentinelNet Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contracts](#smart-contracts)
3. [AI Agents](#ai-agents)
4. [API Reference](#api-reference)
5. [Deployment Guide](#deployment-guide)

## Architecture Overview

SentinelNet is built on a modular, decentralized architecture:

### Components

1. **Smart Contracts (Ethereum)**
   - AgentMarketplace: Agent discovery and registration
   - EscrowContract: Job management and payment
   - ReputationRegistry: Agent reputation tracking

2. **AI Agents (Node.js + TypeScript)**
   - TraderAgent: Discovers tokens and orchestrates verification
   - SecurityAgent: Analyzes smart contract security
   - LiquidityAgent: Evaluates liquidity and trading risks
   - TokenomicsAgent: Reviews token distribution and economics

3. **Backend API (Express)**
   - REST API for frontend communication
   - WebSocket for real-time updates
   - Data aggregation and caching

4. **Frontend Dashboard (Next.js)**
   - Real-time monitoring
   - Agent performance metrics
   - Job history and analytics

### Data Flow

```
1. TraderAgent discovers new token
2. Queries AgentMarketplace for available agents
3. Creates job in EscrowContract with payment
4. Verification agents receive job notification
5. Each agent performs specialized analysis using AI
6. Agents submit reports on-chain
7. TraderAgent aggregates risk scores
8. Makes trade decision based on risk threshold
9. Updates displayed in real-time on dashboard
```

## Smart Contracts

### AgentMarketplace.sol

Manages agent registration and discovery.

**Key Functions:**
- `registerAgent(string name, string endpoint, uint8 agentType, uint256 price)`
- `getAgentsByType(uint8 agentType) returns (address[])`
- `updateReputation(address agent, bool success)`

### EscrowContract.sol

Handles job creation, report submission, and payments.

**Key Functions:**
- `createJob(address tokenAddress, address[] agents, uint256[] payments, uint256 deadline) payable returns (uint256)`
- `submitReport(uint256 jobId, bytes32 reportHash)`
- `getJob(uint256 jobId) returns (...)`

### ReputationRegistry.sol

Tracks agent reputation and performance.

**Key Functions:**
- `updateReputation(address agent, bool success, uint256 earnings, uint256 responseTime)`
- `getReputation(address agent) returns (ReputationData)`
- `addReview(address agent, uint256 jobId, uint8 rating, string comment)`

## AI Agents

### TraderAgent

**Responsibilities:**
- Monitor blockchain for new token deployments
- Query marketplace for verification agents
- Create escrow jobs with appropriate budget
- Aggregate risk scores from reports
- Execute trades based on risk threshold

**Configuration:**
```typescript
PRIVATE_KEY=trader_wallet_private_key
AGENT_MARKETPLACE_ADDRESS=0x...
ESCROW_CONTRACT_ADDRESS=0x...
```

### SecurityAgent

**Analysis Areas:**
- Reentrancy vulnerabilities
- Access control
- Integer overflow/underflow
- External calls
- Selfdestruct functionality

**AI Model:** GPT-4 Turbo

### LiquidityAgent

**Analysis Areas:**
- Total liquidity depth
- Trading volume
- Holder distribution
- Liquidity lock status
- Slippage estimates

### TokenomicsAgent

**Analysis Areas:**
- Token supply and distribution
- Vesting schedules
- Transfer taxes
- Utility mechanisms
- Governance structure

## API Reference

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### GET /agents
Returns list of all registered agents.

**Query Parameters:**
- `type` (optional): Filter by agent type
- `minReputation` (optional): Minimum reputation score

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "address": "0x...",
      "name": "SecurityBot Alpha",
      "type": "Security",
      "reputationScore": 8750,
      "totalJobs": 42,
      "successfulJobs": 40,
      "pricePerVerification": "0.01",
      "isActive": true
    }
  ],
  "count": 3
}
```

#### GET /jobs/:id
Get specific job details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tokenAddress": "0x...",
    "status": "completed",
    "riskScore": 82,
    "agents": ["SecurityBot", "LiquidityScanner", "TokenomicsAnalyzer"],
    "totalBudget": "0.037"
  }
}
```

#### GET /analytics/overview
System-wide analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAgents": 3,
    "activeAgents": 3,
    "totalJobs": 42,
    "completedJobs": 40,
    "averageRiskScore": 86.5
  }
}
```

## Deployment Guide

### Prerequisites

- Node.js 18+
- Ethereum wallet with testnet ETH
- Alchemy/Infura API key
- OpenAI API key

### Step 1: Clone and Install

```bash
git clone https://github.com/yourusername/sentinelnet.git
cd sentinelnet
npm run install:all
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with your keys
```

### Step 3: Deploy Smart Contracts

```bash
cd contracts
npm run deploy:sepolia
```

Copy contract addresses to `.env`.

### Step 4: Register Agents

```bash
cd ../agents
npm run register:agents
```

### Step 5: Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Security Agent
cd agents
npm run start:security

# Terminal 4: Liquidity Agent
npm run start:liquidity

# Terminal 5: Tokenomics Agent
npm run start:tokenomics

# Terminal 6: Trader Agent
npm run start:trader
```

### Step 6: Access Dashboard

Open `http://localhost:3000` in your browser.

## Configuration

### Gas Optimization

Contracts are optimized with:
- Solidity 0.8.20
- Optimizer runs: 200
- Minimal storage operations

### Security

- OpenZeppelin contracts for base functionality
- ReentrancyGuard on payment functions
- Access control on admin functions
- Rate limiting on API endpoints

### Monitoring

- Winston logging in all services
- WebSocket for real-time updates
- Error tracking and reporting

## Troubleshooting

### Issue: Agents not receiving jobs

**Solution:** Check that agent addresses match registered addresses in marketplace.

### Issue: Frontend not updating

**Solution:** Verify WebSocket connection and backend is running.

### Issue: Transaction failures

**Solution:** Ensure sufficient gas and testnet ETH balance.

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/sentinelnet/issues
- Documentation: https://docs.sentinelnet.io
- Discord: https://discord.gg/sentinelnet
