# 🏗️ SentinelNet Frontend - Architecture Refactor

## Overview

The SentinelNet frontend has been completely refactored from a static UI into a **live autonomous system simulator** with proper architectural patterns and reusable modules.

---

## 📁 New Project Structure

```
frontend/src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── agents/page.tsx           # Agent marketplace
│   ├── risk-analyzer/page.tsx    # Risk analysis tool
│   ├── audits/page.tsx           # Audit reports
│   ├── trade/page.tsx            # Trade evaluation
│   └── simulation/page.tsx       # ✨ NEW: Live simulation
│
├── components/                   # ✨ NEW: Reusable UI components
│   ├── ActivityFeed.tsx          # Real-time activity log display
│   ├── AgentCard.tsx             # Agent information card
│   ├── JobCard.tsx               # Verification job status card
│   ├── SimulationControls.tsx   # Simulation control panel
│   ├── layout/
│   │   └── Navbar.tsx            # Navigation bar
│   └── index.ts                  # Component exports
│
├── hooks/                        # ✨ NEW: Custom React hooks
│   ├── useAgents.ts              # Agent data fetching
│   ├── useRiskAnalysis.ts        # Risk analysis logic
│   ├── useTradeEvaluation.ts    # Trade evaluation logic
│   ├── useSimulation.ts          # Simulation state management
│   └── index.ts                  # Hook exports
│
├── lib/                          # ✨ NEW: Core business logic
│   ├── simulation.ts             # Simulation engine & mock data
│   └── utils.ts                  # Utility functions (formatting, colors, etc.)
│
├── services/                     # ✨ NEW: API communication layer
│   └── api.service.ts            # Centralized API client
│
├── types/                        # ✨ NEW: TypeScript type definitions
│   ├── index.ts                  # All type definitions
│   └── window.d.ts               # Window type extensions
│
└── context/                      # React Context providers
    └── WalletContext.tsx         # Wallet connection state
```

---

## 🎯 Key Improvements

### 1. **Separation of Concerns**

**Before:**
- All logic in page components (300+ lines per page)
- API calls scattered throughout
- Duplicate code across pages
- No reusable components

**After:**
- Clean page components (< 100 lines)
- API calls in dedicated service layer
- Shared logic in custom hooks
- Reusable UI components

### 2. **Type Safety**

**Before:**
- Inline interface definitions
- Type inconsistencies between pages
- No shared types

**After:**
- Centralized type definitions in `/types`
- Consistent types across entire app
- Full TypeScript support with path aliases (`@/*`)

### 3. **State Management**

**Before:**
- Local state only
- No global simulation state
- Manual re-renders

**After:**
- Custom hooks for data fetching
- Observable simulation engine
- Automatic UI updates via subscriptions

### 4. **Reusability**

**Before:**
- Copy-pasted color logic
- Duplicate formatting functions
- Repeated API call code

**After:**
- Shared utility functions in `/lib/utils.ts`
- Single API service instance
- Reusable components

---

## 🚀 New Features

### Live Simulation System

Navigate to `/simulation` to access the live autonomous verification simulator:

**Features:**
- ✅ Real-time job tracking
- ✅ Activity log with severity levels
- ✅ Speed controls (0.5x, 1x, 2x)
- ✅ Three pre-configured scenarios (Safe, Risky, Medium)
- ✅ Demo mode (continuous verification loop)
- ✅ Progress visualization
- ✅ Score breakdown by category

**How it works:**
1. User selects a token scenario or starts demo mode
2. Simulation engine creates a verification job
3. Job progresses through 7 steps:
   - Token discovery
   - Agent hiring
   - Security analysis
   - Liquidity analysis
   - Tokenomics analysis
   - Risk aggregation
   - Trade decision
4. Activity log updates in real-time
5. Final scores and recommendation displayed

---

## 📦 Core Modules

### 1. Simulation Engine (`lib/simulation.ts`)

**Purpose:** Manages verification job lifecycle and simulation state

**Key Classes:**
- `SimulationEngine` - Main simulation controller

**Key Methods:**
- `createJob(token)` - Creates a new verification job
- `executeJob(jobId, token, speed)` - Runs verification workflow
- `subscribe(callback)` - Subscribe to state changes
- `clear()` - Reset simulation state

**Usage:**
```typescript
import { simulationEngine, MOCK_TOKENS } from '@/lib/simulation'

// Create a job
const jobId = simulationEngine.createJob(MOCK_TOKENS.safe)

// Execute with 2x speed
await simulationEngine.executeJob(jobId, MOCK_TOKENS.safe, 2)

// Subscribe to updates
const unsubscribe = simulationEngine.subscribe((state) => {
  console.log('Active jobs:', state.activeJobs)
})
```

### 2. API Service (`services/api.service.ts`)

**Purpose:** Centralized API communication with error handling

**Key Methods:**
- `getAgents(filter?)` - Fetch agents by type
- `getAuditsByToken(address)` - Get token audits
- `evaluateTrade(address)` - Evaluate trade decision
- `healthCheck()` - Check API status

