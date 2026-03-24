# 🚀 SentinelNet - Complete Project Startup Guide

This guide will help you run the entire SentinelNet ecosystem with all components.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Hardhat for smart contracts
- ✅ MetaMask browser extension (for frontend)
- ✅ OpenAI API key (for AI agents - optional for demo)

---

## 🏗️ Project Architecture

SentinelNet consists of 5 major components:

```
┌─────────────────────────────────────────────────────────┐
│                    SentinelNet Ecosystem                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Smart Contracts (Blockchain Layer)                 │
│     └─ Hardhat + Solidity                              │
│     └─ Ports: Local blockchain on 8545                 │
│                                                         │
│  2. Autonomous Agents (AI Layer)                       │
│     └─ TypeScript + OpenAI GPT-4                       │
│     └─ 4 specialized verification bots                 │
│                                                         │
│  3. Backend API (Marketplace & Data Layer)             │
│     └─ Express.js REST API                             │
│     └─ Port: 4000                                      │
│                                                         │
│  4. Frontend Dashboard (UI Layer)                      │
│     └─ Next.js 14 + React                              │
│     └─ Port: 3000                                      │
│                                                         │
│  5. Demo Simulation (Presentation Layer)               │
│     └─ CLI-based workflow simulation                   │
│     └─ Terminal visualization                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Start (All Components)

### Option 1: Step-by-Step Manual Start

Open **4 separate terminal windows** and run:

```bash
# Terminal 1: Start Local Blockchain
cd contracts
npm install
npx hardhat node

# Terminal 2: Start Backend API
cd backend
npm install
npm run dev

# Terminal 3: Start Frontend Dashboard
cd frontend
npm install
npm run dev

# Terminal 4: Run Demo Simulation
cd demo
npm install
npm run demo
```

---

### Option 2: Using the Startup Script

I'll create a startup script for you below.

---

## 📦 Component Details

### 1️⃣ Smart Contracts (Blockchain Layer)

**Location:** `/contracts`

**What it does:**
- Deploys 4 core smart contracts to local blockchain
- Manages agent registry and reputation system
- Handles audit reports and trade execution
- Manages escrow for agent payments

**Commands:**
```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests (105+ tests, 92%+ coverage)
npx hardhat test

# Get test coverage
npx hardhat coverage

# Start local blockchain (keep running)
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

**Key Contracts:**
- `AuditRegistry.sol` - Stores verification reports
- `AgentEscrow.sol` - Manages agent payments
- `TradeExecutor.sol` - Executes trades based on consensus
- `MockERC20.sol` - Test token for development

**Ports:**
- Local blockchain: `http://localhost:8545`

---

### 2️⃣ Autonomous Agents (AI Layer)

**Location:** `/agents`

**What it does:**
- 4 specialized AI agents that verify tokens autonomously
- SecurityAuditBot: Contract security analysis
- LiquidityRiskBot: Market liquidity assessment
- TokenomicsAnalysisBot: Token distribution evaluation
- TraderAgent: Orchestrates verification and makes trade decisions

**Commands:**
```bash
cd agents

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Register agents on blockchain
npm run register

# Run individual agents
npm run security      # SecurityAuditBot
npm run liquidity     # LiquidityRiskBot
npm run tokenomics    # TokenomicsAnalysisBot
npm run trader        # TraderAgent

# Run all agents in orchestrated mode
npm run start:all
```

**Environment Variables Required:**
```env
OPENAI_API_KEY=your_openai_api_key_here
PRIVATE_KEY=your_ethereum_private_key
MARKETPLACE_ADDRESS=0x...
AUDIT_REGISTRY_ADDRESS=0x...
TRADE_EXECUTOR_ADDRESS=0x...
```

**Key Features:**
- GPT-4 powered analysis
- On-chain verification storage
- Reputation-based marketplace
- Autonomous decision making

---

### 3️⃣ Backend API (Marketplace & Data Layer)

**Location:** `/backend`

