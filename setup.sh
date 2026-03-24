#!/bin/bash

# SentinelNet - Complete Setup Script
# This script automates the entire setup process

set -e  # Exit on any error

echo "╔════════════════════════════════════════════╗"
echo "║     SentinelNet Setup Wizard               ║"
echo "║     Autonomous Agent Verification Network  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version OK${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your API keys before continuing${NC}"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Load environment variables
source .env

# Validate required variables
echo "🔍 Validating environment variables..."
REQUIRED_VARS=("PRIVATE_KEY" "ALCHEMY_API_KEY" "OPENAI_API_KEY")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    exit 1
fi
echo -e "${GREEN}✓ Environment variables OK${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
npm run install:all > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Compile contracts
echo "🔨 Compiling smart contracts..."
cd contracts
npm run compile > /dev/null 2>&1
cd ..
echo -e "${GREEN}✓ Contracts compiled${NC}"
echo ""

# Ask about deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Contract Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Deploy contracts to Sepolia testnet? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying contracts to Sepolia..."
    cd contracts
    npm run deploy:sepolia
    cd ..
    echo ""
    echo -e "${YELLOW}⚠️  Update .env with the deployed contract addresses${NC}"
    read -p "Press Enter after updating .env..."
    echo ""
    
    # Register agents
    echo "📝 Registering agents..."
    cd agents
    npm run register:agents
    cd ..
    echo ""
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p agents/logs
mkdir -p backend/logs
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Setup complete
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 To start SentinelNet, run these commands in separate terminals:"
echo ""
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo "   Terminal 3: cd agents && npm run start:trader"
echo "   Terminal 4: cd agents && npm run start:security"
echo "   Terminal 5: cd agents && npm run start:liquidity"
echo "   Terminal 6: cd agents && npm run start:tokenomics"
echo ""
echo "Or use the helper script:"
echo "   ./scripts/start-agents.sh"
echo ""
echo "📊 Dashboard will be available at: http://localhost:3000"
echo "🔌 Backend API will be available at: http://localhost:3001"
echo ""
echo "📚 For more information, see:"
echo "   - README.md"
echo "   - QUICKSTART.md"
echo "   - docs/README.md"
echo ""
echo "Happy hacking! 🎉"
