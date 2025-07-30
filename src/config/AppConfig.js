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
    // Only use portable servers - no external dependencies
    this.serviceSources = {
      portable: {
        available: this.checkPortableServices(),
        path: this.appPath,
        priority: 1
      }
    };
    
    console.log('DevStackBox Config:', {
      isDev: this.isDev,
      portableAvailable: this.serviceSources.portable.available,
      mode: 'portable-only'
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
    // Use only portable configuration
    if (!this.serviceSources.portable.available) {
      throw new Error('Portable servers not installed. Please download server binaries first.');
    }
    
    const sourceConfig = this.serviceSources.portable;
    
    const configs = {
      apache: {
        executable: path.join(sourceConfig.path, 'apache', 'bin', 'httpd.exe'),
        configPath: path.join(sourceConfig.path, 'apache', 'conf', 'httpd.conf'),
        documentRoot: path.join(sourceConfig.path, 'www')
      },
      mysql: {
        executable: path.join(sourceConfig.path, 'mysql', 'bin', 'mysqld.exe'),
        configPath: path.join(sourceConfig.path, 'mysql', 'my.ini'),
        dataDir: path.join(sourceConfig.path, 'mysql', 'data')
      }
    };
    
    return {
      ...configs[serviceName],
      source: 'portable',
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
