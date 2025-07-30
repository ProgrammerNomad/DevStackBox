const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const process = require('process');
const DynamicPathManager = require('../utils/DynamicPathManager');

const execAsync = promisify(exec);

/**
 * ServiceManager - Manages Apache, MySQL, and PHP services for DevStackBox  
 * FULLY PORTABLE - NO XAMPP OR EXTERNAL DEPENDENCIES
 */
class ServiceManager {
  constructor(appPath) {
    this.appPath = appPath || DynamicPathManager.getBasePath();
    
    // Look for pre-bundled portable servers
    this.services = {
      apache: {
        name: 'Apache',
        executable: this.findExecutable('apache', ['apache/bin/httpd.exe', 'apache/Apache24/bin/httpd.exe']),
        processName: 'httpd.exe', 
        defaultPort: 80,
        configPath: this.findConfig('apache', ['apache/conf/httpd.conf', 'apache/Apache24/conf/httpd.conf']),
        startArgs: ['-D', 'FOREGROUND'],
        installed: false
      },
      mysql: {
        name: 'MySQL',
        executable: this.findExecutable('mysql', ['mysql/bin/mysqld.exe', 'mysql/mysql-8.0.35-winx64/bin/mysqld.exe']),
        processName: 'mysqld.exe',
        defaultPort: 3306, 
        configPath: this.findConfig('mysql', ['mysql/my.ini', 'mysql/mysql-8.0.35-winx64/my.ini']),
        startArgs: ['--defaults-file=' + this.findConfig('mysql', ['mysql/my.ini', 'mysql/mysql-8.0.35-winx64/my.ini'])],
        installed: false
      }
    };
    
    this.runningProcesses = new Map();
    // PHP 8.2 as default, with 8.1, 8.3, and 8.4 as additional options
    this.phpVersions = ['8.1', '8.2', '8.3', '8.4'];
    this.currentPhpVersion = '8.2'; // Default to PHP 8.2
    
    // Check what's actually pre-bundled
    this.checkInstallations();
    
    // Configure dynamic paths on initialization
    this.configureDynamicPaths();
    
    console.log('DevStackBox: ServiceManager initialized - Looking for pre-bundled servers (PHP 8.2 default)');
  }

