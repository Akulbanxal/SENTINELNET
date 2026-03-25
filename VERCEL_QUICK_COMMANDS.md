# SentinelNet - Vercel Quick Deploy Commands

## 📦 Installation

```bash
# Install Vercel CLI globally
npm install -g vercel

# Or use npx (no installation needed)
vercel --version
```

---

## 🚀 Quick Deploy Commands

### One-Time Setup

```bash
# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Set environment variables interactively
vercel env pull  # Pull from Vercel dashboard
vercel env push  # Push local .env to Vercel
```

---

### Deploy Frontend Only

```bash
# Development (preview) deployment
vercel deploy ./frontend

# Production deployment
vercel deploy --prod ./frontend

# With environment variables
vercel env pull ./frontend && vercel deploy --prod ./frontend
```

### Deploy Backend Only

```bash
# Development deployment
vercel deploy ./backend

# Production deployment
vercel deploy --prod ./backend

# With environment variables
vercel env pull ./backend && vercel deploy --prod ./backend
```

### Deploy Both

```bash
# Sequential deployment
vercel deploy --prod ./frontend && vercel deploy --prod ./backend

# Or deploy via Git
git push origin main
# Vercel will auto-deploy from GitHub
```

---

## 📋 Environment Management

```bash
# Pull environment variables from Vercel
vercel env pull

# Push local .env to Vercel
vercel env push

# List all environment variables
vercel env ls

# Add specific environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME
```

---

## 🔍 Monitoring & Debugging

```bash
# View deployment logs
vercel logs

# View logs in real-time (follow)
vercel logs --follow

# View specific project logs
vercel logs sentinelnet-backend --prod

# View all deployments
vercel list

# View deployment details
vercel inspect <deployment-url>
```

---

## 🔄 Rollback & Management

```bash
# List all deployments
vercel list

# Promote a deployment to production
vercel promote <deployment-url>

# Rollback to previous version
vercel rollback

# Delete a deployment
vercel remove <deployment-url>
```

---

## 🛠️ Local Testing Before Deploy

```bash
# Test build locally
cd frontend && npm run build && npm start
cd backend && npm run build && npm start

# Use Vercel CLI to test locally
vercel dev

# This runs your project exactly as it would on Vercel
```

---

## 📊 Project Status

```bash
# Check current project
vercel whoami

# Show project information
vercel projects list

# Show deployment URL
vercel url

# Show all domains
vercel domains ls
```

---

## 🗑️ Cleanup

```bash
# Remove all preview deployments
vercel remove --all --confirm

# Delete project from Vercel
vercel projects remove sentinelnet-frontend

# Unlink local project from Vercel
rm -rf .vercel
```

---

## 🌐 Custom Domain Setup

```bash
# Add custom domain
vercel domains add yourdomain.com

# List domains
vercel domains ls

# Remove domain
vercel domains remove yourdomain.com
```

---

## 🔐 Security

```bash
# Regenerate JWT secret
# In terminal, run:
openssl rand -base64 32

# Add to Vercel
vercel env add JWT_SECRET
# Paste the generated secret

# Then redeploy
vercel deploy --prod
```

---

## 📝 Common Workflows

### Initial Setup

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for Vercel"
git push origin main

# 2. Deploy frontend
vercel deploy --prod ./frontend

# 3. Deploy backend
vercel deploy --prod ./backend

# 4. Add environment variables in Vercel dashboard
# (See VERCEL_ENV_TEMPLATE.md)

# 5. Redeploy with env vars
vercel deploy --prod ./frontend
vercel deploy --prod ./backend
```

### Update Code

```bash
# 1. Make changes
# 2. Git push
git add .
git commit -m "Feature: description"
git push origin main

# Vercel auto-deploys from GitHub!
# No manual deployment needed
```

### Update Environment Variables

```bash
# 1. Update locally
# vim .env

# 2. Push to Vercel
vercel env push

# 3. Redeploy
vercel deploy --prod ./frontend
vercel deploy --prod ./backend
```

---

## 🆘 Troubleshooting

```bash
# Check build logs
vercel logs --follow

# Clear cache and redeploy
vercel deploy --prod --skip-build=false

# Check environment variables
vercel env ls

# Verify backend health
curl https://sentinelnet-backend.vercel.app/health

# Test frontend
curl https://sentinelnet-frontend.vercel.app
```

---

## 📚 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Vercel Node.js Runtime**: https://vercel.com/docs/runtimes/nodejs

---

## 💡 Tips

1. **Always test locally first**
   ```bash
   vercel dev
   ```

2. **Use preview deployments for testing**
   ```bash
   vercel deploy  # Creates preview URL
   ```

3. **Monitor logs after deployment**
   ```bash
   vercel logs --follow
   ```

4. **Keep .env out of git**
   ```bash
   echo ".env" >> .gitignore
   ```

5. **Use specific Node.js version in vercel.json**
   ```json
   {
     "engines": {
       "node": "18.x"
     }
   }
   ```

---

**Last Updated**: March 25, 2026  
**SentinelNet Version**: 1.0.0
