# ✅ SentinelNet - Vercel Deployment Ready

Your SentinelNet project is fully configured and ready for deployment to Vercel!

## 📦 What's Been Configured

✅ **Backend Configuration**
- `backend/vercel.json` - Serverless deployment config
- Optimized for Node.js runtime
- WebSocket support enabled
- Function timeout: 60 seconds
- Memory limit: 1024 MB

✅ **Documentation**
- `VERCEL_DEPLOYMENT.md` - Complete step-by-step guide
- `VERCEL_QUICK_COMMANDS.md` - Command reference
- `VERCEL_ENV_TEMPLATE.md` - Environment variables template

✅ **Setup Scripts**
- `vercel-setup.sh` - Pre-deployment checklist script

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Ensure Code is Pushed to GitHub

```bash
cd /Users/akul/Desktop/Sentinelnet

# Check if git is configured
git remote -v

# If not, add GitHub:
# git remote add origin https://github.com/YOUR_USERNAME/sentinelnet.git

# Push code
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Login to Vercel

```bash
vercel login
# Opens browser for authentication
```

### Step 3: Deploy Frontend

```bash
vercel deploy --prod ./frontend
# Saves the URL, e.g., https://sentinelnet-frontend-xxx.vercel.app
```

### Step 4: Deploy Backend

```bash
vercel deploy --prod ./backend
# Saves the URL, e.g., https://sentinelnet-backend-xxx.vercel.app
```

### Step 5: Add Environment Variables

**In Vercel Dashboard for Frontend:**
1. Select frontend project
2. Settings → Environment Variables
3. Add:
   ```
   NEXT_PUBLIC_API_URL=https://sentinelnet-backend-xxx.vercel.app
   NEXT_PUBLIC_WS_URL=wss://sentinelnet-backend-xxx.vercel.app
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```
4. Redeploy from deployment settings

**In Vercel Dashboard for Backend:**
1. Select backend project
2. Settings → Environment Variables
3. Add all variables from `VERCEL_ENV_TEMPLATE.md`
4. Redeploy

### Step 6: Verify Deployment

```bash
# Check frontend
curl https://sentinelnet-frontend-xxx.vercel.app

# Check backend health
curl https://sentinelnet-backend-xxx.vercel.app/health

# View logs
vercel logs sentinelnet-backend --prod
```

---

## 📋 Required Before Deployment

Before running the deploy commands, you need:

1. **Smart Contracts Deployed** (Optional for demo)
   ```bash
   cd contracts
   npm run deploy:sepolia
   ```
   Save the contract addresses!

2. **API Keys Ready**
   - Alchemy: https://www.alchemy.com
   - Infura: https://infura.io (optional)
   - Etherscan: https://etherscan.io/apis (optional)
   - OpenAI: https://platform.openai.com/api-keys (optional)

3. **GitHub Account** with repository pushed
   - https://github.com/new (create repo)
   - Push your code

4. **Vercel Account** (free)
   - https://vercel.com/signup

---

## 📂 File Structure

Your project is configured for Vercel:

```
sentinelnet/
├── frontend/                    # Next.js app
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   └── public/
├── backend/                     # Express API
│   ├── package.json
│   ├── vercel.json             # ✅ NEW - Serverless config
│   ├── src/
│   │   └── index.ts
│   └── tsconfig.json
├── contracts/                   # Smart contracts
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.js
├── VERCEL_DEPLOYMENT.md        # ✅ NEW - Full guide
├── VERCEL_QUICK_COMMANDS.md    # ✅ NEW - Command reference
├── VERCEL_ENV_TEMPLATE.md      # ✅ NEW - Environment variables
└── vercel-setup.sh             # ✅ NEW - Setup checklist
```

---

## 🔑 Environment Variables

Create or update your `.env` file with:

```properties
# For smart contracts (optional)
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
ALCHEMY_API_KEY=...

