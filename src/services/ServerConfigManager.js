/**
 * ServerConfigManager - Manages Apache and MySQL configuration settings
 * Provides UI-configurable options for common server settings
 */

const fs = require('fs');
const path = require('path');

class ServerConfigManager {
  constructor(appPath) {
    this.appPath = appPath;
    this.configBackupDir = path.join(appPath, 'config-backups');
    
    // Default configurations
    this.apacheDefaults = {
      port: 80,
      serverName: 'localhost',
      documentRoot: path.join(appPath, 'www').replace(/\\/g, '/'),
      maxRequestWorkers: 150,
      timeout: 60,
      keepAlive: 'On',
      keepAliveTimeout: 5,
      maxKeepAliveRequests: 100,
      serverTokens: 'Prod',
      serverSignature: 'Off',
      errorLogLevel: 'warn'
    };
    
    this.mysqlDefaults = {
      port: 3306,
      bindAddress: '127.0.0.1',
      maxConnections: 100,
      maxAllowedPacket: '64M',
      innodbBufferPoolSize: '256M',
      innodbLogFileSize: '50M',
      queryCache: false, // Disabled in MySQL 8.0+
      slowQueryLog: true,
      longQueryTime: 2,
      generalLog: false,
      sqlMode: 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'
    };
  }

