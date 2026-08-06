@echo off
chcp 65001 >nul
title DIDI Sosyal Kontrol
cd /d "%~dp0"
echo Node surumu:
node --version
echo.
echo Kod kontrolleri:
node --check src\server.js
node --check src\launcher.js
node --check public\app.js
echo.
echo Acik DIDI portlari:
netstat -ano | findstr ":3000 :3001 :3002 :3003 :3004 :3005 :3006 :3007 :3008 :3009 :3010"
echo.
pause
