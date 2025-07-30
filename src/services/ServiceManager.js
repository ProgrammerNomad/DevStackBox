const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * ServiceManager - Manages Apache, MySQL, and PHP services for DevStackBox  
 * FULLY PORTABLE - NO XAMPP OR EXTERNAL DEPENDENCIES
 */
class ServiceManager {
  constructor(appPath) {
    this.appPath = appPath;
    
    // Only use OUR portable installations - NO XAMPP!
    this.services = {
      apache: {
        name: 'Apache',
        executable: path.join(appPath, 'apache', 'bin', 'httpd.exe'),
        processName: 'httpd.exe', 
        defaultPort: 80,
        configPath: path.join(appPath, 'apache', 'conf', 'httpd.conf'),
        startArgs: ['-D', 'FOREGROUND'],
        installed: false
      },
      mysql: {
        name: 'MySQL',
        executable: path.join(appPath, 'mysql', 'bin', 'mysqld.exe'),
        processName: 'mysqld.exe',
        defaultPort: 3306, 
        configPath: path.join(appPath, 'mysql', 'my.ini'),
        startArgs: ['--defaults-file=' + path.join(appPath, 'mysql', 'my.ini')],
        installed: false
      }
    };
    
    this.runningProcesses = new Map();
    this.phpVersions = ['8.1', '8.2', '8.3'];
    this.currentPhpVersion = '8.3';
    
    // Check what's actually installed
    this.checkInstallations();
    
    console.log('DevStackBox: ServiceManager initialized - PORTABLE ONLY, NO XAMPP!');
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
   * Start a service (ONLY if our portable binary exists)
   */
  async startService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    if (!service.installed) {
      throw new Error(`${service.name} portable binary not found. Please download portable servers first using the menu: File > Download Portable Servers`);
    }

    // Check if already running
    const isRunning = await this.isServiceRunning(serviceName);
    if (isRunning) {
      return { success: true, message: `${service.name} is already running` };
    }

    try {
      console.log(`Starting ${service.name} from: ${service.executable}`);
      
      let process;
      if (serviceName === 'apache') {
        process = spawn(service.executable, service.startArgs, {
          cwd: path.join(this.appPath, 'apache', 'bin'),
          detached: false,
          stdio: 'pipe'
        });
      } else if (serviceName === 'mysql') {
        await this.initializeMySQLIfNeeded();
        process = spawn(service.executable, service.startArgs, {
          cwd: path.join(this.appPath, 'mysql', 'bin'),
          detached: false,
          stdio: 'pipe'
        });
      }

      if (process) {
        this.runningProcesses.set(serviceName, process);
        
        process.on('error', (error) => {
          console.error(`${service.name} process error:`, error);
          this.runningProcesses.delete(serviceName);
        });

        process.on('exit', (code) => {
          console.log(`${service.name} process exited with code: ${code}`);
          this.runningProcesses.delete(serviceName);
        });

        // Wait for startup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const running = await this.isServiceRunning(serviceName);
        if (running) {
          console.log(`✅ ${service.name} started successfully`);
          return { success: true, message: `${service.name} started successfully` };
        } else {
          throw new Error(`${service.name} failed to start`);
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

    const process = this.runningProcesses.get(serviceName);
    if (process) {
      try {
        console.log(`Stopping ${service.name}...`);
        process.kill('SIGTERM');
        
        await new Promise((resolve) => {
          process.on('exit', resolve);
          setTimeout(resolve, 5000);
        });
        
        this.runningProcesses.delete(serviceName);
        console.log(`✅ ${service.name} stopped successfully`);
        return { success: true, message: `${service.name} stopped successfully` };
        
      } catch (error) {
        console.error(`Failed to stop ${service.name}:`, error);
        throw new Error(`Failed to stop ${service.name}: ${error.message}`);
      }
    } else {
      return { success: true, message: `${service.name} is not running` };
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
        'Not installed - download portable servers first'
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
      const phpPath = path.join(this.appPath, 'php', version, 'php.exe');
      versions.push({
        version: version,
        path: phpPath,
        installed: fs.existsSync(phpPath),
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
      php: {}
    };

    this.phpVersions.forEach(version => {
      const phpPath = path.join(this.appPath, 'php', version, 'php.exe');
      status.php[version] = fs.existsSync(phpPath);
    });

    return status;
  }
}

module.exports = ServiceManager;
