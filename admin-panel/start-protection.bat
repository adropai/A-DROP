@echo off
title File Guardian - A-DROP System Protection

echo.
echo ================================
echo   FILE GUARDIAN ACTIVATED
echo ================================
echo.
echo This system prevents auto-generation 
echo of unwanted files in your project.
echo.
echo Press Ctrl+C to stop
echo.

cd /d "E:\project\A-DROP\admin-panel"
node scripts/file-destroyer.js

pause
