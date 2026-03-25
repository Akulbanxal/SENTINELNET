#!/bin/bash

# SentinelNet - Vercel Deployment Setup Script
# This script prepares your project for Vercel deployment

set -e

echo "🚀 SentinelNet - Vercel Deployment Setup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo -e "${BLUE}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

echo -e "${BLUE}✅ Vercel CLI is installed${NC}"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not found${NC}"
    echo -e "${BLUE}Initialize git first:${NC}"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git branch -M main"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/sentinelnet.git"
    echo "  git push -u origin main"
    exit 1
fi

echo -e "${GREEN}✅ Git repository found${NC}"
echo ""

# Check GitHub connection
echo -e "${BLUE}Checking GitHub connection...${NC}"
if git remote -v | grep -q "github.com"; then
    echo -e "${GREEN}✅ GitHub remote configured${NC}"
else
    echo -e "${RED}❌ GitHub remote not configured${NC}"
    echo "Add your GitHub remote:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/sentinelnet.git"
    exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  📋 Vercel Deployment Checklist${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""

# Checklist
echo -e "${BLUE}Pre-Deployment Requirements:${NC}"
echo -e "  [ ] Vercel account created (https://vercel.com)"
echo -e "  [ ] GitHub repository created and pushed"
echo -e "  [ ] Environment variables ready"
echo -e "  [ ] Smart contracts deployed to Sepolia"
echo -e "  [ ] Contract addresses saved"
echo ""

# Check environment file
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Create from .env.example:"
    echo "  cp .env.example .env"
    echo "  # Edit .env with your values"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎯 Next Steps${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}1. Deploy Frontend:${NC}"
echo "   vercel deploy --prod ./frontend"
echo ""

echo -e "${BLUE}2. Deploy Backend:${NC}"
echo "   vercel deploy --prod ./backend"
echo ""

echo -e "${BLUE}3. Update Environment Variables in Vercel:${NC}"
echo "   - Frontend: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL"
echo "   - Backend: All blockchain and API keys"
echo ""

echo -e "${BLUE}4. Or use the guided deploy:${NC}"
echo "   vercel --prod"
echo ""

echo -e "${YELLOW}🔗 Documentation:${NC}"
echo "   See VERCEL_DEPLOYMENT.md for detailed instructions"
echo ""

echo -e "${GREEN}Ready to deploy! 🚀${NC}"
echo ""
