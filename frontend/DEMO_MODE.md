# Demo Mode

## Overview
Demo Mode is an automated demonstration feature that continuously runs token verification jobs without manual user input. It showcases the complete system workflow including agent execution, risk assessment, and decision-making.

## Features

### 1. Automatic Token Generation
- Generates realistic-looking Ethereum addresses
- Format: `0x` + 40 hexadecimal characters
- Random generation using crypto-quality randomness
- Each address is unique

### 2. Continuous Verification
- Runs verification every 10 seconds
- Automatic job creation and execution
- Full pipeline demonstration
- Real-time UI updates

### 3. Visual Indicators
- Green toggle button in navbar when active
- Animated banner on homepage
- Running count of completed verifications
- Pulsing play icon animation

## User Interface

### Navbar Toggle Button

**Inactive State:**
```
┌──────────────┐
│ ▶ Demo Mode  │  Gray background
└──────────────┘  Gray text
```

**Active State:**
```
┌──────────────────┐
│ ■ Demo Mode ON 5 │  Green background
└──────────────────┘  White text + counter badge
```

### Homepage Banner (Active Only)

```
┌─────────────────────────────────────────────────────┐
│ 🎬 ▶ Demo Mode Active              5               │
│     Automatically running           verifications   │
│     verifications every 10 seconds  run             │
└─────────────────────────────────────────────────────┘
  Green border, pulsing animation
```

## How It Works

### Activation Flow
```
1. User clicks "Demo Mode" in navbar
   ↓
2. Demo Mode enabled
   ↓
3. First verification runs immediately
   ↓
4. Timer starts (10 second interval)
   ↓
5. Verifications run automatically
   ↓
6. UI updates in real-time
```

### Verification Workflow
```
Demo Mode ON
    ↓
Generate fake token address (0x...)
    ↓
Create verification job
    ↓
Run agents sequentially:
  - SecurityBot (2-4s)
  - LiquidityScanner (2-4s)
  - TokenomicsAnalyzer (2-4s)
    ↓
Aggregate risk scores
    ↓
Calculate final decision
    ↓
Update UI components:
  - Pipeline animation
  - Agent cards
  - Risk gauge
  - Jobs table
    ↓
Wait 10 seconds
    ↓
Repeat
```

## Components

### 1. useDemoMode Hook
**Location**: `/hooks/useDemoMode.ts`

**Features:**
- Manages demo state
- Handles interval timing
- Generates fake addresses
- Tracks verification count
- Provides control functions

**API:**
```typescript
const {
  isEnabled,      // boolean - is demo mode on?
  demoCount,      // number - verifications run
  startDemo,      // function - enable demo mode
  stopDemo,       // function - disable demo mode
  toggleDemo,     // function - toggle state
  runDemoVerification, // function - run one verification
} = useDemoMode({ interval: 10000 })
```

### 2. DemoModeContext
**Location**: `/context/DemoModeContext.tsx`

**Purpose:**
- Global state management
- Share demo state across app
- Provide consistent API

**Usage:**
```typescript
import { useDemoModeContext } from '@/context/DemoModeContext'

const { isEnabled, demoCount, toggleDemo } = useDemoModeContext()
```

### 3. DemoModeToggle Component
**Location**: `/components/DemoModeToggle.tsx`

**Features:**
- Visual toggle button
- State-based styling
- Counter badge
- Responsive design

**Props:**
```typescript
interface DemoModeToggleProps {
  isEnabled: boolean    // current state
  demoCount: number     // verifications run
  onToggle: () => void  // toggle callback
}
```

## Configuration

### Timing
```typescript
const DEMO_INTERVAL = 10000 // milliseconds (10 seconds)
```

### Token Generation
```typescript
const generateFakeTokenAddress = (): string => {
  const chars = '0123456789abcdef'
  let address = '0x'
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)]
  }
  return address
}
```

## UI Updates

### Real-Time Components Updated

1. **Verification Pipeline**
   - Step status changes
   - Progress animations
   - Color transitions

2. **Agent Cards**
   - Status: Idle → Running → Completed
   - Pulsing borders when running
   - Score display when done
   - Progress bars

3. **Risk Gauge**
   - Animated counting
   - Color transitions
   - Score filling

4. **Jobs Table**
   - New row added
   - Color-coded badges
   - Execution time
   - Decision results

5. **Activity Log**
   - Real-time event stream
   - All agent activities
   - Risk calculations
   - Trade decisions

## Control Actions

### Start Demo Mode
```typescript
// Click navbar toggle button
// OR
startDemo()

// Results:
// - Button turns green
// - Banner appears on homepage
// - First verification runs immediately
// - Interval timer starts
```

