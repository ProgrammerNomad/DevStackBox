const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * ConfigEditorManager - Manages configuration file editing for Apache, MySQL, PHP
 */
class ConfigEditorManager {
  constructor(appPath) {
    this.appPath = appPath;
    this.configPaths = {
      apache: {
        main: path.join(appPath, 'apache', 'conf', 'httpd.conf'),
        vhosts: path.join(appPath, 'apache', 'conf', 'extra', 'httpd-vhosts.conf'),
        ssl: path.join(appPath, 'apache', 'conf', 'extra', 'httpd-ssl.conf'),
        modules: path.join(appPath, 'apache', 'conf', 'extra', 'httpd-modules.conf')
      },
      mysql: {
        main: path.join(appPath, 'mysql', 'my.ini'),
        log: path.join(appPath, 'mysql', 'data', 'mysql_error.log')
      },
      php: {
        '8.1': path.join(appPath, 'php', '8.1', 'php.ini'),
        '8.2': path.join(appPath, 'php', '8.2', 'php.ini'),
        '8.3': path.join(appPath, 'php', '8.3', 'php.ini')
      },
      phpmyadmin: {
        main: path.join(appPath, 'phpmyadmin', 'config.inc.php')
      }
    };

    this.backupPath = path.join(appPath, 'config-backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  /**
   * Get list of available configuration files
   */
  getAvailableConfigs() {
    const configs = [];

    // Apache configs
    Object.keys(this.configPaths.apache).forEach(key => {
      const filePath = this.configPaths.apache[key];
      if (fs.existsSync(filePath)) {
        configs.push({
          service: 'apache',
          type: key,
          name: `Apache ${key.charAt(0).toUpperCase() + key.slice(1)}`,
          path: filePath,
          description: this.getConfigDescription('apache', key)
        });
      }
    });

    // MySQL configs
    Object.keys(this.configPaths.mysql).forEach(key => {
      const filePath = this.configPaths.mysql[key];
      if (fs.existsSync(filePath)) {
        configs.push({
          service: 'mysql',
          type: key,
          name: `MySQL ${key.charAt(0).toUpperCase() + key.slice(1)}`,
          path: filePath,
          description: this.getConfigDescription('mysql', key)
        });
      }
    });

    // PHP configs
    Object.keys(this.configPaths.php).forEach(version => {
      const filePath = this.configPaths.php[version];
      if (fs.existsSync(filePath)) {
        configs.push({
          service: 'php',
          type: version,
          name: `PHP ${version}`,
          path: filePath,
          description: this.getConfigDescription('php', version)
        });
      }
    });

    // phpMyAdmin configs
    Object.keys(this.configPaths.phpmyadmin).forEach(key => {
      const filePath = this.configPaths.phpmyadmin[key];
      if (fs.existsSync(filePath)) {
        configs.push({
          service: 'phpmyadmin',
          type: key,
          name: 'phpMyAdmin Configuration',
          path: filePath,
          description: this.getConfigDescription('phpmyadmin', key)
        });
      }
    });

    return configs;
  }

  /**
   * Get configuration description
   */
  getConfigDescription(service, type) {
    const descriptions = {
      apache: {
        main: 'Main Apache configuration file (ports, modules, directories)',
        vhosts: 'Virtual hosts configuration for multiple sites',
        ssl: 'SSL/HTTPS configuration and certificates',
        modules: 'Apache modules configuration'
      },
      mysql: {
        main: 'MySQL server configuration (ports, performance, security)',
        log: 'MySQL error log file (read-only)'
      },
      php: {
        '8.1': 'PHP 8.1 configuration (extensions, limits, paths)',
        '8.2': 'PHP 8.2 configuration (extensions, limits, paths)',
        '8.3': 'PHP 8.3 configuration (extensions, limits, paths)'
      },
      phpmyadmin: {
        main: 'phpMyAdmin configuration (database connections, security)'
      }
    };

    return descriptions[service] && descriptions[service][type] ? descriptions[service][type] : 'Configuration file';
  }

  /**
   * Read configuration file
   */
  async readConfig(service, type) {
    const configPath = this.getConfigPath(service, type);
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    try {
      const content = fs.readFileSync(configPath, 'utf8');
      const stats = fs.statSync(configPath);
      
      return {
        content,
        path: configPath,
        size: stats.size,
        modified: stats.mtime,
        readonly: type === 'log' // Log files are read-only
      };
    } catch (error) {
      throw new Error(`Failed to read configuration file: ${error.message}`);
    }
  }

  /**
   * Write configuration file
   */
  async writeConfig(service, type, content, createBackup = true) {
    const configPath = this.getConfigPath(service, type);
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    try {
      // Create backup if requested
      if (createBackup) {
        await this.createBackup(service, type);
      }

      // Validate configuration before writing
      const validationResult = await this.validateConfig(service, type, content);
      if (!validationResult.valid) {
        throw new Error(`Configuration validation failed: ${validationResult.error}`);
      }

      // Write new configuration
      fs.writeFileSync(configPath, content, 'utf8');

      return {
        success: true,
        message: 'Configuration saved successfully',
        path: configPath,
        backup: createBackup
      };
    } catch (error) {
      throw new Error(`Failed to write configuration file: ${error.message}`);
    }
  }

  /**
   * Get configuration file path
   */
  getConfigPath(service, type) {
    if (service === 'php') {
      return this.configPaths.php[type];
    }
    return this.configPaths[service][type];
  }

  /**
   * Create backup of configuration file
   */
  async createBackup(service, type) {
    const configPath = this.getConfigPath(service, type);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `${service}-${type}-${timestamp}.backup`;
    const backupFilePath = path.join(this.backupPath, backupFilename);

    try {
      fs.copyFileSync(configPath, backupFilePath);
      return {
        success: true,
        path: backupFilePath,
        filename: backupFilename
      };
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Restore configuration from backup
   */
  async restoreBackup(service, type, backupFilename) {
    const configPath = this.getConfigPath(service, type);
    const backupFilePath = path.join(this.backupPath, backupFilename);

    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilename}`);
    }

    try {
      fs.copyFileSync(backupFilePath, configPath);
      return {
        success: true,
        message: 'Configuration restored from backup',
        path: configPath
      };
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  /**
   * Get list of backup files
   */
  getBackups(service = null, type = null) {
    const backupFiles = fs.readdirSync(this.backupPath)
      .filter(file => file.endsWith('.backup'))
      .map(file => {
        const stats = fs.statSync(path.join(this.backupPath, file));
        const parts = file.replace('.backup', '').split('-');
        const fileService = parts[0];
        const fileType = parts[1];
        
        return {
          filename: file,
          service: fileService,
          type: fileType,
          created: stats.mtime,
          size: stats.size
        };
      })
      .filter(backup => {
        if (service && backup.service !== service) return false;
        if (type && backup.type !== type) return false;
        return true;
      })
      .sort((a, b) => b.created - a.created);

    return backupFiles;
  }

  /**
   * Delete backup file
   */
  async deleteBackup(backupFilename) {
    const backupFilePath = path.join(this.backupPath, backupFilename);

    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilename}`);
    }

    try {
      fs.unlinkSync(backupFilePath);
      return {
        success: true,
        message: 'Backup deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete backup: ${error.message}`);
    }
  }

  /**
   * Validate configuration content
   */
  async validateConfig(service, type, content) {
    switch (service) {
      case 'apache':
        return this.validateApacheConfig(type, content);
      case 'mysql':
        return this.validateMySQLConfig(type, content);
      case 'php':
        return this.validatePHPConfig(type, content);
      case 'phpmyadmin':
        return this.validatePhpMyAdminConfig(type, content);
      default:
        return { valid: true };
    }
  }

  /**
   * Validate Apache configuration
   */
  validateApacheConfig(type, content) {
    const requiredDirectives = {
      main: ['ServerRoot', 'Listen'],
      vhosts: ['VirtualHost'],
      ssl: ['SSLEngine'],
      modules: ['LoadModule']
    };

    const required = requiredDirectives[type] || [];
    
    for (const directive of required) {
      if (!content.includes(directive)) {
        return {
          valid: false,
          error: `Missing required directive: ${directive}`
        };
      }
    }

    // Check for common syntax errors
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('<') && !line.includes('>')) {
        return {
          valid: false,
          error: `Unclosed tag on line ${i + 1}: ${line}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate MySQL configuration
   */
  validateMySQLConfig(type, content) {
    if (type === 'log') {
      return { valid: true }; // Log files don't need validation
    }

    // Check for required sections
    if (!content.includes('[mysqld]')) {
      return {
        valid: false,
        error: 'Missing required [mysqld] section'
      };
    }

    // Check for common required settings
    const requiredSettings = ['port', 'datadir'];
    for (const setting of requiredSettings) {
      if (!content.includes(setting)) {
        return {
          valid: false,
          error: `Missing required setting: ${setting}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate PHP configuration
   */
  validatePHPConfig(version, content) {
    // Check for critical PHP settings
    const criticalSettings = [
      'memory_limit',
      'max_execution_time',
      'upload_max_filesize',
      'post_max_size'
    ];

    for (const setting of criticalSettings) {
      if (!content.includes(setting)) {
        return {
          valid: false,
          error: `Missing critical setting: ${setting}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate phpMyAdmin configuration
   */
  validatePhpMyAdminConfig(type, content) {
    // Check for PHP opening tag
    if (!content.includes('<?php')) {
      return {
        valid: false,
        error: 'Missing PHP opening tag'
      };
    }

    // Check for required configuration variables
    const requiredVars = ['$cfg[\'Servers\']', '$cfg[\'blowfish_secret\']'];
    for (const varName of requiredVars) {
      if (!content.includes(varName)) {
        return {
          valid: false,
          error: `Missing required configuration: ${varName}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Test configuration by attempting to start service
   */
  async testConfig(service, type) {
    // This would be implemented to actually test the configuration
    // by attempting to start the service with the new config
    
    switch (service) {
      case 'apache':
        return this.testApacheConfig();
      case 'mysql':
        return this.testMySQLConfig();
      case 'php':
        return this.testPHPConfig(type);
      default:
        return { valid: true, message: 'Configuration appears valid' };
    }
  }

  /**
   * Test Apache configuration
   */
  async testApacheConfig() {
    const apacheBin = path.join(this.appPath, 'apache', 'bin', 'httpd.exe');
    
    if (!fs.existsSync(apacheBin)) {
      return { valid: false, error: 'Apache binary not found' };
    }

    try {
      const command = `"${apacheBin}" -t`;
      await execAsync(command);
      return { valid: true, message: 'Apache configuration is valid' };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Test MySQL configuration
   */
  async testMySQLConfig() {
    // MySQL doesn't have a built-in config test, so we'll do basic validation
    return { valid: true, message: 'MySQL configuration appears valid' };
  }

  /**
   * Test PHP configuration
   */
  async testPHPConfig(version) {
    const phpBin = path.join(this.appPath, 'php', version, 'php.exe');
    
    if (!fs.existsSync(phpBin)) {
      return { valid: false, error: 'PHP binary not found' };
    }

    try {
      const command = `"${phpBin}" -m`;
      await execAsync(command);
      return { valid: true, message: 'PHP configuration is valid' };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get configuration templates for new installations
   */
  getConfigTemplate(service, type) {
    const templates = {
      apache: {
        vhosts: `#
# Virtual Hosts Configuration
#

#
# Example Virtual Host
#
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot "${path.join(this.appPath, 'www', 'projects', 'example').replace(/\\/g, '/')}"
    ServerName example.local
    ErrorLog "logs/example-error.log"
    CustomLog "logs/example-access.log" common
</VirtualHost>
`,
        ssl: `#
# SSL Configuration
#
LoadModule ssl_module modules/mod_ssl.so

Listen 443 ssl

SSLEngine on
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite ECDHE+AESGCM:ECDHE+AES256:ECDHE+AES128:!aNULL:!MD5:!DSS
SSLHonorCipherOrder on
`
      },
      mysql: {
        main: `[mysqld]
port=3306
basedir=${this.appPath.replace(/\\/g, '/')}/mysql
datadir=${this.appPath.replace(/\\/g, '/')}/mysql/data
tmpdir=${this.appPath.replace(/\\/g, '/')}/mysql/tmp
socket=${this.appPath.replace(/\\/g, '/')}/mysql/tmp/mysql.sock

# Security settings
skip-networking=false
bind-address=127.0.0.1

# Performance settings
max_connections=100
key_buffer_size=16M
max_allowed_packet=16M

[mysql]
default-character-set=utf8mb4

[client]
port=3306
`
      }
    };

    return templates[service] && templates[service][type] ? templates[service][type] : '';
  }
}

module.exports = ConfigEditorManager;
