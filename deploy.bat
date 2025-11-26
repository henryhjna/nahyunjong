@echo off
REM =============================================================================
REM Nahyunjong Windows Deployment Script
REM =============================================================================
REM This is the ONLY way to deploy on Windows
REM Usage: deploy.bat
REM =============================================================================

echo.
echo =========================================
echo Nahyunjong Deployment
echo =========================================
echo.

REM Check if Git Bash is available
where bash >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git Bash not found!
    echo Please install Git for Windows: https://git-scm.com/download/win
    exit /b 1
)

REM Run the bash deployment script
bash scripts/deploy.sh

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Deployment failed!
    exit /b 1
)

echo.
echo =========================================
echo Deployment completed successfully!
echo =========================================
echo.
