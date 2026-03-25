#!/usr/bin/env bash

# SentinelNet - Pre-Deployment Checklist
# Run this script before deploying to Vercel

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       SentinelNet - Pre-Deployment Verification                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counter
PASS=0
FAIL=0

# Check function
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} $1"
        ((FAIL++))
    fi
}

echo -e "${BLUE}🔍 Checking System Requirements${NC}"
echo ""

# 1. Node.js
node -v > /dev/null 2>&1
check "Node.js installed ($(node -v))"

# 2. npm
npm -v > /dev/null 2>&1
check "npm installed ($(npm -v))"

# 3. Vercel CLI
vercel --version > /dev/null 2>&1
check "Vercel CLI installed"

# 4. Git
git -v > /dev/null 2>&1
check "Git installed"

# 5. TypeScript
cd backend 2>/dev/null && npx tsc --version > /dev/null 2>&1
check "TypeScript available"
cd .. 2>/dev/null

echo ""
echo -e "${BLUE}📁 Checking Project Structure${NC}"
echo ""

# 6. Frontend directory
[ -d "frontend" ]
check "Frontend directory exists"

# 7. Backend directory
[ -d "backend" ]
check "Backend directory exists"

# 8. Contracts directory
[ -d "contracts" ]
check "Contracts directory exists"

# 9. Frontend package.json
[ -f "frontend/package.json" ]
check "Frontend package.json exists"

# 10. Backend package.json
[ -f "backend/package.json" ]
check "Backend package.json exists"

# 11. Backend vercel.json
[ -f "backend/vercel.json" ]
check "Backend vercel.json configured"

echo ""
echo -e "${BLUE}📦 Checking Dependencies${NC}"
echo ""

# 12. Root node_modules
[ -d "node_modules" ]
check "Root dependencies installed"

# 13. Frontend node_modules
[ -d "frontend/node_modules" ]
check "Frontend dependencies installed"

# 14. Backend node_modules
[ -d "backend/node_modules" ]
check "Backend dependencies installed"

echo ""
echo -e "${BLUE}🔧 Checking Build Configuration${NC}"
echo ""

# 15. Next.js config
[ -f "frontend/next.config.js" ]
check "Frontend next.config.js exists"

# 16. TypeScript config
[ -f "backend/tsconfig.json" ]
check "Backend tsconfig.json exists"

echo ""
echo -e "${BLUE}🌐 Checking Git Configuration${NC}"
echo ""

# 17. Git initialized
[ -d ".git" ]
check "Git repository initialized"

# 18. Git remote
git remote -v | grep -q "github.com"
check "GitHub remote configured"

# 19. Git user
git config user.name > /dev/null 2>&1
check "Git user configured"

echo ""
echo -e "${BLUE}📄 Checking Documentation${NC}"
echo ""

# 20. Deployment docs
[ -f "VERCEL_READY.md" ]
check "VERCEL_READY.md documentation"

[ -f "VERCEL_VISUAL_GUIDE.md" ]
check "VERCEL_VISUAL_GUIDE.md documentation"

[ -f "VERCEL_QUICK_COMMANDS.md" ]
check "VERCEL_QUICK_COMMANDS.md documentation"

echo ""
echo -e "${BLUE}🔐 Checking Security${NC}"
echo ""

# 21. .env not committed
grep -q ".env" .gitignore 2>/dev/null
check ".env file is gitignored"

# 22. No hardcoded secrets
! grep -r "sk-" frontend/src backend/src 2>/dev/null | grep -q "openai\|api\|key"
check "No hardcoded API keys in code"

echo ""
echo -e "${BLUE}✨ Checking Build Status${NC}"
echo ""

# 23. Frontend builds
cd frontend > /dev/null 2>&1
npm run build > /dev/null 2>&1
check "Frontend builds successfully"
cd .. > /dev/null 2>&1

# 24. Backend builds
cd backend > /dev/null 2>&1
npm run build > /dev/null 2>&1
check "Backend builds successfully"
cd .. > /dev/null 2>&1

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION RESULTS                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo -e "Passed: ${GREEN}$PASS/$TOTAL${NC} checks ($PERCENTAGE%)"

if [ $FAIL -gt 0 ]; then
    echo -e "Failed: ${RED}$FAIL/$TOTAL${NC} checks"
    echo ""
    echo -e "${YELLOW}⚠️  Some checks failed. Please fix these before deploying.${NC}"
    exit 1
else
    echo -e "Failed: ${GREEN}0/$TOTAL${NC} checks"
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              🚀 READY FOR VERCEL DEPLOYMENT! 🚀              ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "1. Read: VERCEL_READY.md"
    echo "2. Push to GitHub: git push origin main"
    echo "3. Login: vercel login"
    echo "4. Deploy: vercel deploy --prod ./frontend"
    echo "5. Deploy: vercel deploy --prod ./backend"
    echo "6. Add environment variables in Vercel dashboard"
    echo "7. Redeploy both projects"
    echo ""
    echo "Good luck! 🎉"
    exit 0
fi
