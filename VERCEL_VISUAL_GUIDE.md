# Vercel Deployment - Visual Step-by-Step Guide

## 🎯 Overview

This is a visual guide to deploy SentinelNet to Vercel in 5 steps.

```
┌─────────────────────────────────────────────────────────┐
│         Your Computer (Local)                           │
│  - SentinelNet code ready                               │
│  - All dependencies installed                           │
│  - Tested locally                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Push to GitHub
                     ▼
┌─────────────────────────────────────────────────────────┐
│         GitHub Repository                               │
│  - Code stored                                          │
│  - Vercel connected                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Deploy
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Vercel Platform                                 │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  Frontend        │  │  Backend         │             │
│  │  on Vercel       │  │  on Vercel       │             │
│  │  http://...      │  │  https://...     │             │
│  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1️⃣: Git Setup

### Objective
Get your code to GitHub so Vercel can access it.

### Actions

#### 1.1 Check if GitHub is configured

```bash
cd /Users/akul/Desktop/Sentinelnet
git remote -v
```

**Expected output:**
```
origin  https://github.com/YOUR_USERNAME/sentinelnet.git (fetch)
origin  https://github.com/YOUR_USERNAME/sentinelnet.git (push)
```

#### 1.2 If not configured, add GitHub remote

```bash
# First create repo on https://github.com/new

git remote add origin https://github.com/YOUR_USERNAME/sentinelnet.git
git branch -M main
```

#### 1.3 Push code to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

**Expected result:** 
```
✓ Code uploaded to GitHub
```

---

## Step 2️⃣: Vercel Account Setup

### Objective
Create Vercel account and link your GitHub.

### Actions

#### 2.1 Create Vercel Account
1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

#### 2.2 Login via CLI

```bash
vercel login
```

This opens your browser automatically.

**Expected result:**
```
✓ Successfully authenticated
```

---

## Step 3️⃣: Deploy Frontend

### Objective
Deploy Next.js frontend to Vercel.

### Actions

#### 3.1 Start deployment

```bash
vercel deploy --prod ./frontend
```

#### 3.2 Follow prompts

```
? Set up and deploy "~/sentinelnet/frontend"? (Y/n) Y
? Which scope should contain your project? [your-account]
? Link to existing project? (y/N) N
? What's your project's name? sentinelnet-frontend
? In which directory is your code? ./
? Want to modify these settings? (y/N) N
```

#### 3.3 Wait for deployment

```
Building...
✓ Build complete
✓ Deployed to https://sentinelnet-frontend-xxx.vercel.app
```

**Save this URL!** You'll need it for the backend configuration.

### Visual Flow

```
Your Frontend Code
        │
        ├─ Compile TypeScript
        ├─ Build Next.js
        ├─ Optimize images
        ├─ Create .next bundle
        │
        └─> Deployed to Vercel CDN
            └─> https://sentinelnet-frontend-xxx.vercel.app
```

---

## Step 4️⃣: Deploy Backend

### Objective
Deploy Express API server to Vercel serverless.

### Actions

#### 4.1 Start deployment

```bash
vercel deploy --prod ./backend
```

#### 4.2 Follow prompts

```
? Set up and deploy "~/sentinelnet/backend"? (Y/n) Y
? Which scope should contain your project? [your-account]
? Link to existing project? (y/N) N
? What's your project's name? sentinelnet-backend
? In which directory is your code? ./
? Want to modify these settings? (y/N) N
```

#### 4.3 Wait for deployment

```
Building...
✓ Build complete
✓ Deployed to https://sentinelnet-backend-xxx.vercel.app
```

**Save this URL!** You'll use it in frontend environment variables.

### Visual Flow

```
Your Backend Code
        │
        ├─ Compile TypeScript
        ├─ Build dist folder
        ├─ Load vercel.json config
        │
        └─> Deployed to Vercel Serverless
            └─> https://sentinelnet-backend-xxx.vercel.app
```

---

## Step 5️⃣: Configure Environment Variables

### Objective
Add secrets and configuration to both projects.

### Visual Process

```
You (Local) → Add secrets in Vercel Dashboard → Projects get redeployed
```

---

### 5.1 Configure Frontend Environment Variables

1. Go to **https://vercel.com/dashboard**
2. Select **sentinelnet-frontend** project
3. Click **Settings**
4. Go to **Environment Variables**
5. Add each variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://sentinelnet-backend-xxx.vercel.app` |
| `NEXT_PUBLIC_WS_URL` | `wss://sentinelnet-backend-xxx.vercel.app` |
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` |

```
Click "Add" for each variable
↓
Verify it appears in the list
↓
Go to "Deployments"
↓
Click redeploy button
```

---

### 5.2 Configure Backend Environment Variables

1. Go to **https://vercel.com/dashboard**
2. Select **sentinelnet-backend** project
3. Click **Settings**
4. Go to **Environment Variables**
5. Add variables (from VERCEL_ENV_TEMPLATE.md):

**Essential Variables:**
```
NODE_ENV=production
PORT=3001
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/[YOUR_KEY]
PRIVATE_KEY=[YOUR_PRIVATE_KEY]
OPENAI_API_KEY=sk-[YOUR_KEY]
JWT_SECRET=[GENERATE_NEW]
CORS_ORIGIN=https://sentinelnet-frontend-xxx.vercel.app
```

**How to generate JWT secret:**
```bash
openssl rand -base64 32
```

Copy the output and paste as `JWT_SECRET` value.

---

### 5.3 Redeploy Backend

1. Still in backend project settings
2. Click **"Deployments"** tab
3. Find latest deployment
4. Click **"Redeploy"** button
5. Wait for completion

```
Backend updated
    ↓
Environment variables loaded
    ↓
Ready to receive requests from frontend
```

---

## ✅ Verification

### Test Deployment

#### 1. Check Frontend

```bash
curl https://sentinelnet-frontend-xxx.vercel.app
```

Expected: HTML page loads

#### 2. Check Backend Health

```bash
curl https://sentinelnet-backend-xxx.vercel.app/health
```

Expected output:
```json
{"status": "ok", "timestamp": "2026-03-25T..."}
```

#### 3. Check Logs

```bash
vercel logs sentinelnet-backend --prod --follow
```

Watch for any errors in real-time.

---

## 🎯 Deployment Complete!

When everything works:

```
✅ Frontend accessible at https://sentinelnet-frontend-xxx.vercel.app
✅ Backend accessible at https://sentinelnet-backend-xxx.vercel.app
✅ Frontend can call Backend API
✅ WebSocket connection working
✅ All environment variables loaded
```

---

## 🔄 Future Updates

After initial deployment, updates are easy:

```bash
# Make code changes
git add .
git commit -m "Feature: description"
git push origin main

# Vercel automatically redeploys!
# No manual action needed
```

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm run build:all` locally first |
| API call 404 | Check `NEXT_PUBLIC_API_URL` matches backend |
| WebSocket fails | Use `wss://` not `ws://` in production |
| Variables missing | Redeploy after adding env vars |
| Old code still showing | Clear browser cache, hard refresh (Cmd+Shift+R) |

---

## 📞 Getting Help

1. **Vercel Docs**: https://vercel.com/docs
2. **Check Logs**: `vercel logs --follow`
3. **Local Testing**: `vercel dev`
4. **Project Status**: https://vercel.com/dashboard

---

**Timeline:** ~15-20 minutes total
**Difficulty:** ⭐⭐☆☆☆ (Easy!)
**Success Rate:** 95%+ when following steps

Now you're ready! 🚀
