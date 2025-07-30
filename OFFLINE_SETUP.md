# DevStackBox - Offline Server Setup Guide

This guide will help you set up DevStackBox with offline/bundled Apache, MySQL, and phpMyAdmin binaries instead of downloading them live.

## 📦 **Required Downloads**

### 1. **Apache HTTP Server**
- **Download from**: https://www.apachelounge.com/download/
- **Version**: Apache 2.4.58 or newer (Windows x64)
- **Extract to**: `DevStackBox/apache/`
- **Expected structure**:
  ```
  apache/
  ├── bin/httpd.exe
  ├── conf/httpd.conf
  ├── htdocs/
  ├── logs/
  └── modules/
  ```

### 2. **MySQL Database**
- **Download from**: https://dev.mysql.com/downloads/mysql/
- **Version**: MySQL 8.0.35 or newer (Windows x64 ZIP Archive)
- **Extract to**: `DevStackBox/mysql/`
- **Expected structure**:
  ```
  mysql/
  ├── bin/mysqld.exe
  ├── bin/mysql.exe
  ├── data/ (will be created)
  ├── my.ini (will be created)
  └── logs/
  ```

### 3. **PHP Versions**
- **Download from**: https://windows.php.net/downloads/
- **Versions needed**: PHP 8.1, 8.2, 8.3 (Windows x64 Thread Safe)
- **Extract to**: 
  - `DevStackBox/php/8.1/`
  - `DevStackBox/php/8.2/`
  - `DevStackBox/php/8.3/`
- **Expected structure** (for each version):
  ```
  php/8.x/
  ├── php.exe
  ├── php.ini-development
  ├── ext/ (extensions)
  └── tmp/ (will be created)
  ```

### 4. **phpMyAdmin**
- **Download from**: https://www.phpmyadmin.net/downloads/
- **Version**: phpMyAdmin 5.2.1 or newer
- **Extract to**: `DevStackBox/phpmyadmin/`
- **Expected structure**:
  ```
  phpmyadmin/
  ├── index.php
  ├── config.inc.php (will be created)
  ├── libraries/
  ├── themes/
  └── tmp/ (will be created)
  ```

---

## 🔧 **Quick Setup Steps**

### **Step 1: Download All Components**
1. Download Apache ZIP from ApacheLounge
2. Download MySQL ZIP from MySQL official site
3. Download PHP 8.1, 8.2, 8.3 ZIP files from PHP.net
4. Download phpMyAdmin ZIP from phpMyAdmin.net

### **Step 2: Extract to Project Folders**
1. Extract Apache to `DevStackBox/apache/`
2. Extract MySQL to `DevStackBox/mysql/`
3. Extract each PHP version to respective `DevStackBox/php/8.x/` folders
4. Extract phpMyAdmin to `DevStackBox/phpmyadmin/`

### **Step 3: Verify Structure**
Run DevStackBox - it should automatically detect the binaries and show all services as "available" instead of "not installed".

---

## 🚀 **Alternative: Use Existing XAMPP**

If you have XAMPP installed, you can copy binaries from there:

### **From XAMPP to DevStackBox:**
```powershell
# Copy Apache
Copy-Item "C:\xampp\apache\*" "DevStackBox\apache\" -Recurse

# Copy MySQL
Copy-Item "C:\xampp\mysql\*" "DevStackBox\mysql\" -Recurse

# Copy PHP
Copy-Item "C:\xampp\php\*" "DevStackBox\php\8.3\" -Recurse

# Copy phpMyAdmin
Copy-Item "C:\xampp\phpMyAdmin\*" "DevStackBox\phpmyadmin\" -Recurse
```

---

## ✅ **Verification**

After setup, DevStackBox should show:
- ✅ Apache: Available (not "binaries not found")
- ✅ MySQL: Available (not "binaries not found")
- ✅ PHP 8.3: Available (not "binaries not found")
- ✅ phpMyAdmin: Available in Quick Actions

---

## 🎯 **Benefits of Offline Setup**

1. **No Internet Required**: Works completely offline
2. **Faster Startup**: No downloads needed
3. **Version Control**: Exact versions bundled with project
4. **Reliable**: No download failures or server issues
5. **Portable**: Copy entire project folder anywhere

---

## 📝 **Notes**

- The app will automatically configure all services once binaries are detected
- Configuration files (httpd.conf, my.ini, php.ini) will be created automatically
- All services will run on default ports (Apache: 80, MySQL: 3306)
- phpMyAdmin will be accessible at `http://localhost/phpmyadmin/`

---

## 🆘 **Troubleshooting**

### **If services still show "binaries not found":**
1. Check folder structure matches the expected layout above
2. Ensure executable files have correct names (httpd.exe, mysqld.exe, php.exe)
3. Check file permissions - executables should not be blocked
4. Restart DevStackBox after adding binaries

### **If you prefer the download option:**
The download functionality is still available in the File menu, but offline setup is recommended for reliability.
