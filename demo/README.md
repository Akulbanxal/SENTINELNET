# 🎬 SentinelNet Demo Simulation Mode

**Perfect for Hackathon Presentations!**

A fully automated demo that simulates the entire SentinelNet autonomous verification workflow with beautiful CLI visualization.

---

## 🎯 What It Does

The demo simulates the complete end-to-end workflow:

1. **Token Discovery** - A new token appears in the system
2. **Agent Hiring** - TraderAgent hires specialized verification agents
3. **Security Analysis** - SecurityAuditBot performs comprehensive security audit
4. **Liquidity Analysis** - LiquidityRiskBot analyzes market depth and volume
5. **Tokenomics Analysis** - TokenomicsAnalysisBot evaluates token distribution
6. **Risk Aggregation** - AI engine calculates weighted risk scores
7. **Trade Decision** - TradeExecutor makes final EXECUTE/CAUTION/REJECT decision

All with **beautiful terminal visualizations**, **color-coded output**, and **real-time progress indicators**!

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd demo
npm install
```

### 2. Configure (Optional)

```bash
cp .env.example .env
# Edit .env if needed (works with defaults)
```

### 3. Run Demo

```bash
# Default: Safe token scenario
npm run demo

# Or use specific scenarios:
npm run demo:safe     # ✅ Safe token (high scores)
npm run demo:risky    # ❌ Risky token (low scores)
npm run demo:medium   # ⚠️  Medium token (mixed signals)

# Fast mode (half speed)
npm run demo:fast

# Loop through all scenarios
npm run demo:loop
```

---

## 🎨 Demo Scenarios

### 1. 🟢 Safe Token (SafeCoin)
**Expected Outcome:** EXECUTE - Safe to trade

- **Security Score:** 92/100 ✅
- **Liquidity Score:** 88/100 ✅
- **Tokenomics Score:** 85/100 ✅
- **Overall Score:** 88/100
- **Risk Level:** Low
- **Decision:** ✅ Trade will be EXECUTED

**Key Features:**
- No ownership controls
- No mint/blacklist functions
- High liquidity ($5M pool)
- Fair token distribution (top holder: 8%)
- 15,000+ holders

---

### 2. 🔴 Risky Token (ScamCoin)
**Expected Outcome:** REJECT - High risk, do not trade

- **Security Score:** 25/100 ❌
- **Liquidity Score:** 30/100 ❌
- **Tokenomics Score:** 20/100 ❌
- **Overall Score:** 25/100
- **Risk Level:** Critical
- **Decision:** ❌ Trade will be REJECTED

**Red Flags:**
- Owner can mint unlimited tokens
- Owner can blacklist wallets
- Can pause trading
- Very low liquidity ($50K)
- Top holder owns 75%
- Only 50 holders

---

### 3. 🟡 Medium Token (MediumCoin)
**Expected Outcome:** CAUTION - Proceed with care

- **Security Score:** 68/100 ⚠️
- **Liquidity Score:** 65/100 ⚠️
- **Tokenomics Score:** 62/100 ⚠️
- **Overall Score:** 65/100
- **Risk Level:** Medium
- **Decision:** ⚠️ Trade requires CAUTION

**Mixed Signals:**
- Owner can transfer ownership (concern)
- Moderate liquidity ($500K)
- Top holder owns 25% (moderate risk)
- 2,000 holders (acceptable)
- Some centralization concerns

---

## 📊 What You'll See

### Beautiful Terminal Output

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          SentinelNet Demo Simulation                      ║
║          Autonomous Verification Workflow                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Step 1: Token Discovery
────────────────────────────────────────────────────────────
✔ Token discovered!

Token Information:
┌─────────────────┬──────────────────────────────────────────┐
│ Name            │ SafeCoin                                 │
│ Symbol          │ SAFE                                     │
│ Address         │ 0x1234567890123456789012345678901234... │
│ Scenario        │ ✓ SAFE                                   │
│ Description     │ A well-audited token with high liquidity│
└─────────────────┴──────────────────────────────────────────┘

✔ Contract verified ✓

Step 2: TraderAgent Hires Verification Agents
────────────────────────────────────────────────────────────
👤 TraderAgent: "I need to verify this token before trading."

✔ Found 3 specialized agents

Hiring Agents:
✔ SecurityAuditBot hired (Reputation: 95)
✔ LiquidityRiskBot hired (Reputation: 88)
✔ TokenomicsAnalysisBot hired (Reputation: 90)

✓ All verification agents hired and ready

Step 3: SecurityAuditBot Analysis
────────────────────────────────────────────────────────────
🛡️  SecurityAuditBot: "Starting security audit..."

✔ Checking for ownership controls - SAFE ✓
✔ Checking for mint functions - SAFE ✓
✔ Checking for blacklist functions - SAFE ✓
✔ Checking for pausable functions - SAFE ✓
✔ Checking for proxy patterns - SAFE ✓

📊 Security Score: 92/100 🟢
✔ Audit report submitted ✓

... [continues through all steps]

════════════════════════════════════════════════════════════
✅ DECISION: EXECUTE TRADE
════════════════════════════════════════════════════════════

Reason: All safety checks passed. Token meets all criteria.
Action: ✅ Trade will be EXECUTED

✔ Trade order created ✓
Transaction hash: 0x1234...
```

