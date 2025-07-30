# DevStackBox Setup Guide - Making It Fully Portable

## 🚀 Quick Setup Guide

### Current Status
✅ DevStackBox is running and using XAMPP as fallback
✅ Icons are properly loaded
✅ GUI is functional

### Making It Fully Usable

#### Option 1: Use with Existing XAMPP (Immediate)
1. Start DevStackBox: `npm start`
2. Use the GUI to control Apache/MySQL
3. Services will use XAMPP binaries automatically

#### Option 2: Add Portable Binaries (Full Independence)

1. **Download Portable Apache:**
   - Visit: https://www.apachelounge.com/download/
   - Download Apache 2.4.x Win64
   - Extract to: `DevStackBox/apache/`

2. **Download Portable MySQL:**
   - Visit: https://dev.mysql.com/downloads/mysql/
   - Download MySQL Community Server (ZIP Archive)
   - Extract to: `DevStackBox/mysql/`

3. **Download PHP Versions:**
   - Visit: https://windows.php.net/download/
   - Download PHP 8.1, 8.2, 8.3 (Thread Safe)
   - Extract each to: `DevStackBox/php/8.1/`, `DevStackBox/php/8.2/`, etc.

4. **Download phpMyAdmin:**
   - Visit: https://www.phpmyadmin.net/downloads/
   - Download latest version
   - Extract to: `DevStackBox/phpmyadmin/`

### Development Usage

1. **Start Development Mode:**
   ```bash
   npm run dev
   ```

2. **Access Services:**
   - Main GUI: DevStackBox application window
   - Web Interface: http://localhost/ (when Apache is running)
   - phpMyAdmin: http://localhost/phpmyadmin/
   - Your Projects: http://localhost/projects/

3. **Create Projects:**
   - Place PHP projects in: `DevStackBox/www/projects/`
   - Access via: http://localhost/projects/yourproject/

### Building for Distribution

1. **Build Executable:**
   ```bash
   npm run build
   ```

2. **Build Specific Platform:**
   ```bash
   # Windows
   npm run build -- --win
   
   # macOS  
   npm run build -- --mac
   
   # Linux
   npm run build -- --linux
   ```

3. **Output Location:**
   - Built files will be in: `DevStackBox/dist/`

### Distribution Files

After building, you'll get:
- **Windows:** `DevStackBox Setup.exe` (installer) or `DevStackBox.exe` (portable)
- **macOS:** `DevStackBox.dmg`
- **Linux:** `DevStackBox.AppImage`

### Sharing Your Build

1. **For End Users:**
   - Share the built executable from `dist/` folder
   - Include installation instructions
   - No need for Node.js on target machines

2. **For Developers:**
   - Share the source code
   - Include setup instructions in README
   - Requires Node.js for development

### Next Steps for Full Portability

1. Add portable server binaries
2. Configure services for portable mode
3. Test on clean machines
4. Create installer packages
5. Add auto-updater functionality