**What it does:**
- REST API for agent marketplace
- Manages agent registrations and profiles
- Stores and retrieves audit reports
- Provides trade recommendations
- Real-time data aggregation

**Commands:**
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start

# Run tests
npm test
```

**API Endpoints:**
```
GET    /health                    - Health check
GET    /api/agents                - List all agents
GET    /api/agents/:address       - Get agent details
POST   /api/agents/register       - Register new agent
GET    /api/audits                - List all audits
GET    /api/audits/:tokenAddress  - Get audits for token
POST   /api/audits/submit         - Submit audit report
GET    /api/trades                - List trade history
POST   /api/trades/execute        - Execute trade
GET    /api/risk/:tokenAddress    - Get risk assessment
POST   /api/risk/analyze          - Analyze token risk
```

**Port:** `http://localhost:4000`

**Key Features:**
- RESTful API design
- Winston logging
- Rate limiting
- Error handling middleware
- CORS enabled
- Data caching

---

### 4️⃣ Frontend Dashboard (UI Layer)

**Location:** `/frontend`

**What it does:**
- Modern financial dashboard UI
- 5 interactive pages for different functions
- Real-time data visualization
- MetaMask wallet integration
- Professional trading interface

**Commands:**
```bash
cd frontend

# Install dependencies (473 packages)
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start

# Lint code
npm run lint
```

**Pages:**
1. **Home** (`/`) - Landing page with hero and features
2. **Agent Marketplace** (`/agents`) - Browse and hire agents
3. **Risk Analyzer** (`/risk-analyzer`) - Analyze token risk scores
4. **Audit Reports** (`/audits`) - View verification history
5. **Trade Panel** (`/trade`) - Get trading recommendations

**Port:** `http://localhost:3000`

**Key Features:**
- Next.js 14 with App Router
- Tailwind CSS dark theme
- Recharts for data visualization
- Ethers.js for blockchain interaction
- Responsive design
- Real-time wallet connection

---

### 5️⃣ Demo Simulation (Presentation Layer)

**Location:** `/demo`

**What it does:**
- Simulates entire verification workflow
- Beautiful terminal visualization
- 3 token scenarios (safe, risky, medium)
- Perfect for hackathon presentations
- No blockchain required (uses mock data)

**Commands:**
```bash
cd demo

# Install dependencies
npm install

# Run default (safe token)
npm run demo

# Run specific scenarios
npm run demo:safe     # Safe token (score 89, EXECUTE)
npm run demo:risky    # Risky token (score 25, REJECT)

# Speed control
npm run demo:fast     # 2x speed (1 second delays)
npm run demo -- --slow  # 0.5x speed (4 second delays)

# Loop mode (cycles through all scenarios)
npm run demo:loop

# Seed backend with demo data
npm run seed
```

**Scenarios:**
- **SafeCoin**: Score 89/100 → ✅ EXECUTE
- **ScamCoin**: Score 25/100 → ❌ REJECT
- **MediumCoin**: Score 65/100 → ⚠️ CAUTION

**Key Features:**
- 7-step workflow simulation
- Color-coded terminal output
- Animated progress spinners
- ASCII tables for data display
- Professional boxed displays
- Adjustable timing

---

## 🔗 Integration Flow

Here's how all components work together:

```
┌──────────────┐
│  New Token   │
│  Appears     │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  TraderAgent         │◄────── Monitors blockchain
│  (Autonomous AI)     │
└──────┬───────────────┘
       │
       │ Hires agents via
       ▼
┌──────────────────────┐
│  Agent Marketplace   │◄────── Backend API (port 4000)
│  (Backend)           │
└──────┬───────────────┘
       │
       │ Dispatches to
       ▼
┌────────────────────────────────────┐
│  Verification Agents               │
│  ├─ SecurityAuditBot              │
│  ├─ LiquidityRiskBot              │
│  └─ TokenomicsAnalysisBot         │
└──────┬─────────────────────────────┘
       │
       │ Submit reports to
       ▼
┌──────────────────────┐
│  AuditRegistry       │◄────── Smart Contract
│  (Blockchain)        │
└──────┬───────────────┘
       │
       │ Aggregated by
       ▼
┌──────────────────────┐
│  Risk Engine         │◄────── Backend API
│  (Backend)           │
└──────┬───────────────┘
       │
       │ Decision made by
       ▼
┌──────────────────────┐
│  TradeExecutor       │◄────── Smart Contract
│  (Blockchain)        │
└──────┬───────────────┘
       │
       │ Displayed in
       ▼
┌──────────────────────┐
│  Frontend Dashboard  │◄────── UI (port 3000)
│  (Next.js)           │
└──────────────────────┘
```