### Real-time Progress Indicators

- ⏳ **Spinners** during processing
- ✅ **Checkmarks** for completed tasks
- ⚠️  **Warnings** for concerns
- ❌ **X marks** for failures
- 🎨 **Color-coded** scores and decisions

### Score Visualizations

```
Score Breakdown:
┌────────────┬───────┬────────┬─────────────────┐
│ Category   │ Score │ Weight │ Weighted Score  │
├────────────┼───────┼────────┼─────────────────┤
│ Security   │ 92    │ 40%    │ 36.8           │
│ Liquidity  │ 88    │ 30%    │ 26.4           │
│ Tokenomics │ 85    │ 30%    │ 25.5           │
└────────────┴───────┴────────┴─────────────────┘

Overall Risk Score: 88/100 🟢
Risk Level: Low
```

---

## 🎮 Command Options

### Run Specific Scenarios

```bash
# Safe token (high scores, EXECUTE decision)
npm run demo:safe

# Risky token (low scores, REJECT decision)
npm run demo:risky

# Medium token (mixed scores, CAUTION decision)
npm run demo -- --medium-token
```

### Speed Control

```bash
# Normal speed (default, 2s delays)
npm run demo

# Fast mode (1s delays)
npm run demo:fast
npm run demo -- --fast

# Slow mode (4s delays, good for presentations)
npm run demo -- --slow
```

### Loop Mode

```bash
# Continuously cycle through all scenarios
npm run demo:loop

# Press Ctrl+C to stop
```

### Combined Options

```bash
# Fast loop through all scenarios
npm run demo -- --fast --loop

# Slow demo of risky token
npm run demo -- --risky-token --slow
```

---

## 🎤 Presentation Tips

### For Hackathon Judges

1. **Start with Safe Token** to show the happy path
   ```bash
   npm run demo:safe
   ```

2. **Show Risky Token** to demonstrate risk detection
   ```bash
   npm run demo:risky
   ```

3. **Use Slow Mode** for live presentations
   ```bash
   npm run demo -- --slow
   ```

### Script Suggestions

> "Let me show you SentinelNet's autonomous verification in action. Here we have a token that just appeared on-chain..."

> "Watch as our TraderAgent automatically hires specialized verification agents..."

> "Each agent performs deep analysis in their domain - security, liquidity, and tokenomics..."

> "The AI aggregation engine combines all scores with weighted averages..."

> "And finally, the TradeExecutor makes an informed decision: EXECUTE, CAUTION, or REJECT!"

### Split Screen Setup

For maximum impact:
- **Left Terminal:** Run the demo
- **Right Browser:** Show dashboard at http://localhost:3000
- Watch as data appears in real-time!

---

## 🎬 Integration with Dashboard

The demo generates data that can be viewed in the SentinelNet dashboard:

### Before Demo
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open dashboard: http://localhost:3000

### During Demo
- **Agent Marketplace** (`/agents`) - See all 4 agents
- **Risk Analyzer** (`/risk-analyzer`) - Enter token address to see scores
- **Audit Reports** (`/audits`) - View timeline of verifications
- **Trade Panel** (`/trade`) - Get trade recommendations

### Data Seeding (Optional)

To pre-populate the dashboard with all three scenarios:

```bash
npm run seed
```

This adds:
- 3 tokens (Safe, Risky, Medium)
- 9 audit reports (3 per token)
- Ready-to-view data in dashboard

---

## 🛠️ Technical Details

### Architecture

```
demo/
├── src/
│   ├── demo.ts           # Main simulation script
│   └── seeder.ts         # Data seeder for backend
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── .env.example          # Configuration template
```

### Dependencies

- **ethers** - Blockchain interaction (future use)
- **chalk** - Terminal colors
- **ora** - Elegant spinners
- **boxen** - Beautiful boxes
- **cli-table3** - ASCII tables
- **dotenv** - Environment config
- **axios** - API calls

### Mock Data Structure

Each token scenario includes:
```typescript
{
  name: string
  symbol: string
  address: string
  scenario: 'safe' | 'risky' | 'medium'
  mockData: {
    security: { score, findings }
    liquidity: { score, metrics }
    tokenomics: { score, distribution }
  }
}
```

---

## 🎨 Customization

### Add New Scenarios

Edit `src/demo.ts` and add to `mockTokens`:

