# 🎨 SentinelNet Dashboard - Next.js Frontend

Modern financial analytics dashboard for the SentinelNet decentralized verification network.

## ✨ Features

### 🏠 **Homepage**
- Hero section with gradient branding
- Feature cards with hover effects
- Real-time statistics display
- "How It Works" walkthrough

### 👥 **Agent Marketplace** (`/agents`)
- Browse all verification agents
- Filter by specialization (Security, Liquidity, Tokenomics, Market Analysis)
- View reputation scores with visual gauges
- Success rate tracking
- Reputation leaderboard with top 5 agents
- Real-time status indicators
- Price per verification display

### 🔍 **Token Risk Analyzer** (`/risk-analyzer`)
- Enter any ERC-20 token address
- Comprehensive risk assessment
- **Safety Status Indicators:**
  - Safe to Trade ✓
  - Consensus Reached
  - Blacklist Status
- **Visual Analytics:**
  - Overall risk score (0-100)
  - Score breakdown (Security, Liquidity, Tokenomics)
  - Radar chart for risk profile
  - Pie chart for score distribution
- **Risk Gauges:**
  - Color-coded progress bars
  - Green (80+), Yellow (60-79), Red (<60)

### 📄 **Audit Reports** (`/audits`)
- Search audit reports by token address
- **Timeline Visualization:**
  - Chronological report display
  - Gradient timeline with dots
  - Timestamp information
- **Detailed Report Cards:**
  - Auditor information
  - Risk level badges
  - Individual scores (Security, Liquidity, Tokenomics, Overall)
  - Key findings section
- **Summary Statistics:**
  - Total audits
  - Average score
  - Unique auditors count

### 🤖 **Autonomous Trade Panel** (`/trade`)
- Real-time trade safety evaluation
- **AI-Powered Recommendations:**
  - ✅ EXECUTE (Safe to trade)
  - ⚠️ CAUTION (Proceed with care)
  - ❌ REJECT (High risk)
- **Safety Checks:**
  - Token safety verification
  - Consensus validation
  - Blacklist checking
- **Risk Metrics:**
  - Overall risk score
  - Risk level classification
  - Audit count display
- Visual feedback with color-coded status

## 🎨 Design System

### Color Palette
```css
Background:    #0a0e1a (main), #111827 (secondary), #1f2937 (tertiary)
Primary:       #3b82f6 (blue)
Success:       #10b981 (green)
Danger:        #ef4444 (red)
Warning:       #f59e0b (amber)
Accent Cyan:   #06b6d4
Accent Purple: #a855f7
Accent Pink:   #ec4899
```

### Components
- **Cards**: Elevated panels with hover effects
- **Buttons**: Primary, Secondary, Success, Danger variants
- **Badges**: Success, Danger, Warning, Info states
- **Inputs**: Dark theme with focus states
- **Gauges**: Animated progress bars with color gradients
- **Stats Cards**: Hover-enabled statistics display

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, gradient text effects
- **Body**: Gray-100 on dark background
- **Mono**: Code/address display

## 🔧 Technology Stack

### Core
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React

### Web3
- **Blockchain**: Ethers.js 6.9
- **Wallet**: MetaMask integration
- **Network**: Ethereum (Sepolia testnet)

### Data Visualization
- **Charts**: Recharts 2.10
  - Radar charts for risk profiles
  - Pie charts for score distribution
  - Responsive containers

