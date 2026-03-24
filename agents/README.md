# SentinelNet Agents

Autonomous AI agents for decentralized token verification and trading.

## Overview

SentinelNet consists of four specialized AI agents that work together to verify token safety before executing trades:

1. **SecurityAuditBot** - Detects smart contract vulnerabilities
2. **LiquidityRiskBot** - Analyzes DEX liquidity and rug pull risks
3. **TokenomicsAnalysisBot** - Examines supply distribution and whale concentration
4. **TraderAgent** - Orchestrates verification and executes trades

## Architecture

```
TraderAgent (Orchestrator)
├── Discovers new tokens
├── Hires verification agents via AgentMarketplace
├── Creates escrow payments via AgentEscrow
├── Aggregates risk reports
└── Executes trades via TradeExecutor

SecurityAuditBot
├── Fetches contract source code
├── Detects reentrancy vulnerabilities
├── Identifies dangerous owner privileges
├── Finds unlimited minting capabilities
├── Uses AI for deep analysis
└── Submits reports to AuditRegistry

LiquidityRiskBot
├── Queries Uniswap V2 pairs
├── Calculates liquidity depth
├── Analyzes volume-to-liquidity ratio
├── Checks liquidity locks
├── Calculates rug pull risk
└── Submits reports to AuditRegistry

TokenomicsAnalysisBot
├── Analyzes holder distribution
├── Calculates concentration risk
├── Detects whale dominance
├── Examines contract holdings
└── Submits reports to AuditRegistry
```

## Smart Contract Integration

The agents interact with SentinelNet smart contracts:

- **AgentMarketplace** (`0x...`): Agent registry and discovery
- **AgentEscrow** (`0x...`): Agent-to-agent payments with milestones
- **AuditRegistry** (`0x...`): Risk report storage and consensus
- **TradeExecutor** (`0x...`): Risk-based trade execution

## Setup

### Prerequisites

- Node.js 18+
- TypeScript 5.3+
- Ethereum wallet with Sepolia ETH
- OpenAI API key (for AI analysis)
- Etherscan API key (for source code verification)

### Installation

```bash
cd agents
npm install
```

### Configuration

Create a `.env` file in the `agents/` directory:

```env
# Ethereum Network
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# Contract Addresses (from deployment)
AGENT_MARKETPLACE_ADDRESS=0x...
AGENT_ESCROW_ADDRESS=0x...
AUDIT_REGISTRY_ADDRESS=0x...
TRADE_EXECUTOR_ADDRESS=0x...

# API Keys
OPENAI_API_KEY=sk-...
ETHERSCAN_API_KEY=your_etherscan_api_key

# OpenAI Model
OPENAI_MODEL=gpt-4-turbo-preview

# Logging
LOG_LEVEL=info

# Demo Token (optional)
DEMO_TOKEN_ADDRESS=0x...
```

## Running the Agents

### Individual Agents

Run each agent separately in different terminals:

```bash
# Terminal 1: Security Audit Bot
npm run start:security

# Terminal 2: Liquidity Risk Bot
npm run start:liquidity

# Terminal 3: Tokenomics Analysis Bot
npm run start:tokenomics

# Terminal 4: Trader Agent (Orchestrator)
npm run start:trader
```

### All Agents at Once

Run all agents concurrently:

```bash
npm run start:all
```

### Development Mode with Auto-Reload

```bash
npm run dev
```

## Agent Behavior

### SecurityAuditBot

**Port:** 3001

**Triggers:**
- Listens for job assignments from TraderAgent
- Receives token address to audit

**Process:**
1. Fetches contract source code from Etherscan
2. Performs pattern-based vulnerability detection:
   - Reentrancy attacks
   - Dangerous owner privileges
   - Unlimited minting
   - Hidden/obfuscated functions
3. Uses AI for deep security analysis
4. Calculates security score (0-100)
5. Submits report to AuditRegistry

**Output:** Risk report with security score and findings

---

### LiquidityRiskBot

**Port:** 3002

**Triggers:**
- Listens for job assignments from TraderAgent
- Receives token address to analyze

**Process:**
1. Finds Uniswap V2 pair for token
2. Fetches liquidity data (reserves, LP token supply)
3. Calculates metrics:
   - Liquidity depth
   - Volume-to-liquidity ratio
   - Rug pull risk score
4. Checks if liquidity is locked
5. Submits report to AuditRegistry

**Output:** Risk report with liquidity score and metrics

---

### TokenomicsAnalysisBot

**Port:** 3003

**Triggers:**
- Listens for job assignments from TraderAgent
- Receives token address to analyze

**Process:**
1. Fetches token holder data from Etherscan
2. Analyzes distribution:
   - Top holder percentage
   - Top 10 holders percentage
   - Total holder count
3. Checks contract holdings
4. Identifies burned tokens
5. Calculates concentration risk
6. Submits report to AuditRegistry

**Output:** Risk report with tokenomics score and distribution metrics

---

### TraderAgent

**Port:** 3000

**Role:** Orchestrator

**Process:**
1. **Discovery**: Monitors for new token listings
   - Uniswap pair creation events
   - Token deployment events
   - Social signals