**Usage:**
```typescript
import { apiService } from '@/services/api.service'

// Fetch agents
const response = await apiService.getAgents('security')
const agents = response.data.agents

// Get token audits
const auditData = await apiService.getAuditsByToken('0x...')
```

### 3. Custom Hooks (`hooks/`)

**Purpose:** Reusable data fetching and state management logic

**Available Hooks:**

#### `useAgents(filter?)`
```typescript
const { agents, loading, error, refetch } = useAgents('security')
```

#### `useRiskAnalysis()`
```typescript
const { auditData, loading, error, analyzeToken, reset } = useRiskAnalysis()
await analyzeToken('0x...')
```

#### `useTradeEvaluation()`
```typescript
const { evaluation, loading, error, evaluateTrade, reset } = useTradeEvaluation()
await evaluateTrade('0x...')
```

#### `useSimulation()`
```typescript
const {
  state,
  isRunning,
  startVerification,
  startDemoMode,
  stopSimulation,
  clearSimulation,
  setSpeed,
} = useSimulation()

// Start a single verification
startVerification('safe')

// Start continuous demo
startDemoMode()

// Change speed
setSpeed('fast') // 'slow' | 'normal' | 'fast'
```

### 4. Utility Functions (`lib/utils.ts`)

**Purpose:** Shared helper functions for formatting, colors, and calculations

**Categories:**

#### Risk Scoring
```typescript
calculateOverallScore(security, liquidity, tokenomics)
getRiskLevel(score) // Returns 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
getTradeRecommendation(score, consensus, blacklisted)
```

#### Color Utilities
```typescript
getScoreColor(85) // 'text-success'
getRiskLevelColor('HIGH') // 'badge-danger'
getRecommendationColor('EXECUTE') // 'text-success'
getAgentColor('security') // 'text-primary'
```

#### Formatting
```typescript
formatAddress('0x1234...7890', 4) // '0x1234...7890'
formatTimeAgo(timestamp) // '5m ago'
formatNumber(1500000) // '1.50M'
formatPercent(85.5) // '85.5%'
formatEth(0.01) // '0.0100 ETH'
```

#### Chart Data Transformation
```typescript
transformToRadarData({ securityScore: 85, liquidityScore: 90, tokenomicsScore: 80 })
transformToPieData(scores)
```

---

## 🎨 Reusable Components

### ActivityFeed

Display real-time activity logs with severity-based styling

```typescript
import { ActivityFeed } from '@/components'

<ActivityFeed 
  logs={activityLog}
  maxHeight="max-h-96"
  showTimestamps={true}
/>
```

### AgentCard

Display agent information with stats and hire button

```typescript
import { AgentCard } from '@/components'

<AgentCard 
  agent={agent}
  onHire={(agent) => console.log('Hired:', agent.name)}
  showActions={true}
  compact={false}
/>
```

### JobCard

Display verification job progress and results

```typescript
import { JobCard } from '@/components'

<JobCard 
  job={verificationJob}
  onClick={() => console.log('Job clicked')}
/>
```

### SimulationControls

Control panel for simulation (start, stop, speed, clear)

```typescript
import { SimulationControls } from '@/components'

<SimulationControls
  isRunning={isRunning}
  onStart={startDemo}
  onStop={stopDemo}
  onClear={clearAll}
  onSpeedChange={setSpeed}
  currentSpeed={speedMultiplier}
/>
```

---

## 🔧 Configuration

### TypeScript Path Aliases

Updated `tsconfig.json` to support clean imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Before:**
```typescript
import { Agent } from '../../../types'
import { apiService } from '../../services/api.service'
```

**After:**
```typescript
import { Agent } from '@/types'
import { apiService } from '@/services/api.service'
```

---

## 📊 Mock Data

Three pre-configured token scenarios for simulation:

### 1. SafeCoin (SAFE)
- Security: 92/100
- Liquidity: 88/100
- Tokenomics: 85/100
- **Expected: ✅ EXECUTE**

### 2. ScamCoin (SCAM)
- Security: 25/100
- Liquidity: 30/100
- Tokenomics: 20/100
- **Expected: ❌ REJECT**

### 3. MediumCoin (MED)
- Security: 68/100
- Liquidity: 65/100
- Tokenomics: 62/100
- **Expected: ⚠️ CAUTION**

Access via:
```typescript
import { MOCK_TOKENS } from '@/lib/simulation'

const safeToken = MOCK_TOKENS.safe
const riskyToken = MOCK_TOKENS.risky
const mediumToken = MOCK_TOKENS.medium
```

---

## 🎯 Usage Examples

### Example 1: Fetch and Display Agents

```typescript
'use client'

import { useAgents } from '@/hooks'
import { AgentCard } from '@/components'

export default function AgentsPage() {
  const { agents, loading, error } = useAgents('security')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.address} agent={agent} />
      ))}
    </div>
  )
}
```

### Example 2: Run a Simulation

