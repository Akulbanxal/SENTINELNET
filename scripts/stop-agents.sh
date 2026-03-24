#!/bin/bash

# SentinelNet - Stop All Agents Script

echo "🛑 Stopping SentinelNet Agents..."

PID_FILE="agents/logs/pids.txt"

if [ ! -f "$PID_FILE" ]; then
    echo "❌ No PID file found. Agents may not be running."
    exit 1
fi

while IFS= read -r pid; do
    if ps -p $pid > /dev/null 2>&1; then
        echo "   Stopping process $pid..."
        kill $pid
    else
        echo "   Process $pid not running"
    fi
done < "$PID_FILE"

# Clean up PID file
rm "$PID_FILE"

echo ""
echo "✅ All agents stopped successfully!"
