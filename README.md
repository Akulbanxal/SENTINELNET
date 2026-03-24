# SentinelNet 🛡️

An autonomous verification network where AI agents hire other specialized agents to verify smart contracts before executing trades.

## 🌟 Overview

SentinelNet is a **24/7 AI-powered security team** that instantly analyzes cryptocurrency tokens to determine if they're safe to trade. It's a decentralized agent marketplace that enables AI trading agents to hire specialized verification agents for smart contract auditing, liquidity analysis, and risk assessment before executing trades.

### What is SentinelNet Doing?

**In Simple Terms**: Think of SentinelNet as an automated security inspection service for crypto tokens. When you discover a new token, SentinelNet analyzes it with 3 specialized AI agents working in parallel:

```
User Discovers a Token
         ↓
SentinelNet Analyzes It
         ↓
3 Specialized AI Agents Verify It In Parallel
         ↓
Risk Report Generated
         ↓
User Decides to Trade (or Not)
```

## 🏗️ Architecture

```
┌─────────────┐
│TraderAgent  │ Discovers new token
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│Agent Marketplace│ Browse & hire agents
└──────┬──────────┘
       │
       ▼
┌──────────────────────────────┐
│  Escrow Smart Contract       │ Lock funds & manage jobs
└──────┬───────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│  Verification Agents (Parallel)        │
│  - Security Auditor                    │
│  - Liquidity Analyzer                  │
│  - Tokenomics Reviewer                 │
└──────┬─────────────────────────────────┘
       │
       ▼
┌────────────────┐
│ Report         │ On-chain reports
│ Aggregation    │
└──────┬─────────┘
       │
       ▼
┌────────────────┐
│Execute Trade   │ If risk acceptable
└────────────────┘
```

## 🤖 The Three Verification Agents

SentinelNet uses 3 specialized AI agents that work in parallel to analyze tokens:

### 1. **🔒 SecurityBot Alpha** (Security Auditor)
- **Reputation**: 95/100
- **Role**: Scans for smart contract vulnerabilities
- **Checks**:
  - Reentrancy attacks
  - Access control vulnerabilities
  - Known exploit patterns
  - Contract permissions
- **Time**: ~0.8-1.2 seconds per token

### 2. **💧 LiquidityScanner Pro** (Liquidity Analyzer)
- **Reputation**: 88/100
- **Role**: Analyzes token liquidity pools
- **Checks**:
  - Trading volume adequacy
  - Liquidity pool depth
  - Slippage calculations
  - Sufficient liquidity for safe trading
- **Time**: ~0.8-1.2 seconds per token

### 3. **📈 TokenomicsAnalyzer** (Tokenomics Reviewer)
- **Reputation**: 90/100
- **Role**: Reviews token distribution and mechanics
- **Checks**:
  - Token distribution fairness
  - Hidden supply inflation risks
  - Developer stake alignment
  - Vesting schedule validity
- **Time**: ~0.8-1.2 seconds per token

## 🎮 Dashboard Controls

The frontend dashboard provides three buttons to control the simulation:

### **Start Simulation (Backend)**
- **What it does**: Triggers automatic verification job generation every 5 seconds
- **Process**:
  - Creates random token addresses
  - All 3 agents analyze each token in parallel
  - Each agent takes 0.8-1.2 seconds
  - Generates risk scores
- **Output**: Jobs appear in dashboard showing agent progress
- **Status**: Shows "✅ Simulation started successfully"

### **Stop Simulation (Backend)**
- **What it does**: Stops automatic job generation
- **Effect**: No new jobs created, but existing jobs complete
- **Status**: Shows "✅ Simulation stopped successfully"

### **Generate Test Token (Backend)**
- **What it does**: Creates ONE verification job immediately
- **Token Address**: `0x1234567890123456789012345678901234567890`
- **Output**: Single job appears instantly for analysis
- **Status**: Shows "✅ Test token generated successfully"

