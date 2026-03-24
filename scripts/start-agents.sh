#!/bin/bash

# SentinelNet - Start All Agents Script

echo "🚀 Starting SentinelNet Agents..."

# Check if node_modules exist
if [ ! -d "agents/node_modules" ]; then
    echo "❌ Dependencies not installed. Run 'npm install' in agents directory first."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p agents/logs

echo ""
echo "📋 Starting agents in background..."

# Start Security Agent
echo "🔐 Starting Security Agent..."
cd agents
nohup npm run start:security > logs/security-agent.log 2>&1 &
SECURITY_PID=$!
echo "   PID: $SECURITY_PID"

# Start Liquidity Agent
echo "💧 Starting Liquidity Agent..."
nohup npm run start:liquidity > logs/liquidity-agent.log 2>&1 &
LIQUIDITY_PID=$!
echo "   PID: $LIQUIDITY_PID"

# Start Tokenomics Agent
echo "📊 Starting Tokenomics Agent..."
nohup npm run start:tokenomics > logs/tokenomics-agent.log 2>&1 &
TOKENOMICS_PID=$!
echo "   PID: $TOKENOMICS_PID"

# Start Trader Agent
echo "🤖 Starting Trader Agent..."
nohup npm run start:trader > logs/trader-agent.log 2>&1 &
TRADER_PID=$!
echo "   PID: $TRADER_PID"

cd ..

# Save PIDs to file for later stopping
echo "$SECURITY_PID" > agents/logs/pids.txt
echo "$LIQUIDITY_PID" >> agents/logs/pids.txt
echo "$TOKENOMICS_PID" >> agents/logs/pids.txt
echo "$TRADER_PID" >> agents/logs/pids.txt

echo ""
echo "✅ All agents started successfully!"
echo ""
echo "📝 Process IDs:"
echo "   Security:    $SECURITY_PID"
echo "   Liquidity:   $LIQUIDITY_PID"
echo "   Tokenomics:  $TOKENOMICS_PID"
echo "   Trader:      $TRADER_PID"
echo ""
echo "📄 Logs are available in: agents/logs/"
echo ""
echo "To stop all agents, run: ./scripts/stop-agents.sh"
echo "To view logs, run: tail -f agents/logs/*.log"
