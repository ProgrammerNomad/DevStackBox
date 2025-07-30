# DevStackBox - Download and Bundle Server Components
# ===================================================
# This script downloads and extracts all required server binaries
# to make DevStackBox work offline like XAMPP

param(
    [switch]$Force,
    [switch]$SkipExisting
)

Write-Host "DevStackBox - Downloading Server Components" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Create downloads directory
$downloadDir = "downloads\binaries"
if (-not (Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir -Force | Out-Null
}

# Download URLs and configurations
$downloads = @{
    "Apache" = @{
        url = "https://www.apachelounge.com/download/VS17/binaries/httpd-2.4.58-240718-win64-VS17.zip"
        filename = "apache.zip"
        extractTo = "apache"
        testFile = "apache\bin\httpd.exe"
    }
    "MySQL" = @{
        url = "https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.35-winx64.zip"
        filename = "mysql.zip"
        extractTo = "mysql"
        testFile = "mysql\bin\mysqld.exe"
    }
    "PHP82" = @{
        url = "https://windows.php.net/downloads/releases/php-8.2.26-Win32-vs16-x64.zip"
        filename = "php82.zip"
        extractTo = "php\8.2"
        testFile = "php\8.2\php.exe"
    }
    "PHP81" = @{
        url = "https://windows.php.net/downloads/releases/php-8.1.27-Win32-vs16-x64.zip"
        filename = "php81.zip"
        extractTo = "php\8.1"
        testFile = "php\8.1\php.exe"
    }
    "PHP83" = @{
        url = "https://windows.php.net/downloads/releases/php-8.3.1-Win32-vs16-x64.zip"
        filename = "php83.zip"
        extractTo = "php\8.3"
        testFile = "php\8.3\php.exe"
    }
    "phpMyAdmin" = @{
        url = "https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip"
        filename = "phpmyadmin.zip"
        extractTo = "phpmyadmin"
        testFile = "phpmyadmin\index.php"
    }
}

function Get-WebFile {
    param($url, $output, $name)
    
    Write-Host "Downloading $name..." -ForegroundColor Yellow
    
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "DevStackBox/1.0")
        $webClient.DownloadFile($url, $output)
        Write-Host "Downloaded $name successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Failed to download ${name}: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Expand-ServerArchive {
    param($zipPath, $extractPath, $name)
    
    Write-Host "Extracting $name..." -ForegroundColor Yellow
    
    try {
        # Create extraction directory
        if (-not (Test-Path $extractPath)) {
            New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
        }
        
        # Extract using PowerShell Expand-Archive
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
        
        Write-Host "Extracted $name successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Failed to extract ${name}: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check existing components
$totalComponents = $downloads.Count
$existingComponents = 0

Write-Host "Checking existing components..." -ForegroundColor Cyan

foreach ($component in $downloads.GetEnumerator()) {
    $name = $component.Key
    $config = $component.Value
    $testPath = $config.testFile
    
    if (Test-Path $testPath) {
        Write-Host "$name already exists" -ForegroundColor Green
        $existingComponents++
    } else {
        Write-Host "$name missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Status: $existingComponents/$totalComponents components available" -ForegroundColor Cyan

if ($existingComponents -eq $totalComponents -and -not $Force) {
    Write-Host "All components already installed!" -ForegroundColor Green
    Write-Host "Use -Force parameter to re-download everything" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 0
}

Write-Host ""
Write-Host "Starting download and extraction process..." -ForegroundColor Cyan
Write-Host ""

# Download and extract each component
$downloadedComponents = 0

foreach ($component in $downloads.GetEnumerator()) {
    $name = $component.Key
    $config = $component.Value
    
    $downloadPath = Join-Path $downloadDir $config.filename
    $extractPath = $config.extractTo
    $testPath = $config.testFile
    
    # Skip if already exists and not forcing
    if ((Test-Path $testPath) -and $SkipExisting -and -not $Force) {
        Write-Host "Skipping $name (already exists)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing $name..." -ForegroundColor Cyan
    
    # Download if not exists or forcing
    if (-not (Test-Path $downloadPath) -or $Force) {
        if (-not (Get-WebFile $config.url $downloadPath $name)) {
            continue
        }
    } else {
        Write-Host "Using existing download for $name" -ForegroundColor Yellow
    }
    
    # Extract
    if (Expand-ServerArchive $downloadPath $extractPath $name) {
        $downloadedComponents++
    }
    
    Write-Host ""
}

Write-Host "Download and extraction completed!" -ForegroundColor Green
Write-Host "Successfully processed: $downloadedComponents components" -ForegroundColor Cyan
Write-Host ""

# Verify final installation
Write-Host "Final verification..." -ForegroundColor Cyan
$finalComponents = 0

foreach ($component in $downloads.GetEnumerator()) {
    $name = $component.Key
    $config = $component.Value
    $testPath = $config.testFile
    
    if (Test-Path $testPath) {
        Write-Host "${name}: Ready" -ForegroundColor Green
        $finalComponents++
    } else {
        Write-Host "${name}: Missing" -ForegroundColor Red
    }
}

Write-Host ""
if ($finalComponents -eq $totalComponents) {
    Write-Host "DevStackBox is now fully bundled and ready!" -ForegroundColor Green
    Write-Host "All server components are available offline." -ForegroundColor Green
    Write-Host ""
    Write-Host "Available Components:" -ForegroundColor Cyan
    Write-Host "- Apache HTTP Server" -ForegroundColor Green
    Write-Host "- MySQL Database Server" -ForegroundColor Green
    Write-Host "- PHP 8.1, 8.2, 8.3" -ForegroundColor Green
    Write-Host "- phpMyAdmin" -ForegroundColor Green
    Write-Host ""
    Write-Host "Default PHP Version: 8.2" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run 'npm start' to launch DevStackBox!" -ForegroundColor Cyan
} else {
    Write-Host "Some components are still missing ($finalComponents/$totalComponents)" -ForegroundColor Yellow
    Write-Host "You may need to run this script again or check your internet connection." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