# For OpenAI (optional)
OPENAI_API_KEY=sk-...

# For frontend
NEXT_PUBLIC_API_URL=http://localhost:3001  # Update after deployment
NEXT_PUBLIC_WS_URL=ws://localhost:3001     # Update after deployment

# For backend
PORT=3001
JWT_SECRET=your-secret-here
```

Then push to Vercel:

```bash
vercel env push
```

---

## 💻 Available Commands

```bash
# Deployment
vercel deploy --prod ./frontend      # Deploy frontend
vercel deploy --prod ./backend       # Deploy backend

# Monitoring
vercel logs --follow                 # Real-time logs
vercel list                          # All deployments
vercel url                           # Current URL

# Environment
vercel env pull                      # Pull vars from Vercel
vercel env push                      # Push local .env to Vercel

# Local testing
vercel dev                           # Run locally exactly like Vercel
```

See `VERCEL_QUICK_COMMANDS.md` for complete command reference.

---

## 🔐 Security Checklist

- [ ] Private key NOT in `.env` file committed to git
- [ ] `.env` in `.gitignore`
- [ ] API keys only in Vercel environment variables
- [ ] JWT secret generated with: `openssl rand -base64 32`
- [ ] CORS configured to only allow frontend domain
- [ ] HTTPS enforced (Vercel does this automatically)

---

## 🧪 Testing After Deployment

1. **Frontend loads:**
   ```bash
   curl https://sentinelnet-frontend-xxx.vercel.app
   ```

2. **Backend responds:**
   ```bash
   curl https://sentinelnet-backend-xxx.vercel.app/health
   ```

3. **Frontend can call backend:**
   - Check browser console for errors
   - Check network tab for API calls
   - Verify API response times

4. **WebSocket connects:**
   - Check browser console
   - Should see WebSocket connection in Network tab

---

## 🚨 Common Issues & Solutions

### "Missing environment variables"
**Solution:** Add variables in Vercel dashboard and redeploy

### "Build fails"
**Solution:** 
```bash
# Test locally first
npm run build:all
```

### "WebSocket fails in production"
**Solution:** Use `wss://` instead of `ws://` in production URLs

### "CORS errors"
**Solution:** Update `CORS_ORIGIN` in backend environment variables

### "API calls 404"
**Solution:** Verify `NEXT_PUBLIC_API_URL` points to correct backend URL

---

## 📚 Documentation

- **VERCEL_DEPLOYMENT.md** - Full step-by-step guide
- **VERCEL_QUICK_COMMANDS.md** - Command reference
- **VERCEL_ENV_TEMPLATE.md** - All environment variables
- **README.md** - Project overview
- **ARCHITECTURE.md** - System architecture

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Login to Vercel: `vercel login`
3. ✅ Deploy frontend: `vercel deploy --prod ./frontend`
4. ✅ Deploy backend: `vercel deploy --prod ./backend`
5. ✅ Add environment variables in Vercel dashboard
6. ✅ Redeploy both projects
7. ✅ Test in production
8. ✅ Monitor with `vercel logs --follow`

---

## 📞 Support

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/cli
- https://vercel.com/docs/concepts/projects/environment-variables

### Troubleshooting
- Check logs: `vercel logs --follow`
- Check build: `npm run build:all`
- Check locally: `vercel dev`

---

## ✨ Deployment Benefits

✅ **Zero Configuration**
- Deploy directly from GitHub
- Auto-scaling built-in
- HTTPS by default

✅ **Performance**
- Global CDN
- Edge functions
- Automatic optimization

✅ **Monitoring**
- Real-time logs
- Deployment analytics
- Error tracking

✅ **Continuous Deployment**
- Auto-deploy on git push
- Preview deployments
- Rollback capability

---

**Status:** ✅ Ready for Deployment  
**Created:** March 25, 2026  
**Version:** 1.0.0  
**Next Action:** Run `vercel login` and start deploying!
