#!/bin/bash

# SentinelNet Development Startup Script
# Starts all services with health checks and auto-restart

set -e

echo "🚀 Starting SentinelNet Development Environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        echo -e "${YELLOW}   Attempting to free port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}⏳ Waiting for $name...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}❌ $name failed to start${NC}"
    return 1
}

# Check Node.js version
echo -e "${BLUE}📦 Checking Node.js version...${NC}"
NODE_VERSION=$(node -v)
echo -e "${GREEN}   Using Node.js $NODE_VERSION${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${BLUE}   Creating .env from .env.example...${NC}"
    cp .env.example .env 2>/dev/null || echo -e "${YELLOW}   .env.example not found, continuing...${NC}"
fi

# Clean up ports
echo ""
echo -e "${BLUE}🧹 Cleaning up ports...${NC}"
check_port 3000
check_port 3001
check_port 3002
check_port 3003

# Check if dependencies are installed
echo ""
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Root dependencies not found${NC}"
    echo -e "${BLUE}   Installing root dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not found${NC}"
    echo -e "${BLUE}   Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found${NC}"
    echo -e "${BLUE}   Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

if [ ! -d "demo/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Demo dependencies not found${NC}"
    echo -e "${BLUE}   Installing demo dependencies...${NC}"
    cd demo && npm install && cd ..
fi

echo -e "${GREEN}✅ All dependencies installed${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎯 Starting SentinelNet Services${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Backend API:${NC}      http://localhost:3001"
echo -e "${BLUE}Frontend Dashboard:${NC} http://localhost:3000"
echo -e "${BLUE}Demo Simulation:${NC}   Running in background"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start all services using npm run dev
npm run dev
