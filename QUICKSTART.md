# SentinelNet Quick Start Guide

This guide will help you get SentinelNet up and running in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- MetaMask wallet with Sepolia testnet ETH
- Alchemy API key (free tier works)
- OpenAI API key

## Step 1: Get API Keys (2 minutes)

### Alchemy API Key
1. Go to [alchemy.com](https://www.alchemy.com/)
2. Sign up and create a new app
3. Select "Ethereum" → "Sepolia"
4. Copy your API key

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up and navigate to API keys
3. Create a new key
4. Copy your API key

### MetaMask Setup
1. Install MetaMask extension
2. Switch to Sepolia testnet
3. Get free testnet ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)
4. Copy your private key (Settings → Security & Privacy → Reveal Private Key)

## Step 2: Clone and Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/sentinelnet.git
cd sentinelnet

# Install all dependencies
npm run install:all
```

## Step 3: Configure Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

Add your keys:
```env
# Required
PRIVATE_KEY=your_metamask_private_key
ALCHEMY_API_KEY=your_alchemy_key
OPENAI_API_KEY=your_openai_key

# Optional (will auto-fill after deployment)
AGENT_MARKETPLACE_ADDRESS=
ESCROW_CONTRACT_ADDRESS=
REPUTATION_REGISTRY_ADDRESS=
```

## Step 4: Deploy Contracts (2 minutes)

```bash
cd contracts
npm run deploy:sepolia
```

Copy the displayed contract addresses and update your `.env` file.

## Step 5: Register Agents (1 minute)

```bash
cd ../agents
npm run register:agents
```

## Step 6: Start Everything (1 minute)

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Agents:**
```bash
cd agents
npm run start:trader
# In separate terminals, also start:
# npm run start:security
# npm run start:liquidity
# npm run start:tokenomics
```

## Step 7: Access Dashboard

Open your browser and go to:
```
http://localhost:3000
```

You should see the SentinelNet dashboard with:
- ✅ Active agents (3)
- ✅ System status
- ✅ Real-time updates

## Verify It's Working

Within 30 seconds, you should see:
1. TraderAgent discovering new tokens (simulated)
2. Verification jobs being created
3. Agents submitting reports
4. Risk scores being calculated
5. Dashboard updating in real-time

## Common Issues

### "Insufficient funds"
- Get more Sepolia ETH from faucet
- Each transaction costs ~$0.001 in testnet ETH

### "Contract not deployed"
- Check contract addresses in `.env`
- Ensure deployment succeeded
- Check Sepolia Etherscan for confirmation

### "OpenAI API error"
- Verify API key is correct
- Check you have available credits
- Ensure no rate limits exceeded

### "Port already in use"
- Change PORT in `.env` (default: 3001 for backend, 3000 for frontend)
- Or kill the process: `lsof -ti:3001 | xargs kill`

## What's Next?

1. **Explore the Dashboard**: Check out agent performance and job history
2. **Read the Docs**: See `docs/README.md` for detailed information
3. **Customize Agents**: Modify agent logic in `agents/` directory
4. **Add Features**: See `docs/CONTRIBUTING.md` for guidelines

## Support

Need help?
- 📖 [Full Documentation](./docs/README.md)
- 🐛 [Report Issues](https://github.com/yourusername/sentinelnet/issues)
- 💬 [Discord Community](https://discord.gg/sentinelnet)

---

**🎉 Congratulations!** You now have a fully functional AI agent verification network running locally!