### Stop Demo Mode
```typescript
// Click navbar toggle button again
// OR
stopDemo()

// Results:
// - Button turns gray
// - Banner disappears
// - Interval timer stops
// - No more auto-verifications
```

### Toggle Demo Mode
```typescript
toggleDemo()

// Results:
// - Switches between on/off states
// - Same as clicking button
```

## State Persistence

**Note**: Demo Mode state is NOT persisted across page refreshes.
- Refreshing page stops demo mode
- Counter resets to 0
- All jobs remain in history

## Use Cases

### 1. Product Demonstrations
- Show system capabilities
- Demonstrate full workflow
- No manual input needed
- Continuous action

### 2. Testing
- Stress test UI updates
- Verify real-time sync
- Test job manager
- Validate agents

### 3. Showcasing
- Sales presentations
- Live demos
- Conference displays
- Video recordings

### 4. Development
- Quick data generation
- UI testing
- Performance monitoring
- Feature validation

## Console Logging

Demo mode logs key events:

```
🎬 Demo Mode: Started (running every 10s)
🎬 Demo Mode: Starting verification for 0x1234...
✅ Demo Mode: Verification completed
⏹️ Demo Mode: Stopped
```

## Performance Considerations

### Resource Usage
- Each verification: ~6-12 seconds
- Interval: 10 seconds
- Overlap: Jobs can overlap if one takes >10s
- Memory: Keeps last 10 jobs in table

### Recommendations
- Don't run for extended periods
- Monitor browser memory
- Clear jobs periodically
- Stop when not needed

## Integration

### Layout Integration
```typescript
// app/layout.tsx
<WalletProvider>
  <DemoModeProvider>  {/* Wraps entire app */}
    <Navbar />        {/* Contains toggle */}
    <main>
      {children}      {/* All pages have access */}
    </main>
  </DemoModeProvider>
</WalletProvider>
```

### Navbar Integration
```typescript
// components/layout/Navbar.tsx
const { isEnabled, demoCount, toggleDemo } = useDemoModeContext()

<DemoModeToggle 
  isEnabled={isEnabled}
  demoCount={demoCount}
  onToggle={toggleDemo}
/>
```

### Homepage Integration
```typescript
// app/page.tsx
const { isEnabled: isDemoMode, demoCount } = useDemoModeContext()

{isDemoMode && (
  <DemoBanner count={demoCount} />
)}
```

## Styling

### Toggle Button Colors
```css
/* Inactive */
background: rgb(55, 65, 81)    /* gray-700 */
border: rgb(75, 85, 99)        /* gray-600 */
text: rgb(209, 213, 219)       /* gray-300 */

/* Active */
background: rgb(34, 197, 94)   /* green-500 */
text: white
shadow: 0 0 20px rgba(34, 197, 94, 0.3)
```

### Banner Colors
```css
background: linear-gradient(
  to right,
  rgba(34, 197, 94, 0.2),
  rgba(34, 197, 94, 0.1),
  rgba(34, 197, 94, 0.2)
)
border: 2px solid rgb(34, 197, 94)
animation: pulse
```

## Animations

### Play Icon (Active)
- Main icon: green filled
- Ping effect: expanding duplicate
- Continuous animation

### Banner
- Pulsing opacity
- Subtle scale animation
- Green glow effect

### Toggle Button
- Smooth color transitions
- Shadow animations
- Badge fade in/out

## Future Enhancements

### Potential Features
- [ ] Configurable interval (5s, 10s, 30s)
- [ ] Pause/Resume functionality
- [ ] Demo mode presets (fast, normal, slow)
- [ ] History of demo runs
- [ ] Export demo results
- [ ] Custom token address patterns
- [ ] Notification sounds
- [ ] Demo statistics dashboard

## Troubleshooting

### Demo Mode Won't Start
- Check console for errors
- Verify DemoModeProvider is in layout
- Ensure job manager is working
- Check network connectivity

### Verifications Not Running
- Confirm demo mode is enabled
- Check 10-second interval
- Verify job manager status
- Look for error logs

### UI Not Updating
- Verify auto-refresh is enabled
- Check job manager hook
- Confirm components are mounted
- Review console warnings

## Files

- `/hooks/useDemoMode.ts` - Core demo logic
- `/context/DemoModeContext.tsx` - Global state
- `/components/DemoModeToggle.tsx` - Toggle button
- `/components/layout/Navbar.tsx` - Integration
- `/app/layout.tsx` - Provider setup
- `/app/page.tsx` - Banner display
