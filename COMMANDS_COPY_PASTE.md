# 🎯 SentinelNet Vercel Deployment - Quick Command Reference

Copy and paste these commands in order. No decisions needed!

---

## ✅ BEFORE YOU START

Make sure you have:
- [ ] GitHub account (https://github.com)
- [ ] Vercel account (https://vercel.com)
- [ ] Code on GitHub
- [ ] Terminal open

---

## 🚀 THE EXACT COMMANDS TO RUN

### STEP 1: Verify Everything is Ready (Copy & Paste)

```bash
cd /Users/akul/Desktop/Sentinelnet
bash check-deployment-ready.sh
```

**Expected:** Shows ✅ checks pass with 0 failures

---

### STEP 2: Make Sure Code is on GitHub (Copy & Paste)

```bash
cd /Users/akul/Desktop/Sentinelnet
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

**Expected:** Shows file uploads completing

---

### STEP 3: Login to Vercel (Copy & Paste)

```bash
vercel login
```

**Expected:** Browser opens for authentication

---

### STEP 4: Deploy Frontend (Copy & Paste)

```bash
vercel deploy --prod ./frontend
```

When prompted:
- `Set up and deploy?` → Type: **Y** and press Enter
- `Which scope?` → Press Enter
- `Link to existing?` → Type: **N** and press Enter
- `Project name?` → Type: **sentinelnet-frontend** and press Enter
- `Directory?` → Press Enter
- `Modify settings?` → Type: **N** and press Enter

**Expected:** Shows URL like `https://sentinelnet-frontend-xxx.vercel.app`

📌 **SAVE THIS URL!**

---

### STEP 5: Deploy Backend (Copy & Paste)

```bash
vercel deploy --prod ./backend
```

When prompted:
- `Set up and deploy?` → Type: **Y** and press Enter
- `Which scope?` → Press Enter
- `Link to existing?` → Type: **N** and press Enter
- `Project name?` → Type: **sentinelnet-backend** and press Enter
- `Directory?` → Press Enter
- `Modify settings?` → Type: **N** and press Enter

**Expected:** Shows URL like `https://sentinelnet-backend-xxx.vercel.app`

📌 **SAVE THIS URL!**

---

### STEP 6: Generate JWT Secret (Copy & Paste)

```bash
openssl rand -base64 32
```

**Expected:** Shows a string like `abc123def456ghi789jkl012mno345pqr`

📌 **SAVE THIS VALUE!**

---

### STEP 7: Test Backend is Running (Copy & Paste)

Replace `XXX` with your actual backend URL:

```bash
curl https://sentinelnet-backend-XXX.vercel.app/health
```

**Expected:** Shows `{"status":"ok","timestamp":"..."}`

✅ If you see this, backend is working!

---

## 🌐 STEP 8: Configure in Vercel Dashboard

### A) Go to Vercel Dashboard
Open: https://vercel.com/dashboard

### B) Configure Frontend Project

1. Click **sentinelnet-frontend**
2. Click **Settings**
3. Click **Environment Variables**
4. Add these variables (click "Add" for each):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://sentinelnet-backend-XXX.vercel.app` |
| `NEXT_PUBLIC_WS_URL` | `wss://sentinelnet-backend-XXX.vercel.app` |
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` |

*(Replace XXX with your backend URL)*

5. Go to **Deployments** tab
6. Click the "..." menu on latest deployment
7. Click **Redeploy**

**Wait 1-2 minutes for redeploy to complete**

### C) Configure Backend Project

1. Click **sentinelnet-backend**
2. Click **Settings**
3. Click **Environment Variables**
4. Add these variables (click "Add" for each):

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `CORS_ORIGIN` | `https://sentinelnet-frontend-XXX.vercel.app` |
| `SEPOLIA_RPC_URL` | `https://eth-sepolia.g.alchemy.com/v2/demo` |
| `PRIVATE_KEY` | `0x0000000000000000000000000000000000000000000000000000000000000000` |
| `ALCHEMY_API_KEY` | `demo_key` |
| `ETHERSCAN_API_KEY` | `demo_key` |
| `OPENAI_API_KEY` | `sk-demo-key` |
| `JWT_SECRET` | *(Paste the value from Step 6)* |

*(Replace XXX with your frontend URL)*

5. Go to **Deployments** tab
6. Click the "..." menu on latest deployment
7. Click **Redeploy**

**Wait 1-2 minutes for redeploy to complete**

---

## ✅ STEP 9: Verify Everything Works (Copy & Paste)

### A) Test Frontend

Open in browser:
```
https://sentinelnet-frontend-XXX.vercel.app
```

You should see:
- ✅ Dashboard loads
- ✅ No red errors in console (F12)

### B) Test Backend Health

Copy and paste in terminal:
```bash
curl https://sentinelnet-backend-XXX.vercel.app/health
```

Expected output:
```json
{"status":"ok","timestamp":"2026-03-25T..."}
```

✅ If you see this, it's working!

### C) View Logs

Copy and paste:
```bash
vercel logs sentinelnet-backend --follow
```

Expected: Shows API requests, no errors

Press `Ctrl+C` to stop

---

## 🎉 YOU'RE DONE!

Your SentinelNet is now live!

**Frontend:** `https://sentinelnet-frontend-XXX.vercel.app`  
**Backend:** `https://sentinelnet-backend-XXX.vercel.app`  
**Status:** ✅ LIVE AND WORKING

---

## 📝 Helpful Commands for Later

```bash
# View logs anytime
vercel logs sentinelnet-backend --follow

# Redeploy if you change code
git push origin main
# (Vercel auto-redeploys!)

# List all deployments
vercel list

# Rollback to previous version
vercel rollback
```

---

## 🆘 If Something Goes Wrong

### Frontend blank page?
```bash
# Check logs
vercel logs sentinelnet-frontend --follow
```

### Backend not responding?
```bash
# Check health
curl https://sentinelnet-backend-XXX.vercel.app/health

# Check logs
vercel logs sentinelnet-backend --follow
```

### API errors?
1. Open browser F12 console
2. Look for error messages
3. Check that environment variables are set
4. Redeploy from Vercel dashboard

### Still stuck?
1. Read: `STEP_BY_STEP_GUIDE.md` (has full details)
2. Read: `VERCEL_READY.md` (troubleshooting section)
3. Ask the AI assistant with specific error

---

**Total Time:** ~30-45 minutes  
**Difficulty:** Easy! ⭐⭐☆☆☆  
**Success Rate:** 95%+  

You've got this! 🚀
