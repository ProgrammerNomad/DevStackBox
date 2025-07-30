# DevStackBox - Manual Download Links

To make DevStackBox work offline like XAMPP, you need to download and extract these components:

## 📥 Download These Files:

### 1. **Apache HTTP Server**
- **URL**: https://www.apachelounge.com/download/
- **File**: httpd-2.4.58-240718-win64-VS17.zip (or latest)
- **Extract to**: `DevStackBox/apache/`

### 2. **MySQL Database**
- **URL**: https://dev.mysql.com/downloads/mysql/ 
- **File**: mysql-8.0.35-winx64.zip (or latest)
- **Extract to**: `DevStackBox/mysql/`

### 3. **PHP 8.2 (Default)**
- **URL**: https://windows.php.net/downloads/releases/
- **File**: php-8.2.26-Win32-vs16-x64.zip (or latest 8.2)
- **Extract to**: `DevStackBox/php/8.2/`

### 4. **PHP 8.1 (Optional)**
- **URL**: https://windows.php.net/downloads/releases/archives/
- **File**: php-8.1.27-Win32-vs16-x64.zip (or latest 8.1)
- **Extract to**: `DevStackBox/php/8.1/`

### 5. **PHP 8.3 (Optional)**
- **URL**: https://windows.php.net/downloads/releases/
- **File**: php-8.3.14-Win32-vs16-x64.zip (or latest 8.3)
- **Extract to**: `DevStackBox/php/8.3/`

### 6. **phpMyAdmin**
- **URL**: https://www.phpmyadmin.net/downloads/
- **File**: phpMyAdmin-5.2.1-all-languages.zip (or latest)
- **Extract to**: `DevStackBox/phpmyadmin/`

## 🎯 Quick Setup:

1. Download all 6 files above
2. Extract each to its respective directory as shown
3. Run `npm start` 
4. DevStackBox will detect the bundled components automatically!

## 📁 Expected Structure After Extraction:

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
│   ├── 8.2/php.exe ✓ (Default)
│   ├── 8.1/php.exe ✓ (Optional)
│   └── 8.3/php.exe ✓ (Optional)
└── phpmyadmin/
    └── index.php ✓
```

## ✅ Verification:

After extracting, these files should exist:
- `apache/bin/httpd.exe`
- `mysql/bin/mysqld.exe`
- `php/8.2/php.exe`
- `phpmyadmin/index.php`

Once these are in place, DevStackBox will work completely offline!
