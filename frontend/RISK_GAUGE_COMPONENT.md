# Risk Gauge Component

## Overview
The Risk Gauge is an animated circular gauge component that visually displays risk scores from 0-100 with color-coded ranges and smooth animations.

## Visual Design

### Circular SVG Gauge
- **SVG-based rendering** for smooth, scalable graphics
- **Circular progress indicator** that fills clockwise
- **Gradient colors** for smooth visual transitions
- **Configurable size and stroke width**

### Score Display
- Large centered score number (0.0 - 100.0)
- Risk level badge (SAFE/WARNING/DANGER)
- Color-coded text matching gauge color
- Animated score counting effect

### Color Ranges

| Score Range | Color | Risk Level | Hex Code |
|-------------|-------|------------|----------|
| 0 - 30 | 🟢 Green | SAFE | #10B981 |
| 31 - 60 | 🟡 Yellow | WARNING | #F59E0B |
| 61 - 100 | 🔴 Red | DANGER | #EF4444 |

## Animations

### 1. Score Counting Animation
- **Duration**: 1.5 seconds
- **Easing**: Linear with 60 steps
- **Effect**: Numbers count up from 0 to target score
- **Smooth transitions** when score changes

### 2. Circle Fill Animation
- **Duration**: 0.5 seconds
- **Easing**: ease-out
- **Effect**: Progress circle fills smoothly
- **Clockwise rotation** starting from top

### 3. Active State Effects
When animating:
- **Glow filter** around the stroke
- **Pulse ring** expands outward
- **Shadow glow** on container
- **Visual feedback** for active calculation

### 4. Color Transitions
- Smooth transitions between color states
- Gradient fills for depth
- Consistent timing (300ms)

## Component Variants

### Full Gauge (Default)
```tsx
<RiskGauge 
  score={45.5} 
  size={240} 
  strokeWidth={24}
  animate={true}
  showLabel={true}
/>
```
- Full-size display (240px default)
- Shows risk level label
- Includes legend markers
- Animated counting

### Mini Gauge
```tsx
<RiskGaugeMini 
  score={45.5} 
  size={120}
/>
```
- Compact display (120px default)
- No label shown
- No legend markers
- Faster animations

## Props

### RiskGauge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | number | required | Risk score (0-100) |
| `size` | number | 200 | Diameter in pixels |
| `strokeWidth` | number | 20 | Thickness of gauge stroke |
| `animate` | boolean | true | Enable counting animation |
| `showLabel` | boolean | true | Show risk level badge |

### RiskGaugeMini

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | number | required | Risk score (0-100) |
| `size` | number | 120 | Diameter in pixels |

## Usage Examples

### Basic Usage
```tsx
import { RiskGauge } from '@/components/RiskGauge'

<RiskGauge score={42.5} />
```

### Custom Size
```tsx
<RiskGauge 
  score={75.0} 
  size={300} 
  strokeWidth={30}
/>
```

### Without Animation
```tsx
<RiskGauge 
  score={25.0} 
  animate={false}
/>
```

### Mini Version
```tsx
import { RiskGaugeMini } from '@/components/RiskGauge'

<RiskGaugeMini score={55.0} />
```

## Integration

### In Trade Decision Panel
The gauge is prominently displayed in the verification results:

```tsx
{currentJob.status === 'completed' && currentJob.finalRiskScore !== null && (
  <div className="trade-decision-panel">
    <RiskGauge 
      score={currentJob.finalRiskScore} 
      size={240} 
      strokeWidth={24} 
    />
  </div>
)}
```

### Layout Structure
```
┌─────────────────────────────────────┐
│  Verification Complete              │
├──────────────────┬──────────────────┤
│                  │                  │
│   [Risk Gauge]   │  Decision Details│
│   (Animated)     │  - Risk Level    │
│                  │  - Trade Decision│
│                  │  - Score Breakdown│
│                  │                  │
└──────────────────┴──────────────────┘
```

## Technical Details

### SVG Architecture
```tsx
<svg>
  {/* Gradient definition */}
  <linearGradient id="gaugeGradient">
    <stop offset="0%" stopColor={gradientStart} />
    <stop offset="100%" stopColor={gradientEnd} />
  </linearGradient>
  
  {/* Background track (gray) */}
  <circle stroke="#374151" opacity={0.3} />
  
  {/* Progress circle (colored) */}
  <circle 
    stroke="url(#gaugeGradient)"
    strokeDasharray={circumference}
    strokeDashoffset={circumference - progress}
  />
  
  {/* Pulse ring (when animating) */}
  <circle className="animate-ping" />
</svg>
```

### Circle Math
```javascript
const radius = (size - strokeWidth) / 2
const circumference = 2 * Math.PI * radius
const progress = (score / 100) * circumference
const dashOffset = circumference - progress
```

### Color Selection Logic
```javascript
const getColor = (score: number) => {
  if (score <= 30) return '#10B981'  // green
  if (score <= 60) return '#F59E0B'  // yellow
  return '#EF4444'                    // red
}
```

## Visual Features

### Legend Markers
Displayed below the gauge:
```
  🟢        🟡        🔴
 0-30      31-60    61-100
 Safe     Warning   Danger
```

### Center Content
- **Score**: Large (5xl) bold number
- **Badge**: Rounded pill with border
- **Color**: Dynamic based on score
- **Animation**: Smooth color transitions

### Active State Indicators
1. **Stroke glow** - Gaussian blur filter
2. **Pulse ring** - Expanding circle
3. **Shadow glow** - Box shadow on container
4. **All synchronized** with animation state

## Performance

### Optimizations
- CSS-based animations (GPU accelerated)
- Efficient SVG rendering
- Minimal re-renders
- Smooth 60 FPS animations
- No expensive calculations in render

### Animation Frame Budget
- Score counting: 16.67ms per step (60 FPS)
- Circle fill: CSS transition (hardware accelerated)
- Color change: CSS transition (300ms)

## Accessibility

### Visual Indicators
- Multiple ways to understand score:
  - Numeric value (large text)
  - Color coding (green/yellow/red)
  - Text label (SAFE/WARNING/DANGER)
  - Gauge fill percentage

### Responsive Design
- Scales to any size via props
- Maintains aspect ratio
- Clear at all sizes
- Touch-friendly spacing

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- SVG support required
- CSS animations support required
- Graceful degradation without animations

## Future Enhancements
- [ ] Add tick marks around circle
- [ ] Add percentage labels (25%, 50%, 75%)
- [ ] Add sound effects for score changes
- [ ] Add haptic feedback on mobile
- [ ] Add export as image feature
- [ ] Add comparison mode (multiple gauges)

## Files
- `/components/RiskGauge.tsx` - Main component
- `/app/page.tsx` - Integration example
