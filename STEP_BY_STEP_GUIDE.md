# 🚀 SentinelNet Vercel Deployment - Step-by-Step Guide

Complete step-by-step instructions to deploy your SentinelNet project to Vercel.

---

## 📋 PHASE 1: Prerequisites & Preparation (5 minutes)

### Step 1: Create Required Accounts

#### 1.1 GitHub Account
- Go to: https://github.com
- Click "Sign up"
- Create account if you don't have one
- ✅ You already have this

#### 1.2 Vercel Account
- Go to: https://vercel.com
- Click "Sign up"
- Choose "Continue with GitHub"
- Authorize Vercel to access your GitHub
- ✅ Complete this now

### Step 2: Verify Your Local Setup

Open terminal and run:

```bash
cd /Users/akul/Desktop/Sentinelnet
```

Check Node.js version:
```bash
node -v
# Should show v18.0.0 or higher
```

Check npm version:
```bash
npm -v
# Should show 9.0.0 or higher
```

Check Vercel CLI:
```bash
vercel --version
# Should show a version number
```

Run pre-deployment verification:
```bash
bash check-deployment-ready.sh
```

**Expected output:** All checks should pass (0 failed)

---

## 📂 PHASE 2: GitHub Setup (5 minutes)

### Step 3: Check Git Configuration

```bash
cd /Users/akul/Desktop/Sentinelnet
git remote -v
```

**Expected output:**
```
origin  https://github.com/YOUR_USERNAME/sentinelnet.git (fetch)
origin  https://github.com/YOUR_USERNAME/sentinelnet.git (push)
```

If you see nothing, go to Step 4. If you see output, skip to Step 5.

### Step 4: Create GitHub Repository (First Time Only)

If you haven't created a GitHub repo yet:

#### 4.1 Create on GitHub
- Go to: https://github.com/new
- Repository name: `sentinelnet`
- Description: "Autonomous verification network with AI agents"
- Choose "Public" or "Private"
- Click "Create repository"

#### 4.2 Connect Local to GitHub

```bash
cd /Users/akul/Desktop/Sentinelnet

# Set your git user (one time only)
git config user.name "Your Name"
git config user.email "your@email.com"

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/sentinelnet.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

### Step 5: Push Latest Code

```bash
cd /Users/akul/Desktop/Sentinelnet

# Add all files
git add .

# Commit changes
git commit -m "Ready for Vercel deployment - $(date)"

# Push to GitHub
git push origin main
```

**Expected output:** Files uploaded to GitHub

---

## 🔑 PHASE 3: API Keys & Configuration (10 minutes)

### Step 6: Get Alchemy API Key

This is optional for demo mode, but recommended for production.

#### 6.1 Create Alchemy Account
- Go to: https://www.alchemy.com
- Click "Sign up"
- Create account
- Verify email

#### 6.2 Create App for Sepolia
- Click "Create App"
- Name: `SentinelNet`
- Chain: Select **Sepolia**
- Network: Keep default
- Click "Create App"

#### 6.3 Copy API Key
- Find your app in dashboard
- Click on it
- Copy the API key from URL: `alchemy.com/v2/YOUR_KEY`
- Save it: `alchemy_xxxxx` (you'll use this later)

### Step 7: Get Your Private Key

#### 7.1 From MetaMask (if you use it)
- Open MetaMask
- Click account icon
- Settings → Security & Privacy
- Show private key
- Copy the key starting with `0x`
- Save it safely

**OR** Create new wallet:
- Go to: https://www.alchemy.com/faucet
- Create wallet
- Copy private key

### Step 8: Optional - Get OpenAI API Key

For AI features:
- Go to: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy the key starting with `sk-`
- Save it: `sk-xxxxx`

---

## 🚀 PHASE 4: Deploy Frontend (5 minutes)

### Step 9: Login to Vercel

In terminal, run:
```bash
vercel login
```

This opens your browser automatically. Sign in with your GitHub account.

**Expected:** Browser shows "You are logged in"

### Step 10: Deploy Frontend

```bash
cd /Users/akul/Desktop/Sentinelnet
vercel deploy --prod ./frontend
```

Follow the prompts:

```
? Set up and deploy "~/sentinelnet/frontend"? (Y/n) 
→ Type: Y and press Enter

