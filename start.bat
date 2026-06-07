@echo off
cd /d "%~dp0"
echo.
echo   ORKXTRA  -  http://127.0.0.1:4173/
echo   (Press Ctrl+C to stop)
echo.
node web-player\server.js --port=4173
pause