### Utilities
- **HTTP Client**: Axios 1.6
- **Date Formatting**: date-fns 3.3
- **Class Management**: clsx 2.1

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout with navbar
│   │   ├── globals.css           # Global styles & Tailwind
│   │   ├── agents/
│   │   │   └── page.tsx          # Agent Marketplace
│   │   ├── risk-analyzer/
│   │   │   └── page.tsx          # Token Risk Analyzer
│   │   ├── audits/
│   │   │   └── page.tsx          # Audit Reports
│   │   └── trade/
│   │       └── page.tsx          # Trade Panel
│   ├── components/
│   │   └── layout/
│   │       └── Navbar.tsx        # Main navigation
│   ├── context/
│   │   └── WalletContext.tsx    # Web3 wallet provider
│   └── types/
│       └── window.d.ts           # TypeScript declarations
├── public/                        # Static assets
├── .env.example                   # Environment template
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MetaMask browser extension
- Backend API running (default: http://localhost:4000)

### Installation

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_AGENT_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_TRADE_EXECUTOR_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Open Browser**
Navigate to http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## 🔌 API Integration

The dashboard connects to the SentinelNet backend API:

### Agent Marketplace
```typescript
GET /api/agents              // All agents
GET /api/agents/top          // Top agents by reputation
GET /api/agents/security     // Filter by specialization
```

### Risk Analyzer
```typescript
GET /api/audits/:token       // Token audit reports
```

### Trade Panel
```typescript
POST /api/trade              // Evaluate trade safety
Body: { tokenAddress: "0x..." }
```

## 🌐 Wallet Integration

### MetaMask Connection
- Connect/Disconnect button in navbar
- Automatic network detection
- Account switching support
- Persistent connection across pages

### Supported Networks
- Ethereum Mainnet (Chain ID: 1)
- Sepolia Testnet (Chain ID: 11155111)
- Goerli Testnet (Chain ID: 5)

## 🎯 Page-by-Page Guide

### 1. Homepage (`/`)
**Purpose**: Landing page and navigation hub

**Features**:
- Hero section with SentinelNet branding
- 4 feature cards linking to main pages
- Statistics dashboard (24/7 monitoring, 95%+ accuracy, etc.)
- "How It Works" 3-step process

**Navigation**:
- "Explore Agents" → `/agents`
- "Analyze Token" → `/risk-analyzer`

---

### 2. Agent Marketplace (`/agents`)
**Purpose**: Browse and evaluate verification agents

**Layout**:
- Stats bar (Total, Active, Verifications, Avg Reputation)
- Filter buttons (All, Security, Liquidity, Tokenomics, Market)
- Agent cards grid (3 columns on desktop)
- Reputation leaderboard (Top 5)

**Agent Card Contents**:
- Agent name and icon
- Specialization badge
- Active status indicator
- Reputation score with progress bar
- Total jobs and success rate
- Price per verification
- Contract address (truncated)

**Interactions**:
- Click filter buttons to filter agents
- Hover cards for visual feedback
- View detailed statistics

---

### 3. Risk Analyzer (`/risk-analyzer`)
**Purpose**: Comprehensive token risk assessment

**Workflow**:
1. Enter token address (0x...)
2. Click "Analyze" button
3. View results:
   - Safety status (Safe/High Risk)
   - Consensus reached indicator
   - Blacklist status
   - Overall risk score (large display)
   - Risk level badge
   - Score breakdown gauges
   - Radar chart (risk profile)
   - Pie chart (score distribution)

**Visual Indicators**:
- Green checkmarks = Safe/Passed
- Red X marks = Unsafe/Failed
- Yellow warning = No consensus
- Color-coded scores (Green 80+, Yellow 60-79, Red <60)

---

### 4. Audit Reports (`/audits`)
**Purpose**: View detailed verification reports

**Layout**:
- Search box for token address
- Timeline visualization (gradient line with dots)
- Report cards (chronologically sorted)
- Summary statistics (Total audits, Avg score, Unique auditors)

**Report Card Contents**:
- Auditor name and address
- Risk level badge
- Timestamp (formatted)
- 4 score metrics (Security, Liquidity, Tokenomics, Overall)
- Key findings section (text)

**Timeline Features**:
- Vertical gradient line (blue → cyan → purple)
- Chronological order (newest first)
- Visual connection between reports

---

### 5. Trade Panel (`/trade`)
**Purpose**: Real-time trade safety evaluation

**Workflow**:
1. Enter token address
2. Click "Evaluate Trade"
3. View recommendation:
   - **EXECUTE** (Green) - Safe to trade
   - **CAUTION** (Yellow) - Proceed carefully
   - **REJECT** (Red) - High risk, do not trade

**Result Display**:
- Large icon (✓ / ⚠️ / ✗)
- Recommendation text (EXECUTE/CAUTION/REJECT)
- Reason explanation
- Safety checks panel:
  - Token safety ✓/✗
  - Consensus reached ✓/✗
  - Blacklist status ✓/✗
- Risk metrics panel:
  - Overall score gauge
  - Risk level badge
  - Audit count
- Action buttons (Proceed / Evaluate Another)

**Before Results**:
- "How It Works" 3-step guide
- Submit Token → AI Analysis → Get Recommendation

---

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Collapsible navigation on mobile
- Grid layouts adapt to screen size

### Animations
- Fade-in on page load
- Slide-up for dynamic content
- Pulse effect for active indicators
- Smooth transitions on hover
- Loading spinners

### Interactive Elements
- Hover effects on cards
- Color transitions on buttons
- Focus states on inputs
- Disabled states
- Loading states

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Validate required variables on startup

### Wallet Safety
- User must approve all transactions
- No private key storage
- MetaMask handles signing
- Clear disconnect option

### API Communication
- HTTPS in production
- Error handling on all requests
- Input validation
- Rate limiting awareness

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)
Set in deployment platform:
- `NEXT_PUBLIC_API_URL=https://api.sentinelnet.io`
- `NEXT_PUBLIC_CHAIN_ID=1` (mainnet)
- Contract addresses
- RPC URL

## 📊 Performance Optimization

### Implemented
- Next.js 14 App Router (React Server Components)
- Tailwind CSS (minimal bundle size)
- Code splitting (automatic by Next.js)
- Image optimization (Next.js Image component ready)
- Font optimization (Google Fonts with next/font)

### Recommended
- Enable caching headers
- Use CDN for static assets
- Implement API response caching
- Add loading skeletons
- Implement virtual scrolling for large lists

## 🐛 Troubleshooting

### MetaMask Not Detected
```typescript
if (!window.ethereum) {
  alert('Please install MetaMask!')
}
```

### Wrong Network
- Dashboard shows current network
- User must switch in MetaMask
- Check `chainId` in wallet context

### API Connection Failed
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Inspect browser console for errors
- Test API directly with curl

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## 🎯 Future Enhancements

### Potential Features
- [ ] Real-time WebSocket updates
- [ ] Historical price charts
- [ ] Multi-chain support
- [ ] Dark/Light theme toggle
- [ ] Custom alert system
- [ ] Portfolio tracking
- [ ] Trade execution (direct from UI)
- [ ] Agent performance analytics
- [ ] Export reports (PDF/CSV)
- [ ] User dashboard with saved tokens
- [ ] Mobile app (React Native)

### Performance
- [ ] Implement SWR for data fetching
- [ ] Add service worker for offline support
- [ ] Optimize bundle size analysis
- [ ] Add performance monitoring (Sentry)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Recharts Documentation](https://recharts.org/)

## 📝 License

MIT License - Built for SentinelNet

## 🤝 Contributing

Contributions welcome! Please follow:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

**Built with ❤️ for the SentinelNet Ecosystem**