? Which scope should contain your project? 
→ Select your username

? Link to existing project? (y/N) 
→ Type: N and press Enter

? What's your project's name? 
→ Type: sentinelnet-frontend and press Enter

? In which directory is your code? 
→ Just press Enter (uses ./)

? Want to modify these settings? (y/N) 
→ Type: N and press Enter
```

**Wait for deployment to complete...**

When done, you'll see:
```
✓ Production: https://sentinelnet-frontend-xxx.vercel.app
```

📌 **SAVE THIS URL!** You'll need it for the next step.

---

## 🚀 PHASE 5: Deploy Backend (5 minutes)

### Step 11: Deploy Backend

```bash
vercel deploy --prod ./backend
```

Follow the prompts (same as frontend):

```
? Set up and deploy "~/sentinelnet/backend"? (Y/n) 
→ Type: Y and press Enter

? Which scope should contain your project? 
→ Select your username

? Link to existing project? (y/N) 
→ Type: N and press Enter

? What's your project's name? 
→ Type: sentinelnet-backend and press Enter

? In which directory is your code? 
→ Just press Enter

? Want to modify these settings? (y/N) 
→ Type: N and press Enter
```

**Wait for deployment to complete...**

When done, you'll see:
```
✓ Production: https://sentinelnet-backend-xxx.vercel.app
```

📌 **SAVE THIS URL!** You'll need it for the next step.

---

## ⚙️ PHASE 6: Configure Environment Variables (10 minutes)

### Step 12: Add Frontend Environment Variables

#### 12.1 Open Vercel Dashboard
- Go to: https://vercel.com/dashboard

#### 12.2 Select Frontend Project
- Click on `sentinelnet-frontend` project
- Click "Settings"
- Click "Environment Variables"

#### 12.3 Add Variables

For each variable below, click "Add" and enter the name and value:

**Variable 1:**
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://sentinelnet-backend-xxx.vercel.app` (use YOUR backend URL from Step 11)
- Click "Save"

**Variable 2:**
- Name: `NEXT_PUBLIC_WS_URL`
- Value: `wss://sentinelnet-backend-xxx.vercel.app` (same as above, but with `wss://`)
- Click "Save"

**Variable 3:**
- Name: `NEXT_PUBLIC_CHAIN_ID`
- Value: `11155111`
- Click "Save"

#### 12.4 Redeploy Frontend

- Click "Deployments" tab
- Find the latest deployment (top of list)
- Click the "..." menu
- Select "Redeploy"
- Wait for completion (usually 1-2 minutes)

### Step 13: Add Backend Environment Variables

#### 13.1 Select Backend Project
- Go to: https://vercel.com/dashboard
- Click on `sentinelnet-backend` project
- Click "Settings"
- Click "Environment Variables"

#### 13.2 Add Variables

Add each variable:

**Essential Variables:**

```
NODE_ENV = production
PORT = 3001
CORS_ORIGIN = https://sentinelnet-frontend-xxx.vercel.app
```

**Blockchain Variables (use demo keys for now):**

```
SEPOLIA_RPC_URL = https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY = 0x0000000000000000000000000000000000000000000000000000000000000000
ALCHEMY_API_KEY = demo_key
ETHERSCAN_API_KEY = demo_key
```

**OpenAI (optional):**

```
OPENAI_API_KEY = sk-demo-key
```

**JWT Secret (generate new one):**

```
JWT_SECRET = (Run in terminal: openssl rand -base64 32)
```

Then copy the output and paste as the value.

#### 13.3 Redeploy Backend

- Click "Deployments" tab
- Find the latest deployment
- Click the "..." menu
- Select "Redeploy"
- Wait for completion

---

## ✅ PHASE 7: Verification (5 minutes)

### Step 14: Test Frontend

Open in browser:
```
https://sentinelnet-frontend-xxx.vercel.app
```

You should see:
- ✅ Dashboard loads without errors
- ✅ No red error messages in browser console (press F12)
- ✅ Layout and components visible

