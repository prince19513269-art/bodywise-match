@echo off
setlocal
cd /d "%~dp0"
title Bodywise Match - Keep this window open
set "NEXT_TELEMETRY_DISABLED=1"

set "BODYWISE_NODE="
for /f "delims=" %%N in ('where.exe node.exe 2^>nul') do if not defined BODYWISE_NODE set "BODYWISE_NODE=%%N"
if not defined BODYWISE_NODE set "BODYWISE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%BODYWISE_NODE%" (
  echo Node.js was not found. Open this project in Codex and ask to start the app.
  pause
  exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
  echo App dependencies were not found. Keep this launcher in the Be Bodywise project folder.
  pause
  exit /b 1
)

echo Starting Bodywise Match...
echo.
echo When you see Ready below, open or refresh:
echo http://127.0.0.1:3000/products
echo.
echo Keep this window open while using the app.
echo After restarting your laptop, double-click this file again.
echo Press Ctrl+C here to stop the app.
echo.
"%BODYWISE_NODE%" "node_modules\next\dist\bin\next" dev --hostname 127.0.0.1 --port 3000
echo.
echo The app server has stopped. If it says the port is already in use,
echo another app window may already be running. Try refreshing the browser.
pause
