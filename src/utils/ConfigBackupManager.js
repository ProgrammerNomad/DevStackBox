const fs = require('fs').promises;
const path = require('path');

/**
 * ConfigBackupManager - Creates backups of configuration files before modification
 */
class ConfigBackupManager {
  constructor(appPath) {
    this.appPath = appPath;
    this.backupDir = path.join(appPath, 'config-backups');
  }

  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      return true;
    } catch (error) {
      console.error('Failed to create backup directory:', error);
      return false;
    }
  }

  async createBackup(configFilePath, serviceName = '') {
    try {
      await this.ensureBackupDirectory();
      
      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const originalFilename = path.basename(configFilePath);
      const backupFilename = `${serviceName}_${originalFilename}_${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupFilename);
      
      // Read original file and create backup
      const originalContent = await fs.readFile(configFilePath, 'utf8');
      await fs.writeFile(backupPath, originalContent, 'utf8');
      
      console.log(`✅ Backup created: ${backupFilename}`);
      return backupPath;
    } catch (error) {
      console.error(`❌ Failed to create backup for ${configFilePath}:`, error);
      return null;
    }
  }

  async createAllBackups() {
    console.log('🔄 Creating configuration backups...');
    
    const configFiles = [
      { 
        path: path.join(this.appPath, 'apache', 'conf', 'httpd.conf'), 
        service: 'apache' 
      },
      { 
        path: path.join(this.appPath, 'php', '8.2', 'php.ini'), 
        service: 'php82' 
      },
      { 
        path: path.join(this.appPath, 'mysql', 'my.ini'), 
        service: 'mysql' 
      },
      { 
        path: path.join(this.appPath, 'phpmyadmin', 'config.inc.php'), 
        service: 'phpmyadmin' 
      }
    ];

    const backupResults = [];
    
    for (const config of configFiles) {
      try {
        // Check if file exists before attempting backup
        await fs.access(config.path);
        const backupPath = await this.createBackup(config.path, config.service);
        backupResults.push({
          original: config.path,
          backup: backupPath,
          success: backupPath !== null
        });
      } catch (error) {
        console.log(`ℹ️  Config file not found (skipping): ${config.path}`);
        backupResults.push({
          original: config.path,
          backup: null,
          success: false,
          reason: 'File not found'
        });
      }
    }

    return backupResults;
  }

  async restoreBackup(backupPath, originalPath) {
    try {
      const backupContent = await fs.readFile(backupPath, 'utf8');
      await fs.writeFile(originalPath, backupContent, 'utf8');
      console.log(`✅ Restored backup: ${originalPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to restore backup:`, error);
      return false;
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.endsWith('.backup'));
      
      const backups = [];
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        backups.push({
          filename: file,
          path: filePath,
          created: stats.mtime,
          size: stats.size
        });
      }
      
      return backups.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }
}

module.exports = ConfigBackupManager;
