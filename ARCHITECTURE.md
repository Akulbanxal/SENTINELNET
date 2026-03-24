# 🏗️ SentinelNet System Architecture

## Complete System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           SENTINELNET ECOSYSTEM                             │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         BLOCKCHAIN LAYER (Ethereum)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐ │
│  │ AgentMarketplace   │  │   AgentEscrow      │  │   AuditRegistry      │ │
│  ├────────────────────┤  ├────────────────────┤  ├──────────────────────┤ │
│  │ • Register agents  │  │ • Create jobs      │  │ • Submit reports     │ │
│  │ • Browse agents    │  │ • Milestones       │  │ • Risk scores        │ │
│  │ • Agent reputation │  │ • Payments         │  │ • Consensus check    │ │
│  │ • Pricing info     │  │ • Disputes         │  │ • Token safety       │ │
│  └─────────┬──────────┘  └──────────┬─────────┘  └───────────┬──────────┘ │
│            │                        │                          │            │
│            └────────────────────────┼──────────────────────────┘            │
│                                     │                                       │
│                      ┌──────────────┴──────────────┐                       │
│                      │     TradeExecutor           │                       │
│                      ├─────────────────────────────┤                       │
│                      │ • Validate risk             │                       │
│                      │ • Execute trades            │                       │
│                      │ • DEX integration           │                       │
│                      │ • Order tracking            │                       │
│                      └──────────────┬──────────────┘                       │
│                                     │                                       │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
                      ┌───────────────┴──────────────┐
                      │      EVENT BUS               │
                      │  • AuditReported             │
                      │  • JobCreated                │
                      │  • JobCompleted              │
                      │  • TradeExecuted             │
                      └───────────────┬──────────────┘
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────┐
│                          AGENT LAYER (Off-Chain)                            │
├─────────────────────────────────────┼───────────────────────────────────────┤
│                                     │                                       │
│                      ┌──────────────▼──────────────┐                       │
│                      │      TraderAgent            │                       │
│                      │     (Orchestrator)          │                       │
│                      ├─────────────────────────────┤                       │
│                      │ 1. Discover tokens          │                       │
│                      │ 2. Query marketplace        │                       │
│                      │ 3. Create escrow jobs       │                       │
│                      │ 4. Aggregate reports        │                       │
│                      │ 5. Verify consensus         │                       │
│                      │ 6. Execute trades           │                       │
│                      │ 7. Release payments         │                       │
│                      └──┬─────────┬─────────┬──────┘                       │
│                         │         │         │                              │
│         ┌───────────────┘         │         └───────────────┐              │
│         │                         │                         │              │
│    ┌────▼──────────┐    ┌────────▼────────┐    ┌──────────▼──────────┐   │
│    │ SecurityAudit │    │ LiquidityRisk   │    │ TokenomicsAnalysis  │   │
│    │     Bot       │    │      Bot        │    │        Bot          │   │
│    ├───────────────┤    ├─────────────────┤    ├─────────────────────┤   │
│    │ Port: 3001    │    │ Port: 3002      │    │ Port: 3003          │   │
│    │               │    │                 │    │                     │   │
│    │ Analyzes:     │    │ Analyzes:       │    │ Analyzes:           │   │
│    │ • Reentrancy  │    │ • Liquidity     │    │ • Distribution      │   │
│    │ • Owner       │    │ • Rug pull      │    │ • Concentration     │   │
│    │ • Minting     │    │ • Locks         │    │ • Whales            │   │
│    │ • Hidden code │    │ • Volume        │    │ • Burns             │   │
│    │               │    │                 │    │                     │   │
│    │ Output:       │    │ Output:         │    │ Output:             │   │
│    │ Security      │    │ Liquidity       │    │ Tokenomics          │   │
│    │ Score 0-100   │    │ Score 0-100     │    │ Score 0-100         │   │
│    └───────┬───────┘    └────────┬────────┘    └──────────┬──────────┘   │
│            │                     │                          │              │
│            └─────────────────────┼──────────────────────────┘              │
│                                  │                                         │
│                          Reports submitted to                              │
│                            AuditRegistry                                   │
│                                  │                                         │
└──────────────────────────────────┼─────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼─────────────────────────────────────────┐
│                       EXTERNAL INTEGRATIONS                                │
├──────────────────────────────────┼─────────────────────────────────────────┤
│                                  │                                         │
│  ┌──────────────┐   ┌────────────▼──────┐   ┌──────────────────┐        │
│  │   Etherscan  │   │   OpenAI GPT-4    │   │  Uniswap V2      │        │
│  ├──────────────┤   ├───────────────────┤   ├──────────────────┤        │
│  │ • Source code│   │ • AI analysis     │   │ • Pair data      │        │
│  │ • Holder data│   │ • Security review │   │ • Liquidity      │        │
│  │ • Verification   │ • Pattern detect  │   │ • Trade exec     │        │
│  └──────────────┘   └───────────────────┘   └──────────────────┘        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Complete Verification Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  TOKEN VERIFICATION & TRADE EXECUTION FLOW                   │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Token Discovery
─────────────────────────
┌──────────────────┐
│  New Token       │
│  Listed on DEX   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  TraderAgent     │  ← Monitors Uniswap events
│  detects token   │
└────────┬─────────┘
         │
         │
