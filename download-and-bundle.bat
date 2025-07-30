@echo off
echo.
echo 🚀 DevStackBox - Download and Bundle Server Components
echo ===============================================
echo.

:: Create downloads directory
if not exist "downloads\binaries" mkdir downloads\binaries

:: Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PowerShell is required but not available
    echo Please run the download-and-bundle.ps1 script directly
    pause
    exit /b 1
)

echo 📋 Starting PowerShell download script...
echo.

:: Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "download-and-bundle.ps1" %*

echo.
echo 📋 Download script completed
pause