  /**
   * Find executable in possible locations
   */
  findExecutable(service, possiblePaths) {
    for (const possiblePath of possiblePaths) {
      const fullPath = path.join(this.appPath, possiblePath);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Found ${service} executable: ${fullPath}`);
        return fullPath;
      }
    }
    // Return default path as fallback
    return path.join(this.appPath, possiblePaths[0]);
  }

  /**
   * Find config file in possible locations
   */
  findConfig(service, possiblePaths) {
    for (const possiblePath of possiblePaths) {
      const fullPath = path.join(this.appPath, possiblePath);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Found ${service} config: ${fullPath}`);
        return fullPath;
      }
    }
    // Return default path as fallback
    return path.join(this.appPath, possiblePaths[0]);
  }

  /**
   * Check which portable services are actually installed
   */
  checkInstallations() {
    Object.keys(this.services).forEach(serviceName => {
      const service = this.services[serviceName];
      service.installed = fs.existsSync(service.executable);
      
      if (service.installed) {
        console.log(`✅ ${service.name} portable binary found`);
      } else {
        console.log(`❌ ${service.name} portable binary missing: ${service.executable}`);
      }
    });
  }

  /**
   * Configure all configuration files with dynamic paths
   * This replaces all static paths with the current installation directory
   */
  async configureDynamicPaths() {
    console.log('🔧 Configuring dynamic paths for portability...');
    
    try {
      // Configure Apache httpd.conf with dynamic paths
      await this.configureApacheConfig();
      
      // Configure MySQL my.ini with dynamic paths
      await this.configureMySQLConfig();
      
      // Configure phpMyAdmin config with dynamic paths
      await this.configurePhpMyAdminConfig();
      
      // Configure PHP ini files with dynamic paths
      await this.configurePHPConfig();
      
      console.log('✅ All configuration files updated with dynamic paths');
    } catch (error) {
      console.error('❌ Error configuring dynamic paths:', error);
    }
  }

  /**
   * Configure Apache httpd.conf with dynamic paths
   */
  async configureApacheConfig() {
    const configPath = this.services.apache.configPath;
    
    if (!fs.existsSync(configPath)) {
      console.log(`⚠️ Apache config not found: ${configPath}`);
      return;
    }
    
    try {
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Replace all static paths with dynamic ones
      const normalizedAppPath = this.appPath.replace(/\\/g, '/');
      
      // Replace ServerRoot
      content = content.replace(
        /^Define SRVROOT .+$/m,
        `Define SRVROOT "${normalizedAppPath}/apache"`
      );
      
      // Replace DocumentRoot
      content = content.replace(
        /^DocumentRoot .+$/m,
        `DocumentRoot "${normalizedAppPath}/www"`
      );
      
      // Replace Directory paths
      content = content.replace(
        /<Directory\s+"[^"]*\/www">/g,
        `<Directory "${normalizedAppPath}/www">`
      );
      
      // Replace PHP CGI script alias
      content = content.replace(
        /^ScriptAlias \/cgi-bin\/ .+$/m,
        `ScriptAlias /cgi-bin/ "${normalizedAppPath}/php/${this.currentPhpVersion}/"`
      );
      
      // Replace phpMyAdmin alias
      content = content.replace(
        /^Alias \/phpmyadmin .+$/m,
        `Alias /phpmyadmin "${normalizedAppPath}/phpmyadmin"`
      );
      
      // Replace phpMyAdmin directory
      content = content.replace(
        /<Directory\s+"[^"]*\/phpmyadmin">/g,
        `<Directory "${normalizedAppPath}/phpmyadmin">`
      );
      
      fs.writeFileSync(configPath, content, 'utf8');
      console.log('✅ Apache config updated with dynamic paths');
    } catch (error) {
      console.error('❌ Error updating Apache config:', error);
    }
  }

  /**
   * Configure MySQL my.ini with dynamic paths
   */
  async configureMySQLConfig() {
    const configPath = this.services.mysql.configPath;
    
    if (!fs.existsSync(configPath)) {
      console.log(`⚠️ MySQL config not found: ${configPath}`);
      return;
    }
    
    try {
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Replace all paths with dynamic ones
      const normalizedAppPath = this.appPath.replace(/\\/g, '/');
      
      // Replace basedir
      content = content.replace(
        /^basedir\s*=.+$/m,
        `basedir = ${normalizedAppPath}/mysql`
      );
      
      // Replace datadir
      content = content.replace(
        /^datadir\s*=.+$/m,
        `datadir = ${normalizedAppPath}/mysql/data`
      );
      
      // Replace log files
      content = content.replace(
        /^log-error\s*=.+$/m,
        `log-error = ${normalizedAppPath}/mysql/logs/error.log`
      );
      
      content = content.replace(
        /^general_log_file\s*=.+$/m,
        `general_log_file = ${normalizedAppPath}/mysql/logs/general.log`
      );
      
      content = content.replace(
        /^slow_query_log_file\s*=.+$/m,
        `slow_query_log_file = ${normalizedAppPath}/mysql/logs/slow.log`
      );
      
      fs.writeFileSync(configPath, content, 'utf8');
      console.log('✅ MySQL config updated with dynamic paths');
    } catch (error) {
      console.error('❌ Error updating MySQL config:', error);
    }
  }

  /**
   * Configure phpMyAdmin config with dynamic paths
   */
  async configurePhpMyAdminConfig() {
    const configPath = path.join(this.appPath, 'phpmyadmin', 'config.inc.php');
    
    try {
      // Check if config file already exists and has working settings
      if (fs.existsSync(configPath)) {
        const existingConfig = fs.readFileSync(configPath, 'utf8');
        
        // Check for manual preserve marker first
        if (existingConfig.includes("MANUAL_CONFIG_PRESERVE")) {
          console.log('✅ phpMyAdmin config marked as MANUAL_CONFIG_PRESERVE - skipping overwrite');
          return;
        }
        
        // If it already has cookie auth and proper connection settings, don't overwrite
        // Also check for 127.0.0.1 host to ensure it's a working configuration
        if (existingConfig.includes("auth_type'] = 'cookie'") && 
            existingConfig.includes("AllowNoPassword'] = true") &&
            existingConfig.includes("AllowRoot'] = true") &&
            (existingConfig.includes("host'] = '127.0.0.1'") || existingConfig.includes("host'] = 'localhost'"))) {
          console.log('✅ phpMyAdmin config already configured with working settings - skipping overwrite');
          return;
        }
      }
      
      const normalizedAppPath = this.appPath.replace(/\\/g, '/');
      
      const configContent = `<?php
/**
 * phpMyAdmin Configuration - Dynamic Paths
 * Auto-generated by DevStackBox ServiceManager
 */

// Server configuration
$cfg['Servers'][1]['auth_type'] = 'cookie';
$cfg['Servers'][1]['host'] = '127.0.0.1';
$cfg['Servers'][1]['port'] = 3306;
$cfg['Servers'][1]['connect_type'] = 'tcp';
$cfg['Servers'][1]['compress'] = false;
$cfg['Servers'][1]['user'] = 'root';
$cfg['Servers'][1]['password'] = '';
$cfg['Servers'][1]['AllowNoPassword'] = true;
$cfg['Servers'][1]['AllowRoot'] = true;

// Directories with dynamic paths
$cfg['UploadDir'] = '${normalizedAppPath}/phpmyadmin/upload';
$cfg['SaveDir'] = '${normalizedAppPath}/phpmyadmin/save';
$cfg['TempDir'] = '${normalizedAppPath}/phpmyadmin/tmp';

// Security settings
$cfg['blowfish_secret'] = '${this.generateBlowfishSecret()}';
$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;

// Performance settings
$cfg['MaxRows'] = 100;
$cfg['MemoryLimit'] = '512M';
$cfg['ExecTimeLimit'] = 300;

// UI settings
$cfg['ShowPhpInfo'] = true;
$cfg['ShowServerInfo'] = true;
$cfg['ShowAll'] = true;
$cfg['MaxNavigationItems'] = 200;

// Theme
$cfg['ThemeDefault'] = 'pmahomme';
?>`;
      
      fs.writeFileSync(configPath, configContent, 'utf8');
      console.log('✅ phpMyAdmin config created with working connection settings');
    } catch (error) {
      console.error('❌ Error creating phpMyAdmin config:', error);
    }
  }

  /**
   * Configure PHP ini files with dynamic paths
   */
  async configurePHPConfig() {
    for (const version of this.phpVersions) {
      const phpIniPath = path.join(this.appPath, 'php', version, 'php.ini');
      
      if (!fs.existsSync(phpIniPath)) {
        console.log(`⚠️ PHP ${version} config not found: ${phpIniPath}`);
        continue;
      }
      
      try {
        let content = fs.readFileSync(phpIniPath, 'utf8');
        
        const normalizedAppPath = this.appPath.replace(/\\/g, '/');
        
        // Update extension directory
        content = content.replace(
          /^extension_dir\s*=.+$/m,
          `extension_dir = "${normalizedAppPath}/php/${version}/ext"`
        );
        
        // Update session save path
        content = content.replace(
          /^;?session\.save_path\s*=.+$/m,
          `session.save_path = "${normalizedAppPath}/php/${version}/tmp"`
        );
        
        // Update upload tmp dir
        content = content.replace(
          /^;?upload_tmp_dir\s*=.+$/m,
          `upload_tmp_dir = "${normalizedAppPath}/php/${version}/tmp"`
        );
        
        // Update error log
        content = content.replace(
          /^;?log_errors_max_len\s*=.+$/m,
          `log_errors = On\nerror_log = "${normalizedAppPath}/php/logs/php_${version}_errors.log"`
        );
        
        fs.writeFileSync(phpIniPath, content, 'utf8');
        console.log(`✅ PHP ${version} config updated with dynamic paths`);
      } catch (error) {
        console.error(`❌ Error updating PHP ${version} config:`, error);
      }
    }
  }

  /**
   * Generate a random blowfish secret for phpMyAdmin
   */
  generateBlowfishSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Update PHP configuration for a specific version (compatibility method)
   */
  async updatePhpConfig(version) {
    console.log(`🔧 Updating PHP ${version} configuration with dynamic paths...`);
    // This is handled by configurePHPConfig() method above
    return true;
  }

  /**
   * Start a service (ONLY if our portable binary exists)
   */
  async startService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    if (!service.installed) {
      throw new Error(`${service.name} binaries not found. Please add ${service.name.toLowerCase()} binaries to the project or use the bundled setup. Expected location: ${service.executable}`);
    }

    // Check if already running
    const isRunning = await this.isServiceRunning(serviceName);
    if (isRunning) {
      return { success: true, message: `${service.name} is already running` };
    }

    try {
      console.log(`Starting ${service.name} from: ${service.executable}`);
      
      let childProcess;
      if (serviceName === 'apache') {
        // For Apache, we need to specify the config file explicitly and use absolute paths
        const configPath = path.resolve(service.configPath);
        const apacheArgs = ['-f', configPath, '-D', 'FOREGROUND'];
        
        childProcess = spawn(service.executable, apacheArgs, {
          cwd: path.join(this.appPath, 'apache', 'bin'),
          detached: false,
          stdio: 'pipe',
          env: { ...process.env, APACHE_RUN_DIR: path.join(this.appPath, 'apache', 'logs') }
        });
      } else if (serviceName === 'mysql') {
        await this.initializeMySQLIfNeeded();
        childProcess = spawn(service.executable, service.startArgs, {
          cwd: path.join(this.appPath, 'mysql', 'bin'),
          detached: false,
          stdio: 'pipe'
        });
      }

      if (childProcess) {
        this.runningProcesses.set(serviceName, childProcess);
        
        // Capture output for debugging
        let output = '';
        let errorOutput = '';
        
        if (childProcess.stdout) {
          childProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`${service.name} stdout:`, data.toString());
          });
        }
        
        if (childProcess.stderr) {
          childProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`${service.name} stderr:`, data.toString());
          });
        }
        
        childProcess.on('error', (error) => {
          console.error(`${service.name} process error:`, error);
          this.runningProcesses.delete(serviceName);
        });

        childProcess.on('exit', (code) => {
          console.log(`${service.name} process exited with code: ${code}`);
          if (code !== 0) {
            console.error(`${service.name} error output:`, errorOutput);
          }
          this.runningProcesses.delete(serviceName);
        });

        // Wait for startup - increase timeout for MySQL
        const startupTimeout = serviceName === 'mysql' ? 5000 : 2000;
        await new Promise(resolve => setTimeout(resolve, startupTimeout));
        
        const running = await this.isServiceRunning(serviceName);
        if (running) {
          console.log(`✅ ${service.name} started successfully`);
          return { success: true, message: `${service.name} started successfully` };
        } else {
          throw new Error(`${service.name} failed to start - check logs for details. Error output: ${errorOutput}`);
        }
      }

    } catch (error) {
      console.error(`Failed to start ${service.name}:`, error);
      throw new Error(`Failed to start ${service.name}: ${error.message}`);
    }
  }

  /**
   * Stop a service
   */
  async stopService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    const childProcess = this.runningProcesses.get(serviceName);
    if (childProcess) {
      try {
        console.log(`Stopping ${service.name}...`);
        
        // Try graceful shutdown first
        childProcess.kill('SIGTERM');
        
        // Wait for graceful shutdown or force kill after timeout
        await new Promise((resolve) => {
          let resolved = false;
          
          childProcess.on('exit', () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          });
          
          // Force kill after 5 seconds if still running
          setTimeout(() => {
            if (!resolved) {
              console.log(`Force killing ${service.name}...`);
              try {
                childProcess.kill('SIGKILL');
              } catch (err) {
                console.log(`Process ${service.name} was already terminated`);
              }
              resolved = true;
              resolve();
            }
          }, 5000);
        });
        
        this.runningProcesses.delete(serviceName);
        console.log(`✅ ${service.name} stopped successfully`);
        return { success: true, message: `${service.name} stopped successfully` };
        
      } catch (error) {
        console.error(`Failed to stop ${service.name}:`, error);
        this.runningProcesses.delete(serviceName); // Clean up even on error
        throw new Error(`Failed to stop ${service.name}: ${error.message}`);
      }
    } else {
      // Check system processes and kill if found
      try {
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
          exec(`taskkill /F /IM "${service.processName}" 2>nul`, (error) => {
            // Don't reject if process not found - that's expected
            resolve();
          });
        });
        
        console.log(`✅ ${service.name} stopped (system process)`);
        return { success: true, message: `${service.name} stopped successfully` };
      } catch (error) {
        return { success: true, message: `${service.name} is not running` };
      }
    }
  }

  /**
   * Check if service is running
   */
  async isServiceRunning(serviceName) {
    const service = this.services[serviceName];
    if (!service) return false;

    // Check our managed processes first
    const process = this.runningProcesses.get(serviceName);
    if (process && !process.killed) {
      return true;
    }

    // Check system processes
    try {
      const { stdout } = await execAsync(`tasklist /FI "IMAGENAME eq ${service.processName}" /FO CSV`);
      return stdout.includes(service.processName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      return { installed: false, running: false, message: 'Unknown service' };
    }

    const running = await this.isServiceRunning(serviceName);
    return {
      installed: service.installed,
      running: running,
      port: service.defaultPort,
      executable: service.executable,
      message: service.installed ? 
        (running ? 'Running' : 'Stopped') : 
        'Binaries not found - please add server files to project folders'
    };
  }

  /**
   * Initialize MySQL data directory if needed
   */
  async initializeMySQLIfNeeded() {
    const dataDir = path.join(this.appPath, 'mysql', 'data');
    const mysqlDir = path.join(dataDir, 'mysql');
    
    if (fs.existsSync(mysqlDir)) {
      return;
    }

    console.log('Initializing MySQL data directory...');
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const mysqld = path.join(this.appPath, 'mysql', 'bin', 'mysqld.exe');
      const initCommand = `"${mysqld}" --initialize-insecure --basedir="${path.join(this.appPath, 'mysql')}" --datadir="${dataDir}"`;
      
      await execAsync(initCommand);
      console.log('✅ MySQL data directory initialized');
      
    } catch (error) {
      console.error('Failed to initialize MySQL:', error);
      throw new Error(`Failed to initialize MySQL: ${error.message}`);
    }
  }

  /**
   * Get available PHP versions
   */
  getPhpVersions() {
    const versions = [];
    this.phpVersions.forEach(version => {
      // Look for PHP in multiple possible locations
      const possiblePaths = [
        path.join(this.appPath, 'php', version, 'php.exe'),
        path.join(this.appPath, 'php', `php-${version}`, 'php.exe'),
        path.join(this.appPath, 'php', `${version}`, 'php.exe')
      ];
      
      let phpPath = null;
      let installed = false;
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          phpPath = possiblePath;
          installed = true;
          console.log(`✅ Found PHP ${version}: ${possiblePath}`);
          break;
        }
      }
      
      if (!phpPath) {
        phpPath = possiblePaths[0]; // Default fallback
      }
      
      versions.push({
        version: version,
        path: phpPath,
        installed: installed,
        current: version === this.currentPhpVersion
      });
    });
    return versions;
  }

  /**
   * Set PHP version
   */
  async setPhpVersion(version) {
    if (!this.phpVersions.includes(version)) {
      throw new Error(`Invalid PHP version: ${version}`);
    }

    const phpPath = path.join(this.appPath, 'php', version, 'php.exe');
    if (!fs.existsSync(phpPath)) {
      throw new Error(`PHP ${version} is not installed. Please download portable servers first.`);
    }

    this.currentPhpVersion = version;
    console.log(`✅ PHP version set to ${version}`);
    return { success: true, version: version };
  }

  /**
   * Get installation status for all components
   */
  getInstallationStatus() {
    const status = {
      apache: this.services.apache.installed,
      mysql: this.services.mysql.installed,
      php: {},
      phpmyadmin: fs.existsSync(path.join(this.appPath, 'phpmyadmin', 'index.php')),
      prebundled: true // Mark as pre-bundled installation
    };

    // Check PHP versions, prioritizing 8.2 as default
    this.phpVersions.forEach(version => {
      const phpPath = path.join(this.appPath, 'php', version, 'php.exe');
      status.php[version] = fs.existsSync(phpPath);
    });

    // Set default PHP version to 8.2 if available
    if (status.php['8.2']) {
      this.currentPhpVersion = '8.2';
    }

    return status;
  }

  /**
   * Stop all running services
   */
  async stopAllServices() {
    const results = [];
    for (const serviceName of Object.keys(this.services)) {
      try {
        const result = await this.stopService(serviceName);
        results.push({ service: serviceName, ...result });
      } catch (error) {
        results.push({ service: serviceName, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = ServiceManager;
