@echo off
REM Windows: double-click me to launch the slopify web UI.
REM It hands off to start.mjs, which does everything else.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js isn't installed ^(or isn't on your PATH^).
  echo   Install it from https://nodejs.org, then run this again.
  echo.
  pause
  exit /b 1
)

node start.mjs
pause