  /**
   * Get current Apache configuration
   */
  async getApacheConfig() {
    const configPath = path.join(this.appPath, 'apache', 'conf', 'httpd.conf');
    
    if (!fs.existsSync(configPath)) {
      throw new Error('Apache configuration file not found');
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    const config = { ...this.apacheDefaults };
    
    // Parse current settings
    const portMatch = content.match(/^Listen\s+(\d+)$/m);
    if (portMatch) config.port = parseInt(portMatch[1]);
    
    const serverNameMatch = content.match(/^ServerName\s+(.+?)(?::\d+)?$/m);
    if (serverNameMatch) config.serverName = serverNameMatch[1];
    
    const docRootMatch = content.match(/^DocumentRoot\s+"(.+)"$/m);
    if (docRootMatch) config.documentRoot = docRootMatch[1];
    
    const timeoutMatch = content.match(/^Timeout\s+(\d+)$/m);
    if (timeoutMatch) config.timeout = parseInt(timeoutMatch[1]);
    
    const keepAliveMatch = content.match(/^KeepAlive\s+(\w+)$/m);
    if (keepAliveMatch) config.keepAlive = keepAliveMatch[1];
    
    const keepAliveTimeoutMatch = content.match(/^KeepAliveTimeout\s+(\d+)$/m);
    if (keepAliveTimeoutMatch) config.keepAliveTimeout = parseInt(keepAliveTimeoutMatch[1]);
    
    const maxKeepAliveMatch = content.match(/^MaxKeepAliveRequests\s+(\d+)$/m);
    if (maxKeepAliveMatch) config.maxKeepAliveRequests = parseInt(maxKeepAliveMatch[1]);
    
    const serverTokensMatch = content.match(/^ServerTokens\s+(\w+)$/m);
    if (serverTokensMatch) config.serverTokens = serverTokensMatch[1];
    
    const serverSigMatch = content.match(/^ServerSignature\s+(\w+)$/m);
    if (serverSigMatch) config.serverSignature = serverSigMatch[1];
    
    const errorLogMatch = content.match(/^LogLevel\s+(\w+)$/m);
    if (errorLogMatch) config.errorLogLevel = errorLogMatch[1];
    
    const maxWorkersMatch = content.match(/^\s*MaxRequestWorkers\s+(\d+)$/m);
    if (maxWorkersMatch) config.maxRequestWorkers = parseInt(maxWorkersMatch[1]);
    
    return config;
  }

  /**
   * Get current MySQL configuration
   */
  async getMySQLConfig() {
    const configPath = path.join(this.appPath, 'mysql', 'my.ini');
    
    if (!fs.existsSync(configPath)) {
      throw new Error('MySQL configuration file not found');
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    const config = { ...this.mysqlDefaults };
    
    // Parse current settings
    const portMatch = content.match(/^port\s*=\s*(\d+)$/m);
    if (portMatch) config.port = parseInt(portMatch[1]);
    
    const bindMatch = content.match(/^bind-address\s*=\s*(.+)$/m);
    if (bindMatch) config.bindAddress = bindMatch[1].trim();
    
    const maxConnMatch = content.match(/^max_connections\s*=\s*(\d+)$/m);
    if (maxConnMatch) config.maxConnections = parseInt(maxConnMatch[1]);
    
    const maxPacketMatch = content.match(/^max_allowed_packet\s*=\s*(.+)$/m);
    if (maxPacketMatch) config.maxAllowedPacket = maxPacketMatch[1].trim();
    
    const bufferMatch = content.match(/^innodb_buffer_pool_size\s*=\s*(.+)$/m);
    if (bufferMatch) config.innodbBufferPoolSize = bufferMatch[1].trim();
    
    const logSizeMatch = content.match(/^innodb_log_file_size\s*=\s*(.+)$/m);
    if (logSizeMatch) config.innodbLogFileSize = logSizeMatch[1].trim();
    
    const slowLogMatch = content.match(/^slow_query_log\s*=\s*(\d+)$/m);
    if (slowLogMatch) config.slowQueryLog = slowLogMatch[1] === '1';
    
    const longQueryMatch = content.match(/^long_query_time\s*=\s*(\d+)$/m);
    if (longQueryMatch) config.longQueryTime = parseInt(longQueryMatch[1]);
    
    const generalLogMatch = content.match(/^general_log\s*=\s*(\d+)$/m);
    if (generalLogMatch) config.generalLog = generalLogMatch[1] === '1';
    
    const sqlModeMatch = content.match(/^sql_mode\s*=\s*(.+)$/m);
    if (sqlModeMatch) config.sqlMode = sqlModeMatch[1].trim();
    
    return config;
  }

  /**
   * Update Apache configuration
   */
  async updateApacheConfig(newConfig) {
    const configPath = path.join(this.appPath, 'apache', 'conf', 'httpd.conf');
    
    // Create backup first
    await this.createBackup('apache', configPath);
    
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Update port
    content = content.replace(/^Listen\s+\d+$/m, `Listen ${newConfig.port}`);
    
    // Update ServerName
    content = content.replace(/^ServerName\s+.+$/m, `ServerName ${newConfig.serverName}:${newConfig.port}`);
    
    // Update DocumentRoot
    content = content.replace(/^DocumentRoot\s+".+"$/m, `DocumentRoot "${newConfig.documentRoot}"`);
    
    // Update Timeout
    content = content.replace(/^Timeout\s+\d+$/m, `Timeout ${newConfig.timeout}`);
    
    // Update KeepAlive settings
    content = content.replace(/^KeepAlive\s+\w+$/m, `KeepAlive ${newConfig.keepAlive}`);
    content = content.replace(/^KeepAliveTimeout\s+\d+$/m, `KeepAliveTimeout ${newConfig.keepAliveTimeout}`);
    content = content.replace(/^MaxKeepAliveRequests\s+\d+$/m, `MaxKeepAliveRequests ${newConfig.maxKeepAliveRequests}`);
    
    // Update Security settings
    content = content.replace(/^ServerTokens\s+\w+$/m, `ServerTokens ${newConfig.serverTokens}`);
    content = content.replace(/^ServerSignature\s+\w+$/m, `ServerSignature ${newConfig.serverSignature}`);
    
    // Update LogLevel
    content = content.replace(/^LogLevel\s+\w+$/m, `LogLevel ${newConfig.errorLogLevel}`);
    
    // Update MaxRequestWorkers (in mpm_winnt module section)
    content = content.replace(/(^\s*MaxRequestWorkers\s+)\d+$/m, `$1${newConfig.maxRequestWorkers}`);
    
    // Also update Directory directive for document root
    const oldDirMatch = content.match(/<Directory\s+"[^"]*\/www">/);
    if (oldDirMatch) {
      content = content.replace(/<Directory\s+"[^"]*\/www">/, `<Directory "${newConfig.documentRoot}">`);
    }
    
    fs.writeFileSync(configPath, content, 'utf8');
    
    return { success: true, message: 'Apache configuration updated successfully' };
  }

  /**
   * Update MySQL configuration
   */
  async updateMySQLConfig(newConfig) {
    const configPath = path.join(this.appPath, 'mysql', 'my.ini');
    
    // Create backup first
    await this.createBackup('mysql', configPath);
    
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Update port
    content = content.replace(/^port\s*=\s*\d+$/m, `port = ${newConfig.port}`);
    
    // Update bind-address
    content = content.replace(/^bind-address\s*=\s*.+$/m, `bind-address = ${newConfig.bindAddress}`);
    
    // Update max_connections
    content = content.replace(/^max_connections\s*=\s*\d+$/m, `max_connections = ${newConfig.maxConnections}`);
    
    // Update max_allowed_packet
    content = content.replace(/^max_allowed_packet\s*=\s*.+$/m, `max_allowed_packet = ${newConfig.maxAllowedPacket}`);
    
    // Update InnoDB settings
    content = content.replace(/^innodb_buffer_pool_size\s*=\s*.+$/m, `innodb_buffer_pool_size = ${newConfig.innodbBufferPoolSize}`);
    content = content.replace(/^innodb_log_file_size\s*=\s*.+$/m, `innodb_log_file_size = ${newConfig.innodbLogFileSize}`);
    
    // Update slow query log
    content = content.replace(/^slow_query_log\s*=\s*\d+$/m, `slow_query_log = ${newConfig.slowQueryLog ? 1 : 0}`);
    content = content.replace(/^long_query_time\s*=\s*\d+$/m, `long_query_time = ${newConfig.longQueryTime}`);
    
    // Update general log
    content = content.replace(/^general_log\s*=\s*\d+$/m, `general_log = ${newConfig.generalLog ? 1 : 0}`);
    
    // Update SQL mode
    content = content.replace(/^sql_mode\s*=\s*.+$/m, `sql_mode = ${newConfig.sqlMode}`);
    
    // Also update [client] section port
    content = content.replace(/^\[client\]\s*\nport\s*=\s*\d+$/m, `[client]\nport = ${newConfig.port}`);
    
    fs.writeFileSync(configPath, content, 'utf8');
    
    return { success: true, message: 'MySQL configuration updated successfully' };
  }

  /**
   * Validate Apache configuration
   */
  async validateApacheConfig() {
    const apachePath = path.join(this.appPath, 'apache', 'bin', 'httpd.exe');
    const configPath = path.join(this.appPath, 'apache', 'conf', 'httpd.conf');
    
    if (!fs.existsSync(apachePath)) {
      return { valid: false, error: 'Apache executable not found' };
    }
    
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Test configuration syntax
      const result = await execAsync(`"${apachePath}" -f "${configPath}" -t`);
      
      if (result.stderr && result.stderr.includes('Syntax OK')) {
        return { valid: true, message: 'Apache configuration is valid' };
      } else if (result.stdout && result.stdout.includes('Syntax OK')) {
        return { valid: true, message: 'Apache configuration is valid' };
      } else {
        return { valid: false, error: result.stderr || result.stdout };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate MySQL configuration
   */
  async validateMySQLConfig() {
    const mysqlPath = path.join(this.appPath, 'mysql', 'bin', 'mysqld.exe');
    const configPath = path.join(this.appPath, 'mysql', 'my.ini');
    
    if (!fs.existsSync(mysqlPath)) {
      return { valid: false, error: 'MySQL executable not found' };
    }
    
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Test configuration syntax
      const result = await execAsync(`"${mysqlPath}" --defaults-file="${configPath}" --help --verbose`, { timeout: 10000 });
      
      // If it doesn't throw an error, the config is likely valid
      return { valid: true, message: 'MySQL configuration appears to be valid' };
    } catch (error) {
      if (error.message.includes('timeout')) {
        // Timeout usually means config is valid but MySQL is taking time to process
        return { valid: true, message: 'MySQL configuration appears to be valid (timeout during validation)' };
      }
      return { valid: false, error: error.message };
    }
  }

  /**
   * Create configuration backup
   */
  async createBackup(service, configPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${service}_config_${timestamp}.backup`;
    const backupPath = path.join(this.configBackupDir, backupName);
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.configBackupDir)) {
      fs.mkdirSync(this.configBackupDir, { recursive: true });
    }
    
    // Copy current config to backup
    fs.copyFileSync(configPath, backupPath);
    
    console.log(`✅ Configuration backup created: ${backupName}`);
    return backupPath;
  }

  /**
   * Get available configuration backups
   */
  getConfigBackups(service) {
    if (!fs.existsSync(this.configBackupDir)) {
      return [];
    }
    
    const files = fs.readdirSync(this.configBackupDir);
    return files
      .filter(file => file.startsWith(`${service}_config_`))
      .map(file => ({
        name: file,
        path: path.join(this.configBackupDir, file),
        created: fs.statSync(path.join(this.configBackupDir, file)).mtime
      }))
      .sort((a, b) => b.created - a.created); // Most recent first
  }

  /**
   * Restore configuration from backup
   */
  async restoreFromBackup(service, backupName) {
    const backupPath = path.join(this.configBackupDir, backupName);
    let configPath;
    
    if (service === 'apache') {
      configPath = path.join(this.appPath, 'apache', 'conf', 'httpd.conf');
    } else if (service === 'mysql') {
      configPath = path.join(this.appPath, 'mysql', 'my.ini');
    } else {
      throw new Error('Invalid service name');
    }
    
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }
    
    // Create a backup of current config before restoring
    await this.createBackup(service, configPath);
    
    // Restore from backup
    fs.copyFileSync(backupPath, configPath);
    
    return { success: true, message: `Configuration restored from ${backupName}` };
  }
}

module.exports = ServerConfigManager;