Step 2: Agent Hiring
─────────────────────
         │
         ▼
┌──────────────────────────────┐
│ Query AgentMarketplace       │
│ • getAgentsByType(Security)  │
│ • getAgentsByType(Liquidity) │
│ • getAgentsByType(Tokenomics)│
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Select 3 agents:             │
│ • SecurityAuditBot           │
│ • LiquidityRiskBot           │
│ • TokenomicsAnalysisBot      │
└────────┬─────────────────────┘
         │
         │
Step 3: Escrow Creation
─────────────────────────
         │
         ▼
┌──────────────────────────────┐
│ AgentEscrow.createJob()      │
│ • Agents: [addr1, addr2...]  │
│ • Payment: 0.03 ETH          │
│ • Milestones: 3              │
│ • Deadline: 1 hour           │
└────────┬─────────────────────┘
         │
         ├─────────────┬─────────────┬──────────────┐
         │             │             │              │
         ▼             ▼             ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│JobCreated    │ │JobCreated    │ │JobCreated    ││
│Event         │ │Event         │ │Event         ││
│(Agent 1)     │ │(Agent 2)     │ │(Agent 3)     ││
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘│
       │                │                │        │
       │                │                │        │
Step 4: Parallel Verification
───────────────────────────────
       │                │                │        │
       ▼                ▼                ▼        │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│SecurityAudit │ │LiquidityRisk │ │Tokenomics    │
│Bot starts    │ │Bot starts    │ │Analysis      │
│analysis      │ │analysis      │ │Bot starts    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │ 1. Fetch       │ 1. Find        │ 1. Query
       │    source      │    Uni pair    │    holders
       │ 2. Detect      │ 2. Get         │ 2. Check
       │    vulns       │    reserves    │    whales
       │ 3. AI          │ 3. Check       │ 3. Calculate
       │    analysis    │    locks       │    metrics
       │ 4. Score       │ 4. Score       │ 4. Score
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Submit to     │ │Submit to     │ │Submit to     │
│AuditRegistry │ │AuditRegistry │ │AuditRegistry │
│Score: 85/100 │ │Score: 78/100 │ │Score: 82/100 │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        │
Step 5: Report Aggregation
────────────────────────────
                        │
                        ▼
            ┌────────────────────────┐
            │ TraderAgent receives   │
            │ all 3 reports          │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Calculate weighted     │
            │ overall score:         │
            │ • Security × 0.4       │
            │ • Liquidity × 0.3      │
            │ • Tokenomics × 0.3     │
            │ = 82/100               │
            └────────┬───────────────┘
                     │
                     │
Step 6: Consensus Check
─────────────────────────
                     │
                     ▼
            ┌────────────────────────┐
            │ AuditRegistry          │
            │ .hasConsensus()        │
            │                        │
            │ ✅ 3 auditors agree    │
            │    Risk: LOW           │
            └────────┬───────────────┘
                     │
                     │
Step 7: Decision Logic
────────────────────────
                     │
                     ▼
            ┌────────────────────────┐
            │ Check thresholds:      │
            │ ✅ Overall: 82 ≥ 70    │
            │ ✅ Security: 85 ≥ 75   │
            │ ✅ Liquidity: 78 ≥ 65  │
            │ ✅ Tokenomics: 82 ≥ 60 │
            │ ✅ Consensus: YES      │
            │ ✅ Not blacklisted     │
            │                        │
            │ DECISION: EXECUTE ✅   │
            └────────┬───────────────┘
                     │
                     │
Step 8: Trade Execution
─────────────────────────
                     │
                     ▼
            ┌────────────────────────┐
            │ TradeExecutor          │
            │ .createTradeOrder()    │
            │                        │
            │ • Token: 0x...         │
            │ • Direction: BUY       │
            │ • Amount: 0.1 ETH      │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Validate against       │
            │ AuditRegistry          │
            │ ✅ Token is safe       │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Execute swap on        │
            │ Uniswap V2             │
            │ ✅ Trade complete      │
            └────────┬───────────────┘
                     │
                     │
Step 9: Payment Release
─────────────────────────
                     │
                     ▼
            ┌────────────────────────┐
            │ AgentEscrow            │
            │ .completeMilestone()   │
            │                        │
            │ → 0.01 ETH to Security │
            │ → 0.01 ETH to Liquidity│
            │ → 0.01 ETH to Tokenomics
            │                        │
            │ ✅ All agents paid     │
            └────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              RESULT                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✅ Token thoroughly verified by 3 independent agents                       │
