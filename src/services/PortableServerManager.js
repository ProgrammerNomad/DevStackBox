const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * PortableServerManager - Manages downloading and setting up portable server binaries
 */
class PortableServerManager {
  constructor(appPath) {
    this.appPath = appPath;
    this.downloadUrls = {
      apache: {
        url: 'https://www.apachelounge.com/download/VS17/binaries/httpd-2.4.58-240718-win64-VS17.zip',
        filename: 'apache.zip',
        extractTo: 'apache'
      },
      mysql: {
        url: 'https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.35-winx64.zip',
        filename: 'mysql.zip',
        extractTo: 'mysql'
      },
      php81: {
        url: 'https://windows.php.net/downloads/releases/php-8.1.27-Win32-vs16-x64.zip',
        filename: 'php81.zip',
        extractTo: 'php/8.1'
      },
      php82: {
        url: 'https://windows.php.net/downloads/releases/php-8.2.14-Win32-vs16-x64.zip',
        filename: 'php82.zip',
        extractTo: 'php/8.2'
      },
      php83: {
        url: 'https://windows.php.net/downloads/releases/php-8.3.1-Win32-vs16-x64.zip',
        filename: 'php83.zip',
        extractTo: 'php/8.3'
      },
      phpmyadmin: {
        url: 'https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip',
        filename: 'phpmyadmin.zip',
        extractTo: 'phpmyadmin'
      }
    };
  }

  /**
   * Check if portable binaries are already installed
   */
  async checkInstallation() {
    const status = {
      apache: fs.existsSync(path.join(this.appPath, 'apache', 'bin', 'httpd.exe')),
      mysql: fs.existsSync(path.join(this.appPath, 'mysql', 'bin', 'mysqld.exe')),
      php81: fs.existsSync(path.join(this.appPath, 'php', '8.1', 'php.exe')),
      php82: fs.existsSync(path.join(this.appPath, 'php', '8.2', 'php.exe')),
      php83: fs.existsSync(path.join(this.appPath, 'php', '8.3', 'php.exe')),
      phpmyadmin: fs.existsSync(path.join(this.appPath, 'phpmyadmin', 'index.php'))
    };

    return status;
  }

  /**
   * Download a file from URL
   */
  async downloadFile(url, filename, onProgress) {
    const downloadPath = path.join(this.appPath, 'downloads');
    
    // Create downloads directory if it doesn't exist
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }

    const filePath = path.join(downloadPath, filename);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (onProgress && totalSize) {
            onProgress(Math.round((downloadedSize / totalSize) * 100));
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });

        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete partial file
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Extract ZIP file using PowerShell
   */
  async extractZip(zipPath, extractTo) {
    const fullExtractPath = path.join(this.appPath, extractTo);
    
    // Create extract directory if it doesn't exist
    if (!fs.existsSync(fullExtractPath)) {
      fs.mkdirSync(fullExtractPath, { recursive: true });
    }

    const command = `Expand-Archive -Path "${zipPath}" -DestinationPath "${fullExtractPath}" -Force`;
    
    try {
      await execAsync(command, { shell: 'powershell.exe' });
      console.log(`Extracted ${zipPath} to ${fullExtractPath}`);
    } catch (error) {
      throw new Error(`Failed to extract ${zipPath}: ${error.message}`);
    }
  }

  /**
   * Setup Apache configuration
   */
  async setupApache() {
    const apachePath = path.join(this.appPath, 'apache');
    const confPath = path.join(apachePath, 'conf', 'httpd.conf');
    
    if (!fs.existsSync(confPath)) {
      throw new Error('Apache configuration file not found');
    }

    // Read current config
    let config = fs.readFileSync(confPath, 'utf8');

    // Update paths and settings for portable mode
    config = config.replace(/ServerRoot.*/g, `ServerRoot "${apachePath.replace(/\\/g, '/')}"`);
    config = config.replace(/DocumentRoot.*/g, `DocumentRoot "${path.join(this.appPath, 'www').replace(/\\/g, '/')}"`);
    config = config.replace(/Listen 80/g, 'Listen 80');
    
    // Enable PHP module
    config += `\n# PHP Configuration\nLoadModule php_module "${path.join(this.appPath, 'php/8.3/php8apache2_4.dll').replace(/\\/g, '/')}"\nAddType application/x-httpd-php .php\nPHPIniDir "${path.join(this.appPath, 'php/8.3').replace(/\\/g, '/')}"\n`;

    // Write updated config
    fs.writeFileSync(confPath, config);
    console.log('Apache configuration updated');
  }

  /**
   * Setup MySQL configuration
   */
  async setupMySQL() {
    const mysqlPath = path.join(this.appPath, 'mysql');
    const configPath = path.join(mysqlPath, 'my.ini');
    
    const config = `[mysqld]
port=3306
basedir=${mysqlPath.replace(/\\/g, '/')}
datadir=${path.join(mysqlPath, 'data').replace(/\\/g, '/')}
tmpdir=${path.join(mysqlPath, 'tmp').replace(/\\/g, '/')}
socket=${path.join(mysqlPath, 'tmp', 'mysql.sock').replace(/\\/g, '/')}
log-error=${path.join(mysqlPath, 'data', 'mysql_error.log').replace(/\\/g, '/')}
pid-file=${path.join(mysqlPath, 'data', 'mysql.pid').replace(/\\/g, '/')}

# Security settings
skip-networking=false
bind-address=127.0.0.1

# Performance settings
max_connections=100
key_buffer_size=16M
max_allowed_packet=16M
table_open_cache=64
sort_buffer_size=512K
net_buffer_length=8K
read_buffer_size=256K
read_rnd_buffer_size=512K
myisam_sort_buffer_size=8M

[mysql]
default-character-set=utf8mb4

[client]
port=3306
socket=${path.join(mysqlPath, 'tmp', 'mysql.sock').replace(/\\/g, '/')}
`;

    fs.writeFileSync(configPath, config);
    
    // Create required directories
    const dirs = ['data', 'tmp', 'logs'];
    dirs.forEach(dir => {
      const dirPath = path.join(mysqlPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    console.log('MySQL configuration created');
  }

  /**
   * Setup PHP configuration
   */
  async setupPHP(version) {
    const phpPath = path.join(this.appPath, 'php', version);
    const iniPath = path.join(phpPath, 'php.ini');
    const devIniPath = path.join(phpPath, 'php.ini-development');
    
    if (fs.existsSync(devIniPath) && !fs.existsSync(iniPath)) {
      fs.copyFileSync(devIniPath, iniPath);
    }

    if (fs.existsSync(iniPath)) {
      let config = fs.readFileSync(iniPath, 'utf8');
      
      // Enable common extensions
      const extensions = [
        'curl', 'gd', 'mbstring', 'mysqli', 'pdo_mysql', 
        'openssl', 'zip', 'fileinfo', 'json'
      ];

      extensions.forEach(ext => {
        config = config.replace(`;extension=${ext}`, `extension=${ext}`);
      });

      // Update paths
      config = config.replace(/;upload_tmp_dir =.*/g, `upload_tmp_dir = "${path.join(phpPath, 'tmp').replace(/\\/g, '/')}"`);
      config = config.replace(/;session.save_path =.*/g, `session.save_path = "${path.join(phpPath, 'tmp').replace(/\\/g, '/')}"`);

      fs.writeFileSync(iniPath, config);
      
      // Create tmp directory
      const tmpDir = path.join(phpPath, 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    }

    console.log(`PHP ${version} configuration updated`);
  }

  /**
   * Setup phpMyAdmin configuration
   */
  async setupPhpMyAdmin() {
    const pmaPath = path.join(this.appPath, 'phpmyadmin');
    const configPath = path.join(pmaPath, 'config.inc.php');
    
    const config = `<?php
/**
 * phpMyAdmin configuration for DevStackBox
 */

// Servers configuration
$i = 0;

// Server 1 (localhost)
$i++;
$cfg['Servers'][$i]['verbose'] = 'DevStackBox MySQL';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['socket'] = '';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['AllowNoPassword'] = true;

// Global configuration
$cfg['blowfish_secret'] = '${this.generateBlowfishSecret()}';
$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';
$cfg['TempDir'] = '${path.join(pmaPath, 'tmp').replace(/\\/g, '/')}';

// Security
$cfg['CheckConfigurationPermissions'] = false;
$cfg['ShowPhpInfo'] = true;
$cfg['ShowServerInfo'] = true;
$cfg['ShowDbStructureCreation'] = true;
$cfg['ShowDbStructureLastUpdate'] = true;
$cfg['ShowDbStructureLastCheck'] = true;
?>`;

    fs.writeFileSync(configPath, config);
    
    // Create tmp directory for phpMyAdmin
    const tmpDir = path.join(pmaPath, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    console.log('phpMyAdmin configuration created');
  }

  /**
   * Generate random blowfish secret for phpMyAdmin
   */
  generateBlowfishSecret() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Install a specific component
   */
  async installComponent(component, onProgress) {
    const componentInfo = this.downloadUrls[component];
    if (!componentInfo) {
      throw new Error(`Unknown component: ${component}`);
    }

    try {
      // Download component
      onProgress && onProgress({ stage: 'downloading', progress: 0 });
      const filePath = await this.downloadFile(
        componentInfo.url, 
        componentInfo.filename,
        (progress) => onProgress && onProgress({ stage: 'downloading', progress })
      );

      // Extract component
      onProgress && onProgress({ stage: 'extracting', progress: 0 });
      await this.extractZip(filePath, componentInfo.extractTo);

      // Setup component
      onProgress && onProgress({ stage: 'configuring', progress: 50 });
      switch (component) {
        case 'apache':
          await this.setupApache();
          break;
        case 'mysql':
          await this.setupMySQL();
          break;
        case 'php81':
        case 'php82':
        case 'php83':
          await this.setupPHP(component.replace('php', '').replace(/(\d)(\d)/, '$1.$2'));
          break;
        case 'phpmyadmin':
          await this.setupPhpMyAdmin();
          break;
      }

      // Cleanup downloaded file
      fs.unlinkSync(filePath);
      
      onProgress && onProgress({ stage: 'complete', progress: 100 });
      return { success: true, message: `${component} installed successfully` };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Install all components
   */
  async installAll(onProgress) {
    const components = Object.keys(this.downloadUrls);
    let completed = 0;

    for (const component of components) {
      try {
        await this.installComponent(component, (progress) => {
          const overallProgress = Math.round(((completed + (progress.progress / 100)) / components.length) * 100);
          onProgress && onProgress({
            component,
            stage: progress.stage,
            progress: progress.progress,
            overall: overallProgress
          });
        });
        completed++;
      } catch (error) {
        console.error(`Failed to install ${component}:`, error);
      }
    }

    return { success: true, message: 'All components installed' };
  }
}

module.exports = PortableServerManager;
