# Recent Verification Jobs Table

## Overview
The Recent Verification Jobs Table displays a comprehensive history of completed token verifications with detailed scoring, risk assessment, and execution metrics. It automatically updates as new jobs complete.

## Table Columns

### 1. Token Address
- **Format**: Truncated Ethereum address (first 10 + last 8 chars)
- **Example**: `0x12345678...90abcdef`
- **Sub-info**: Completion timestamp
- **Font**: Monospace for clarity

### 2. Security Score (🔒)
- **Range**: 0-100
- **Display**: Rounded badge with color coding
- **Precision**: 1 decimal place
- **Icon**: Shield symbol in header

**Color Coding:**
- 0-30: Green (Safe)
- 31-60: Yellow (Warning)
- 61-100: Red (Danger)

### 3. Liquidity Score (📈)
- **Range**: 0-100
- **Display**: Rounded badge with color coding
- **Precision**: 1 decimal place
- **Icon**: Trending up symbol in header

**Color Coding:**
- Same as Security Score

### 4. Tokenomics Score (📊)
- **Range**: 0-100
- **Display**: Rounded badge with color coding
- **Precision**: 1 decimal place
- **Icon**: Bar chart symbol in header

**Color Coding:**
- Same as Security Score

### 5. Final Risk Score
- **Range**: 0-100
- **Display**: Larger badge (emphasized)
- **Precision**: 1 decimal place
- **Styling**: 2px border, larger padding

**Calculation:**
```
(Security × 0.5) + (Liquidity × 0.3) + (Tokenomics × 0.2)
```

**Color Coding:**
- 0-30: Green background/text
- 31-60: Yellow background/text
- 61-100: Red background/text

### 6. Risk Level
- **Values**: SAFE | WARNING | DANGER
- **Display**: Rounded pill badge
- **Font**: Bold, all caps

**Color Mapping:**
- SAFE: Green badge (white text)
- WARNING: Yellow badge (white text)
- DANGER: Red badge (white text)

### 7. Decision
- **Values**: APPROVE | REVIEW | REJECT
- **Display**: Rounded pill badge with icon
- **Font**: Bold, all caps

**Decision Badges:**
| Decision | Color | Icon | Meaning |
|----------|-------|------|---------|
| APPROVE | Green | ✓ CheckCircle | Safe to trade |
| REVIEW | Yellow | ⚠ AlertCircle | Requires review |
| REJECT | Red | ✕ XCircle | Do not trade |

### 8. Execution Time (⏱️)
- **Format**: Minutes and seconds (e.g., "2m 34s") or seconds only (e.g., "45s")
- **Display**: Clock icon + time
- **Calculation**: completedAt - startedAt

## Visual Design

### Desktop View (Large Screens)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Token Address     │ 🔒 │ 💧 │ 📊 │ Final │ Risk  │ Decision │ ⏱️ Time │
│                   │ Sec│ Liq│ Tok│ Risk  │ Level │          │          │
├─────────────────────────────────────────────────────────────────────────┤
│ 0x1234...cdef     │ 25 │ 35 │ 40 │ 32.5  │ WARN  │ REVIEW   │ 2m 15s   │
│ 2024-03-10 14:30  │ 🟢 │ 🟡 │ 🟡 │ 🟡   │ 🟡   │ 🟡      │          │
├─────────────────────────────────────────────────────────────────────────┤
│ 0xabcd...5678     │ 15 │ 20 │ 18 │ 17.5  │ SAFE  │ APPROVE  │ 1m 45s   │
│ 2024-03-10 14:25  │ 🟢 │ 🟢 │ 🟢 │ 🟢   │ 🟢   │ 🟢      │          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile/Tablet View (Small Screens)
```
┌────────────────────────────────────┐
│ 0x1234...cdef         ⏱️ 2m 15s  │
│ 2024-03-10 14:30:00               │
│                                    │
│ Security  Liquidity  Tokenomics   │
│   25.0      35.0       40.0       │
│   🟢        🟡         🟡         │
│                                    │
│ Final Risk  Risk Level  Decision  │
│    32.5       WARN      REVIEW    │
│    🟡         🟡         🟡       │
└────────────────────────────────────┘
```

## Color System

### Badge Colors

**Green (Safe: 0-30)**
```css
background: rgba(16, 185, 129, 0.2)
text: #34D399
border: rgba(16, 185, 129, 0.5)
```

**Yellow (Warning: 31-60)**
```css
background: rgba(245, 158, 11, 0.2)
text: #FBBF24
border: rgba(245, 158, 11, 0.5)
```

**Red (Danger: 61-100)**
```css
background: rgba(239, 68, 68, 0.2)
text: #F87171
border: rgba(239, 68, 68, 0.5)
```

### Decision/Risk Level Solid Badges

**Green (SAFE/APPROVE)**
```css
background: #10B981
text: #FFFFFF
border: #10B981
```

