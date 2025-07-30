@echo off
echo DevStackBox - Prepare Directory Structure
echo =========================================
echo.

echo Creating directory structure for server binaries...

:: Create main server directories
if not exist "apache" mkdir apache
if not exist "apache\bin" mkdir apache\bin
if not exist "apache\conf" mkdir apache\conf
if not exist "apache\htdocs" mkdir apache\htdocs
if not exist "apache\logs" mkdir apache\logs
if not exist "apache\modules" mkdir apache\modules

if not exist "mysql" mkdir mysql
if not exist "mysql\bin" mkdir mysql\bin
if not exist "mysql\data" mkdir mysql\data
if not exist "mysql\logs" mkdir mysql\logs

if not exist "php" mkdir php
if not exist "php\8.1" mkdir php\8.1
if not exist "php\8.2" mkdir php\8.2
if not exist "php\8.3" mkdir php\8.3
if not exist "php\logs" mkdir php\logs

if not exist "phpmyadmin" mkdir phpmyadmin
if not exist "phpmyadmin\tmp" mkdir phpmyadmin\tmp

if not exist "www" mkdir www
if not exist "www\projects" mkdir www\projects

echo.
echo ✅ Directory structure created successfully!
echo.
echo 📋 Next steps:
echo    1. Download server binaries from DOWNLOAD_LINKS.md
echo    2. Extract each to its respective directory
echo    3. Run 'npm start' to launch DevStackBox
echo.

echo 📁 Created directories:
echo    apache/     - Apache HTTP Server
echo    mysql/      - MySQL Database Server  
echo    php/8.1/    - PHP 8.1 (optional)
echo    php/8.2/    - PHP 8.2 (default)
echo    php/8.3/    - PHP 8.3 (optional)
echo    phpmyadmin/ - phpMyAdmin
echo    www/        - Web document root
echo.

pause
