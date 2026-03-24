# Verification Pipeline Component

## Overview
The Verification Pipeline is a visual component that displays the real-time progress of token verification through a 6-step workflow. It provides animated, color-coded status updates as each stage of the verification process completes.

## Pipeline Steps

1. **Token Submitted** 🪙
   - Token address received
   - Status: Complete when job starts

2. **Security Analysis** 🔒
   - SecurityBot scanning for vulnerabilities
   - Checks: Smart contract security, ownership, backdoors

3. **Liquidity Analysis** 💧
   - LiquidityScanner analyzing market depth
   - Checks: Pool liquidity, trading volume, price stability

4. **Tokenomics Analysis** 📊
   - TokenomicsAnalyzer evaluating economic model
   - Checks: Token distribution, supply mechanics, utility

5. **Risk Engine** ⚖️
   - Aggregating all scores with weighted formula
   - Formula: `(Security × 0.5) + (Liquidity × 0.3) + (Tokenomics × 0.2)`

6. **Trade Decision** ✅
   - Final recommendation based on risk level
   - Outcomes: APPROVE, REVIEW, or REJECT

## Status States

### Idle (⚪ Gray)
- Step hasn't started yet
- Gray border, reduced opacity
- Waiting for previous steps to complete

### Running (🔵 Blue)
- Step is currently executing
- Pulsing blue border with glow effect
- Animated progress bar
- Sliding shimmer effect
- Scale transform (105%)

### Complete (✅ Green)
- Step finished successfully
- Green border with success icon
- Displays score/result
- Static styling

### Error (❌ Red)
- Step failed
- Red border with error icon
- Error state preserved

## Visual Features

### Desktop View (Horizontal)
- All 6 steps displayed in a row
- Animated connectors between steps
- Flowing gradient on active connections
- Responsive card sizing

### Mobile/Tablet View (Vertical)
- Stacked vertical layout
- Vertical connectors
- Same animations and status indicators
- Optimized for narrow screens

### Animations

1. **Step Highlighting**
   - Running steps scale up (105%)
   - Pulsing glow effect around border
   - Blue gradient background

2. **Progress Indicators**
   - Horizontal progress bar with sliding gradient
   - Continuous left-to-right animation
   - Multi-color gradient (blue → cyan → blue)

3. **Connector Animations**
   - Active connectors pulse
   - Gradient flows from completed to running steps
   - Shimmer effect slides along connector

4. **Ping Effect**
   - Outer border pulses outward
   - Creates radar-like scanning effect
   - Only on running steps

## Integration

```tsx
import { VerificationPipeline } from '@/components/VerificationPipeline'

<VerificationPipeline job={currentJob} />
```

### Props
- `job`: VerificationJob | null - The current verification job to display

### Auto-Updates
The pipeline automatically updates when the job state changes through the useJobManager hook's auto-refresh feature (1 second interval).

## CSS Animations

Custom animations defined in `globals.css`:

```css
.animate-pulse-slow - Slower pulse animation (3s)
.animate-glow - Glow effect for borders
.animate-slide-progress - Sliding progress indicator
```

## Color Coding

- **Blue (#3B82F6)**: Running/In Progress
- **Green (#10B981)**: Complete/Success
- **Red (#EF4444)**: Error/Failed
- **Gray (#4B5563)**: Idle/Waiting

## Usage Example

1. User enters token address
2. Clicks "Start Verification"
3. Pipeline shows:
   - ✅ Token Submitted (instant complete)
   - 🔵 Security Analysis (running, 2-4s)
   - ⚪ Other steps (waiting)
4. As each agent completes:
   - Current step: Running → Complete
   - Next step: Idle → Running
   - Connector animates between steps
5. Final state shows all steps complete with scores

## Performance

- Lightweight animations (CSS-based)
- No expensive re-renders
- Efficient state updates via React hooks
- Responsive to all screen sizes

## Accessibility

- Clear visual status indicators
- Color + icon + text labels
- Descriptive step names
- Score displays for quantitative feedback
- Legend for status meanings

## Files

- `/components/VerificationPipeline.tsx` - Main component
- `/app/globals.css` - Custom animations
- `/app/page.tsx` - Integration example
