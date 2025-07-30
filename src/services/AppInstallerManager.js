const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * AppInstallerManager - Manages one-click installation of popular PHP applications
 */
class AppInstallerManager {
  constructor(appPath) {
    this.appPath = appPath;
    this.wwwPath = path.join(appPath, 'www');
    this.downloadsPath = path.join(appPath, 'downloads', 'apps');
    
    this.appTemplates = {
      wordpress: {
        name: 'WordPress',
        description: 'The world\'s most popular CMS',
        url: 'https://wordpress.org/latest.zip',
        filename: 'wordpress-latest.zip',
        requiresDatabase: true,
        setupScript: this.setupWordPress.bind(this)
      },
      laravel: {
        name: 'Laravel',
        description: 'The PHP framework for web artisans',
        url: 'https://github.com/laravel/laravel/archive/refs/heads/10.x.zip',
        filename: 'laravel-latest.zip',
        requiresDatabase: true,
        requiresComposer: true,
        setupScript: this.setupLaravel.bind(this)
      },
      codeigniter: {
        name: 'CodeIgniter 4',
        description: 'Simple and elegant PHP framework',
        url: 'https://github.com/codeigniter4/CodeIgniter4/releases/download/v4.4.4/CodeIgniter4-4.4.4.zip',
        filename: 'codeigniter4-latest.zip',
        requiresDatabase: true,
        setupScript: this.setupCodeIgniter.bind(this)
      },
      phpmyadmin: {
        name: 'phpMyAdmin',
        description: 'MySQL administration tool',
        url: 'https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip',
        filename: 'phpmyadmin-latest.zip',
        requiresDatabase: false,
        setupScript: this.setupPhpMyAdmin.bind(this)
      },
      drupal: {
        name: 'Drupal',
        description: 'Open source CMS platform',
        url: 'https://www.drupal.org/download-latest/zip',
        filename: 'drupal-latest.zip',
        requiresDatabase: true,
        setupScript: this.setupDrupal.bind(this)
      }
    };

    // Ensure downloads directory exists
    if (!fs.existsSync(this.downloadsPath)) {
      fs.mkdirSync(this.downloadsPath, { recursive: true });
    }
  }

  /**
   * Get list of available applications
   */
  getAvailableApps() {
    return Object.keys(this.appTemplates).map(key => ({
      id: key,
      ...this.appTemplates[key],
      setupScript: undefined // Don't expose the function
    }));
  }

  /**
   * Check if application is already installed
   */
  isAppInstalled(appId, projectName) {
    const projectPath = path.join(this.wwwPath, 'projects', projectName);
    return fs.existsSync(projectPath);
  }