```typescript
const mockTokens = {
  custom: {
    name: 'CustomCoin',
    symbol: 'CUST',
    scenario: 'medium',
    mockData: {
      security: { score: 75, ... },
      liquidity: { score: 80, ... },
      tokenomics: { score: 70, ... }
    }
  }
}
```

### Adjust Timing

In `.env`:
```env
DEMO_DELAY_MS=2000    # Change delay between steps
DEMO_SPEED=fast       # or 'normal', 'slow'
```

### Modify Agent Messages

In `src/demo.ts`, find the step methods:
```typescript
console.log(chalk.green('\n👤 TraderAgent:') + ' "Your custom message"')
```

---

## 📊 Demo Workflow Details

### Step 1: Token Discovery
- Simulates on-chain detection
- Shows token metadata
- Verifies contract

### Step 2: Agent Hiring
- TraderAgent evaluates need
- Searches agent marketplace
- Hires 3 specialized agents
- Shows reputation scores

### Step 3: Security Analysis
- SecurityAuditBot performs 5 checks:
  1. Ownership controls
  2. Mint functions
  3. Blacklist mechanism
  4. Pausable functions
  5. Proxy patterns
- Calculates security score
- Submits report on-chain

### Step 4: Liquidity Analysis
- LiquidityRiskBot checks:
  1. Pool size
  2. 24h volume
  3. Holder count
  4. Liquidity depth
- Calculates liquidity score
- Submits report

### Step 5: Tokenomics Analysis
- TokenomicsAnalysisBot analyzes:
  1. Total supply
  2. Circulating supply
  3. Top holder concentration
  4. Burn percentage
- Calculates tokenomics score
- Submits report

### Step 6: Risk Aggregation
- Weighted score calculation:
  - Security: 40%
  - Liquidity: 30%
  - Tokenomics: 30%
- Determines risk level
- Shows score breakdown table

### Step 7: Trade Decision
- Consensus check (3/3 agents)
- Score threshold check (>60)
- Blacklist verification
- Final decision:
  - **EXECUTE** (score ≥80)
  - **CAUTION** (score 60-79)
  - **REJECT** (score <60)
- Creates trade order if safe

---

## 🐛 Troubleshooting

### Demo won't start
```bash
# Install dependencies
cd demo
npm install

# Check Node version (need 18+)
node --version
```

### Colors not showing
Some terminals don't support colors. Try:
- iTerm2 (macOS)
- Windows Terminal (Windows)
- GNOME Terminal (Linux)

### Demo too fast/slow
Adjust in `.env`:
```env
DEMO_DELAY_MS=3000  # Slower
DEMO_DELAY_MS=1000  # Faster
```

---

## 🎯 Use Cases

### 1. Hackathon Presentations
- Live demo of full workflow
- Visual appeal with colors and animations
- Demonstrates AI agent coordination

### 2. Investor Pitches
- Shows autonomous operation
- Highlights risk assessment capabilities
- Proves concept with real scenarios

### 3. Developer Onboarding
- Understand system architecture
- See agent interactions
- Learn data flow

### 4. Testing & QA
- Verify workflow logic
- Test edge cases
- Debug agent behavior

---

## 📚 Additional Resources

### Related Documentation
- **Main README:** `/README.md`
- **Backend API:** `/backend/README.md`
- **Frontend Guide:** `/frontend/README.md`
- **Agents Setup:** `/agents/README.md`

### Video Demo Script

Perfect 3-minute demo:
1. **0:00-0:30** - Introduction and overview
2. **0:30-1:00** - Run safe token scenario
3. **1:00-1:30** - Run risky token scenario
4. **1:30-2:30** - Show dashboard integration
5. **2:30-3:00** - Q&A highlights

---

## 🏆 Demo Best Practices

### Preparation
✅ Test demo before presentation
✅ Have backup terminal ready
✅ Increase font size for visibility
✅ Close unnecessary applications
✅ Have dashboard open in browser

### During Presentation
✅ Use slow mode for live demos
✅ Explain each step as it runs
✅ Point out key features
✅ Show dashboard simultaneously
✅ Have Q&A answers ready

### Common Questions
- **Q:** Is this real blockchain data?
  - **A:** Demo uses mock data, but system works with real contracts

- **Q:** How long does real analysis take?
  - **A:** 30-60 seconds on mainnet with GPT-4

- **Q:** Can I add custom agents?
  - **A:** Yes! Agent system is modular and extensible

---

## 🎉 Summary

The SentinelNet demo simulation provides:

✅ **Complete workflow visualization**
✅ **Beautiful terminal UI**
✅ **3 realistic scenarios**
✅ **Configurable speed**
✅ **Loop mode for continuous demo**
✅ **Dashboard integration**
✅ **Hackathon-ready**

**Perfect for showcasing SentinelNet's autonomous verification capabilities!**

---

Built with ❤️ for amazing hackathon presentations 🎤