## 📊 Real-Time Verification Flow

When running, jobs progress automatically:

```
Time: 0s    → Job #1 Created (SecurityBot, LiquidityScanner, TokenomicsAnalyzer start)
            ↓
Time: 0.8s  → SecurityBot Finishes → Risk Score: 45/100 (Medium Risk)
            ↓
Time: 1.2s  → LiquidityScanner Finishes → Liquidity Status: OK
            ↓
Time: 1.8s  → TokenomicsAnalyzer Finishes → Distribution: Valid
            ↓
Time: 2.0s  → Job #1 COMPLETED (All results aggregated)

Time: 5s    → Job #2 Created (cycle repeats automatically)
Time: 10s   → Job #3 Created
Time: 15s   → Job #4 Created
...
```

## 📈 Dashboard Metrics

The Live Simulation Demo displays real-time metrics:

```
┌─────────────────────────────────────────────────┐
│           Live Simulation Demo                   │
│  Watch autonomous agents verify tokens           │
├─────────────────────────────────────────────────┤
│  Active Jobs: 0      Completed: 0                │
│  Total Jobs: 0                                   │
├─────────────────────────────────────────────────┤
│  [Start Demo]  [Clear]  Speed: 0.5x 1x 2x       │
├─────────────────────────────────────────────────┤
│  [Start Simulation]  [Stop]  [Generate Test]     │
│                                                  │
│  ✅ Success/Error Messages Display Here         │
└─────────────────────────────────────────────────┘
```

**Metrics Explained**:
- **Active Jobs**: Currently processing verifications
- **Completed**: Successfully finished jobs
- **Total Jobs**: All jobs created in this session
- **Speed Control**: Slow (0.5x), Normal (1x), Fast (2x)

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- npm or yarn
- Running on localhost

### Start Everything
```bash
cd /Users/akul/Desktop/Sentinelnet
npm run start
```

This will:
1. Start the **Backend API** on `http://localhost:3001`
2. Start the **Frontend Dashboard** on `http://localhost:3000`
3. Auto-compile everything in watch mode

### Access the Dashboard
Open your browser to: **`http://localhost:3000`**

### Try the Simulation
1. Click **"Start Simulation (Backend)"**
2. Watch jobs appear automatically every 5 seconds
3. See the 3 agents working in parallel on each token
4. Click **"Stop Simulation (Backend)"** to stop
5. Click **"Generate Test Token (Backend)"** for an instant single job

## 🎯 What Happens When You Use Each Button

### ✅ Before Using Buttons
- Environment is set up with `.env.local`
- Backend runs on port 3001
- Frontend runs on port 3000
- CORS enabled for cross-origin communication

### ✅ Start Simulation (Backend)
```
Click Button
   ↓
Backend service starts auto-generation
   ↓
Every 5 seconds: 1 new job created
   ↓
3 agents analyze token in parallel
   ↓
Job completes in ~2 seconds
   ↓
Dashboard updates in real-time
   ↓
Success message: "✅ Simulation started successfully"
```

### ✅ Stop Simulation (Backend)
```
Click Button
   ↓
Backend stops auto-generation
   ↓
In-flight jobs complete
   ↓
No new jobs created
   ↓
Success message: "✅ Simulation stopped successfully"
```

### ✅ Generate Test Token (Backend)
```
Click Button
   ↓
1 job created immediately with test address
   ↓
3 agents analyze it
   ↓
Dashboard shows new job
   ↓
Success message: "✅ Test token generated successfully"
```

## 🚀 Features

- **Autonomous Agent Discovery**: TraderAgent automatically discovers and hires verification agents
- **On-Chain Escrow**: Secure payment system with milestone-based releases
- **Reputation System**: Track agent performance and reliability
- **Multi-Agent Verification**: Parallel verification by specialized agents
- **Risk Aggregation**: AI-powered risk score calculation
- **Real-Time Dashboard**: Monitor agent activities and verification results

