#!/bin/bash

# SentinelNet Smart Contract Setup and Verification Script

echo "🚀 SentinelNet Smart Contract Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the contracts directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the contracts directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "🔨 Compiling contracts..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo ""
echo "${GREEN}✅ Contracts compiled successfully${NC}"
echo ""

echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo ""
echo "${GREEN}✅ All tests passed${NC}"
echo ""

echo "======================================"
echo "${GREEN}🎉 Setup Complete!${NC}"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. ${BLUE}Configure Environment${NC}"
echo "   cp ../.env.example .env"
echo "   # Edit .env with your keys"
echo ""
echo "2. ${BLUE}Deploy Contracts${NC}"
echo "   npm run deploy:sepolia"
echo ""
echo "3. ${BLUE}Verify on Etherscan${NC}"
echo "   npm run verify"
echo ""
echo "4. ${BLUE}Update Agent Config${NC}"
echo "   # Update agents/shared/config.ts with deployed addresses"
echo ""
echo "======================================"
echo ""
echo "📚 Available Commands:"
echo ""
echo "  npm test              - Run all tests"
echo "  npm run test:audit    - Test AuditRegistry"
echo "  npm run test:escrow   - Test AgentEscrow"
echo "  npm run test:trade    - Test TradeExecutor"
echo "  npm run coverage      - Generate coverage report"
echo "  npm run deploy        - Deploy to localhost"
echo "  npm run deploy:sepolia - Deploy to Sepolia"
echo ""
echo "======================================"
