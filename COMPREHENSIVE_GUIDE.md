# SentinelNet - Comprehensive Guide 🛡️

## What is SentinelNet?

**SentinelNet is a 24/7 AI-powered security team** that instantly analyzes cryptocurrency tokens to determine if they're safe to trade.

### The Problem it Solves
- New crypto tokens launch daily, many are scams or have hidden vulnerabilities
- Manual security audits take days and cost thousands
- Users need instant verification before trading
- Traditional centralized auditors are single points of failure

### The Solution
- Decentralized network of AI verification agents
- 3 agents analyze each token in parallel
- Results in ~2 seconds (vs days for traditional audits)
- Reputation-based system rewards honest agents
- Transparent, blockchain-verified results

---

## How It Works: The Complete Flow

### Step 1: Token Discovery
User discovers a new token they want to trade.

### Step 2: Request Verification
They submit the token address to SentinelNet.

### Step 3: Parallel Verification
3 specialized agents analyze it simultaneously:

```
SecurityBot Alpha (95/100 reputation)
    ↓
    Checks for contract vulnerabilities
    - Reentrancy attacks
    - Access control issues
    - Exploit patterns
    Time: ~1 second
    
LiquidityScanner Pro (88/100 reputation)
    ↓
    Analyzes trading pools
    - Pool depth
    - Trading volume
    - Slippage impact
    Time: ~1 second
    
TokenomicsAnalyzer (90/100 reputation)
    ↓
    Reviews token distribution
    - Supply fairness
    - Inflation risks
    - Developer alignment
    Time: ~1 second
```

### Step 4: Results Aggregation
All 3 reports combined into single risk score:
- **Green (Safe)**: Score 0-30
- **Yellow (Medium)**: Score 31-70
- **Red (Risky)**: Score 71-100

### Step 5: Trade Decision
User decides to trade or wait based on risk assessment.

---

## The Three Agents Explained

### 🔒 SecurityBot Alpha
**What it Does**: Security auditing
**Reputation Score**: 95/100
**Analyzes**:
- Smart contract code for vulnerabilities
- Access control mechanisms
- Known attack patterns (reentrancy, overflow, etc.)
- Permission settings
**Output**: Security risk score (0-100)
**Time**: ~0.8-1.2 seconds

### 💧 LiquidityScanner Pro
**What it Does**: Liquidity analysis
**Reputation Score**: 88/100
**Analyzes**:
- DEX liquidity pool depth
- Trading volume adequacy
- Slippage calculations
- Pool safety metrics
**Output**: Liquidity risk score (0-100)
**Time**: ~0.8-1.2 seconds

### 📈 TokenomicsAnalyzer
**What it Does**: Tokenomics review
**Reputation Score**: 90/100
**Analyzes**:
- Token supply distribution
- Hidden inflation mechanisms
- Developer/insider holdings
- Vesting schedules
- Governance structure
**Output**: Tokenomics risk score (0-100)
**Time**: ~0.8-1.2 seconds

---

## Dashboard Controls Explained

### 🎮 Button 1: Start Simulation (Backend)

**What Happens:**
```
1. Click button
2. Backend starts auto-generation service
3. Every 5 seconds, creates new random token address
4. 3 agents analyze it in parallel
5. Job completes in ~2 seconds
6. Results stored and displayed
7. Next job starts automatically
8. Continues until stopped
```

**Visual Feedback:**
- Message shows: "✅ Simulation started successfully"
- Dashboard updates in real-time
- Active Jobs counter increases
- Completed jobs counter increases

**When to Use:**
- Test the system with continuous token analysis
- See how agents handle multiple concurrent jobs
- Monitor dashboard performance under load

---

### 🎮 Button 2: Stop Simulation (Backend)

**What Happens:**
```
1. Click button
2. Backend stops creating new jobs
3. In-flight jobs complete normally
4. No new tokens created
5. Simulation enters idle state
```

**Visual Feedback:**
- Message shows: "✅ Simulation stopped successfully"
- No new jobs appear
- Existing jobs continue to completion

**When to Use:**
- Pause the simulation for inspection
- Review results without interference
- Reset dashboard before new test

---

### 🎮 Button 3: Generate Test Token (Backend)

