# DevStackBox v2.0 - Pre-bundled Development Stack

## ✅ What's Included

DevStackBox comes with **pre-bundled server binaries** - no downloads or XAMPP required!

### Core Components (Ready to Use)
- **Apache HTTP Server** - Web server for your projects
- **MySQL Database** - Complete database server with tools
- **PHP 8.2** - Default PHP version (recommended for new projects)
- **phpMyAdmin** - Web-based MySQL administration interface

### Additional PHP Versions (Available)
- **PHP 8.1** - For legacy project support
- **PHP 8.3** - Latest stable features  
- **PHP 8.4** - Cutting-edge development

## 🚀 Quick Start Guide

1. **Launch DevStackBox** - All servers are immediately available
2. **Start Services** - Click the Start buttons for Apache and MySQL
3. **Access phpMyAdmin** - Click the phpMyAdmin button once MySQL is running
4. **Switch PHP Versions** - Use the dropdown to change between 8.1, 8.2, 8.3, 8.4
5. **Create Projects** - Start coding in the `www/projects` folder

## 📁 Pre-bundled Structure

```
DevStackBox/
├── apache/              ✅ Pre-bundled HTTP Server
│   ├── bin/httpd.exe
│   ├── conf/httpd.conf
│   ├── modules/
│   └── htdocs/
├── mysql/               ✅ Pre-bundled Database Server
│   ├── bin/mysqld.exe
│   ├── bin/mysql.exe
│   ├── data/
│   └── share/
├── php/                 ✅ Multiple PHP Versions
│   ├── 8.1/php.exe     (Available)
│   ├── 8.2/php.exe     (Default ⭐)
│   ├── 8.3/php.exe     (Available)
│   └── 8.4/php.exe     (Available)
└── phpmyadmin/          ✅ Pre-bundled Database Admin
    ├── index.php
    ├── config.inc.php
    └── libraries/
```

## ⚙️ Configuration & Settings

### Default Configuration
- **Default PHP**: Version 8.2 (optimal for most projects)
- **Apache Port**: 80 (customizable in settings)
- **MySQL Port**: 3306 (customizable in settings)
- **Document Root**: `www/` folder for your projects

### Switching PHP Versions
1. Open DevStackBox main interface
2. Locate the PHP version dropdown (shows current version)
3. Select your desired version: 8.1, 8.2, 8.3, or 8.4
4. The system will automatically reconfigure Apache
5. Restart Apache if it's currently running

### Port Configuration
- Modify ports through the Settings panel
- Avoid conflicts with existing services
- Common alternatives: 8080 for Apache, 3307 for MySQL

## 🔧 Verification & Testing

### Quick Verification
Run the built-in verification script:
```bash
node verify-bundle.js
```

This script checks:
- ✅ All required binaries are present
- ✅ Configuration files are valid
- ✅ PHP versions are properly installed
- ✅ Directory structure is correct

### Manual Verification
Check these key files exist:
- `apache/bin/httpd.exe` - Apache server
- `mysql/bin/mysqld.exe` - MySQL server  
- `php/8.2/php.exe` - Default PHP
- `phpmyadmin/index.php` - Database admin

## 💡 Benefits of Pre-bundled Setup

### Offline Development
- ✅ **No Internet Required** - Everything works offline
- ✅ **No Downloads** - Instant startup, no waiting
- ✅ **No External Dependencies** - Self-contained environment

### Developer Experience  
- ✅ **Multiple PHP Versions** - Easy switching between 8.1-8.4
- ✅ **Consistent Environment** - Same setup across all machines
- ✅ **Portable Installation** - Run from any location
- ✅ **Version Controlled** - Reproducible development environment

### Performance & Reliability
- ✅ **Faster Startup** - No download delays
- ✅ **Stable Versions** - Tested and verified combinations
- ✅ **Local Control** - No dependency on external servers

## 🆘 Troubleshooting Guide

### "Service Not Found" Errors
1. Run `node verify-bundle.js` to check all binaries
2. Ensure executable files aren't blocked by antivirus
3. Check that required ports (80, 3306) are available
4. Restart DevStackBox as Administrator if needed

### PHP Version Switching Issues
- Verify the target PHP version binary exists in `php/X.X/php.exe`
- Restart Apache after switching PHP versions
- Check Apache error logs if PHP fails to load

### Permission Problems
- Run DevStackBox as Administrator
- Add DevStackBox folder to Windows Defender exclusions
- Ensure write permissions to configuration files

### Port Conflicts
- Check if IIS or other web servers are using port 80
- Use netstat to identify port conflicts: `netstat -an | findstr :80`
- Configure alternative ports in DevStackBox settings

## 📈 Updates & Maintenance

### Updating DevStackBox
- Server binaries remain unchanged during updates
- Only application files are updated
- Your configurations and projects are preserved

### Adding New PHP Versions
1. Download PHP binary from php.net
2. Extract to `php/X.X/` folder (e.g., `php/8.5/`)
3. Restart DevStackBox to detect the new version
4. Select from the PHP version dropdown

### Backup Recommendations
- Regular backup of `www/projects/` folder
- Export MySQL databases through phpMyAdmin
- Save custom configuration files

## 🎯 Getting Started Checklist

- [ ] Launch DevStackBox
- [ ] Verify all services show "Pre-bundled ✅" status
- [ ] Start Apache and MySQL services
- [ ] Access phpMyAdmin to confirm database connectivity
- [ ] Create your first project in `www/projects/`
- [ ] Test PHP functionality with a simple script

## 📞 Support & Resources

### Self-Help Tools
1. Run bundle verification: `node verify-bundle.js`
2. Check service status in main DevStackBox panel
3. Review application logs for error details
4. Test individual components manually

### Documentation
- Main README.md for general usage
- Individual service README files in respective folders
- Configuration examples in config-backups/

---

**🎉 DevStackBox v2.0 - Complete XAMPP-free development environment!**

*Pre-bundled • Portable • Professional • PHP 8.2 Default*
