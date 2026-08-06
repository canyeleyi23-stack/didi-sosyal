@echo off
chcp 65001 >nul
title DIDI Sosyal Beta 1.3
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0BASLAT.ps1"
