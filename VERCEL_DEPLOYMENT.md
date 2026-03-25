# SentinelNet - Vercel Deployment Guide

Complete guide to deploy SentinelNet frontend and backend to Vercel.

## 📋 Prerequisites

1. **Vercel Account** - Create at https://vercel.com
2. **GitHub Account** - Repository pushed to GitHub
3. **Environment Variables** - API keys and contract addresses ready
4. **Node.js 18+** - Installed locally

---

## 🚀 Step 1: Deploy Frontend to Vercel

### 1.1 Push to GitHub (if not done)

```bash
cd /Users/akul/Desktop/Sentinelnet
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 1.2 Import Project to Vercel

1. Go to **https://vercel.com**
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your **Sentinelnet** repository
5. Click **"Import"**

### 1.3 Configure Frontend Project

**Project Settings:**
- **Project Name:** `sentinelnet-frontend` (or your choice)
- **Framework Preset:** Next.js
- **Root Directory:** `./frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 1.4 Set Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://sentinelnet-backend.vercel.app
NEXT_PUBLIC_WS_URL=wss://sentinelnet-backend.vercel.app
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x[YOUR_CONTRACT_ADDRESS]
NEXT_PUBLIC_ESCROW_ADDRESS=0x[YOUR_ESCROW_ADDRESS]
```

**Note:** Replace contract addresses with your deployed contract addresses.

### 1.5 Deploy Frontend

Click **"Deploy"** button. Wait for deployment to complete.

**Frontend URL will be:** `https://sentinelnet-frontend.vercel.app` (or your custom domain)

---

## 🚀 Step 2: Deploy Backend to Vercel

Vercel natively supports serverless deployment of Node.js backend.

### 2.1 Create Vercel Configuration for Backend

Create `/Users/akul/Desktop/Sentinelnet/backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/index.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### 2.2 Update Backend for Serverless

Modify `/Users/akul/Desktop/Sentinelnet/backend/src/index.ts` to support Vercel serverless:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Your existing routes here
// ... (existing code)

// For serverless, export the app
export default app;
```

### 2.3 Import Backend Project

1. Go to **https://vercel.com**
2. Click **"New Project"**
3. Import the same GitHub repository
4. **Project Settings:**
   - **Project Name:** `sentinelnet-backend`
   - **Root Directory:** `./backend`
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2.4 Set Backend Environment Variables

In Vercel dashboard for backend, go to **Settings → Environment Variables** and add:

```
NODE_ENV=production
PORT=3001

# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/[YOUR_ALCHEMY_KEY]
PRIVATE_KEY=[YOUR_PRIVATE_KEY]
ALCHEMY_API_KEY=[YOUR_ALCHEMY_KEY]
ETHERSCAN_API_KEY=[YOUR_ETHERSCAN_KEY]

# Contracts
AGENT_MARKETPLACE_ADDRESS=0x[YOUR_ADDRESS]
ESCROW_CONTRACT_ADDRESS=0x[YOUR_ADDRESS]
REPUTATION_REGISTRY_ADDRESS=0x[YOUR_ADDRESS]

# OpenAI
OPENAI_API_KEY=[YOUR_OPENAI_KEY]

# JWT
JWT_SECRET=[GENERATE_STRONG_SECRET]

# CORS
CORS_ORIGIN=https://sentinelnet-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.5 Deploy Backend

Click **"Deploy"** button.

**Backend URL will be:** `https://sentinelnet-backend.vercel.app`

---

## 🔄 Step 3: Update Frontend API URLs

After backend is deployed, update frontend environment variables:

```
NEXT_PUBLIC_API_URL=https://sentinelnet-backend.vercel.app
NEXT_PUBLIC_WS_URL=wss://sentinelnet-backend.vercel.app
```

Redeploy frontend from Vercel dashboard.

---

## 📦 Step 4: Deploy Smart Contracts

Deploy contracts to Sepolia testnet (if not done):

```bash
cd contracts
npm run deploy:sepolia
```

**Save contract addresses** and update them in Vercel environment variables.

---

## ✅ Verification Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Vercel
- [ ] Environment variables configured for both
- [ ] Frontend loads at `https://sentinelnet-frontend.vercel.app`
- [ ] Backend API responds at `https://sentinelnet-backend.vercel.app/health`
- [ ] Frontend can call backend API
- [ ] WebSocket connection working
- [ ] Smart contracts deployed to Sepolia
- [ ] Contract addresses in environment variables
- [ ] No console errors in frontend
- [ ] API rate limiting active

---

## 🐛 Troubleshooting

### Frontend build fails
```bash
# Check build locally first
cd frontend
npm run build
```

### Backend deployment issues
- Check `vercel.json` configuration
- Verify environment variables are set
- Check Vercel logs: `vercel logs --prod`

### API calls failing
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Verify backend environment variables

### WebSocket issues
- Use `wss://` for WebSocket in production
- Check Vercel function timeout (may need to increase)

---

## 🔐 Security Notes

1. **Never commit `.env`** - Only set secrets in Vercel dashboard
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** - Vercel does this automatically
4. **Set strong JWT secret** - Generate with: `openssl rand -base64 32`
5. **Rotate API keys** regularly
6. **Use CORS carefully** - Only allow your frontend domain

---

## 📊 Monitoring

### View Logs

**Frontend logs:**
```bash
vercel logs sentinelnet-frontend --prod
```

**Backend logs:**
```bash
vercel logs sentinelnet-backend --prod
```

### Performance
- Check Vercel Analytics
- Monitor API response times
- Track error rates

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Deployment happens automatically!

---

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update API URLs if using custom domain

Example:
- Frontend: `https://sentinelnet.yourdomain.com`
- Backend: `https://api.sentinelnet.yourdomain.com`

---

## 📝 Next Steps

After deployment:

1. Test all features in production
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up backup and disaster recovery
5. Document production procedures
6. Create runbook for team

---

**Deployment Date:** _______________  
**Frontend URL:** https://sentinelnet-frontend.vercel.app  
**Backend URL:** https://sentinelnet-backend.vercel.app  
**Status:** ✅ Live
