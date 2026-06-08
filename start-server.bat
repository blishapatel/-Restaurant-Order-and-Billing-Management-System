@echo off
title The Grand Table - Server
cd /d "%~dp0backend"
echo Starting The Grand Table server...
echo.
echo Frontend : http://localhost:5000
echo.
node server.js
pause
