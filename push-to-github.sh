#!/bin/bash

# SentinelNet GitHub Push Script
# Usage: ./push-to-github.sh <github-url>

if [ -z "$1" ]; then
    echo "❌ GitHub URL not provided!"
    echo ""
    echo "Usage: ./push-to-github.sh <github-url>"
    echo ""
    echo "Example:"
    echo "  ./push-to-github.sh https://github.com/Akulbanxal/SentinelNet.git"
    echo ""
    echo "Steps:"
    echo "1. Create a repository on GitHub: https://github.com/new"
    echo "2. Copy the repository URL (without clicking any setup instructions)"
    echo "3. Run this script with that URL"
    echo ""
    exit 1
fi

GITHUB_URL=$1

echo "🚀 Pushing SentinelNet to GitHub..."
echo "📍 Repository: $GITHUB_URL"
echo ""

cd /Users/akul/Desktop/Sentinelnet

echo "📌 Adding remote origin..."
git remote add origin "$GITHUB_URL"

echo "📌 Setting default branch to main..."
git branch -M main

echo "📌 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 Your repository is now available at: $GITHUB_URL"
    echo ""
    echo "Next steps:"
    echo "1. Visit $GITHUB_URL in your browser"
    echo "2. Share the link with others"
    echo "3. To make changes locally and push again: git push"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo "Possible reasons:"
    echo "1. Invalid GitHub URL"
    echo "2. GitHub authentication failed"
    echo "3. Repository already has files (create empty repo instead)"
    echo ""
fi
