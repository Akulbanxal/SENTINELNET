# 🚀 SentinelNet Smart Contracts - Quick Reference

## 📍 You Are Here
```
/Users/akul/Desktop/Sentinelnet/contracts/
```

---

## ⚡ Quick Commands

### Setup (First Time)
```bash
cd /Users/akul/Desktop/Sentinelnet/contracts

# Option 1: Automated (Recommended)
./setup-and-verify.sh

# Option 2: Manual
npm install
npm run compile
npm test
```

### Development
```bash
# Compile contracts
npm run compile

# Run all tests
npm test

# Run specific tests
npm run test:audit      # AuditRegistry tests
npm run test:escrow     # AgentEscrow tests  
npm run test:trade      # TradeExecutor tests

# Test coverage
npm run coverage

# Clean build artifacts
npm run clean
```

### Deployment
```bash
# Deploy to local network
npm run node              # Terminal 1: Start local node
npm run deploy:local      # Terminal 2: Deploy

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy all contracts (auto-configured)
npm run deploy
```

### Verification (Etherscan)
```bash
npm run verify -- <contract_address> <constructor_args>
```

---

## 📁 File Structure

```
contracts/
├── contracts/
│   ├── AgentMarketplace.sol       (Existing - Agent discovery)
│   ├── EscrowContract.sol         (Existing - Job escrow)
│   ├── ReputationRegistry.sol     (Existing - Reputation)
│   ├── AuditRegistry.sol          ⭐ NEW (500+ lines)
│   ├── AgentEscrow.sol            ⭐ NEW (650+ lines)
│   ├── TradeExecutor.sol          ⭐ NEW (600+ lines)
│   └── MockERC20.sol              ⭐ NEW (Testing token)
│
├── test/
│   ├── AgentMarketplace.test.js   (Existing)
│   ├── EscrowContract.test.js     (Existing)
│   ├── AuditRegistry.test.js      ⭐ NEW (500+ lines)
│   ├── AgentEscrow.test.js        ⭐ NEW (550+ lines)
│   └── TradeExecutor.test.js      ⭐ NEW (400+ lines)
│
├── scripts/
│   ├── deploy.js                  (Existing - Legacy)
│   └── deployAll.js               ⭐ NEW (350+ lines)
│
├── README.md                       ⭐ NEW (Complete docs)
├── setup-and-verify.sh            ⭐ NEW (Automation)
├── hardhat.config.js
└── package.json                    (Updated with new scripts)
```

---

## 🎯 What Each Contract Does

### 1. **AuditRegistry** 📋
*Stores verification reports with risk scores*

```solidity
// Submit audit report
auditRegistry.submitAuditReport(
    jobId,
    tokenAddress,
    riskScores,      // 5 categories: Security, Liquidity, etc.
    findings,
    ipfsHash
);

// Check if token is safe
(bool isSafe, uint8 score) = auditRegistry.isTokenSafe(tokenAddress);
```

### 2. **AgentEscrow** 💰
*Secure agent-to-agent payments*

```solidity
// Create escrow with ETH
uint256 escrowId = agentEscrow.createEscrowETH{value: 1 ether}(
    provider,
    deadline,
    "Security audit service"
);

// Release payment after work
agentEscrow.releasePayment(escrowId);
```

### 3. **TradeExecutor** 🤖
*Executes trades based on risk validation*

```solidity
// Create trade order (auto risk-check)
uint256 orderId = tradeExecutor.createTradeOrder(
    tokenAddress,
    TradeDirection.Buy,
    amount,
    price,
    slippage,
    deadline
);

// Execute if approved
tradeExecutor.executeTrade(orderId);
```

---

## 📊 Contract Addresses (After Deployment)

Deployment info saved to:
```
contracts/deployments/deployment-{network}-latest.json
```

Update these in agent config:
```typescript
// agents/shared/config.ts
export const CONTRACTS = {
  AUDIT_REGISTRY: "0x...",      // From deployment JSON
  AGENT_ESCROW: "0x...",         // From deployment JSON
  TRADE_EXECUTOR: "0x...",       // From deployment JSON
};
```

