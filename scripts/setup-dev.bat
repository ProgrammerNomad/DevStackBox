@echo off
REM DevStackBox Development Startup Script for Windows
REM This script helps set up the development environment

echo 🚀 Starting DevStackBox Development Environment...

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check for Rust/Cargo
cargo --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Rust/Cargo is not installed. Please install Rust first.
    exit /b 1
)

REM Check for package managers
set PACKAGE_MANAGER=
pnpm --version >nul 2>&1
if not errorlevel 1 (
    set PACKAGE_MANAGER=pnpm
) else (
    npm --version >nul 2>&1
    if not errorlevel 1 (
        set PACKAGE_MANAGER=npm
    ) else (
        echo ❌ No package manager found. Please install npm or pnpm.
        exit /b 1
    )
)

echo 📦 Using package manager: %PACKAGE_MANAGER%

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
%PACKAGE_MANAGER% install

REM Install Tauri CLI if not present
cargo-tauri --version >nul 2>&1
if errorlevel 1 (
    echo 🦀 Installing Tauri CLI...
    cargo install tauri-cli
)

REM Create necessary directories
echo 📁 Creating directory structure...
if not exist mysql\bin mkdir mysql\bin
if not exist mysql\data mkdir mysql\data
if not exist php\8.2\bin mkdir php\8.2\bin
if not exist php\8.2\ext mkdir php\8.2\ext
if not exist apache\bin mkdir apache\bin
if not exist apache\conf mkdir apache\conf
if not exist phpmyadmin mkdir phpmyadmin
if not exist apps mkdir apps
if not exist config-backups mkdir config-backups
if not exist logs mkdir logs
if not exist www mkdir www
if not exist tmp mkdir tmp

echo ✅ Development environment setup complete!
echo.
echo 🎯 Next steps:
echo 1. Download MySQL binaries to mysql/bin/
echo 2. Download PHP 8.2 binaries to php/8.2/bin/
echo 3. Download phpMyAdmin to phpmyadmin/
echo 4. Run: %PACKAGE_MANAGER% run tauri:dev
echo.
echo 📚 Need help? Check the README.md or GitHub Issues
pause
