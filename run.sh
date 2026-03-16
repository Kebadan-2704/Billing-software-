#!/usr/bin/env bash

# 🏗️ Construction Project Manager - Quick Start Script
# Usage: bash run.sh

echo "🏗️  Construction Project Manager - Starting..."
echo "=================================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")" || exit

echo "📦 Installing dependencies (if needed)..."
npm install --silent

echo ""
echo "🚀 Starting development server..."
echo "========================================"
echo ""
echo "✅ Development server starting..."
echo "🌐 URL: http://localhost:3000"
echo "📝 Features:"
echo "   - Professional landing page"
echo "   - Dashboard with KPI cards"
echo "   - Project tracking table"
echo "   - Team collaboration tools"
echo "   - Responsive design"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "========================================"
echo ""

npm run dev

echo ""
echo "🛑 Development server stopped"
