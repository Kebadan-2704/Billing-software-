@echo off
REM 🏗️ Construction Project Manager - Quick Start Script for Windows
REM Usage: run.bat

echo.
echo 🏗️  Construction Project Manager - Starting...
echo ==================================================
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo 📦 Installing dependencies (if needed)...
call npm install --silent

echo.
echo 🚀 Starting development server...
echo ========================================
echo.
echo ✅ Development server starting...
echo 🌐 URL: http://localhost:3000
echo 📝 Features:
echo    - Professional landing page
echo    - Dashboard with KPI cards
echo    - Project tracking table
echo    - Team collaboration tools
echo    - Responsive design
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm run dev

echo.
echo 🛑 Development server stopped
pause
