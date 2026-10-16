@echo off

taskkill /F /IM node.exe >nul 2>&1

timeout /t 2 >nul

cd /d C:\TZG-Dashboard

start "TZG Dashboard" cmd /k npm run dev