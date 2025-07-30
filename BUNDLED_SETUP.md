# DevStackBox - Pre-Bundled Server Setup

DevStackBox is designed to work with **pre-bundled server binaries** to provide an out-of-the-box experience without requiring downloads or external dependencies.

## 📦 **Expected Bundle Structure**

For DevStackBox to work properly, the following directory structure should be present:

```
DevStackBox/
├── apache/
│   ├── bin/httpd.exe          ✓ Required
│   ├── conf/httpd.conf        ✓ Required
│   ├── htdocs/
│   ├── logs/
│   └── modules/
├── mysql/
│   ├── bin/mysqld.exe         ✓ Required
│   ├── bin/mysql.exe          ✓ Required
│   ├── data/
│   ├── my.ini                 ✓ Will be created
│   └── logs/
├── php/
│   └── 8.2/                   ✓ Default PHP version
│       ├── php.exe            ✓ Required
│       ├── php.ini            ✓ Will be created
│       ├── ext/               ✓ Extensions folder
│       └── tmp/
│   └── 8.1/                   ⚡ Optional
│       └── ...
│   └── 8.3/                   ⚡ Optional
│       └── ...
└── phpmyadmin/
    ├── index.php              ✓ Required
    ├── config.inc.php         ✓ Will be created
    ├── libraries/
    ├── themes/
    └── tmp/
```

## 🎯 **PHP 8.2 as Default**

- **PHP 8.2** is the primary pre-bundled version
- **PHP 8.1** and **8.3** are optional additional versions
- Users can switch between versions if multiple are bundled
- All versions support common extensions (mysqli, curl, gd, etc.)

## ✅ **What DevStackBox Provides**

1. **Auto-Configuration**: Creates necessary config files on first run
2. **Service Management**: Start/stop Apache and MySQL with one click
3. **Multiple PHP Versions**: Switch between bundled PHP versions
4. **phpMyAdmin Integration**: Pre-configured database management
5. **Project Management**: Create WordPress, Laravel, and other projects
6. **Zero Dependencies**: No external software required

## 🚀 **Distribution Benefits**

- **Instant Setup**: No downloads or installations needed
- **Offline Ready**: Works completely without internet
- **Version Locked**: Consistent environment across deployments
- **Portable**: Copy entire folder to any Windows machine
- **Professional**: Ready for development teams and training

## 🔧 **For Developers**

To create a bundled distribution:

1. **Download Required Binaries:**
   - Apache HTTP Server (Windows x64)
   - MySQL 8.0+ (Windows x64 ZIP)
   - PHP 8.2 (Windows x64 Thread Safe)
   - phpMyAdmin (Latest)

2. **Extract to Proper Folders:**
   - Extract each to the expected directory structure
   - Remove unnecessary files to reduce size

3. **Test Installation:**
   - Run DevStackBox
   - All services should show as "Available"
   - Start Apache and MySQL successfully

4. **Package Distribution:**
   - Create installer or ZIP bundle
   - Include entire DevStackBox folder with binaries

## 📝 **Notes**

- Configuration files are auto-generated on first run
- All services use standard ports (Apache: 80, MySQL: 3306)
- phpMyAdmin accessible at `http://localhost/phpmyadmin/`
- Projects are created in `www/projects/` folder
- Logs are stored in respective service folders

## 🆘 **Troubleshooting**

- **Services not starting**: Check if binaries exist in expected locations
- **Missing PHP**: Ensure `php/8.2/php.exe` exists
- **Database issues**: MySQL data folder should be initialized
- **Port conflicts**: Check if ports 80 and 3306 are available

---

**The goal is to provide a complete, professional development environment that works immediately after extraction, with no setup required.**