### Step 15: Test Backend Health Check

In terminal, run:
```bash
curl https://sentinelnet-backend-xxx.vercel.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-03-25T..."}
```

If you see this, your backend is working! ✅

### Step 16: Check Logs

View real-time logs:
```bash
vercel logs sentinelnet-backend --follow
```

You should see:
- ✅ No critical errors
- ✅ API requests logged
- ✅ No "missing environment variable" errors

Press `Ctrl+C` to stop.

---

## 🎯 PHASE 8: Verify Frontend-Backend Connection (5 minutes)

### Step 17: Check Frontend Console

1. Go to: https://sentinelnet-frontend-xxx.vercel.app
2. Press `F12` to open Developer Tools
3. Click "Console" tab
4. Look for any error messages

**Expected:** No red errors, maybe some warnings

### Step 18: Test API Calls

In the browser console, run:
```javascript
fetch('https://sentinelnet-backend-xxx.vercel.app/health')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e))
```

You should see:
```
Success: {status: 'ok', timestamp: '...'}
```

If you see "Success", the connection is working! ✅

---

## 📊 PHASE 9: Success Verification (2 minutes)

### Step 19: Final Checklist

Check all of these:

- [ ] Frontend deployed: https://sentinelnet-frontend-xxx.vercel.app
- [ ] Backend deployed: https://sentinelnet-backend-xxx.vercel.app
- [ ] Frontend loads without errors
- [ ] Backend health check responds
- [ ] No CORS errors in browser console
- [ ] Environment variables in Vercel dashboard
- [ ] Both projects redeployed after adding env vars
- [ ] Logs show no critical errors

### Step 20: Celebrate! 🎉

Your SentinelNet project is now live on Vercel!

**Your URLs:**
- Frontend: `https://sentinelnet-frontend-xxx.vercel.app`
- Backend: `https://sentinelnet-backend-xxx.vercel.app`

---

## 🆘 TROUBLESHOOTING

### Frontend shows blank page
**Solution:**
1. Press F12 to open console
2. Check for error messages
3. Verify `NEXT_PUBLIC_API_URL` is correct
4. Run: `vercel logs sentinelnet-frontend --follow`

### Backend returns 404
**Solution:**
1. Run: `curl https://your-backend.vercel.app/health`
2. Check logs: `vercel logs sentinelnet-backend --follow`
3. Verify environment variables in dashboard
4. Redeploy backend

### CORS errors in console
**Solution:**
1. Go to Vercel backend settings
2. Add correct `CORS_ORIGIN` with frontend URL
3. Redeploy backend

### API calls timeout
**Solution:**
1. Check backend logs: `vercel logs --follow`
2. Verify backend is responding: `curl https://your-backend.vercel.app/health`
3. Check network tab in browser (F12 → Network)

### Still having issues?
1. Read: `/Users/akul/Desktop/Sentinelnet/VERCEL_READY.md`
2. Check: `VERCEL_QUICK_COMMANDS.md` for more commands
3. View logs: `vercel logs --follow`

---

## 📝 Quick Reference Commands

```bash
# Login to Vercel
vercel login

# Deploy frontend
vercel deploy --prod ./frontend

# Deploy backend
vercel deploy --prod ./backend

# View logs
vercel logs --follow

# List all deployments
vercel list

# Rollback if needed
vercel rollback

# Check backend health
curl https://your-backend.vercel.app/health
```

---

## ✨ Summary

You've completed:

✅ Created GitHub account & repository  
✅ Pushed code to GitHub  
✅ Created Vercel account  
✅ Deployed frontend to Vercel  
✅ Deployed backend to Vercel  
✅ Configured environment variables  
✅ Verified both are working  

**Time taken:** ~30-45 minutes  
**Difficulty:** ⭐⭐☆☆☆ (Easy!)  
**Success rate:** 95%+  

---

**Your SentinelNet project is now live! 🚀**

For updates, just do:
```bash
git push origin main
# Vercel automatically redeploys!
```

---

**Questions?** Check the documentation files or ask the AI assistant.

**Stuck?** Troubleshooting section above has solutions!

Good luck! 🎉