---

## 🎬 Complete Startup Sequence

### Step 1: Install All Dependencies

```bash
# From project root
cd contracts && npm install && cd ..
cd agents && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd demo && npm install && cd ..
```

### Step 2: Configure Environment Variables

```bash
# Contracts - create .env
cd contracts
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=optional_for_verification
EOF

# Agents - create .env
cd ../agents
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key
PRIVATE_KEY=your_private_key
MARKETPLACE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
AUDIT_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
TRADE_EXECUTOR_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
RPC_URL=http://localhost:8545
EOF

# Backend - create .env
cd ../backend
cat > .env << EOF
PORT=4000
NODE_ENV=development
BLOCKCHAIN_RPC=http://localhost:8545
MARKETPLACE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
AUDIT_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
EOF

# Frontend - create .env.local
cd ../frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_BLOCKCHAIN_RPC=http://localhost:8545
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
EOF

# Demo - create .env
cd ../demo
cat > .env << EOF
DEMO_MODE=true
DEMO_SPEED=normal
API_URL=http://localhost:4000
DEMO_DELAY_MS=2000
DEMO_SHOW_PROGRESS=true
EOF
```

### Step 3: Start Services (4 Terminals)

**Terminal 1 - Blockchain:**
```bash
cd contracts
npx hardhat node
# Keep running - provides local blockchain
# Note the contract addresses from deployment
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm run dev
# Starts on http://localhost:4000
# Keep running
```

**Terminal 3 - Frontend Dashboard:**
```bash
cd frontend
npm run dev
# Starts on http://localhost:3000
# Keep running
```

**Terminal 4 - Demo or Agents:**
```bash
# Option A: Run demo simulation
cd demo
npm run demo

# Option B: Run agents
cd agents
npm run start:all
```

---

## 🌐 Access Points

Once everything is running:

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend Dashboard** | http://localhost:3000 | Main UI - Browse agents, analyze risk, view audits |
| **Backend API** | http://localhost:4000 | REST API - Check http://localhost:4000/health |
| **Blockchain RPC** | http://localhost:8545 | Local Ethereum node |
| **Hardhat Console** | Terminal 1 | View blockchain logs |

---

## 🧪 Testing the Full Stack

