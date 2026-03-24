# Agent Simulation Engine Documentation

## Overview

The Agent Simulation Engine provides a realistic simulation of autonomous verification agents for the SentinelNet platform. It simulates three types of agents that analyze token contracts: SecurityBot, LiquidityScanner, and TokenomicsAnalyzer.

## Features

- ✅ **Asynchronous Execution**: All agents run asynchronously with configurable timing (2-4 seconds by default)
- ✅ **Event-Driven Architecture**: Real-time event emission for UI updates
- ✅ **Configurable Parameters**: Customize duration, scores, and failure rates
- ✅ **Realistic Behavior**: Random scores, findings, and occasional failures
- ✅ **Multiple Execution Modes**: Parallel, sequential, or individual agent execution
- ✅ **Retry Mechanism**: Automatic retry with exponential backoff for failed agents
- ✅ **Batch Processing**: Process multiple tokens in a single operation
- ✅ **Progress Tracking**: Real-time progress updates during agent execution

## Architecture

### Core Components

```
lib/agentSimulation.ts        # Core simulation engine
hooks/useAgentSimulation.ts   # React hook for UI integration
app/agent-demo/page.tsx       # Demo page showcasing agent simulation
```

### Type Definitions

```typescript
interface AgentSimulationResult {
  score: number                // 0-100
  duration: number             // milliseconds
  timestamp: number            // Unix timestamp
  findings: string[]           // Array of findings
  status: 'success' | 'failed' // Execution status
}

interface AgentSimulationConfig {
  minDuration?: number         // Default: 2000ms
  maxDuration?: number         // Default: 4000ms
  minScore?: number            // Default: 0
  maxScore?: number            // Default: 100
  failureRate?: number         // Default: 0.02 (2%)
}

interface AgentEvent {
  agentName: string            // e.g., "SecurityBot"
  agentType: 'security' | 'liquidity' | 'tokenomics'
  eventType: 'started' | 'progress' | 'completed' | 'failed'
  timestamp: number
  data?: {
    progress?: number          // 0-100
    message?: string
    error?: string
  }
}
```

## Usage

### Basic Usage

```typescript
import { runAllAgents } from '@/lib/agentSimulation'

// Run all three agents in parallel
const results = await runAllAgents()

console.log('Security Score:', results.security.score)
console.log('Liquidity Score:', results.liquidity.score)
console.log('Tokenomics Score:', results.tokenomics.score)
console.log('Overall Score:', results.overallScore)
```

### Using the React Hook

```typescript
import { useAgentSimulation } from '@/hooks/useAgentSimulation'

function MyComponent() {
  const {
    security,
    liquidity,
    tokenomics,
    overallScore,
    isRunning,
    events,
    runParallel,
    clear,
  } = useAgentSimulation()

  return (
    <div>
      <button onClick={runParallel} disabled={isRunning}>
        Run Agents
      </button>
      {overallScore && <div>Score: {overallScore}</div>}
    </div>
  )
}
```

### Individual Agent Execution

```typescript
import {
  runSecurityBot,
  runLiquidityScanner,
  runTokenomicsAnalyzer,
} from '@/lib/agentSimulation'

// Run agents individually
const securityResult = await runSecurityBot()
const liquidityResult = await runLiquidityScanner()
const tokenomicsResult = await runTokenomicsAnalyzer()
```

### Sequential Execution

```typescript
import { runAllAgentsSequential } from '@/lib/agentSimulation'

// Run agents one after another
const results = await runAllAgentsSequential()
```

### Custom Configuration

```typescript
import { runAllAgents } from '@/lib/agentSimulation'

const config = {
  minDuration: 1000,  // Faster execution
  maxDuration: 2000,
  minScore: 50,       // Higher minimum score
  maxScore: 100,
  failureRate: 0.05,  // 5% failure rate
}

const results = await runAllAgents(config)
```

### Event Listening

```typescript
import { agentEventEmitter } from '@/lib/agentSimulation'

// Subscribe to all agent events
const unsubscribe = agentEventEmitter.subscribe('completed', (event) => {
  console.log(`${event.agentName} completed with score:`, event.data)
})

// Subscribe to progress events
agentEventEmitter.subscribe('progress', (event) => {
  console.log(`${event.agentName} progress:`, event.data?.progress)
})

// Cleanup
unsubscribe()
```

### Retry Mechanism

```typescript
import { runAgentWithRetry, runSecurityBot } from '@/lib/agentSimulation'

// Retry up to 3 times with exponential backoff
const result = await runAgentWithRetry(() => runSecurityBot(), 3)
```

### Batch Processing