**What Happens:**
```
1. Click button
2. Creates ONE job immediately
3. Uses fixed test address: 0x1234...5678
4. 3 agents analyze it
5. Results appear instantly
6. Job complete in ~2 seconds
```

**Visual Feedback:**
- Message shows: "✅ Test token generated successfully: [job-id]"
- Single job appears in Active Jobs
- Agents shown working on it

**When to Use:**
- Single test without auto-generation
- Test specific scenarios
- Verify system responsiveness
- Manual testing without continuous runs

---

## Real-Time Metrics Explained

### Dashboard Display
```
Active Jobs: [X]      Shows jobs currently processing
Completed: [X]        Shows finished jobs
Total Jobs: [X]       Shows all jobs created so far
```

### Example Progression
```
Time 0s:    Active: 1, Completed: 0, Total: 1
Time 2s:    Active: 0, Completed: 1, Total: 1  (Job #1 done)
Time 5s:    Active: 1, Completed: 1, Total: 2  (Job #2 starts)
Time 7s:    Active: 0, Completed: 2, Total: 2
Time 10s:   Active: 1, Completed: 2, Total: 3  (Job #3 starts)
```

---

## Real-World Use Cases

### 1. DeFi Trader
Alice discovers NEWTOKEN launching on Uniswap. She:
1. Inputs token address into SentinelNet
2. Gets instant security report
3. Sees it has vulnerabilities (Red flag)
4. Avoids the token, protecting her funds

### 2. Bot Developer
Bob runs automated trading bots. He:
1. Integrates SentinelNet API
2. Automatically screens every new token
3. Only trades tokens with Green score
4. Reduces losses by 90%

### 3. Smart Contract Auditor
Carol audits contracts part-time. She:
1. Uses SentinelNet for initial screening
2. Only deeply audits high-value contracts
3. Earns reputation as SentinelNet agent
4. Gets paid per verification

### 4. Exchange Platform
Platform X deploys SentinelNet to:
1. Verify new token listings
2. Protect users before trading
3. Reduce legal liability
4. Attract security-conscious users

---

## Technical Architecture

### Frontend (http://localhost:3000)
- Next.js 14 React app
- Real-time dashboard
- WebSocket for live updates
- Displays metrics and status

### Backend (http://localhost:3001)
- Express.js server
- Routes for simulation control
- In-memory job storage
- WebSocket server for real-time updates

### Simulation Service
- Manages job lifecycle
- Spawns agent tasks
- Calculates risk scores
- Broadcasts updates

### Agent Services
- SecurityBot: Contract analysis
- LiquidityScanner: Pool analysis
- TokenomicsAnalyzer: Distribution analysis

---

## Environment Setup

### `.env.local` Configuration
```bash
# Backend URL (where frontend sends requests)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Blockchain settings
NEXT_PUBLIC_CHAIN_ID=11155111
```

### CORS Configuration
Backend allows requests from:
- `http://localhost:3000` (frontend)
- `http://localhost:3001` (API server)

---

## Common Questions

### Q: Why 3 agents?
**A:** Each agent specializes in one area. Diversity catches different types of risks.

### Q: How fast is verification?
**A:** ~2 seconds per token (0.8-1.2s per agent in parallel).

### Q: What's the reputation system?
**A:** Agents earn reputation for accurate reports. High-reputation agents get hired more.

### Q: Can agents be wrong?
**A:** Yes, but on-chain records hold them accountable. Repeated failures reduce reputation.

### Q: Is it decentralized?
**A:** Currently simulated, but production version uses smart contracts and actual agent nodes.

### Q: What happens with the results?
**A:** Stored on-chain, users can see reports, agents tracked by history.

---

## Next Steps

1. **Run the Simulation**: Click "Start Simulation" and watch agents work
2. **Monitor Metrics**: Watch Active/Completed/Total job counters
3. **Test Buttons**: Try all 3 buttons to understand system behavior
4. **Review Results**: Examine how agents work in parallel
5. **Plan Production**: Consider real-world integration

---

## Key Takeaway

**SentinelNet = Instant AI Security Audit for Crypto Tokens**

It solves the critical need for quick, reliable, decentralized verification of new tokens before users risk their funds. The 3-agent parallel approach is faster and more reliable than traditional audits.

---

*Last Updated: March 25, 2026*