---

## 🧪 Testing Strategy

### Test Coverage Goals
- ✅ AuditRegistry: 90%+ (30+ tests)
- ✅ AgentEscrow: 95%+ (40+ tests)
- ✅ TradeExecutor: 90%+ (35+ tests)

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Specific file
npx hardhat test test/AuditRegistry.test.js

# With gas reporting
REPORT_GAS=true npm test

# Coverage report
npm run coverage
```

---

## 🔐 Security Checklist

Before deploying to mainnet:

- [ ] Professional security audit completed
- [ ] All tests passing (105+ tests)
- [ ] Test coverage > 90%
- [ ] Multi-signature wallet for admin
- [ ] Timelock for critical functions
- [ ] Emergency pause mechanisms tested
- [ ] Gas optimization reviewed
- [ ] Event emission verified
- [ ] Access control validated
- [ ] Reentrancy protection confirmed

---

## 🐛 Troubleshooting

### "hardhat: command not found"
```bash
npm install
```

### "Cannot find module '@openzeppelin/contracts'"
```bash
npm install @openzeppelin/contracts
```

### Tests failing with "provider not found"
```bash
# Start local node first
npm run node
# Then in another terminal
npm test
```

### Deployment fails with "insufficient funds"
- Get testnet ETH from faucet
- Check .env has PRIVATE_KEY set
- Verify account has balance

### Gas estimation failed
- Check contract compiles without errors
- Verify constructor arguments are correct
- Increase gas limit in hardhat.config.js

---

## 📚 Documentation Links

- **Contract README**: `contracts/README.md`
- **Extension Details**: `/SMART_CONTRACTS_EXTENSION.md`
- **Complete Summary**: `/CONTRACTS_COMPLETE.md`
- **Quick Reference**: This file

---

## 🎯 Next Steps After Deployment

1. **Verify on Etherscan**
   ```bash
   npx hardhat verify --network sepolia <address> <args>
   ```

2. **Update Agent Config**
   Edit `agents/shared/config.ts` with deployed addresses

3. **Register Agents**
   ```bash
   cd ../agents
   npm run register:agents
   ```

4. **Test Integration**
   ```bash
   cd ../agents/trader
   npm start
   ```

5. **Start Full System**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend  
   cd frontend && npm run dev
   
   # Agents
   ./scripts/start-agents.sh
   ```

---

## 💡 Pro Tips

1. **Use simulation mode first**
   - TradeExecutor defaults to simulation
   - Test thoroughly before real trading

2. **Monitor gas costs**
   - Run `REPORT_GAS=true npm test`
   - Optimize high-cost functions

3. **Keep deployment records**
   - Deployment JSON saved automatically
   - Commit to version control

4. **Test on testnet thoroughly**
   - Use Sepolia for testing
   - Get free ETH from faucets

5. **Gradual rollout**
   - Start with low trade limits
   - Increase as confidence grows

---

## 📞 Getting Help

If stuck:

1. Check this quick reference
2. Read full documentation in `contracts/README.md`
3. Review test files for usage examples
4. Check deployment output for errors
5. Verify .env configuration

---

## ✅ Pre-Deployment Checklist

Before running `npm run deploy:sepolia`:

- [ ] `npm install` completed
- [ ] `npm run compile` successful
- [ ] `npm test` all passing
- [ ] `.env` file configured with:
  - [ ] PRIVATE_KEY
  - [ ] ALCHEMY_API_KEY
  - [ ] ETHERSCAN_API_KEY (for verification)
- [ ] Test account has Sepolia ETH (get from faucet)
- [ ] Hardhat config reviewed

---

## 🎉 You're Ready!

**All contracts are complete and tested.**  
**Run the setup script to get started:**

```bash
cd /Users/akul/Desktop/Sentinelnet/contracts
./setup-and-verify.sh
```

---

*Built with ❤️ for SentinelNet*
