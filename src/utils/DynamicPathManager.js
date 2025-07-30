const fs = require('fs');
const path = require('path');
const ConfigBackupManager = require('./ConfigBackupManager');

class DynamicPathManager {
  constructor() {
    this.appPath = this.detectAppPath();
    this.backupManager = new ConfigBackupManager(this.appPath);
    console.log(`🔧 DevStackBox detected at: ${this.appPath}`);
  }

  /**
   * Detect application root path dynamically
   */
  detectAppPath() {
    if (process.pkg) {
      // Running as compiled executable
      return path.dirname(process.execPath);
    } else {
      // Running from source - find the root directory with package.json
      let currentPath = __dirname;
      while (currentPath !== path.dirname(currentPath)) {
        if (fs.existsSync(path.join(currentPath, 'package.json'))) {
          return currentPath;
        }
        currentPath = path.dirname(currentPath);
      }
      // Fallback to two levels up from this file
      return path.resolve(__dirname, '..', '..');
    }
  }

  /**
   * Convert Windows paths to Apache-compatible forward slashes
   */
  toApachePath(filePath) {
    return filePath.replace(/\\/g, '/');
  }

  /**
   * Get all dynamic paths needed for configuration
   */
  getPaths() {
    return {
      appRoot: this.toApachePath(this.appPath),
      apacheRoot: this.toApachePath(path.join(this.appPath, 'apache')),
      documentRoot: this.toApachePath(path.join(this.appPath, 'www')),
      phpRoot: this.toApachePath(path.join(this.appPath, 'php', '8.2')),
      phpRootGeneric: this.toApachePath(path.join(this.appPath, 'php')),
      mysqlRoot: this.toApachePath(path.join(this.appPath, 'mysql')),
      mysqlData: this.toApachePath(path.join(this.appPath, 'mysql', 'data')),
      mysqlLogs: this.toApachePath(path.join(this.appPath, 'mysql', 'logs')),
      mysqlTmp: this.toApachePath(path.join(this.appPath, 'mysql', 'tmp')),
      pmaRoot: this.toApachePath(path.join(this.appPath, 'phpmyadmin')),
      tmpRoot: this.toApachePath(path.join(this.appPath, 'tmp')),
      phpTmp: this.toApachePath(path.join(this.appPath, 'php', '8.2', 'tmp')),
      sessions: this.toApachePath(path.join(this.appPath, 'php', '8.2', 'tmp', 'sessions')),
      uploads: this.toApachePath(path.join(this.appPath, 'php', '8.2', 'tmp', 'uploads'))
    };
  }

  /**
   * Ensure all required directories exist
   */
  ensureDirectories() {
    const paths = this.getPaths();
    const dirsToCreate = [
      paths.tmpRoot,
      paths.phpTmp,
      paths.sessions,
      paths.uploads,
      paths.mysqlTmp,
      paths.mysqlLogs,
      paths.mysqlData
    ];

    dirsToCreate.forEach(dir => {
      const windowsPath = dir.replace(/\//g, '\\');
      if (!fs.existsSync(windowsPath)) {
        fs.mkdirSync(windowsPath, { recursive: true });
        console.log(`✅ Created directory: ${windowsPath}`);
      }
    });
  }

  /**
   * Update Apache configuration with dynamic paths
   */
  async updateApacheConfig() {
    const configPath = path.join(this.appPath, 'apache', 'conf', 'httpd.conf');
    
    if (!fs.existsSync(configPath)) {
      throw new Error('Apache configuration file not found');
    }

    const paths = this.getPaths();
    let config = fs.readFileSync(configPath, 'utf8');

    // Replace all hardcoded paths with dynamic ones
    const replacements = [
      // SRVROOT definition
      { 
        pattern: /^Define SRVROOT\s+".*?"$/m, 
        replacement: `Define SRVROOT "${paths.apacheRoot}"` 
      },
      // DocumentRoot
      { 
        pattern: /^DocumentRoot\s+".*?"$/m, 
        replacement: `DocumentRoot "${paths.documentRoot}"` 
      },
      // Document root directory directive
      { 
        pattern: /<Directory\s+".*?www.*?">/g, 
        replacement: `<Directory "${paths.documentRoot}">` 
      },
      // PHP CGI ScriptAlias
      { 
        pattern: /^ScriptAlias \/php-cgi\/\s+".*?"$/m, 
        replacement: `ScriptAlias /php-cgi/ "${paths.phpRoot}/"` 
      },
      // PHP Directory
      { 
        pattern: /<Directory\s+".*?php\/[\d\.]+.*?">/g, 
        replacement: `<Directory "${paths.phpRoot}">` 
      },
      // PHP environment variables
      { 
        pattern: /^SetEnv PHPRC\s+".*?"$/m, 
        replacement: `SetEnv PHPRC "${paths.phpRoot}"` 
      },
      { 
        pattern: /^SetEnv PATH\s+".*?"$/m, 
        replacement: `SetEnv PATH "${paths.phpRoot};%PATH%"` 
      },
      // phpMyAdmin Alias
      { 
        pattern: /^Alias \/phpmyadmin\s+".*?"$/m, 
        replacement: `Alias /phpmyadmin "${paths.pmaRoot}/"` 
      },
      // phpMyAdmin Directory
      { 
        pattern: /<Directory\s+".*?phpmyadmin(?!\/)".*?">/g, 
        replacement: `<Directory "${paths.pmaRoot}">` 
      },
      // phpMyAdmin libraries directory
      { 
        pattern: /<Directory\s+".*?phpmyadmin\/libraries.*?">/g, 
        replacement: `<Directory "${paths.pmaRoot}/libraries">` 
      },
      // phpMyAdmin setup/lib directory
      { 
        pattern: /<Directory\s+".*?phpmyadmin\/setup\/lib.*?">/g, 
        replacement: `<Directory "${paths.pmaRoot}/setup/lib">` 
      }
    ];

    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      config = config.replace(pattern, replacement);
    });

