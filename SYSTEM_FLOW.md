# SentinelNet System Flow Visualization

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SENTINELNET ECOSYSTEM                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│   ETHEREUM SEPOLIA  │         │   OPENAI GPT-4      │
│   ┌──────────────┐  │         │   ┌──────────────┐  │
│   │ Marketplace  │  │         │   │   Analysis   │  │
│   │   Escrow     │◄─┼─────────┼──►│   Engine     │  │
│   │  Reputation  │  │         │   └──────────────┘  │
│   └──────────────┘  │         └─────────────────────┘
└──────────┬──────────┘
           │
           │ Blockchain Events
           │
┌──────────▼──────────────────────────────────────────────────────────────┐
│                        AI AGENT NETWORK                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌────────────┐ │
│  │   Trader    │   │  Security   │   │  Liquidity  │   │ Tokenomics │ │
│  │    Agent    │──►│    Agent    │   │    Agent    │   │   Agent    │ │
│  └─────────────┘   └─────────────┘   └─────────────┘   └────────────┘ │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
                             │ REST API / WebSocket
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                        BACKEND API SERVER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │    Routes    │  │   Services   │  │   Database   │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             │ HTTP / WebSocket
                             │
┌────────────────────────────▼───────────────────────────────────────────┐
│                     NEXT.JS DASHBOARD                                   │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  📊 Real-Time Monitoring  │  📈 Analytics  │  ⚙️ Controls    │     │
│  └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Token Verification Process

```
Step 1: Discovery
┌──────────────┐
│ TraderAgent  │ ──► Discovers new token address: 0xABC...
└──────────────┘
       │
       │ Query marketplace
       ▼
┌──────────────────┐
│ Marketplace      │ ──► Returns available agents by type
│ Smart Contract   │     - SecurityBot (0x123...)
└──────────────────┘     - LiquidityScanner (0x456...)
                         - TokenomicsAnalyzer (0x789...)

Step 2: Job Creation
┌──────────────┐
│ TraderAgent  │ ──► Creates escrow job
└──────────────┘     - Token: 0xABC...
       │             - Agents: [0x123, 0x456, 0x789]
       │             - Payments: [0.01, 0.015, 0.012]
       ▼             - Budget: 0.037 ETH + fees
┌──────────────────┐
│ Escrow Contract  │ ──► Locks funds in escrow
└──────────────────┘     Emits: AgentHired events

Step 3: Parallel Verification
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ SecurityBot  │    │LiquidityScann│    │TokenomicsAnal│
│              │    │     er       │    │     yzer     │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │ Analyze           │ Analyze           │ Analyze
       │ Security          │ Liquidity         │ Tokenomics
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ GPT-4 API    │    │ GPT-4 API    │    │ GPT-4 API    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │ Returns           │ Returns           │ Returns
       │ Analysis          │ Analysis          │ Analysis
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Risk: 85/100 │    │ Risk: 78/100 │    │ Risk: 83/100 │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                          │
                          │ Submit reports
                          ▼
                   ┌──────────────┐
                   │   Escrow     │
                   │  Contract    │
                   └──────┬───────┘
                          │
                          │ Auto-release payments
                          │ Update reputations
                          ▼
                   ┌──────────────┐
                   │ Payments Sent│
                   └──────────────┘

Step 4: Risk Aggregation
┌──────────────┐
│ TraderAgent  │ ──► Fetches all reports
└──────┬───────┘     - Security: 85
       │             - Liquidity: 78
       │             - Tokenomics: 83
       │
       │ Calculate aggregate
       ▼
   Average: 82/100
       │
       │ Apply decision logic
       ▼
┌──────────────────────┐
│ Risk Assessment      │
│ 82/100 = "LOW RISK"  │
└──────┬───────────────┘
       │
       │ Risk acceptable?
       ▼
┌──────────────────────┐
│ ✅ Execute Trade     │
│ Position: 1%         │
└──────────────────────┘

Step 5: Real-Time Updates
┌──────────────┐
│   Backend    │ ──► Broadcasts via WebSocket
└──────┬───────┘     {
       │               event: "jobCompleted",
       │               jobId: 123,
       │               riskScore: 82
       ▼             }
┌──────────────┐
│  Dashboard   │ ──► Updates UI in real-time
└──────────────┘     - Job status
                     - Risk score
                     - Agent performance
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                              │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Next.js Dashboard                        │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │    │
│  │  │ Agents  │  │  Jobs   │  │Analytics│  │ Settings│      │    │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │    │
│  └───────┼────────────┼────────────┼────────────┼───────────────┘ │
└──────────┼────────────┼────────────┼────────────┼─────────────────┘
           │            │            │            │
           │    HTTP    │    HTTP    │   HTTP     │   HTTP
           │            │            │            │
┌──────────▼────────────▼────────────▼────────────▼─────────────────┐
│                     Express.js Backend API                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │
│  │ Agents │  │  Jobs  │  │Analytics│ │  Auth  │  │   WS   │     │
│  │  Route │  │ Route  │  │ Route   │ │ Route  │  │ Server │     │
│  └────┬───┘  └────┬───┘  └────┬────┘ └────┬───┘  └────┬───┘     │
└───────┼───────────┼───────────┼───────────┼───────────┼──────────┘
        │           │           │           │           │
        │  Web3.js  │  Web3.js  │  Web3.js  │  Web3.js  │  Push
        │           │           │           │           │  Events
        │           │           │           │           │
┌───────▼───────────▼───────────▼───────────▼───────────▼──────────┐
│                  Ethereum Blockchain (Sepolia)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │Agent         │  │Escrow        │  │Reputation    │           │
│  │Marketplace   │◄─┤Contract      │◄─┤Registry      │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼──────────────────┼──────────────────┼───────────────────┘
          │                  │                  │
          │  Events          │  Events          │  Events
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼───────────────────┐
│                       AI Agent Network                              │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │ Trader   │  │Security  │  │Liquidity │  │Tokenomics│  │    │
│  │  │  Agent   │──┤  Agent   │  │  Agent   │  │  Agent   │  │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │    │
│  └───────┼─────────────┼─────────────┼─────────────┼────────┘    │
└──────────┼─────────────┼─────────────┼─────────────┼─────────────┘
           │             │             │             │
           │  OpenAI API │  OpenAI API │  OpenAI API │  OpenAI API
           │             │             │             │
┌──────────▼─────────────▼─────────────▼─────────────▼─────────────┐
│                         OpenAI GPT-4                                │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  Natural Language Analysis & Risk Assessment Engine      │     │
│  └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Timeline

```
Time    TraderAgent          Blockchain           Verification Agents      Dashboard
────────────────────────────────────────────────────────────────────────────────────
00:00   Discover Token
        0xABC123...
         │