```typescript
import { runAgentBatch } from '@/lib/agentSimulation'

const tokens = [
  '0x1234...5678',
  '0xabcd...ef01',
  '0x9876...5432',
]

const results = await runAgentBatch(tokens)

// Access results by token address
tokens.forEach((token) => {
  const tokenResults = results.get(token)
  console.log(`Token ${token}:`, tokenResults)
})
```

## Agent Details

### SecurityBot 🔒

Analyzes smart contract security with focus on:
- Ownership controls
- Proxy patterns
- Reentrancy guards
- Time locks
- Mint functions
- Access control
- Emergency pauses

**Sample Findings:**
- "No ownership controls found"
- "Reentrancy guard implemented"
- "Proxy upgrade pattern detected"
- "Time-locked admin functions"

### LiquidityScanner 💧

Scans liquidity and market conditions:
- Pool size analysis
- Trading volume
- Holder distribution
- Price volatility
- Liquidity locks
- Whale holdings

**Sample Findings:**
- "High liquidity pool detected"
- "Low trading volume warning"
- "Liquidity locked for 6+ months"
- "Price volatility within normal range"

### TokenomicsAnalyzer 📊

Evaluates token economics and distribution:
- Supply metrics
- Distribution patterns
- Holder concentration
- Vesting schedules
- Burn mechanisms
- Tax structures

**Sample Findings:**
- "Fair token distribution"
- "Whale concentration detected"
- "Auto-burn mechanism active"
- "Reasonable transaction tax (2%)"

## Scoring System

### Individual Scores

Each agent generates a random score between 0-100 (configurable):
- **80-100**: Excellent - Low risk
- **60-79**: Good - Moderate risk
- **40-59**: Fair - Notable risk
- **0-39**: Poor - High risk

### Overall Score

Weighted average of all three agents:
- **Security**: 40% weight
- **Liquidity**: 30% weight
- **Tokenomics**: 30% weight

Formula: `(Security × 0.4) + (Liquidity × 0.3) + (Tokenomics × 0.3)`

## Events

### Event Types

1. **started**: Agent begins execution
   ```typescript
   {
     agentName: "SecurityBot",
     agentType: "security",
     eventType: "started",
     timestamp: 1234567890,
     data: { message: "Starting security analysis..." }
   }
   ```

2. **progress**: Agent progress update
   ```typescript
   {
     agentName: "SecurityBot",
     agentType: "security",
     eventType: "progress",
     timestamp: 1234567891,
     data: { 
       progress: 50,
       message: "Analyzing smart contract code..."
     }
   }
   ```

3. **completed**: Agent finishes successfully
   ```typescript
   {
     agentName: "SecurityBot",
     agentType: "security",
     eventType: "completed",
     timestamp: 1234567892,
     data: { message: "Security analysis complete" }
   }
   ```

4. **failed**: Agent encounters an error
   ```typescript
   {
     agentName: "SecurityBot",
     agentType: "security",
     eventType: "failed",
     timestamp: 1234567893,
     data: { 
       error: "Network timeout",
       message: "Failed to complete analysis"
     }
   }
   ```

## Configuration Options

### Duration

Controls how long agents take to execute:
```typescript
{
  minDuration: 2000,  // 2 seconds minimum
  maxDuration: 4000,  // 4 seconds maximum
}
```

### Score Range

Controls the range of possible scores:
```typescript
{
  minScore: 0,    // Minimum possible score
  maxScore: 100,  // Maximum possible score
}
```

### Failure Rate

Controls how often agents fail:
```typescript
{
  failureRate: 0.02,  // 2% chance of failure
}
```

## Demo Page

Visit `/agent-demo` to see the simulation in action:

**Features:**
- ⚙️ **Configuration Panel**: Adjust all simulation parameters
- 🎮 **Control Buttons**: Run agents in various modes
- 📊 **Results Display**: View scores and findings for each agent
- 📡 **Event Stream**: Real-time event tracking with progress bars
- 🎯 **Overall Score**: Weighted aggregate score

**Controls:**
- **Run All (Parallel)**: Execute all three agents simultaneously
- **Run All (Sequential)**: Execute agents one after another
- **Security Only**: Run only the SecurityBot
- **Liquidity Only**: Run only the LiquidityScanner
- **Tokenomics Only**: Run only the TokenomicsAnalyzer
- **Clear All**: Reset all results and events
- **Clear Events**: Clear only the event stream

## Performance Characteristics

### Execution Time

- **Parallel Mode**: 2-4 seconds (fastest)
- **Sequential Mode**: 6-12 seconds (3 agents × 2-4s each)
- **Individual Agent**: 2-4 seconds

### Memory Usage