2. **Hiring**: Queries AgentMarketplace for available verification agents
3. **Escrow**: Creates payment jobs in AgentEscrow contract
4. **Coordination**: Notifies agents to perform verification
5. **Aggregation**: Collects reports from all three verification agents
6. **Consensus**: Checks if 3+ auditors agree (via AuditRegistry)
7. **Decision**: Applies risk thresholds:
   - Overall score ≥ 70
   - Security score ≥ 75
   - Liquidity score ≥ 65
   - Tokenomics score ≥ 60
   - Consensus required
8. **Execution**: Submits trade order to TradeExecutor if all checks pass
9. **Payment**: Releases milestone payments to verification agents

## Risk Thresholds

### TraderAgent Decision Logic

```typescript
MIN_OVERALL_SCORE = 70
MIN_SECURITY_SCORE = 75
MIN_LIQUIDITY_SCORE = 65
MIN_TOKENOMICS_SCORE = 60
REQUIRED_CONSENSUS = true
```

Trade is executed ONLY if:
- All scores meet minimum thresholds
- Consensus achieved among auditors
- Token marked as safe in AuditRegistry
- No critical issues detected

## Scoring System

### Security Score (0-100)

- **100-90**: Excellent security
- **89-75**: Good security, minor issues
- **74-60**: Moderate risks, caution advised
- **59-40**: High risk, avoid
- **<40**: Critical vulnerabilities

### Liquidity Score (0-100)

- **100-90**: Deep liquidity, low slippage
- **89-75**: Good liquidity
- **74-60**: Moderate liquidity, medium slippage
- **59-40**: Low liquidity, high risk
- **<40**: Insufficient liquidity

### Tokenomics Score (0-100)

- **100-85**: Healthy distribution
- **84-70**: Good distribution
- **69-55**: Moderate concentration
- **54-40**: High concentration, whale risk
- **<40**: Extreme concentration

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Test a Specific Token

Set `DEMO_TOKEN_ADDRESS` in `.env` and run:

```bash
npm run start:trader
```

## Monitoring

### Logs

Logs are written to `logs/` directory:
- `logs/security-audit.log`
- `logs/liquidity-risk.log`
- `logs/tokenomics-analysis.log`
- `logs/trader-agent.log`
- `logs/*-error.log` (error logs)

### Log Levels

Set `LOG_LEVEL` in `.env`:
- `debug`: Verbose logging
- `info`: Standard logging (default)
- `warn`: Warnings and errors only
- `error`: Errors only

## API Endpoints (Future)

Each agent can expose REST APIs for external integration:

### SecurityAuditBot

```
POST /audit
Body: { "tokenAddress": "0x..." }
Response: { "score": 85, "issues": [...] }
```

### LiquidityRiskBot

```
POST /analyze
Body: { "tokenAddress": "0x..." }
Response: { "score": 78, "metrics": {...} }
```

### TokenomicsAnalysisBot

```
POST /tokenomics
Body: { "tokenAddress": "0x..." }
Response: { "score": 82, "distribution": {...} }
```

## Deployment

### Production Environment

1. Deploy smart contracts to mainnet
2. Update contract addresses in `.env`
3. Fund agent wallets with ETH
4. Register agents in AgentMarketplace
5. Start agents with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Docker Deployment

```bash
docker-compose up -d
```

## Troubleshooting

### Agent Not Registering

- Check wallet has sufficient ETH
- Verify contract addresses are correct
- Check if agent is already registered

### No Reports Received

- Ensure all agents are running
- Check event listeners are active
- Verify jobs are being created in escrow

### AI Analysis Failing

- Check OpenAI API key is valid
- Verify API quota is not exceeded
- Fallback to pattern-based analysis is automatic

### Contract Interaction Errors

- Check RPC endpoint is accessible
- Verify wallet has sufficient ETH for gas
- Ensure contract addresses are deployed

## Security Considerations

⚠️ **Important Security Notes:**

1. **Private Keys**: Never commit private keys to version control
2. **API Keys**: Store API keys securely in `.env`
3. **Risk Thresholds**: Conservative thresholds reduce false positives
4. **Consensus**: Require 3+ auditors for high-confidence decisions
5. **Escrow**: Agents are paid only after work completion
6. **Rate Limiting**: Implement rate limits for external APIs

## Architecture Decisions

### Why Multi-Agent?

- **Specialization**: Each agent focuses on specific risk domain
- **Modularity**: Easy to add/remove/update individual agents
- **Redundancy**: Multiple agents provide consensus
- **Scalability**: Agents can run on different machines

### Why On-Chain Coordination?

- **Transparency**: All decisions recorded on blockchain
- **Trust**: No single point of failure
- **Incentives**: Agents paid for accurate work
- **Composability**: Other protocols can use SentinelNet

## Future Enhancements

- [ ] Support for additional DEXes (Uniswap V3, Sushiswap, etc.)
- [ ] Machine learning for pattern recognition
- [ ] Historical risk tracking and trends
- [ ] Multi-chain support (Arbitrum, Optimism, Polygon)
- [ ] Social sentiment analysis
- [ ] Contract upgrade detection
- [ ] Flash loan attack simulation
- [ ] Whale transaction monitoring
- [ ] Discord/Telegram notifications
- [ ] Web dashboard for monitoring

## Contributing

See main repo for contribution guidelines.

## License

MIT License - see LICENSE file for details

## Support

- Documentation: https://sentinelnet.docs
- Discord: https://discord.gg/sentinelnet
- GitHub Issues: https://github.com/sentinelnet/issues
