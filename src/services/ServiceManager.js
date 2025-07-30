const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * ServiceManager - Manages Apache, MySQL, and PHP services for DevStackBox
 */
class ServiceManager {
  constructor(appPath) {
    this.appPath = appPath;
    
    // Check if we can use existing XAMPP installation as fallback
    const xamppPath = 'C:\\xampp';
    const useXamppFallback = require('fs').existsSync(xamppPath);
    
    this.services = {
      apache: {
        name: 'Apache',
        executable: useXamppFallback 
          ? path.join(xamppPath, 'apache', 'bin', 'httpd.exe')
          : path.join(appPath, 'apache', 'bin', 'httpd.exe'),
        processName: 'httpd.exe',
        defaultPort: 80,
        configPath: useXamppFallback
          ? path.join(xamppPath, 'apache', 'conf', 'httpd.conf')
          : path.join(appPath, 'apache', 'conf', 'httpd.conf'),
        fallbackMode: useXamppFallback
      },
      mysql: {
        name: 'MySQL',
        executable: useXamppFallback
          ? path.join(xamppPath, 'mysql', 'bin', 'mysqld.exe')
          : path.join(appPath, 'mysql', 'bin', 'mysqld.exe'),
        processName: 'mysqld.exe',
        defaultPort: 3306,
        configPath: useXamppFallback
          ? path.join(xamppPath, 'mysql', 'bin', 'my.ini')
          : path.join(appPath, 'mysql', 'my.ini'),
        fallbackMode: useXamppFallback
      }
    };
    
    this.runningProcesses = new Map();
    
    if (useXamppFallback) {
      console.log('DevStackBox: Using existing XAMPP installation as fallback');
    }
  }

  /**
   * Start a service
   */
  async startService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    // Check if already running
    const isRunning = await this.isServiceRunning(serviceName);
    if (isRunning) {
      return {
        success: true,
        message: `${service.name} is already running`,
        alreadyRunning: true
      };
    }

    // Check if executable exists
    if (!fs.existsSync(service.executable)) {
      throw new Error(`Service executable not found: ${service.executable}`);
    }

    try {
      const args = this.getServiceArgs(serviceName);
      const options = this.getServiceOptions(serviceName);
      
      const childProcess = spawn(service.executable, args, options);
      
      // Store process reference
      this.runningProcesses.set(serviceName, childProcess);
      
      // Handle process events
      childProcess.on('error', (error) => {
        console.error(`${service.name} process error:`, error);
        this.runningProcesses.delete(serviceName);
      });
      
      childProcess.on('exit', (code, signal) => {
        console.log(`${service.name} process exited with code ${code}, signal ${signal}`);
        this.runningProcesses.delete(serviceName);
      });
      
      // Give the service time to start
      await this.waitForService(serviceName, 5000);
      
      return {
        success: true,
        message: `${service.name} started successfully`,
        pid: childProcess.pid,
        port: service.defaultPort
      };
      
    } catch (error) {
      this.runningProcesses.delete(serviceName);
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

    try {
      // Try graceful shutdown first
      const managedProcess = this.runningProcesses.get(serviceName);
      if (managedProcess && !managedProcess.killed) {
        managedProcess.kill('SIGTERM');
        
        // Wait a bit for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Force kill if still running
      const isRunning = await this.isServiceRunning(serviceName);
      if (isRunning) {
        if (process.platform === 'win32') {
          await execAsync(`taskkill /F /IM ${service.processName}`);
        } else {
          await execAsync(`pkill -f ${service.processName}`);
        }
      }

      this.runningProcesses.delete(serviceName);

      return {
        success: true,
        message: `${service.name} stopped successfully`
      };

    } catch (error) {
      // If the error is because the process wasn't found, that's actually success
      if (error.message.includes('not found') || error.message.includes('No such process')) {
        this.runningProcesses.delete(serviceName);
        return {
          success: true,
          message: `${service.name} was not running`
        };
      }
      
      throw new Error(`Failed to stop ${service.name}: ${error.message}`);
    }
  }

  /**
   * Check if a service is running
   */
  async isServiceRunning(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      return false;
    }

    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync(`tasklist /FI "IMAGENAME eq ${service.processName}"`);
        return stdout.includes(service.processName);
      } else {
        const { stdout } = await execAsync(`pgrep -f ${service.processName}`);
        return stdout.trim().length > 0;
      }
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
      return { running: false, error: 'Unknown service' };
    }

    const isRunning = await this.isServiceRunning(serviceName);
    const managedProcess = this.runningProcesses.get(serviceName);
    
    return {
      running: isRunning,
      service: serviceName,
      name: service.name,
      port: service.defaultPort,
      pid: managedProcess?.pid || null,
      managed: !!managedProcess
    };
  }

  /**
   * Get status of all services
   */
  async getAllServiceStatus() {
    const statuses = {};
    
    for (const serviceName of Object.keys(this.services)) {
      statuses[serviceName] = await this.getServiceStatus(serviceName);
    }
    
    return statuses;
  }

  /**
   * Stop all services
   */
  async stopAllServices() {
    const results = {};
    
    for (const serviceName of Object.keys(this.services)) {
      try {
        results[serviceName] = await this.stopService(serviceName);
      } catch (error) {
        results[serviceName] = {
          success: false,
          error: error.message
        };
      }
    }
    
    return results;
  }

  /**
   * Get service-specific arguments
   */
  getServiceArgs(serviceName) {
    switch (serviceName) {
      case 'apache':
        return ['-D', 'FOREGROUND'];
      case 'mysql':
        return ['--console'];
      default:
        return [];
    }
  }

  /**
   * Get service-specific spawn options
   */
  getServiceOptions(serviceName) {
    const baseOptions = {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    };

    switch (serviceName) {
      case 'apache':
        return {
          ...baseOptions,
          cwd: path.join(this.appPath, 'apache')
        };
      case 'mysql':
        return {
          ...baseOptions,
          cwd: path.join(this.appPath, 'mysql')
        };
      default:
        return baseOptions;
    }
  }

  /**
   * Wait for service to start
   */
  async waitForService(serviceName, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const isRunning = await this.isServiceRunning(serviceName);
      if (isRunning) {
        return true;
      }
      
      // Wait 500ms before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    throw new Error(`Service ${serviceName} failed to start within ${timeout}ms`);
  }

  /**
   * Get service configuration path
   */
  getConfigPath(serviceName) {
    const service = this.services[serviceName];
    return service ? service.configPath : null;
  }

  /**
   * Check if service files exist
   */
  checkServiceFiles(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      return { valid: false, error: 'Unknown service' };
    }

    const checks = {
      executable: fs.existsSync(service.executable),
      config: fs.existsSync(service.configPath)
    };

    return {
      valid: Object.values(checks).every(Boolean),
      checks,
      service: service.name
    };
  }
}

module.exports = ServiceManager;
