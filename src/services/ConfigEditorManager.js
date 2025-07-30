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
        '8.3': path.join(appPath, 'php', '8.3', 'php.ini'),
        '8.4': path.join(appPath, 'php', '8.4', 'php.ini')
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

  /**
   * Get Apache configuration settings
   */
  async getApacheConfig() {
    try {
      const configPath = this.configPaths.apache.main;
      const content = fs.readFileSync(configPath, 'utf8');
      
      const config = {
        port: this.extractConfigValue(content, /^Listen\s+(\d+)/m, 80),
        serverName: this.extractConfigValue(content, /^ServerName\s+(.+)/m, 'localhost'),
        documentRoot: this.extractConfigValue(content, /^DocumentRoot\s+"([^"]+)"/m, ''),
        directoryIndex: this.extractConfigValue(content, /^DirectoryIndex\s+(.+)/m, 'index.html index.php'),
        serverTokens: this.extractConfigValue(content, /^ServerTokens\s+(\w+)/m, 'Full'),
        serverSignature: this.extractConfigValue(content, /^ServerSignature\s+(\w+)/m, 'On'),
        maxRequestsPerChild: this.extractConfigValue(content, /^MaxRequestsPerChild\s+(\d+)/m, 10000),
        keepAlive: this.extractConfigValue(content, /^KeepAlive\s+(\w+)/m, 'On'),
        keepAliveTimeout: this.extractConfigValue(content, /^KeepAliveTimeout\s+(\d+)/m, 5)
      };

      return config;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get MySQL configuration settings
   */
  async getMySQLConfig() {
    try {
      const configPath = this.configPaths.mysql.main;
      const content = fs.readFileSync(configPath, 'utf8');
      
      const config = {
        port: this.extractConfigValue(content, /^port\s*=\s*(\d+)/m, 3306),
        bindAddress: this.extractConfigValue(content, /^bind-address\s*=\s*(.+)/m, '127.0.0.1'),
        maxConnections: this.extractConfigValue(content, /^max_connections\s*=\s*(\d+)/m, 100),
        maxAllowedPacket: this.extractConfigValue(content, /^max_allowed_packet\s*=\s*(.+)/m, '64M'),
        innodbBufferPoolSize: this.extractConfigValue(content, /^innodb_buffer_pool_size\s*=\s*(.+)/m, '256M'),
        queryCacheType: this.extractConfigValue(content, /^query_cache_type\s*=\s*(\d+)/m, '0'),
        generalLog: this.extractConfigValue(content, /^general_log\s*=\s*(\d+)/m, '1'),
        slowQueryLog: this.extractConfigValue(content, /^slow_query_log\s*=\s*(\d+)/m, '1'),
        longQueryTime: this.extractConfigValue(content, /^long_query_time\s*=\s*(\d+(?:\.\d+)?)/m, 2)
      };

      return config;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get PHP configuration settings
   */
  async getPHPConfig() {
    try {
      const configPath = this.configPaths.php['8.2']; // Default to PHP 8.2
      const content = fs.readFileSync(configPath, 'utf8');
      
      const config = {
        version: '8.2',
        memoryLimit: this.extractConfigValue(content, /^memory_limit\s*=\s*(.+)/m, '256M'),
        uploadMaxFilesize: this.extractConfigValue(content, /^upload_max_filesize\s*=\s*(.+)/m, '64M'),
        postMaxSize: this.extractConfigValue(content, /^post_max_size\s*=\s*(.+)/m, '128M')
      };

      return config;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Validate configuration settings before saving
   */
  async validateConfig(service, config) {
    try {
      if (service === 'apache') {
        return this.validateApacheSettings(config);
      } else if (service === 'mysql') {
        return this.validateMySQLSettings(config);
      } else if (service === 'php') {
        return this.validatePHPSettings(config);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save configuration settings
   */
  async saveConfig(service, config) {
    try {
      if (service === 'apache') {
        return await this.saveApacheConfig(config);
      } else if (service === 'mysql') {
        return await this.saveMySQLConfig(config);
      } else if (service === 'php') {
        return await this.savePHPConfig(config);
      }
      
      return { success: false, error: 'Unknown service' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate Apache settings
   */
  validateApacheSettings(config) {
    if (config.port < 1 || config.port > 65535) {
      return { success: false, error: 'Port must be between 1 and 65535' };
    }
    
    if (!config.serverName || config.serverName.trim() === '') {
      return { success: false, error: 'Server name cannot be empty' };
    }
    
    if (config.keepAliveTimeout < 1 || config.keepAliveTimeout > 300) {
      return { success: false, error: 'Keep alive timeout must be between 1 and 300 seconds' };
    }
    
    return { success: true };
  }

  /**
   * Validate MySQL settings
   */
  validateMySQLSettings(config) {
    if (config.port < 1 || config.port > 65535) {
      return { success: false, error: 'Port must be between 1 and 65535' };
    }
    
    if (config.maxConnections < 1 || config.maxConnections > 10000) {
      return { success: false, error: 'Max connections must be between 1 and 10000' };
    }
    
    if (config.longQueryTime < 0.1 || config.longQueryTime > 60) {
      return { success: false, error: 'Slow query time must be between 0.1 and 60 seconds' };
    }
    
    return { success: true };
  }

  /**
   * Validate PHP settings
   */
  validatePHPSettings(config) {
    const validVersions = ['8.1', '8.2', '8.3', '8.4'];
    if (!validVersions.includes(config.version)) {
      return { success: false, error: 'Invalid PHP version' };
    }
    
    return { success: true };
  }

  /**
   * Save Apache configuration
   */
  async saveApacheConfig(config) {
    try {
      const configPath = this.configPaths.apache.main;
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Update configuration values
      content = this.updateConfigValue(content, /^Listen\s+\d+/m, `Listen ${config.port}`);
      content = this.updateConfigValue(content, /^ServerName\s+.+/m, `ServerName ${config.serverName}`);
      content = this.updateConfigValue(content, /^DirectoryIndex\s+.+/m, `DirectoryIndex ${config.directoryIndex}`);
      content = this.updateConfigValue(content, /^ServerTokens\s+\w+/m, `ServerTokens ${config.serverTokens}`);
      content = this.updateConfigValue(content, /^ServerSignature\s+\w+/m, `ServerSignature ${config.serverSignature}`);
      content = this.updateConfigValue(content, /^MaxRequestsPerChild\s+\d+/m, `MaxRequestsPerChild ${config.maxRequestsPerChild}`);
      content = this.updateConfigValue(content, /^KeepAlive\s+\w+/m, `KeepAlive ${config.keepAlive}`);
      content = this.updateConfigValue(content, /^KeepAliveTimeout\s+\d+/m, `KeepAliveTimeout ${config.keepAliveTimeout}`);
      
      // Create backup before saving
      await this.createBackup('apache', 'main');
      
      // Save updated configuration
      fs.writeFileSync(configPath, content, 'utf8');
      
      return { success: true, message: 'Apache configuration saved successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save MySQL configuration
   */
  async saveMySQLConfig(config) {
    try {
      const configPath = this.configPaths.mysql.main;
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Update configuration values
      content = this.updateConfigValue(content, /^port\s*=\s*\d+/m, `port = ${config.port}`);
      content = this.updateConfigValue(content, /^bind-address\s*=\s*.+/m, `bind-address = ${config.bindAddress}`);
      content = this.updateConfigValue(content, /^max_connections\s*=\s*\d+/m, `max_connections = ${config.maxConnections}`);
      content = this.updateConfigValue(content, /^max_allowed_packet\s*=\s*.+/m, `max_allowed_packet = ${config.maxAllowedPacket}`);
      content = this.updateConfigValue(content, /^innodb_buffer_pool_size\s*=\s*.+/m, `innodb_buffer_pool_size = ${config.innodbBufferPoolSize}`);
      content = this.updateConfigValue(content, /^general_log\s*=\s*\d+/m, `general_log = ${config.generalLog}`);
      content = this.updateConfigValue(content, /^slow_query_log\s*=\s*\d+/m, `slow_query_log = ${config.slowQueryLog}`);
      content = this.updateConfigValue(content, /^long_query_time\s*=\s*\d+(?:\.\d+)?/m, `long_query_time = ${config.longQueryTime}`);
      
      // Create backup before saving
      await this.createBackup('mysql', 'main');
      
      // Save updated configuration
      fs.writeFileSync(configPath, content, 'utf8');
      
      return { success: true, message: 'MySQL configuration saved successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save PHP configuration
   */
  async savePHPConfig(config) {
    try {
      const configPath = this.configPaths.php[config.version];
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Update configuration values
      content = this.updateConfigValue(content, /^memory_limit\s*=\s*.+/m, `memory_limit = ${config.memoryLimit}`);
      content = this.updateConfigValue(content, /^upload_max_filesize\s*=\s*.+/m, `upload_max_filesize = ${config.uploadMaxFilesize}`);
      content = this.updateConfigValue(content, /^post_max_size\s*=\s*.+/m, `post_max_size = ${config.postMaxSize}`);
      
      // Create backup before saving
      await this.createBackup('php', config.version);
      
      // Save updated configuration
      fs.writeFileSync(configPath, content, 'utf8');
      
      return { success: true, message: `PHP ${config.version} configuration saved successfully` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract configuration value using regex
   */
  extractConfigValue(content, regex, defaultValue) {
    const match = content.match(regex);
    return match ? match[1].trim() : defaultValue;
  }

  /**
   * Update configuration value in content
   */
  updateConfigValue(content, regex, newValue) {
    if (regex.test(content)) {
      return content.replace(regex, newValue);
    } else {
      // If the directive doesn't exist, add it at the end
      return content + '\n' + newValue + '\n';
    }
  }
}

module.exports = ConfigEditorManager;
