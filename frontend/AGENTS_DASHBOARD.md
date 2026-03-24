# Verification Agents Dashboard

## Overview
The Verification Agents Dashboard provides real-time monitoring of autonomous agents performing token verification tasks. Each agent card displays live status, current job information, and performance metrics.

## Agent Profiles

### 1. SecurityBot 🔒
- **Specialization**: Smart Contract Security
- **Reputation**: 98%
- **Color**: Blue (#3B82F6)
- **Focus**: Vulnerability scanning, ownership analysis, backdoor detection

### 2. LiquidityScanner 💧
- **Specialization**: Market Liquidity Analysis
- **Reputation**: 95%
- **Color**: Cyan (#06B6D4)
- **Focus**: Pool depth, trading volume, price stability

### 3. TokenomicsAnalyzer 📊
- **Specialization**: Economic Model Evaluation
- **Reputation**: 97%
- **Color**: Purple (#8B5CF6)
- **Focus**: Token distribution, supply mechanics, utility analysis

## Agent Card Components

### Card Structure
```
┌─────────────────────────────────────┐
│ 🔒 SecurityBot          ● Running   │ ← Header with status dot
│ Smart Contract Security             │ ← Specialization
│                                     │
│ Reputation: ████████░░ 98%          │ ← Progress bar
│                                     │
│ Status: ⟳ Running                   │ ← Status indicator
│ ─────────────────────────────────── │
│ Current Job:                        │
│   Token: 0x1234567890...            │ ← Job details
│   Job ID: job_17731616...           │
│   Progress: ████████░░ 65%          │ ← Progress bar
│                                     │
│ ⚡ Analyzing token...                │ ← Activity indicator
└─────────────────────────────────────┘
```

### Status States

#### 1. Idle (Gray)
**Visual Indicators:**
- Gray status dot (static)
- Gray status text
- "No active job" message
- Standard border (no animation)

**Use Case:**
- Agent waiting for new job
- No token being analyzed
- Ready to receive work

#### 2. Running (Colored - Agent Specific)
**Visual Indicators:**
- Pulsing colored dot with ping animation
- Animated spinning loader icon
- Progress bar with shimmer effect
- Glowing colored border
- "Analyzing token..." activity message
- Box shadow animation

**Use Case:**
- Agent actively analyzing token
- Processing in progress
- Updates every second via job manager

**Animations:**
- Status dot pulses continuously
- Border glows with agent color
- Progress bar has sliding shimmer
- Loader icon spins

#### 3. Completed (Colored - Agent Specific)
**Visual Indicators:**
- Solid colored status dot
- Checkmark icon (success)
- Risk score display (large colored number)
- Completed timestamp
- Colored border (no animation)

**Use Case:**
- Agent finished analysis
- Score available
- Results ready for aggregation

## Card Details

### Header Section
```tsx
┌─────────────────────────────┐
│ 🔒 SecurityBot     ● Status │
│ Smart Contract Security     │
└─────────────────────────────┘
```
- Agent icon (emoji)
- Agent name (bold)
- Specialization (subtitle)
- Status dot (animated when running)

### Reputation Bar
```tsx
Reputation: ████████░░ 98%
```
- Horizontal progress bar
- Agent-specific color
- Percentage value
- Smooth fill animation

### Status Row
```tsx
Status: ⟳ Running
```
- Status icon (circle/loader/checkmark)
- Status text (Idle/Running/Completed)
- Color-coded by state
- Icon animation for running state

### Current Job Section

**When Idle:**
```tsx
Current Job:
  No active job
```

**When Running:**
```tsx
Current Job:
  Token: 0x1234567890...
  Job ID: job_17731616...
  Progress: ████████░░ 65%
```

**When Completed:**
```tsx
Current Job:
  Token: 0x1234567890...
  Job ID: job_17731616...
  
  ┌─────────────────────┐
  │ Risk Score     45.5 │ ← Large colored number
  └─────────────────────┘
  
  Completed at 2:34:56 PM
```

### Activity Indicator (Running Only)
```tsx
⚡ Analyzing token...
```
- Animated activity icon
- Agent-specific color
- Only shown during running state

## Visual Effects

### 1. Status Dot Animations

**Idle:**
```css
● Gray solid circle
```

**Running:**
```css
● Colored pulsing dot
  + Expanding ping ring
  + Continuous animation
```

**Completed:**
```css
● Colored solid circle
```

### 2. Border Effects

**Idle:**
```css
border: 1px solid #374151
```

**Running:**
```css
border: 2px solid [agent-color]
box-shadow: 0 0 30px [agent-color]40
animation: glow
```

**Completed:**
```css
border: 2px solid [agent-color]
```

### 3. Progress Bar Animations

**Reputation Bar:**
- Width animates to percentage
- Agent-specific color
- Smooth transition (300ms)

**Progress Bar (Running):**
```css
├────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░       │
│    ↑ Shimmer slides →      │
└────────────────────────────┘
```
- Base progress width (65%)
- Sliding shimmer overlay
- White gradient transparency
- Continuous animation

### 4. Score Display (Completed)

```tsx
┌─────────────────────────┐
│ Risk Score              │
│                         │
│         45.5           │ ← 2xl bold colored
│                         │
└─────────────────────────┘
```
- Large 2xl font size
- Agent-specific color
- Colored background (20% opacity)
- Rounded container
- Padding for emphasis

## Dashboard Stats Summary

When a job is active, shows aggregate statistics:

```
┌──────────────┬──────────────┬──────────────┐
│ Active Jobs  │ Agents Run   │ Jobs Complete│
│      1       │      1       │      0       │
└──────────────┴──────────────┴──────────────┘
```

**Metrics:**
- **Active Jobs**: Total jobs in progress
- **Agents Running**: Count of agents currently analyzing
- **Jobs Completed**: Successfully finished jobs

## Legend

Displayed in dashboard header:

```
○ Idle    ⟳ Running    ✓ Completed
```

## Color System

| Agent | Primary | Used For |
|-------|---------|----------|
| SecurityBot | Blue (#3B82F6) | Borders, text, progress, glow |
| LiquidityScanner | Cyan (#06B6D4) | Borders, text, progress, glow |
| TokenomicsAnalyzer | Purple (#8B5CF6) | Borders, text, progress, glow |

## State Transitions

```
Idle → Running → Completed
  ↓      ↓          ↓
  ○      ●(pulse)   ●
```

1. **Idle → Running**: When job starts
   - Dot begins pulsing
   - Border gains color and glow
   - Progress bar appears
   - Activity indicator shows

2. **Running → Completed**: When agent finishes
   - Dot stops pulsing
   - Glow animation stops
   - Progress bar removed
   - Score display appears
   - Timestamp added

## Usage

### Basic Integration
```tsx
import { VerificationAgentsDashboard } from '@/components/VerificationAgentsDashboard'

<VerificationAgentsDashboard currentJob={currentJob} />
```

### Individual Agent Card
```tsx
import { AgentCard } from '@/components/VerificationAgentsDashboard'

<AgentCard
  agentName="SecurityBot"
  specialization="Smart Contract Security"
  icon="🔒"
  reputation={98}
  currentJob={currentJob}
  color="#3B82F6"
/>
```

## Props

### VerificationAgentsDashboard
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentJob` | VerificationJob \| null | Yes | Current verification job to display |

### AgentCard
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `agentName` | string | Yes | Name of the agent |
| `specialization` | string | Yes | Agent's area of expertise |
| `icon` | string | Yes | Emoji icon for agent |
| `reputation` | number | Yes | Reputation score (0-100) |
| `currentJob` | VerificationJob \| null | Yes | Current job being processed |
| `color` | string | Yes | Agent's theme color (hex) |

## Real-Time Updates

The dashboard automatically updates via the `useJobManager` hook:
- **Refresh Interval**: 1 second
- **Auto-sync**: Job state changes propagate immediately
- **Status Detection**: Automatically determines agent state from job results
- **Score Display**: Shows scores as soon as agents complete

## Responsive Design

- **Desktop**: 3-column grid
- **Tablet**: 2-column grid
- **Mobile**: Single column stack
- **Breakpoints**: Uses Tailwind's md and lg breakpoints

## Performance

### Optimizations
- Efficient state updates via useEffect
- CSS animations (GPU accelerated)
- Minimal re-renders
- Conditional rendering based on state

### Animation Performance
- 60 FPS animations
- Hardware-accelerated transforms
- Smooth transitions (300ms)
- No layout thrashing

## Accessibility

- Clear status indicators (color + icon + text)
- High contrast text
- Readable font sizes
- Descriptive labels
- Status legend provided

## Files

- `/components/VerificationAgentsDashboard.tsx` - Main component
- `/app/page.tsx` - Integration example
- `/lib/jobManager.ts` - Job state management
- `/hooks/useJobManager.ts` - Real-time updates
