# SentinelNet Smart Contracts

Complete smart contract layer for the SentinelNet autonomous verification network.

## 📋 Contracts Overview

### Core Contracts

#### 1. **ReputationRegistry** 
*Tracks agent reputation and performance metrics*

- Stores agent profiles with reputation scores (0-10000)
- Tracks job success rates and total earnings
- Manages agent verification status
- Allows authorized updaters to modify reputation
- Provides reputation-weighted agent discovery

**Key Functions:**
- `initializeReputation()` - Initialize new agent
- `updateReputation()` - Update agent score after job completion
- `addReview()` - Add review from client
- `getReputation()` - Get agent reputation data

#### 2. **AuditRegistry** 
*Stores and manages verification reports from agents*

- Comprehensive risk scoring system (Security, Liquidity, Tokenomics, Market, Technical)
- Audit report submission and finalization workflow
- Token risk profile aggregation across multiple audits
- Blacklist/whitelist functionality for tokens
- IPFS integration for detailed reports

**Key Functions:**
- `submitAuditReport()` - Submit new audit report with risk scores
- `finalizeReport()` - Finalize report (auditor only)
- `isTokenSafe()` - Check if token meets safety threshold
- `blacklistToken()` - Blacklist dangerous tokens
- `getTokenAudits()` - Get all audits for a token

**Risk Scoring:**
- Security Score: 0-100 (smart contract vulnerabilities)
- Liquidity Score: 0-100 (trading volume and depth)
- Tokenomics Score: 0-100 (token distribution and economics)
- Overall Score: Weighted average (Security 40%, Liquidity 30%, Tokenomics 30%)
- Minimum safe score: 60
- Consensus threshold: 3 audits

#### 3. **AgentMarketplace**
*Enables agent discovery and hiring*

- Agent registration with specialization types
- Search agents by capability (Security, Liquidity, Tokenomics)
- Reputation-based agent ranking
- Job creation with automatic agent discovery
- Integration with ReputationRegistry

**Key Functions:**
- `registerAgent()` - Register as verification agent
- `getAgentsByType()` - Find agents by specialization
- `updateReputation()` - Update agent reputation after jobs

#### 4. **AgentEscrow**
*Secure agent-to-agent payment system*

- ETH and ERC20 token support
- Milestone-based payments
- Dispute resolution with arbitrator role
- Automatic payment release on completion
- Platform fee collection (default 2.5%)

**Key Functions:**
- `createEscrowETH()` - Create escrow with ETH payment
- `createEscrowERC20()` - Create escrow with token payment
- `addMilestone()` - Add payment milestones
- `releasePayment()` - Release payment to provider
- `raiseDispute()` - Raise dispute for arbitration
- `resolveDispute()` - Arbitrator resolves dispute

**Escrow Lifecycle:**
1. Requester creates escrow and locks payment
2. Optionally add milestones before work starts
3. Provider starts work
4. Provider completes work or milestones
5. Requester releases payment or dispute is raised
6. Arbitrator resolves disputes if needed

#### 5. **EscrowContract** (Legacy)
*Original escrow implementation for job payments*

- Job-based escrow with multiple agents
- Report submission tracking
- Payment distribution to multiple providers
- Maintains backward compatibility

#### 6. **TradeExecutor**
*Executes trades only if risk score meets threshold*

- Integration with AuditRegistry for safety checks
- Simulation mode for testing (default enabled)
- Risk threshold configuration (default: 60/100 minimum)
- Automatic approval/rejection based on audits
- Batch trade execution support
- Emergency stop functionality

**Key Functions:**
- `createTradeOrder()` - Create new trade order with auto risk-check
- `executeTrade()` - Execute approved trade (simulation or real)
- `batchExecuteTrades()` - Execute multiple trades
- `manuallyApproveTrade()` - Risk manager override
- `updateRiskThreshold()` - Configure safety thresholds
- `toggleSimulationMode()` - Switch between simulation and real trading

**Trade Lifecycle:**
1. Trader creates trade order
2. Automatic risk check against AuditRegistry
3. If risk score >= threshold → Approved, else → Rejected
4. Approved trades can be executed before deadline
5. Execution tracked with statistics

**Risk Management:**
- Minimum safe score: 60/100 (configurable)
- Warning score: 75/100 (configurable)
- Requires minimum 3 audits for consensus
- Checks for blacklisted tokens
- Max trade amount limit (default: 100 ETH)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SentinelNet Contracts                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐    ┌─────────────────┐                 │
│  │ ReputationReg  │◄───┤ AgentMarketplace│                 │
│  │   (Scoring)    │    │   (Discovery)   │                 │
│  └────────────────┘    └─────────────────┘                 │
│          ▲                                                   │
│          │                                                   │
│  ┌───────┴────────┐    ┌─────────────────┐                │
│  │  AgentEscrow   │    │  AuditRegistry  │                │
│  │   (Payments)   │    │   (Reports)     │                │
│  └────────────────┘    └────────┬────────┘                │
│                                  │                          │
│                         ┌────────▼────────┐                │
│                         │  TradeExecutor  │                │
│                         │  (Execution)    │                │
│                         └─────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment

### Prerequisites

```bash
npm install
```

### Environment Setup

Create `.env` file:

```env
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
PLATFORM_WALLET=your_platform_wallet_address
```

### Deploy to Network

```bash
# Local Hardhat network
npx hardhat run scripts/deployAll.js --network localhost

# Sepolia testnet
npx hardhat run scripts/deployAll.js --network sepolia

# Mainnet (after audit!)
npx hardhat run scripts/deployAll.js --network mainnet
```

### Deployment Output

The script will:
1. Deploy all 6 contracts
2. Configure roles and permissions
3. Save deployment info to `deployments/` folder
4. Display verification commands
5. Show next steps

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
# Test AuditRegistry
npx hardhat test test/AuditRegistry.test.js

# Test AgentEscrow
npx hardhat test test/AgentEscrow.test.js

# Test TradeExecutor
npx hardhat test test/TradeExecutor.test.js

# Test with coverage
npx hardhat coverage
```

### Test Coverage

Current coverage:
- ReputationRegistry: 95%+
- AuditRegistry: 90%+
- AgentMarketplace: 95%+
- AgentEscrow: 95%+
- TradeExecutor: 90%+
- EscrowContract: 90%+

## 🔐 Security Features

### Access Control
- Role-based permissions (OpenZeppelin AccessControl)
- Admin, Agent, Auditor, Trader, Risk Manager roles
- Multi-signature recommended for admin functions

### Reentrancy Protection
- ReentrancyGuard on all payable functions
- Checks-Effects-Interactions pattern
- SafeERC20 for token transfers

### Gas Optimization
- Efficient storage patterns
- Batch operations support
- Event emission for off-chain indexing

### Audit Recommendations
- ✅ Use OpenZeppelin battle-tested contracts
- ✅ Comprehensive test coverage
- ✅ Role-based access control
- ✅ Reentrancy guards
- ⚠️ Formal audit recommended before mainnet
- ⚠️ Consider timelock for admin functions
- ⚠️ Multi-signature wallet for governance

## 📊 Gas Costs (Estimated)

| Function | Gas Cost |
|----------|----------|
| Register Agent | ~100,000 |
| Submit Audit Report | ~200,000 |
| Create Escrow (ETH) | ~150,000 |
| Release Payment | ~80,000 |
| Create Trade Order | ~120,000 |
| Execute Trade (simulation) | ~100,000 |

*Costs vary based on network congestion and data size*

## 🔗 Contract Interactions

### Example: Complete Agent Workflow

```solidity
// 1. Register agent
agentMarketplace.registerAgent(
    AgentType.Security,
    "ipfs://QmProfile...",
    "Security audit specialist"
);

// 2. Submit audit report
auditRegistry.submitAuditReport(
    jobId,
    tokenAddress,
    riskScores,
    findings,
    "ipfs://QmReport..."
);

// 3. Get paid via escrow
agentEscrow.completeWork(escrowId);
agentEscrow.releasePayment(escrowId);
```

### Example: Trade Execution Flow

```solidity
// 1. Create trade order (auto risk-check)
uint256 orderId = tradeExecutor.createTradeOrder(
    tokenAddress,
    TradeDirection.Buy,
    amount,
    expectedPrice,
    slippage,
    deadline
);

// 2. If approved, execute trade
tradeExecutor.executeTrade(orderId);

// 3. Check if token is safe (manual check)
(bool isSafe, uint8 score) = auditRegistry.isTokenSafe(tokenAddress);
```

## 🛠️ Development

### Compile Contracts

```bash
npx hardhat compile
```

### Run Local Node

```bash
npx hardhat node
```

### Console Interaction

```bash
npx hardhat console --network localhost
```

### Generate Documentation

```bash
npx hardhat docgen
```

## 📝 Events

All contracts emit comprehensive events for off-chain tracking:

**AuditRegistry:**
- `AuditReportSubmitted`
- `ReportFinalized`
- `TokenProfileUpdated`
- `TokenBlacklisted`

**AgentEscrow:**
- `EscrowCreated`
- `MilestoneCompleted`
- `PaymentReleased`
- `DisputeRaised`

**TradeExecutor:**
- `TradeOrderCreated`
- `TradeApproved`
- `TradeExecuted`
- `TradeRejected`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- Documentation: `/docs/CONTRACTS.md`
- Issues: GitHub Issues
- Discord: discord.gg/sentinelnet

## ⚠️ Disclaimers

- **Testnet Only**: Current deployment is for testnet use
- **No Audit**: Contracts have not been formally audited
- **Use at Own Risk**: Not recommended for mainnet without audit
- **Simulation Mode**: TradeExecutor defaults to simulation mode
- **Educational Purpose**: Primarily for hackathon/educational use

---

**Built with ❤️ for the SentinelNet project**