00:01   Query Marketplace ─►  Read: getAgentsByType()
         │                                                                  
00:02   ◄─ Agents Found     
         │
00:03   Create Job ────────►  Write: createJob()
         │                    Lock: 0.037 ETH
         │                    Emit: AgentHired(x3)
00:04                                           ◄─ Event: AgentHired
00:05                                              Start Analysis
00:06                                              │
00:07                                              │ Call OpenAI
00:08                                              │
00:09                                              ◄─ AI Response
00:10                                              Submit Report ►
00:11                        Write: submitReport()
                             Release: 0.01 ETH
                             Emit: ReportSubmitted
00:12                                                                   ◄─ WS Update
00:15                                              (All 3 agents done)
00:16                        Emit: JobCompleted
00:17   ◄─ Event: Completed
00:18   Fetch Reports ─────► Read: getAgentReport(x3)
00:19   ◄─ Reports
00:20   Aggregate Risk
        Score: 82/100
00:21   Decision: BUY                                                  ◄─ WS Update
00:22   Execute Trade                                                  ◄─ Trade Alert
```

## Security & Trust Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TRUST BOUNDARIES                              │
└─────────────────────────────────────────────────────────────────────┘

Trustless Zone (On-Chain)
┌─────────────────────────────────────────────────────────────────────┐
│  ✓ Agent Registration      - Immutable on-chain                     │
│  ✓ Escrow Management        - Smart contract enforced               │
│  ✓ Payment Release          - Automatic upon report submission      │
│  ✓ Reputation Tracking      - Transparent and verifiable            │
└─────────────────────────────────────────────────────────────────────┘

Trust-Required Zone (Off-Chain)
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠ Agent Analysis Quality   - Depends on AI model & agent code     │
│  ⚠ Report Accuracy          - Not verified on-chain                │
│  ⚠ Data Sources             - External APIs (DEX, blockchain)       │
│  ⚠ OpenAI Availability      - Third-party dependency                │
└─────────────────────────────────────────────────────────────────────┘

Security Measures
┌─────────────────────────────────────────────────────────────────────┐
│  ✓ ReentrancyGuard          - All payment functions                │
│  ✓ Access Control           - Owner-only admin functions            │
│  ✓ Input Validation         - All user inputs checked               │
│  ✓ Rate Limiting            - API endpoints protected               │
│  ✓ Error Handling           - Comprehensive error management        │
│  ✓ Logging                  - Full audit trail                      │
└─────────────────────────────────────────────────────────────────────┘
```

This visualization provides a complete understanding of how all components interact in the SentinelNet ecosystem!