- Minimal memory footprint
- Event history limited to last 50 events
- Efficient cleanup with unsubscribe functions

### Reliability

- 98% success rate by default
- Automatic retry with exponential backoff
- Graceful error handling

## Best Practices

### 1. Always Subscribe to Events for UI Updates

```typescript
useEffect(() => {
  const unsubscribe = agentEventEmitter.subscribe('progress', (event) => {
    // Update progress bar
  })
  return () => unsubscribe()
}, [])
```

### 2. Clear Events Periodically

```typescript
// Prevent memory buildup in long-running sessions
useEffect(() => {
  const interval = setInterval(() => {
    clearEvents()
  }, 60000) // Clear every minute
  return () => clearInterval(interval)
}, [])
```

### 3. Handle Errors Gracefully

```typescript
try {
  const results = await runAllAgents()
} catch (error) {
  console.error('Agent simulation failed:', error)
  // Show user-friendly error message
}
```

### 4. Use Parallel Mode for Better UX

```typescript
// Prefer parallel execution for faster results
const results = await runAllAgents()  // 2-4s total

// Instead of sequential
const results = await runAllAgentsSequential()  // 6-12s total
```

### 5. Customize Configuration for Testing

```typescript
// Fast mode for development
const devConfig = {
  minDuration: 500,
  maxDuration: 1000,
  failureRate: 0,  // No failures during dev
}

// Stress test mode
const stressConfig = {
  minDuration: 5000,
  maxDuration: 10000,
  failureRate: 0.2,  // 20% failure rate
}
```

## Integration with Existing System

The agent simulation can be integrated with the existing SentinelNet simulation engine:

```typescript
// In lib/simulation.ts
import { runAllAgents } from './agentSimulation'

async executeJob(job: VerificationJob) {
  // Use real agent simulation instead of mock data
  const results = await runAllAgents()
  
  job.results = {
    security: results.security,
    liquidity: results.liquidity,
    tokenomics: results.tokenomics,
    overallScore: results.overallScore,
  }
  
  job.status = 'completed'
  this.notifySubscribers()
}
```

## Future Enhancements

Potential improvements to the agent simulation:

1. **Real API Integration**: Connect to actual agent backend
2. **Historical Data**: Store and analyze past agent results
3. **Custom Agents**: Allow users to create custom agent types
4. **Advanced Scoring**: More sophisticated risk calculation
5. **Real-time Blockchain Data**: Integration with on-chain data
6. **Machine Learning**: Predict outcomes based on patterns
7. **Alert System**: Notify users of critical findings
8. **Export Reports**: Generate PDF/CSV reports of findings

## Troubleshooting

### Events Not Appearing

```typescript
// Make sure to subscribe before running agents
const unsubscribe = agentEventEmitter.subscribe('started', handleEvent)
await runAllAgents()
```

### Memory Leaks

```typescript
// Always cleanup subscriptions
useEffect(() => {
  const unsubscribe = agentEventEmitter.subscribe('completed', handler)
  return () => unsubscribe()  // Cleanup on unmount
}, [])
```

### Agents Not Completing

```typescript
// Check if agents are failing silently
agentEventEmitter.subscribe('failed', (event) => {
  console.error('Agent failed:', event)
})
```

## API Reference

### Functions

- `runSecurityBot(config?)`: Run security analysis agent
- `runLiquidityScanner(config?)`: Run liquidity scanning agent
- `runTokenomicsAnalyzer(config?)`: Run tokenomics analysis agent
- `runAllAgents(config?)`: Run all agents in parallel
- `runAllAgentsSequential(config?)`: Run all agents sequentially
- `runAgentWithRetry(agentFn, maxRetries?)`: Run agent with retry logic
- `runAgentBatch(tokens, config?)`: Batch process multiple tokens

### Classes

- `AgentEventEmitter`: Event emitter for agent lifecycle events
  - `subscribe(eventType, callback)`: Subscribe to events
  - `emit(event)`: Emit an event
  - `clear()`: Clear all subscriptions

### Hooks

- `useAgentSimulation(config?)`: React hook for agent simulation
  - Returns: `{ security, liquidity, tokenomics, overallScore, isRunning, error, events, runParallel, runSequential, clear, ... }`

## Conclusion

The Agent Simulation Engine provides a powerful and flexible way to simulate autonomous verification agents. It's designed to be:

- **Easy to use**: Simple API with sensible defaults
- **Flexible**: Highly configurable for different use cases
- **Realistic**: Mimics real-world agent behavior
- **Production-ready**: Robust error handling and retry logic
- **Event-driven**: Real-time updates for responsive UIs

For more information, see the demo page at `/agent-demo` or check the source code in `lib/agentSimulation.ts`.
