@echo off
echo Adding The Grand Table server to Windows startup...
echo.

:: Create a VBS script that starts the server silently in background
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SCRIPT=%STARTUP_DIR%\GrandTableServer.vbs"

echo Set WshShell = CreateObject("WScript.Shell") > "%SCRIPT%"
echo WshShell.Run "pm2 resurrect", 0, False >> "%SCRIPT%"

echo Created: %SCRIPT%
echo.
echo Done! The server will auto-start when you log into Windows.
echo.
echo To start the server right now, run: npm run serve
echo To check status: npm run serve:status
echo To stop: npm run serve:stop
echo.
pause