  /**
   * Download application archive
   */
  async downloadApp(appId, onProgress) {
    const app = this.appTemplates[appId];
    if (!app) {
      throw new Error(`Unknown application: ${appId}`);
    }

    const filePath = path.join(this.downloadsPath, app.filename);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      
      https.get(app.url, (response) => {
        // Handle redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
          https.get(response.headers.location, (redirectResponse) => {
            const totalSize = parseInt(redirectResponse.headers['content-length'], 10);
            let downloadedSize = 0;

            redirectResponse.on('data', (chunk) => {
              downloadedSize += chunk.length;
              if (onProgress && totalSize) {
                onProgress(Math.round((downloadedSize / totalSize) * 100));
              }
            });

            redirectResponse.pipe(file);

            file.on('finish', () => {
              file.close();
              resolve(filePath);
            });

            file.on('error', (err) => {
              fs.unlink(filePath, () => {});
              reject(err);
            });
          }).on('error', reject);
          return;
        }

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
          fs.unlink(filePath, () => {});
          reject(err);
        });
      }).on('error', reject);
    });
  }

  /**
   * Extract application archive
   */
  async extractApp(zipPath, projectName) {
    const extractPath = path.join(this.wwwPath, 'projects', projectName);
    
    // Create project directory
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    const command = `Expand-Archive -Path "${zipPath}" -DestinationPath "${extractPath}" -Force`;
    
    try {
      await execAsync(command, { shell: 'powershell.exe' });
      
      // Check if extracted files are in a subdirectory and move them up
      const extractedItems = fs.readdirSync(extractPath);
      if (extractedItems.length === 1 && fs.statSync(path.join(extractPath, extractedItems[0])).isDirectory()) {
        const subDir = path.join(extractPath, extractedItems[0]);
        const subItems = fs.readdirSync(subDir);
        
        // Move all items from subdirectory to project root
        for (const item of subItems) {
          const srcPath = path.join(subDir, item);
          const destPath = path.join(extractPath, item);
          fs.renameSync(srcPath, destPath);
        }
        
        // Remove empty subdirectory
        fs.rmdirSync(subDir);
      }
      
      return extractPath;
    } catch (error) {
      throw new Error(`Failed to extract ${zipPath}: ${error.message}`);
    }
  }

  /**
   * Create database for application
   */
  async createDatabase(dbName, dbUser = 'root', dbPassword = '') {
    const mysqlPath = path.join(this.appPath, 'mysql', 'bin', 'mysql.exe');
    
    if (!fs.existsSync(mysqlPath)) {
      throw new Error('MySQL is not installed. Please install MySQL first.');
    }

    const commands = [
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`,
      `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'localhost';`,
      `FLUSH PRIVILEGES;`
    ];

    for (const command of commands) {
      const mysqlCommand = `"${mysqlPath}" -u root -p${dbPassword} -e "${command}"`;
      try {
        await execAsync(mysqlCommand);
      } catch (error) {
        console.warn(`Database command warning: ${error.message}`);
      }
    }

    return { name: dbName, user: dbUser, password: dbPassword };
  }

  /**
   * Setup WordPress
   */
  async setupWordPress(projectPath, projectName, options = {}) {
    const configPath = path.join(projectPath, 'wp-config.php');
    const sampleConfigPath = path.join(projectPath, 'wp-config-sample.php');
    
    if (!fs.existsSync(sampleConfigPath)) {
      throw new Error('WordPress sample config not found');
    }

    // Create database
    const dbName = options.dbName || `wp_${projectName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    await this.createDatabase(dbName);

    // Create wp-config.php
    let config = fs.readFileSync(sampleConfigPath, 'utf8');
    
    config = config.replace('database_name_here', dbName);
    config = config.replace('username_here', 'root');
    config = config.replace('password_here', '');
    config = config.replace('localhost', 'localhost');
    
    // Add security keys
    const keys = await this.getWordPressKeys();
    config = config.replace(/\/\*\*#@\+.*?\*\//s, keys);

    fs.writeFileSync(configPath, config);

    return {
      url: `http://localhost/projects/${projectName}`,
      adminUrl: `http://localhost/projects/${projectName}/wp-admin/install.php`,
      database: dbName
    };
  }

  /**
   * Get WordPress security keys
   */
  async getWordPressKeys() {
    return new Promise((resolve) => {
      https.get('https://api.wordpress.org/secret-key/1.1/salt/', (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      }).on('error', () => {
        // Fallback keys if API fails
        resolve(`define('AUTH_KEY',         'devstackbox-auth-key');
define('SECURE_AUTH_KEY',  'devstackbox-secure-auth-key');
define('LOGGED_IN_KEY',    'devstackbox-logged-in-key');
define('NONCE_KEY',        'devstackbox-nonce-key');
define('AUTH_SALT',        'devstackbox-auth-salt');
define('SECURE_AUTH_SALT', 'devstackbox-secure-auth-salt');
define('LOGGED_IN_SALT',   'devstackbox-logged-in-salt');
define('NONCE_SALT',       'devstackbox-nonce-salt');`);
      });
    });
  }

  /**
   * Setup Laravel
   */
  async setupLaravel(projectPath, projectName, options = {}) {
    // Create database
    const dbName = options.dbName || `laravel_${projectName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    await this.createDatabase(dbName);

    // Create .env file
    const envPath = path.join(projectPath, '.env');
    const envExamplePath = path.join(projectPath, '.env.example');
    
    let envContent = '';
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
    } else {
      envContent = `APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${dbName}
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=null
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

MIX_PUSHER_APP_KEY="\${PUSHER_APP_KEY}"
MIX_PUSHER_APP_CLUSTER="\${PUSHER_APP_CLUSTER}"`;
    }

    fs.writeFileSync(envPath, envContent);

    return {
      url: `http://localhost/projects/${projectName}/public`,
      database: dbName,
      note: 'Run "composer install" and "php artisan key:generate" to complete setup'
    };
  }

  /**
   * Setup CodeIgniter
   */
  async setupCodeIgniter(projectPath, projectName, options = {}) {
    // Create database
    const dbName = options.dbName || `ci_${projectName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    await this.createDatabase(dbName);

    // Update database configuration
    const configPath = path.join(projectPath, 'app', 'Config', 'Database.php');
    if (fs.existsSync(configPath)) {
      let config = fs.readFileSync(configPath, 'utf8');
      config = config.replace(/('database'\s*=>\s*')\w*(')/g, `$1${dbName}$2`);
      config = config.replace(/('username'\s*=>\s*')\w*(')/g, `$1root$2`);
      config = config.replace(/('password'\s*=>\s*')\w*(')/g, `$1$2`);
      fs.writeFileSync(configPath, config);
    }

    return {
      url: `http://localhost/projects/${projectName}/public`,
      database: dbName
    };
  }

  /**
   * Setup Drupal
   */
  async setupDrupal(projectPath, projectName, options = {}) {
    // Create database
    const dbName = options.dbName || `drupal_${projectName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    await this.createDatabase(dbName);

    // Create sites/default/settings.php if it doesn't exist
    const settingsPath = path.join(projectPath, 'sites', 'default', 'settings.php');
    const defaultSettingsPath = path.join(projectPath, 'sites', 'default', 'default.settings.php');
    
    if (!fs.existsSync(settingsPath) && fs.existsSync(defaultSettingsPath)) {
      fs.copyFileSync(defaultSettingsPath, settingsPath);
    }

    return {
      url: `http://localhost/projects/${projectName}`,
      installUrl: `http://localhost/projects/${projectName}/install.php`,
      database: dbName
    };
  }

  /**
   * Setup phpMyAdmin (standalone)
   */
  async setupPhpMyAdmin(projectPath, projectName, options = {}) {
    const configPath = path.join(projectPath, 'config.inc.php');
    
    const config = `<?php
/**
 * phpMyAdmin configuration for ${projectName}
 */

$i = 0;

// Server 1 (localhost)
$i++;
$cfg['Servers'][$i]['verbose'] = 'DevStackBox MySQL';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['AllowNoPassword'] = true;

$cfg['blowfish_secret'] = '${this.generateBlowfishSecret()}';
$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;
?>`;

    fs.writeFileSync(configPath, config);

    return {
      url: `http://localhost/projects/${projectName}`
    };
  }

  /**
   * Generate random blowfish secret
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
   * Install application
   */
  async installApp(appId, projectName, options = {}, onProgress) {
    const app = this.appTemplates[appId];
    if (!app) {
      throw new Error(`Unknown application: ${appId}`);
    }

    if (this.isAppInstalled(appId, projectName)) {
      throw new Error(`Application ${projectName} is already installed`);
    }

    try {
      // Download application
      onProgress && onProgress({ stage: 'downloading', progress: 0 });
      const zipPath = await this.downloadApp(appId, (progress) => {
        onProgress && onProgress({ stage: 'downloading', progress });
      });

      // Extract application
      onProgress && onProgress({ stage: 'extracting', progress: 0 });
      const projectPath = await this.extractApp(zipPath, projectName);

      // Setup application
      onProgress && onProgress({ stage: 'configuring', progress: 50 });
      const setupResult = await app.setupScript(projectPath, projectName, options);

      // Cleanup
      fs.unlinkSync(zipPath);

      onProgress && onProgress({ stage: 'complete', progress: 100 });

      return {
        success: true,
        message: `${app.name} installed successfully`,
        path: projectPath,
        ...setupResult
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get installed applications
   */
  getInstalledApps() {
    const projectsPath = path.join(this.wwwPath, 'projects');
    
    if (!fs.existsSync(projectsPath)) {
      return [];
    }

    const projects = fs.readdirSync(projectsPath)
      .filter(item => fs.statSync(path.join(projectsPath, item)).isDirectory())
      .map(projectName => {
        const projectPath = path.join(projectsPath, projectName);
        let appType = 'unknown';
        
        // Detect application type
        if (fs.existsSync(path.join(projectPath, 'wp-config.php'))) {
          appType = 'wordpress';
        } else if (fs.existsSync(path.join(projectPath, 'artisan'))) {
          appType = 'laravel';
        } else if (fs.existsSync(path.join(projectPath, 'app', 'Config', 'App.php'))) {
          appType = 'codeigniter';
        } else if (fs.existsSync(path.join(projectPath, 'index.php'))) {
          appType = 'phpmyadmin';
        } else if (fs.existsSync(path.join(projectPath, 'modules'))) {
          appType = 'drupal';
        }

        return {
          name: projectName,
          type: appType,
          path: projectPath,
          url: `http://localhost/projects/${projectName}`
        };
      });

    return projects;
  }

  /**
   * Uninstall application
   */
  async uninstallApp(projectName) {
    const projectPath = path.join(this.wwwPath, 'projects', projectName);
    
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project ${projectName} not found`);
    }

    // Remove project directory
    const command = `Remove-Item -Path "${projectPath}" -Recurse -Force`;
    await execAsync(command, { shell: 'powershell.exe' });

    return { success: true, message: `${projectName} uninstalled successfully` };
  }
}

module.exports = AppInstallerManager;
