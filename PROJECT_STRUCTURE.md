sentinelnet/
│
├── 📄 README.md                      # Main project documentation
├── 📄 QUICKSTART.md                  # Quick start guide
├── 📄 LICENSE                        # MIT License
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .env.example                   # Environment template
├── 📄 .eslintrc.js                   # ESLint configuration
├── 📄 .prettierrc                    # Prettier configuration
├── 📄 package.json                   # Root package.json
├── 🔧 setup.sh                       # Automated setup script
│
├── 📁 contracts/                     # Smart contracts (Solidity)
│   ├── 📄 package.json
│   ├── 📄 hardhat.config.js
│   ├── 📄 tsconfig.json
│   │
│   ├── 📁 contracts/
│   │   ├── AgentMarketplace.sol      # Agent registration & discovery
│   │   ├── EscrowContract.sol        # Job management & payments
│   │   └── ReputationRegistry.sol    # Agent reputation tracking
│   │
│   ├── 📁 scripts/
│   │   └── deploy.js                 # Deployment script
│   │
│   ├── 📁 test/
│   │   ├── AgentMarketplace.test.js  # Marketplace tests
│   │   └── EscrowContract.test.js    # Escrow tests
│   │
│   └── 📁 deployments/                # Deployment artifacts
│
├── 📁 agents/                        # AI Agents (TypeScript)
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   │
│   ├── 📁 shared/
│   │   ├── config.ts                 # Shared configuration
│   │   ├── logger.ts                 # Logging utilities
│   │   └── ai.ts                     # AI analysis helpers
│   │
│   ├── 📁 trader/
│   │   └── index.ts                  # Main trading agent
│   │
│   ├── 📁 security/
│   │   └── index.ts                  # Security verification agent
│   │
│   ├── 📁 liquidity/
│   │   └── index.ts                  # Liquidity analysis agent
│   │
│   ├── 📁 tokenomics/
│   │   └── index.ts                  # Tokenomics review agent
│   │
│   ├── 📁 scripts/
│   │   └── registerAgents.ts         # Agent registration script
│   │
│   └── 📁 logs/                       # Agent logs
│
├── 📁 analysis/                      # Analysis modules
│   ├── 📁 contract-scanner/
│   │   └── README.md                 # Contract scanning logic
│   │
│   ├── 📁 liquidity-checker/
│   │   └── README.md                 # Liquidity checking logic
│   │
│   └── 📁 risk-aggregator/
│       └── README.md                 # Risk aggregation logic
│
├── 📁 backend/                       # Backend API (Express)
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   │
│   ├── 📁 src/
│   │   ├── index.ts                  # Main server file
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── agents.ts             # Agent endpoints
│   │   │   ├── jobs.ts               # Job endpoints
│   │   │   └── analytics.ts          # Analytics endpoints
│   │   │
│   │   ├── 📁 services/
│   │   │   └── README.md             # Business logic services
│   │   │
│   │   └── 📁 database/
│   │       └── README.md             # Database models & migrations
│   │
│   └── 📁 logs/                       # Server logs
│
├── 📁 frontend/                      # Frontend Dashboard (Next.js)
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 next.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   │
│   ├── 📁 app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Dashboard page
│   │   └── globals.css               # Global styles
│   │
│   ├── 📁 components/
│   │   └── README.md                 # Reusable components
│   │
│   └── 📁 lib/
│       └── README.md                 # Utility functions
│
├── 📁 scripts/                       # Utility scripts
│   ├── 📄 README.md                  # Scripts documentation
│   ├── 🔧 start-agents.sh            # Start all agents
│   └── 🔧 stop-agents.sh             # Stop all agents
│
└── 📁 docs/                          # Documentation
    ├── 📄 README.md                  # Main documentation
    ├── 📄 CONTRACTS.md               # Contract addresses & specs
    ├── 📄 AGENTS.md                  # Agent protocol specification
    ├── 📄 CONTRIBUTING.md            # Contributing guidelines
    └── 📄 API.md                     # API documentation

## Key Files by Purpose

### Smart Contracts
- `contracts/contracts/AgentMarketplace.sol` - Agent registration
- `contracts/contracts/EscrowContract.sol` - Payment management
- `contracts/contracts/ReputationRegistry.sol` - Reputation system

### AI Agents
- `agents/trader/index.ts` - Orchestrates verification jobs
- `agents/security/index.ts` - Security analysis
- `agents/liquidity/index.ts` - Liquidity analysis
- `agents/tokenomics/index.ts` - Tokenomics analysis

### Backend
- `backend/src/index.ts` - API server
- `backend/src/routes/*.ts` - REST endpoints

### Frontend
- `frontend/app/page.tsx` - Main dashboard UI
- `frontend/app/layout.tsx` - App layout

### Configuration
- `.env.example` - Environment variables template
- `hardhat.config.js` - Hardhat configuration
- `tsconfig.json` - TypeScript configuration

### Scripts
- `setup.sh` - Automated setup
- `scripts/start-agents.sh` - Start agents
- `scripts/stop-agents.sh` - Stop agents

### Documentation
- `README.md` - Project overview
- `QUICKSTART.md` - Quick start guide
- `docs/README.md` - Technical documentation
- `docs/AGENTS.md` - Agent protocol specs
- `docs/CONTRACTS.md` - Contract documentation