```typescript
'use client'

import { useSimulation } from '@/hooks'
import { SimulationControls, JobCard, ActivityFeed } from '@/components'

export default function SimulationPage() {
  const { 
    state, 
    isRunning, 
    startVerification, 
    stopSimulation 
  } = useSimulation()

  return (
    <div>
      <button onClick={() => startVerification('safe')}>
        Start Safe Verification
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {state.jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <div>
          <ActivityFeed logs={state.activityLog} />
        </div>
      </div>
    </div>
  )
}
```

### Example 3: Analyze Token Risk

```typescript
'use client'

import { useState } from 'react'
import { useRiskAnalysis } from '@/hooks'
import { transformToRadarData } from '@/lib/utils'

export default function RiskAnalyzerPage() {
  const [address, setAddress] = useState('')
  const { auditData, loading, analyzeToken } = useRiskAnalysis()

  const handleAnalyze = () => {
    analyzeToken(address)
  }

  return (
    <div>
      <input 
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Token address"
      />
      <button onClick={handleAnalyze}>Analyze</button>

      {auditData && (
        <div>
          <h3>Overall Score: {auditData.aggregatedScores.avgOverallScore}</h3>
          {/* Display radar chart, etc. */}
        </div>
      )}
    </div>
  )
}
```

---

## 🚀 Migration Guide

### Updating Existing Pages

**Step 1:** Import from centralized modules
```typescript
// OLD
import axios from 'axios'
interface Agent { ... }

// NEW
import { apiService } from '@/services/api.service'
import type { Agent } from '@/types'
```

**Step 2:** Use custom hooks instead of useEffect
```typescript
// OLD
const [agents, setAgents] = useState([])
useEffect(() => {
  axios.get('/api/agents').then(res => setAgents(res.data))
}, [])

// NEW
const { agents, loading, error } = useAgents()
```

**Step 3:** Use utility functions for colors/formatting
```typescript
// OLD
const color = score >= 80 ? 'text-green-500' : 'text-red-500'

// NEW
import { getScoreColor } from '@/lib/utils'
const color = getScoreColor(score)
```

**Step 4:** Extract components
```typescript
// OLD - Inline JSX
<div className="card">
  {/* 50 lines of agent card JSX */}
</div>

// NEW - Component
import { AgentCard } from '@/components'
<AgentCard agent={agent} />
```

---

## 📈 Performance Benefits

1. **Reduced Bundle Size**
   - Shared utilities instead of duplicates
   - Tree-shakeable exports

2. **Better Caching**
   - Single API service instance
   - Shared state via hooks

3. **Faster Development**
   - Reusable components
   - Type safety catches errors early
   - Less boilerplate code

4. **Improved Maintainability**
   - Single source of truth for types
   - Centralized business logic
   - Clear separation of concerns

---

## 🧪 Testing

### Test Simulation Engine

```typescript
import { simulationEngine, MOCK_TOKENS } from '@/lib/simulation'

describe('SimulationEngine', () => {
  it('should create and execute a job', async () => {
    const jobId = simulationEngine.createJob(MOCK_TOKENS.safe)
    await simulationEngine.executeJob(jobId, MOCK_TOKENS.safe, 10) // Fast speed
    
    const job = simulationEngine.getJob(jobId)
    expect(job?.status).toBe('completed')
  })
})
```

### Test API Service

```typescript
import { apiService } from '@/services/api.service'

describe('ApiService', () => {
  it('should fetch agents', async () => {
    const response = await apiService.getAgents()
    expect(response.data.agents).toBeInstanceOf(Array)
  })
})
```

---

## 🎯 Next Steps

### Phase 1: ✅ Complete
- [x] Refactor architecture
- [x] Create reusable modules
- [x] Build simulation engine
- [x] Add live simulation page

### Phase 2: In Progress
- [ ] Add WebSocket support for real-time updates
- [ ] Integrate with actual backend API
- [ ] Add authentication/authorization
- [ ] Deploy to production

### Phase 3: Future
- [ ] Add more simulation scenarios
- [ ] Create admin dashboard
- [ ] Add analytics and metrics
- [ ] Build mobile responsive views

---

## 📚 Documentation

- **Main README:** `/README.md`
- **API Service:** `/services/api.service.ts`
- **Simulation Engine:** `/lib/simulation.ts`
- **Type Definitions:** `/types/index.ts`
- **Utility Functions:** `/lib/utils.ts`

---

## 🤝 Contributing

When adding new features, follow these patterns:

1. **Types first** - Define types in `/types/index.ts`
2. **Business logic** - Add to `/lib/` modules
3. **API calls** - Add to `/services/api.service.ts`
4. **Custom hooks** - Add to `/hooks/`
5. **UI components** - Add to `/components/`
6. **Pages** - Keep thin, use hooks and components

---

## ✨ Key Takeaways

🎯 **Clean Architecture** - Proper separation of concerns  
🔄 **Reusable Code** - DRY principle applied throughout  
🎨 **Consistent UI** - Shared components and utilities  
📊 **Type Safe** - Full TypeScript coverage  
⚡ **Live Simulation** - Real-time autonomous verification  
🚀 **Scalable** - Easy to extend and maintain  

---

**Built with ❤️ for hackathon demos and production deployment**