    fs.writeFileSync(configPath, config);
    console.log('✅ Apache configuration updated with dynamic paths');
    return paths;
  }

  /**
   * Update MySQL configuration with dynamic paths
   */
  async updateMySQLConfig() {
    const configPath = path.join(this.appPath, 'mysql', 'my.ini');
    
    if (!fs.existsSync(configPath)) {
      console.log('MySQL configuration file not found, skipping...');
      return;
    }

    const paths = this.getPaths();
    let config = fs.readFileSync(configPath, 'utf8');

    // Replace all hardcoded paths
    const replacements = [
      { 
        pattern: /^basedir\s*=.*$/m, 
        replacement: `basedir=${paths.mysqlRoot}` 
      },
      { 
        pattern: /^datadir\s*=.*$/m, 
        replacement: `datadir=${paths.mysqlData}` 
      },
      { 
        pattern: /^tmpdir\s*=.*$/m, 
        replacement: `tmpdir=${paths.mysqlTmp}` 
      },
      { 
        pattern: /^log-error\s*=.*$/m, 
        replacement: `log-error=${paths.mysqlLogs}/mysql_error.log` 
      },
      { 
        pattern: /^pid-file\s*=.*$/m, 
        replacement: `pid-file=${paths.mysqlData}/mysql.pid` 
      }
    ];

    replacements.forEach(({ pattern, replacement }) => {
      config = config.replace(pattern, replacement);
    });

    fs.writeFileSync(configPath, config);
    console.log('✅ MySQL configuration updated with dynamic paths');
    return paths;
  }

  /**
   * Update PHP configuration with dynamic paths
   */
  async updatePHPConfig() {
    const configPath = path.join(this.appPath, 'php', '8.2', 'php.ini');
    
    if (!fs.existsSync(configPath)) {
      console.log('PHP configuration file not found, skipping...');
      return;
    }

    const paths = this.getPaths();
    let config = fs.readFileSync(configPath, 'utf8');

    // Replace all hardcoded paths
    const replacements = [
      { 
        pattern: /^sys_temp_dir\s*=.*$/m, 
        replacement: `sys_temp_dir = "${paths.phpTmp}"` 
      },
      { 
        pattern: /^upload_tmp_dir\s*=.*$/m, 
        replacement: `upload_tmp_dir = "${paths.uploads}"` 
      },
      { 
        pattern: /^session\.save_path\s*=.*$/m, 
        replacement: `session.save_path = "${paths.sessions}"` 
      }
    ];

    replacements.forEach(({ pattern, replacement }) => {
      config = config.replace(pattern, replacement);
    });

    fs.writeFileSync(configPath, config);
    console.log('✅ PHP configuration updated with dynamic paths');
    return paths;
  }

  /**
   * Update phpMyAdmin configuration with dynamic paths
   */
  async updatePhpMyAdminConfig() {
    const configPath = path.join(this.appPath, 'phpmyadmin', 'config.inc.php');
    
    if (!fs.existsSync(configPath)) {
      console.log('phpMyAdmin configuration file not found, skipping...');
      return;
    }

    const paths = this.getPaths();
    let config = fs.readFileSync(configPath, 'utf8');

    // Replace all hardcoded paths
    const replacements = [
      { 
        pattern: /\$cfg\['UploadDir'\]\s*=\s*'.*?';/g, 
        replacement: `$cfg['UploadDir'] = '${paths.tmpRoot}/';` 
      },
      { 
        pattern: /\$cfg\['SaveDir'\]\s*=\s*'.*?';/g, 
        replacement: `$cfg['SaveDir'] = '${paths.tmpRoot}/';` 
      },
      { 
        pattern: /\$cfg\['TempDir'\]\s*=\s*'.*?';/g, 
        replacement: `$cfg['TempDir'] = '${paths.tmpRoot}/';` 
      }
    ];

    replacements.forEach(({ pattern, replacement }) => {
      config = config.replace(pattern, replacement);
    });

    fs.writeFileSync(configPath, config);
    console.log('✅ phpMyAdmin configuration updated with dynamic paths');
    return paths;
  }

  /**
   * Update documentation with dynamic paths
   */
  async updateDocumentation() {
    const docPath = path.join(this.appPath, 'PHP_EXTENSIONS.md');
    
    if (!fs.existsSync(docPath)) {
      console.log('Documentation file not found, skipping...');
      return;
    }

    const paths = this.getPaths();
    let content = fs.readFileSync(docPath, 'utf8');

    // Replace hardcoded paths in documentation
    content = content.replace(
      /C:\/xampp\/htdocs\/DevStackBox\/php\/8\.2\/tmp\/sessions/g,
      `${paths.sessions}`
    );
    content = content.replace(
      /C:\/xampp\/htdocs\/DevStackBox\/php\/8\.2\/tmp\/uploads/g,
      `${paths.uploads}`
    );

    fs.writeFileSync(docPath, content);
    console.log('✅ Documentation updated with dynamic paths');
  }

  /**
   * Update all configurations with dynamic paths
   */
  async updateAllConfigurations() {
    try {
      console.log('🔧 Starting dynamic path configuration update...');
      
      // Ensure directories exist first
      this.ensureDirectories();
      
      // Update all configuration files
      await this.updateApacheConfig();
      await this.updateMySQLConfig();
      await this.updatePHPConfig();
      await this.updatePhpMyAdminConfig();
      await this.updateDocumentation();
      
      console.log('✅ All configurations updated with dynamic paths!');
      console.log(`📍 DevStackBox root: ${this.appPath}`);
      
      return {
        success: true,
        appPath: this.appPath,
        paths: this.getPaths()
      };
      
    } catch (error) {
      console.error('❌ Failed to update configurations:', error);
      throw error;
    }
  }

  /**
   * Update PHP version dynamically
   */
  async updatePhpVersion(version) {
    const paths = this.getPaths();
    const newPhpRoot = this.toApachePath(path.join(this.appPath, 'php', version));
    
    // Update Apache config for new PHP version
    const configPath = path.join(this.appPath, 'apache', 'conf', 'httpd.conf');
    let config = fs.readFileSync(configPath, 'utf8');
    
    config = config.replace(
      /ScriptAlias \/php-cgi\/\s+".*?"/g,
      `ScriptAlias /php-cgi/ "${newPhpRoot}/"`
    );
    config = config.replace(
      /<Directory\s+".*?php\/[\d\.]+.*?">/g,
      `<Directory "${newPhpRoot}">`
    );
    config = config.replace(
      /SetEnv PHPRC\s+".*?"/g,
      `SetEnv PHPRC "${newPhpRoot}"`
    );
    config = config.replace(
      /SetEnv PATH\s+".*?"/g,
      `SetEnv PATH "${newPhpRoot};%PATH%"`
    );
    
    fs.writeFileSync(configPath, config);
    console.log(`✅ Apache updated for PHP ${version}: ${newPhpRoot}`);
    
    return { success: true, phpRoot: newPhpRoot };
  }

  /**
   * Initialize all dynamic paths with backup system
   */
  static async initializePaths() {
    const manager = new DynamicPathManager();
    
    try {
      console.log('🔄 Starting dynamic path initialization...');
      
      // Create backups first
      const backupResults = await manager.backupManager.createAllBackups();
      console.log(`📋 Created ${backupResults.filter(r => r.success).length} configuration backups`);
      
      // Ensure all directories exist
      console.log('📁 Ensuring directory structure...');
      manager.ensureDirectories();
      
      // Note: ServiceManager now handles all config updates with dynamic paths
      // This avoids duplication and ensures consistency
      console.log('✅ Dynamic path initialization completed - ServiceManager handles config updates');
      
      return { success: true, backups: backupResults };
      
    } catch (error) {
      console.error('❌ Dynamic path initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get base path statically
   */
  static getBasePath() {
    const manager = new DynamicPathManager();
    return manager.appPath;
  }

  /**
   * Get paths statically
   */
  static getPaths() {
    const manager = new DynamicPathManager();
    return manager.getPaths();
  }
}

module.exports = DynamicPathManager;