**Yellow (WARNING/REVIEW)**
```css
background: #F59E0B
text: #FFFFFF
border: #F59E0B
```

**Red (DANGER/REJECT)**
```css
background: #EF4444
text: #FFFFFF
border: #EF4444
```

## Features

### 1. Auto-Refresh
- Updates every 1 second via `useJobManager` hook
- Shows "Auto-refreshing" indicator
- Clock icon in header

### 2. Sorting
- Most recent jobs first
- Sorted by completion timestamp
- Displays last 10 jobs maximum

### 3. Responsive Layout
- **Desktop (lg+)**: Full table view
- **Mobile/Tablet**: Card-based view
- Smooth transitions between layouts

### 4. Empty State
```
┌─────────────────────────────┐
│                             │
│         📊                  │
│   No completed jobs yet     │
│ Start a verification to     │
│   see results here          │
│                             │
└─────────────────────────────┘
```

### 5. Interactive Elements
- Row hover effect (desktop)
- Color-coded badges
- Icon indicators
- Timestamp display

### 6. Legend
At bottom of table:
```
Color Legend:
🟢 SAFE / APPROVE (0-30)
🟡 WARNING / REVIEW (31-60)
🔴 DANGER / REJECT (61-100)
```

## Data Flow

### When Job Completes
1. Job status changes to 'completed'
2. Table auto-refreshes (1s interval)
3. New row added at top
4. Oldest row removed if > 10 jobs
5. Badges calculated from scores
6. Execution time computed

### Score Calculation Flow
```
Agent Results
    ↓
Security Score (0-100)
Liquidity Score (0-100)
Tokenomics Score (0-100)
    ↓
Weighted Aggregation
    ↓
Final Risk Score (0-100)
    ↓
Risk Level (SAFE/WARNING/DANGER)
    ↓
Trade Decision (APPROVE/REVIEW/REJECT)
```

## Usage

### Basic Integration
```tsx
import { RecentVerificationJobsTable } from '@/components/RecentVerificationJobsTable'

<RecentVerificationJobsTable />
```

### Features Used
- `useJobManager()` hook for real-time data
- Auto-refresh every 1 second
- Filter: Only completed jobs
- Sort: By completion time (desc)
- Limit: Last 10 jobs

## Component Props

### RecentVerificationJobsTable
No props required - fully self-contained.

**Uses:**
- `useJobManager({ autoRefresh: true, refreshInterval: 1000 })`
- Filters completed jobs automatically
- Sorts by completion time
- Limits to 10 most recent

## Display Logic

### Score Badge Color
```typescript
const getScoreBadgeColor = (score: number) => {
  if (score <= 30) return 'green'
  if (score <= 60) return 'yellow'
  return 'red'
}
```

### Risk Level Badge
```typescript
const getRiskLevelBadge = (level: string) => {
  switch (level) {
    case 'SAFE': return 'green solid'
    case 'WARNING': return 'yellow solid'
    case 'DANGER': return 'red solid'
  }
}
```

### Decision Badge
```typescript
const getDecisionBadge = (decision: string) => {
  switch (decision) {
    case 'APPROVE': return 'green solid + checkmark'
    case 'REVIEW': return 'yellow solid + alert'
    case 'REJECT': return 'red solid + x'
  }
}
```

### Execution Time Formatting
```typescript
const calculateExecutionTime = (job) => {
  const diffMs = completedAt - startedAt
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  
  return minutes > 0 
    ? `${minutes}m ${remaining}s`
    : `${seconds}s`
}
```

## Performance

### Optimizations
- Only fetches completed jobs
- Limits to 10 rows (prevents large lists)
- Efficient sorting algorithm
- Memoized calculations
- CSS-based styling (no JS animations)

### Update Frequency
- Auto-refresh: 1 second
- Minimal re-renders via React optimization
- Efficient diff algorithm

## Accessibility

### Visual Indicators
- Color + text labels
- Icon + text combinations
- Clear numeric values
- High contrast badges

### Screen Readers
- Semantic table structure
- Descriptive column headers
- Icon aria-labels
- Time format readable

## Mobile Responsiveness

### Breakpoints
- **< 1024px**: Card view
- **≥ 1024px**: Table view

### Card View Features
- Stacked layout
- Grouped information
- Clear separators
- Touch-friendly spacing

## Integration Points

### Job Manager Integration
```typescript
const { jobs } = useJobManager({
  autoRefresh: true,
  refreshInterval: 1000
})

const completedJobs = jobs
  .filter(job => job.status === 'completed')
  .sort((a, b) => b.completedAt - a.completedAt)
  .slice(0, 10)
```

### Activity Log Integration
Jobs in this table automatically logged to activity log system.

## Files
- `/components/RecentVerificationJobsTable.tsx` - Main component
- `/app/page.tsx` - Integration example
- `/lib/jobManager.ts` - Data source
- `/hooks/useJobManager.ts` - Real-time updates
