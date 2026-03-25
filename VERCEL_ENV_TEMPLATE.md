# SentinelNet - Vercel Environment Variables Template
# Copy these and add to Vercel dashboard for each project

## FRONTEND Environment Variables
## Project: sentinelnet-frontend
## Add these in Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_API_URL=https://sentinelnet-backend.vercel.app
NEXT_PUBLIC_WS_URL=wss://sentinelnet-backend.vercel.app
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x[DEPLOY_YOUR_CONTRACTS_AND_ADD_HERE]
NEXT_PUBLIC_ESCROW_ADDRESS=0x[DEPLOY_YOUR_CONTRACTS_AND_ADD_HERE]
NEXT_PUBLIC_REPUTATION_ADDRESS=0x[DEPLOY_YOUR_CONTRACTS_AND_ADD_HERE]

---

## BACKEND Environment Variables
## Project: sentinelnet-backend
## Add these in Vercel Dashboard → Settings → Environment Variables

# Environment
NODE_ENV=production
PORT=3001

# Blockchain Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/[YOUR_ALCHEMY_API_KEY]
PRIVATE_KEY=[YOUR_WALLET_PRIVATE_KEY]
ALCHEMY_API_KEY=[YOUR_ALCHEMY_API_KEY]
INFURA_API_KEY=[YOUR_INFURA_API_KEY]
ETHERSCAN_API_KEY=[YOUR_ETHERSCAN_API_KEY]

# Network
NETWORK=sepolia
CHAIN_ID=11155111

# Deployed Contract Addresses
AGENT_MARKETPLACE_ADDRESS=0x[CONTRACT_ADDRESS]
ESCROW_CONTRACT_ADDRESS=0x[CONTRACT_ADDRESS]
REPUTATION_REGISTRY_ADDRESS=0x[CONTRACT_ADDRESS]

# Agent Wallets (or use same as PRIVATE_KEY wallet)
TRADER_AGENT_WALLET=0x[WALLET_ADDRESS]
SECURITY_AGENT_WALLET=0x[WALLET_ADDRESS]
LIQUIDITY_AGENT_WALLET=0x[WALLET_ADDRESS]
TOKENOMICS_AGENT_WALLET=0x[WALLET_ADDRESS]

# OpenAI Configuration
OPENAI_API_KEY=sk-[YOUR_OPENAI_API_KEY]
OPENAI_MODEL=gpt-4-turbo-preview

# JWT & Security
JWT_SECRET=[GENERATE_WITH: openssl rand -base64 32]

# CORS
CORS_ORIGIN=https://sentinelnet-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=[OPTIONAL_SENTRY_KEY]

# API Configuration
API_BASE_URL=https://sentinelnet-backend.vercel.app

---

## Instructions:

### 1. Generate JWT Secret:
```bash
openssl rand -base64 32
```

### 2. Get API Keys:
- **Alchemy**: https://www.alchemy.com
- **Infura**: https://infura.io
- **Etherscan**: https://etherscan.io/apis
- **OpenAI**: https://platform.openai.com/api-keys

### 3. Deploy Contracts First:
```bash
cd contracts
npm run deploy:sepolia
```
Save the contract addresses from the deployment output.

### 4. Add to Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from above
5. Redeploy

### 5. Update URLs:
- Frontend API URL: https://[your-backend-project].vercel.app
- WebSocket URL: wss://[your-backend-project].vercel.app