│  ✅ Risk scores meet all safety thresholds                                  │
│  ✅ Consensus achieved among auditors                                       │
│  ✅ Trade executed safely on DEX                                            │
│  ✅ Agents compensated for their work                                       │
│                                                                              │
│  Total Time: ~3 minutes                                                     │
│  Total Cost: 0.03 ETH (agent fees) + gas                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Interactions

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      CONTRACT INTERACTION MAP                             │
└──────────────────────────────────────────────────────────────────────────┘

TraderAgent
    │
    ├─ read  → AgentMarketplace.getAgentsByType()
    ├─ read  → AgentMarketplace.getAgent()
    ├─ write → AgentEscrow.createJob()
    ├─ read  → AuditRegistry.getAuditReport()
    ├─ read  → AuditRegistry.hasConsensus()
    ├─ read  → AuditRegistry.isTokenSafe()
    ├─ write → TradeExecutor.createTradeOrder()
    └─ write → AgentEscrow.completeMilestone()

SecurityAuditBot
    │
    ├─ read  → AgentEscrow.getJob()
    ├─ write → AuditRegistry.submitAuditReport()
    └─ listen → AgentEscrow.JobCreated event

LiquidityRiskBot
    │
    ├─ read  → AgentEscrow.getJob()
    ├─ write → AuditRegistry.submitAuditReport()
    ├─ read  → UniswapV2Factory.getPair()
    ├─ read  → UniswapV2Pair.getReserves()
    └─ listen → AgentEscrow.JobCreated event

TokenomicsAnalysisBot
    │
    ├─ read  → AgentEscrow.getJob()
    ├─ write → AuditRegistry.submitAuditReport()
    ├─ read  → ERC20.balanceOf()
    ├─ read  → ERC20.totalSupply()
    └─ listen → AgentEscrow.JobCreated event

TradeExecutor
    │
    ├─ read  → AuditRegistry.isTokenSafe()
    ├─ read  → AuditRegistry.isBlacklisted()
    ├─ write → UniswapV2Router.swapExactETHForTokens()
    └─ emit  → TradeExecuted event

AuditRegistry
    │
    ├─ store → Risk reports from all agents
    ├─ calc  → Consensus mechanism
    ├─ emit  → AuditReported event
    └─ query → Token safety status

AgentEscrow
    │
    ├─ store → Job details and milestones
    ├─ transfer → ETH payments to agents
    ├─ emit  → JobCreated, JobCompleted events
    └─ manage → Disputes
```

## Risk Scoring Algorithm

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         RISK SCORING SYSTEM                               │
└──────────────────────────────────────────────────────────────────────────┘

Security Score Calculation:
───────────────────────────
Base Score: 100

Deductions:
  - Critical vulnerability:     -40 points
  - High severity issue:        -25 points
  - Medium severity issue:      -15 points
  - Low severity warning:       -5 points
  - Unverified contract:        -80 points

Final Score = max(0, Base - Deductions)

Example:
  100 - 15 (medium) - 5 (low) = 85 ✅


Liquidity Score Calculation:
──────────────────────────────
Base Score: 100

Deductions:
  - Liquidity < $10K:           -50 points
  - Liquidity < $50K:           -30 points
  - Not locked:                 -20 points
  - High rug pull risk:         -30 points
  - Low volume/liquidity:       -15 points

Final Score = max(0, Base - Deductions)

Example:
  100 - 30 (low liq) - 20 (not locked) = 50 ⚠️


Tokenomics Score Calculation:
───────────────────────────────
Base Score: 100

Deductions:
  - Top holder > 50%:           -40 points
  - Top holder > 30%:           -25 points
  - Top holder > 15%:           -10 points
  - Top 10 > 80%:               -30 points
  - Top 10 > 60%:               -15 points
  - Holders < 50:               -20 points
  - Holders < 100:              -10 points

Final Score = max(0, Base - Deductions)

Example:
  100 - 10 (top holder 18%) - 10 (120 holders) = 80 ✅


Overall Score (Weighted Average):
───────────────────────────────────
Overall = (Security × 0.4) + (Liquidity × 0.3) + (Tokenomics × 0.3)

Example:
  Overall = (85 × 0.4) + (78 × 0.3) + (82 × 0.3)
          = 34 + 23.4 + 24.6
          = 82 ✅


Risk Level Mapping:
────────────────────
  90-100:  VERY_LOW    (Safe to trade)
  75-89:   LOW         (Generally safe)
  50-74:   MEDIUM      (Caution advised)
  30-49:   HIGH        (High risk)
  0-29:    CRITICAL    (Do not trade)


Trade Decision Matrix:
───────────────────────
Execute Trade IF:
  ✅ Overall Score ≥ 70
  ✅ Security Score ≥ 75
  ✅ Liquidity Score ≥ 65
  ✅ Tokenomics Score ≥ 60
  ✅ Consensus (3+ auditors agree)
  ✅ Not blacklisted
  ✅ AuditRegistry.isTokenSafe() = true

Skip Trade IF any condition fails ❌
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** Production Ready ✅