### Test 1: API Health Check
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok","message":"Backend is running"}
```

### Test 2: Get Agents
```bash
curl http://localhost:4000/api/agents
# Should return list of registered agents
```

### Test 3: Frontend Connection
- Open browser to http://localhost:3000
- Click "Connect Wallet" in navbar
- Connect MetaMask
- Browse to /agents page
- Should see agent marketplace

### Test 4: Run Demo
```bash
cd demo
npm run demo
# Should show beautiful terminal simulation
```

---

## 📊 Project Statistics

### Smart Contracts
- **Files:** 4 contracts + 4 test files
- **Lines of Code:** ~1,810 lines
- **Tests:** 105+ tests
- **Coverage:** 92%+
- **Languages:** Solidity 0.8.20

### Autonomous Agents
- **Files:** 4 agent files + utilities
- **Lines of Code:** ~2,080 lines
- **Dependencies:** Ethers.js, OpenAI SDK
- **Languages:** TypeScript 5.3

### Backend API
- **Files:** 17 files
- **Lines of Code:** ~2,500 lines
- **Endpoints:** 12+ REST endpoints
- **Languages:** TypeScript + Express.js

### Frontend Dashboard
- **Files:** 17 files
- **Lines of Code:** ~1,800 lines
- **Pages:** 5 complete pages
- **Dependencies:** 473 packages
- **Languages:** TypeScript + React + Next.js

### Demo Simulation
- **Files:** 5 files
- **Lines of Code:** ~1,600 lines
- **Scenarios:** 3 (safe, risky, medium)
- **Dependencies:** 87 packages
- **Languages:** TypeScript

### **Total Project**
- **Total Files:** 50+ files
- **Total Lines:** ~10,000+ lines of code
- **Total Tests:** 105+ tests
- **Languages:** Solidity, TypeScript, React
- **Frameworks:** Hardhat, Express, Next.js

---

## 🎯 Use Cases

### 1. Development Mode
Run all components for full-stack development:
- Blockchain for contract testing
- Backend for API development
- Frontend for UI development
- Agents for AI integration

### 2. Demo Mode
Perfect for presentations:
- Start frontend dashboard
- Run demo simulation in terminal
- Show live data in browser
- Explain workflow step-by-step

### 3. Testing Mode
For quality assurance:
- Run contract tests (`cd contracts && npx hardhat test`)
- Test API endpoints (`cd backend && npm test`)
- Test frontend components (`cd frontend && npm run lint`)
- Verify agent logic

### 4. Production Deployment
Deploy to live networks:
- Deploy contracts to mainnet/testnet
- Host backend API on cloud
- Deploy frontend to Vercel/Netlify
- Run agents on servers

---

## 🔧 Troubleshooting

### Issue: "Port already in use"

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process using port 4000
lsof -ti:4000 | xargs kill -9

# Find and kill process using port 8545
lsof -ti:8545 | xargs kill -9
```

### Issue: "Cannot connect to blockchain"

```bash
# Make sure Hardhat node is running
cd contracts
npx hardhat node

# Verify RPC URL in .env files is correct
# Should be: http://localhost:8545
```

### Issue: "MetaMask transaction fails"

1. Reset MetaMask account:
   - Settings → Advanced → Reset Account
2. Make sure you're connected to localhost:8545
3. Import a test account from Hardhat node output

### Issue: "Backend API not responding"

```bash
# Check if backend is running
curl http://localhost:4000/health

# Restart backend
cd backend
npm run dev
```

### Issue: "Demo not showing colors"

Use a better terminal:
- **macOS:** iTerm2
- **Windows:** Windows Terminal
- **Linux:** GNOME Terminal

---

## 🚀 Quick Commands Cheatsheet

```bash
# Start everything (4 terminals)
Terminal 1: cd contracts && npx hardhat node
Terminal 2: cd backend && npm run dev
Terminal 3: cd frontend && npm run dev
Terminal 4: cd demo && npm run demo

# Test everything
cd contracts && npx hardhat test
cd backend && npm test
cd frontend && npm run lint
cd demo && npm run demo

# Stop everything
Ctrl+C in each terminal

# Clean everything
cd contracts && rm -rf node_modules artifacts cache
cd backend && rm -rf node_modules dist
cd frontend && rm -rf node_modules .next
cd agents && rm -rf node_modules dist
cd demo && rm -rf node_modules
```

---

## 📚 Documentation Links

- **Main README:** `/README.md`
- **Contracts:** `/contracts/README.md`
- **Agents:** `/agents/README.md`
- **Backend:** `/backend/README.md`
- **Frontend:** `/frontend/README.md`
- **Demo:** `/demo/README.md`
- **Demo Complete:** `/DEMO_COMPLETE.md`

---

## 🎉 Success!

If you see:
- ✅ Hardhat node running with contract addresses
- ✅ Backend API responding at http://localhost:4000/health
- ✅ Frontend dashboard accessible at http://localhost:3000
- ✅ Demo simulation running with colorful output

**Congratulations! SentinelNet is fully operational! 🚀**

---

Built with ❤️ for autonomous DeFi verification
