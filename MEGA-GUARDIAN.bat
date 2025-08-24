@echo off
title MEGA GUARDIAN - Complete Project Protection

echo.
echo ==========================================
echo      MEGA GUARDIAN SYSTEM ACTIVATED
echo ==========================================
echo.
echo Protecting ENTIRE A-DROP project from:
echo   - Empty MD report files
echo   - Test files 
echo   - Backup files
echo   - Duplicate files
echo.
echo Monitoring directories:
echo   - E:\project\A-DROP
echo   - E:\project\A-DROP\admin-panel
echo.
echo Press Ctrl+C to stop protection
echo.

cd /d "E:\project\A-DROP\admin-panel"
node scripts/mega-destroyer.js

echo.
echo MEGA GUARDIAN stopped
pause
