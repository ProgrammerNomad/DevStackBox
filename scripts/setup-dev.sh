#!/bin/bash
# DevStackBox Development Startup Script
# This script helps set up the development environment

echo "🚀 Starting DevStackBox Development Environment..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check for Rust/Cargo
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo is not installed. Please install Rust first."
    exit 1
fi

# Check for pnpm (preferred) or npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
else
    echo "❌ No package manager found. Please install npm or pnpm."
    exit 1
fi

echo "📦 Using package manager: $PACKAGE_MANAGER"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
$PACKAGE_MANAGER install

# Install Tauri CLI if not present
if ! command -v cargo-tauri &> /dev/null; then
    echo "🦀 Installing Tauri CLI..."
    cargo install tauri-cli
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p mysql/{bin,data}
mkdir -p php/8.2/{bin,ext}
mkdir -p apache/{bin,conf}
mkdir -p phpmyadmin
mkdir -p apps
mkdir -p config-backups
mkdir -p logs
mkdir -p www
mkdir -p tmp

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Download MySQL binaries to mysql/bin/"
echo "2. Download PHP 8.2 binaries to php/8.2/bin/"
echo "3. Download phpMyAdmin to phpmyadmin/"
echo "4. Run: $PACKAGE_MANAGER run tauri:dev"
echo ""
echo "📚 Need help? Check the README.md or GitHub Issues"
