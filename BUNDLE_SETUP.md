# DevStackBox - Pre-bundled Server Setup

DevStackBox comes with **pre-bundled Apache, MySQL, PHP 8.2, and phpMyAdmin** for immediate use without any external dependencies.

## 🎯 **Default Configuration**

- **PHP 8.2** - Primary version (pre-installed)
- **Apache 2.4** - Web server (pre-bundled)  
- **MySQL 8.0** - Database server (pre-bundled)
- **phpMyAdmin** - Database management (pre-bundled)

## 📦 **Pre-bundled Structure**

```
DevStackBox/
├── apache/
│   ├── bin/httpd.exe ✓
│   ├── conf/httpd.conf
│   └── modules/
├── mysql/
│   ├── bin/mysqld.exe ✓
│   ├── bin/mysql.exe ✓
│   └── data/
├── php/
│   └── 8.2/  ← Default version
│       ├── php.exe ✓
│       ├── php.ini
│       └── ext/
└── phpmyadmin/
    ├── index.php ✓
    └── config.inc.php
```

## 🚀 **Quick Start**

1. **Launch DevStackBox**
   ```bash
   npm start
   ```

2. **All services ready immediately** - No downloads needed!
   - ✅ Apache: Ready to start
   - ✅ MySQL: Ready to start  
   - ✅ PHP 8.2: Ready to use
   - ✅ phpMyAdmin: Ready to access

3. **Start Services** from the GUI:
   - Click "Start Apache"
   - Click "Start MySQL"
   - Open http://localhost in browser

## 🔧 **Additional PHP Versions**

Want PHP 8.1 or 8.3? Use the built-in downloader:
- **File → Download Portable Servers** 
- Select additional PHP versions
- Switch between versions in GUI

## ✅ **Benefits**

- ✅ **No Internet Required** - Works completely offline
- ✅ **No External Dependencies** - Everything included
- ✅ **Instant Setup** - Start coding immediately  
- ✅ **Portable** - Copy entire folder anywhere
- ✅ **Version Controlled** - Exact same setup everywhere

## 🛠️ **Customization**

All configuration files are pre-configured but editable:
- **Apache**: `apache/conf/httpd.conf`
- **MySQL**: `mysql/my.ini`  
- **PHP**: `php/8.2/php.ini`
- **phpMyAdmin**: `phpmyadmin/config.inc.php`

## 📝 **Notes**

- Default ports: Apache (80), MySQL (3306)
- Default PHP version: 8.2 (fastest, most stable)
- phpMyAdmin accessible at: http://localhost/phpmyadmin/
- All services run portable - no system installation needed

---

**Ready to develop? Just run `npm start` and everything works!** 🚀