## 📦 Technology Stack

- **Smart Contracts**: Solidity + Hardhat
- **Agents**: Node.js + TypeScript + OpenAI
- **Backend**: Express.js + PostgreSQL
- **Frontend**: Next.js 14 + Tailwind CSS
- **Blockchain**: Ethereum (testnet) + ethers.js
- **Testing**: Hardhat, Jest, Mocha

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask wallet
- Alchemy or Infura API key

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/sentinelnet.git
cd sentinelnet

# Install dependencies for all packages
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Compile smart contracts
cd contracts
npm run compile

# Deploy contracts to testnet
npm run deploy:sepolia

# Start the backend
cd ../backend
npm run dev

# Start the frontend (in another terminal)
cd ../frontend
npm run dev
```

## 📁 Project Structure

```
sentinelnet/
├── contracts/          # Solidity smart contracts
│   ├── AgentMarketplace.sol
│   ├── EscrowContract.sol
│   └── ReputationRegistry.sol
├── agents/            # AI agent implementations
│   ├── trader/        # Main trading agent
│   ├── security/      # Security verification agent
│   ├── liquidity/     # Liquidity analysis agent
│   └── tokenomics/    # Tokenomics review agent
├── analysis/          # Analysis modules
│   ├── contract-scanner/
│   ├── liquidity-checker/
│   └── risk-aggregator/
├── backend/           # Express API server
│   ├── routes/
│   ├── services/
│   └── database/
├── frontend/          # Next.js dashboard
│   ├── app/
│   ├── components/
│   └── lib/
├── scripts/           # Deployment & utility scripts
└── docs/              # Documentation
```

## 🎯 Usage

### 1. Deploy Contracts

```bash
cd contracts
npm run deploy:sepolia
```

### 2. Register Verification Agents

```bash
cd agents
npm run register:agents
```

### 3. Start the System

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Trader Agent
cd agents/trader
npm run start
```

### 4. Monitor Dashboard

Open `http://localhost:3000` to view the real-time dashboard.

## 🔑 Environment Variables

```env
# Blockchain
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/sentinelnet

# API
PORT=3001
JWT_SECRET=your_secret
```

## 🔮 Real-World Impact

In production, SentinelNet enables:

✅ **User Protection**: Automated security checks before trading new tokens  
✅ **Time Savings**: 3 parallel agents = instant verification (vs manual audits taking days)  
✅ **Decentralized Trust**: Reputation-based agent hiring system  
✅ **Agent Revenue**: Agents earn money for successful audits  
✅ **Transparent History**: All verifications recorded on blockchain  
✅ **Risk Reduction**: Protects users from scams, rug pulls, and exploits  

## 🧪 Testing

```bash
# Test smart contracts
cd contracts
npm test

# Test agents
cd agents
npm test

# Test backend
cd backend
npm test

# Run all tests
npm run test:all
```

## 📊 Demo Flow

1. **TraderAgent** discovers token: `0x1234...5678`
2. Queries **Agent Marketplace** for verification agents
3. Selects 3 agents based on reputation scores
4. Creates escrow with 0.1 ETH payment
5. Agents perform parallel verification:
   - SecurityAgent: Checks for reentrancy, access control
   - LiquidityAgent: Analyzes pool depth, volume
   - TokenomicsAgent: Reviews supply, distribution
6. Agents submit reports on-chain
7. Risk scores aggregated: `Security: 85/100, Liquidity: 70/100, Tokenomics: 90/100`
8. Overall risk: **Medium** (81.67/100)
9. Trade executed with 1% position size

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 🔗 Links

- [Documentation](./docs/README.md)
- [Smart Contract Addresses](./docs/CONTRACTS.md)
- [API Documentation](./docs/API.md)
- [Agent Protocols](./docs/AGENTS.md)

## 👥 Team

Built with ❤️ for the decentralized future.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Hardhat for development tools
- The Ethereum community

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Not audited for production use.
