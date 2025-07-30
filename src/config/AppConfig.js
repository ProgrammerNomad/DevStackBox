/**
 * DevStackBox Configuration
 * Manages different environments and settings
 */

const path = require('path');
const fs = require('fs');

class AppConfig {
  constructor() {
    this.isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
    this.appPath = __dirname;
    
    // Detect available service sources
    this.detectServiceSources();
  }

  detectServiceSources() {
    const xamppPath = 'C:\\xampp';
    const xamppExists = fs.existsSync(xamppPath);
    
    this.serviceSources = {
      xampp: {
        available: xamppExists,
        path: xamppPath,
        priority: 1 // Lower number = higher priority
      },
      portable: {
        available: this.checkPortableServices(),
        path: this.appPath,
        priority: 2
      }
    };
    
    console.log('DevStackBox Config:', {
      isDev: this.isDev,
      xamppAvailable: xamppExists,
      portableAvailable: this.serviceSources.portable.available
    });
  }

  checkPortableServices() {
    const requiredPaths = [
      path.join(this.appPath, 'apache', 'bin', 'httpd.exe'),
      path.join(this.appPath, 'mysql', 'bin', 'mysqld.exe')
    ];
    
    return requiredPaths.every(p => fs.existsSync(p));
  }

  getServiceConfig(serviceName) {
    // Use the highest priority available source
    const availableSources = Object.entries(this.serviceSources)
      .filter(([_, config]) => config.available)
      .sort((a, b) => a[1].priority - b[1].priority);
    
    if (availableSources.length === 0) {
      throw new Error('No service sources available');
    }
    
    const [sourceType, sourceConfig] = availableSources[0];
    
    const configs = {
      apache: {
        xampp: {
          executable: path.join(sourceConfig.path, 'apache', 'bin', 'httpd.exe'),
          configPath: path.join(sourceConfig.path, 'apache', 'conf', 'httpd.conf'),
          documentRoot: path.join(sourceConfig.path, 'htdocs')
        },
        portable: {
          executable: path.join(sourceConfig.path, 'apache', 'bin', 'httpd.exe'),
          configPath: path.join(sourceConfig.path, 'apache', 'conf', 'httpd.conf'),
          documentRoot: path.join(sourceConfig.path, 'www')
        }
      },
      mysql: {
        xampp: {
          executable: path.join(sourceConfig.path, 'mysql', 'bin', 'mysqld.exe'),
          configPath: path.join(sourceConfig.path, 'mysql', 'bin', 'my.ini'),
          dataDir: path.join(sourceConfig.path, 'mysql', 'data')
        },
        portable: {
          executable: path.join(sourceConfig.path, 'mysql', 'bin', 'mysqld.exe'),
          configPath: path.join(sourceConfig.path, 'mysql', 'my.ini'),
          dataDir: path.join(sourceConfig.path, 'mysql', 'data')
        }
      }
    };
    
    return {
      ...configs[serviceName][sourceType],
      source: sourceType,
      name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
      processName: serviceName === 'apache' ? 'httpd.exe' : 'mysqld.exe',
      defaultPort: serviceName === 'apache' ? 80 : 3306
    };
  }

  getWebRoot() {
    const apacheConfig = this.getServiceConfig('apache');
    return apacheConfig.documentRoot;
  }

  isPortable() {
    return this.serviceSources.portable.available;
  }
}

module.exports = AppConfig;
