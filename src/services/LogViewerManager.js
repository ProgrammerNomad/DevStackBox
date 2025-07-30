const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * LogViewerManager - Manages viewing and monitoring of Apache, MySQL, PHP logs
 */
class LogViewerManager extends EventEmitter {
  constructor(appPath) {
    super();
    this.appPath = appPath;
    this.watchers = new Map();
    
    this.logPaths = {
      apache: {
        error: path.join(appPath, 'apache', 'logs', 'error.log'),
        access: path.join(appPath, 'apache', 'logs', 'access.log'),
        ssl_error: path.join(appPath, 'apache', 'logs', 'ssl_error.log'),
        ssl_access: path.join(appPath, 'apache', 'logs', 'ssl_access.log')
      },
      mysql: {
        error: path.join(appPath, 'mysql', 'data', 'mysql_error.log'),
        slow: path.join(appPath, 'mysql', 'data', 'mysql_slow.log'),
        general: path.join(appPath, 'mysql', 'data', 'mysql_general.log'),
        binary: path.join(appPath, 'mysql', 'data', 'mysql-bin.log')
      },
      php: {
        error: path.join(appPath, 'php', 'logs', 'php_error.log'),
        '8.1': path.join(appPath, 'php', '8.1', 'logs', 'php_error.log'),
        '8.2': path.join(appPath, 'php', '8.2', 'logs', 'php_error.log'),
        '8.3': path.join(appPath, 'php', '8.3', 'logs', 'php_error.log')
      },
      system: {
        devstackbox: path.join(appPath, 'logs', 'devstackbox.log'),
        services: path.join(appPath, 'logs', 'services.log')
      }
    };

    // Ensure log directories exist
    this.ensureLogDirectories();
  }

  /**
   * Ensure log directories exist
   */
  ensureLogDirectories() {
    const logDirs = [
      path.join(this.appPath, 'apache', 'logs'),
      path.join(this.appPath, 'mysql', 'data'),
      path.join(this.appPath, 'php', 'logs'),
      path.join(this.appPath, 'php', '8.1', 'logs'),
      path.join(this.appPath, 'php', '8.2', 'logs'),
      path.join(this.appPath, 'php', '8.3', 'logs'),
      path.join(this.appPath, 'logs')
    ];

    logDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get list of available log files
   */
  getAvailableLogs() {
    const logs = [];

    // Apache logs
    Object.keys(this.logPaths.apache).forEach(type => {
      const logPath = this.logPaths.apache[type];
      logs.push({
        service: 'apache',
        type: type,
        name: `Apache ${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Log`,
        path: logPath,
        exists: fs.existsSync(logPath),
        description: this.getLogDescription('apache', type)
      });
    });

    // MySQL logs
    Object.keys(this.logPaths.mysql).forEach(type => {
      const logPath = this.logPaths.mysql[type];
      logs.push({
        service: 'mysql',
        type: type,
        name: `MySQL ${type.charAt(0).toUpperCase() + type.slice(1)} Log`,
        path: logPath,
        exists: fs.existsSync(logPath),
        description: this.getLogDescription('mysql', type)
      });
    });

    // PHP logs
    Object.keys(this.logPaths.php).forEach(type => {
      const logPath = this.logPaths.php[type];
      const name = type.match(/\d\.\d/) ? `PHP ${type} Error Log` : `PHP ${type.charAt(0).toUpperCase() + type.slice(1)} Log`;
      logs.push({
        service: 'php',
        type: type,
        name: name,
        path: logPath,
        exists: fs.existsSync(logPath),
        description: this.getLogDescription('php', type)
      });
    });

    // System logs
    Object.keys(this.logPaths.system).forEach(type => {
      const logPath = this.logPaths.system[type];
      logs.push({
        service: 'system',
        type: type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Log`,
        path: logPath,
        exists: fs.existsSync(logPath),
        description: this.getLogDescription('system', type)
      });
    });

    return logs.filter(log => log.exists);
  }

  /**
   * Get log description
   */
  getLogDescription(service, type) {
    const descriptions = {
      apache: {
        error: 'Apache server errors and warnings',
        access: 'HTTP requests and responses',
        ssl_error: 'SSL/HTTPS related errors',
        ssl_access: 'HTTPS requests and responses'
      },
      mysql: {
        error: 'MySQL server errors and startup issues',
        slow: 'Slow queries that exceed slow_query_log_time',
        general: 'All SQL statements and connections',
        binary: 'Binary log for replication and recovery'
      },
      php: {
        error: 'PHP errors and warnings for all versions',
        '8.1': 'PHP 8.1 specific errors and warnings',
        '8.2': 'PHP 8.2 specific errors and warnings',
        '8.3': 'PHP 8.3 specific errors and warnings'
      },
      system: {
        devstackbox: 'DevStackBox application logs',
        services: 'Service management operations'
      }
    };

    return descriptions[service] && descriptions[service][type] ? descriptions[service][type] : 'Log file';
  }

  /**
   * Read log file content
   */
  async readLog(service, type, options = {}) {
    const logPath = this.getLogPath(service, type);
    
    if (!fs.existsSync(logPath)) {
      return {
        content: '',
        lines: [],
        size: 0,
        lastModified: null,
        message: 'Log file does not exist'
      };
    }

    try {
      const stats = fs.statSync(logPath);
      const {
        lines = 100,
        tail = true,
        filter = null,
        level = null
      } = options;

      let content = fs.readFileSync(logPath, 'utf8');
      let logLines = content.split('\n').filter(line => line.trim());

      // Apply filters
      if (filter) {
        logLines = logLines.filter(line => 
          line.toLowerCase().includes(filter.toLowerCase())
        );
      }

      if (level) {
        logLines = logLines.filter(line => 
          this.matchesLogLevel(line, level)
        );
      }

      // Get specified number of lines
      if (tail) {
        logLines = logLines.slice(-lines);
      } else {
        logLines = logLines.slice(0, lines);
      }

      // Parse log entries
      const parsedLines = logLines.map((line, index) => 
        this.parseLogLine(service, line, index)
      );

      return {
        content: logLines.join('\n'),
        lines: parsedLines,
        size: stats.size,
        lastModified: stats.mtime,
        totalLines: content.split('\n').length,
        filteredLines: logLines.length
      };

    } catch (error) {
      throw new Error(`Failed to read log file: ${error.message}`);
    }
  }

  /**
   * Get log file path
   */
  getLogPath(service, type) {
    if (service === 'php' && type.match(/\d\.\d/)) {
      return this.logPaths.php[type];
    }
    return this.logPaths[service][type];
  }

  /**
   * Parse log line into structured data
   */
  parseLogLine(service, line, index) {
    const parsed = {
      id: index,
      raw: line,
      timestamp: null,
      level: 'info',
      message: line,
      source: service
    };

    switch (service) {
      case 'apache':
        return this.parseApacheLogLine(line, parsed);
      case 'mysql':
        return this.parseMySQLLogLine(line, parsed);
      case 'php':
        return this.parsePHPLogLine(line, parsed);
      default:
        return parsed;
    }
  }

  /**
   * Parse Apache log line
   */
  parseApacheLogLine(line, parsed) {
    // Apache error log format: [timestamp] [level] [pid] message
    const errorLogMatch = line.match(/^\[([^\]]+)\] \[([^\]]+)\] \[pid (\d+)\] (.+)$/);
    if (errorLogMatch) {
      parsed.timestamp = new Date(errorLogMatch[1]);
      parsed.level = errorLogMatch[2].toLowerCase();
      parsed.pid = errorLogMatch[3];
      parsed.message = errorLogMatch[4];
      return parsed;
    }

    // Apache access log format: IP - - [timestamp] "request" status size
    const accessLogMatch = line.match(/^(\S+) \S+ \S+ \[([^\]]+)\] "([^"]*)" (\d+) (\S+)/);
    if (accessLogMatch) {
      parsed.ip = accessLogMatch[1];
      parsed.timestamp = new Date(accessLogMatch[2]);
      parsed.request = accessLogMatch[3];
      parsed.status = parseInt(accessLogMatch[4]);
      parsed.size = accessLogMatch[5];
      parsed.level = parsed.status >= 400 ? 'error' : (parsed.status >= 300 ? 'warn' : 'info');
      parsed.message = `${parsed.request} - ${parsed.status}`;
      return parsed;
    }

    return parsed;
  }

  /**
   * Parse MySQL log line
   */
  parseMySQLLogLine(line, parsed) {
    // MySQL error log format: timestamp [level] message
    const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z) \[([^\]]+)\] (.+)$/);
    if (match) {
      parsed.timestamp = new Date(match[1]);
      parsed.level = match[2].toLowerCase();
      parsed.message = match[3];
    }

    return parsed;
  }

  /**
   * Parse PHP log line
   */
  parsePHPLogLine(line, parsed) {
    // PHP error log format: [timestamp] PHP level: message in file on line
    const match = line.match(/^\[([^\]]+)\] PHP (.*?): (.+)$/);
    if (match) {
      parsed.timestamp = new Date(match[1]);
      parsed.level = match[2].toLowerCase().includes('error') ? 'error' : 
                    match[2].toLowerCase().includes('warning') ? 'warn' : 'info';
      parsed.message = match[3];
    }

    return parsed;
  }

  /**
   * Check if log line matches specified level
   */
  matchesLogLevel(line, level) {
    const lowerLine = line.toLowerCase();
    switch (level.toLowerCase()) {
      case 'error':
        return lowerLine.includes('error') || lowerLine.includes('fatal');
      case 'warn':
      case 'warning':
        return lowerLine.includes('warn');
      case 'info':
        return lowerLine.includes('info') || lowerLine.includes('notice');
      case 'debug':
        return lowerLine.includes('debug');
      default:
        return true;
    }
  }

  /**
   * Watch log file for changes
   */
  watchLog(service, type, callback) {
    const logPath = this.getLogPath(service, type);
    const watchKey = `${service}-${type}`;

    if (!fs.existsSync(logPath)) {
      // Create empty log file if it doesn't exist
      fs.writeFileSync(logPath, '');
    }

    // Stop existing watcher if any
    this.stopWatching(service, type);

    try {
      const watcher = fs.watchFile(logPath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
          // File was modified, read new content
          this.readLog(service, type, { lines: 10, tail: true })
            .then(result => {
              callback(null, {
                type: 'update',
                service,
                logType: type,
                newLines: result.lines,
                size: result.size,
                lastModified: result.lastModified
              });
            })
            .catch(error => {
              callback(error);
            });
        }
      });

      this.watchers.set(watchKey, { watcher, path: logPath });
      
      // Emit event
      this.emit('watchStarted', { service, type, path: logPath });

    } catch (error) {
      throw new Error(`Failed to watch log file: ${error.message}`);
    }
  }

  /**
   * Stop watching a log file
   */
  stopWatching(service, type) {
    const watchKey = `${service}-${type}`;
    const watchInfo = this.watchers.get(watchKey);

    if (watchInfo) {
      fs.unwatchFile(watchInfo.path);
      this.watchers.delete(watchKey);
      this.emit('watchStopped', { service, type });
    }
  }

  /**
   * Stop watching all log files
   */
  stopAllWatching() {
    for (const [watchKey, watchInfo] of this.watchers) {
      fs.unwatchFile(watchInfo.path);
    }
    this.watchers.clear();
    this.emit('allWatchesStopped');
  }

  /**
   * Clear log file
   */
  async clearLog(service, type) {
    const logPath = this.getLogPath(service, type);

    if (!fs.existsSync(logPath)) {
      return { success: true, message: 'Log file does not exist' };
    }

    try {
      fs.writeFileSync(logPath, '');
      return {
        success: true,
        message: 'Log file cleared successfully',
        path: logPath
      };
    } catch (error) {
      throw new Error(`Failed to clear log file: ${error.message}`);
    }
  }

  /**
   * Archive log file
   */
  async archiveLog(service, type) {
    const logPath = this.getLogPath(service, type);

    if (!fs.existsSync(logPath)) {
      throw new Error('Log file does not exist');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = logPath.replace(/\.log$/, `-${timestamp}.log`);

    try {
      fs.copyFileSync(logPath, archivePath);
      fs.writeFileSync(logPath, '');

      return {
        success: true,
        message: 'Log file archived successfully',
        originalPath: logPath,
        archivePath: archivePath
      };
    } catch (error) {
      throw new Error(`Failed to archive log file: ${error.message}`);
    }
  }

  /**
   * Get log file statistics
   */
  async getLogStats(service, type) {
    const logPath = this.getLogPath(service, type);

    if (!fs.existsSync(logPath)) {
      return {
        exists: false,
        size: 0,
        lines: 0,
        lastModified: null
      };
    }

    try {
      const stats = fs.statSync(logPath);
      const content = fs.readFileSync(logPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim()).length;

      // Count log levels
      const logLines = content.split('\n');
      const levelCounts = {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0
      };

      logLines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('error') || lowerLine.includes('fatal')) {
          levelCounts.error++;
        } else if (lowerLine.includes('warn')) {
          levelCounts.warn++;
        } else if (lowerLine.includes('info') || lowerLine.includes('notice')) {
          levelCounts.info++;
        } else if (lowerLine.includes('debug')) {
          levelCounts.debug++;
        }
      });

      return {
        exists: true,
        size: stats.size,
        lines: lines,
        lastModified: stats.mtime,
        created: stats.birthtime,
        levelCounts: levelCounts,
        path: logPath
      };
    } catch (error) {
      throw new Error(`Failed to get log statistics: ${error.message}`);
    }
  }

  /**
   * Search log files
   */
  async searchLogs(services, query, options = {}) {
    const {
      caseSensitive = false,
      regex = false,
      maxResults = 100,
      level = null
    } = options;

    const results = [];
    const searchPattern = regex ? new RegExp(query, caseSensitive ? 'g' : 'gi') : null;

    for (const service of services) {
      const serviceLogs = this.getAvailableLogs().filter(log => log.service === service);

      for (const log of serviceLogs) {
        try {
          const logData = await this.readLog(service, log.type, { lines: 1000 });
          
          for (const line of logData.lines) {
            let matches = false;

            if (regex && searchPattern) {
              matches = searchPattern.test(line.message);
            } else {
              const searchText = caseSensitive ? line.message : line.message.toLowerCase();
              const searchQuery = caseSensitive ? query : query.toLowerCase();
              matches = searchText.includes(searchQuery);
            }

            if (matches && (!level || line.level === level)) {
              results.push({
                service: service,
                logType: log.type,
                line: line,
                file: log.path
              });

              if (results.length >= maxResults) {
                return results;
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to search log ${service}/${log.type}: ${error.message}`);
        }
      }
    }

    return results;
  }

  /**
   * Write to DevStackBox application log
   */
  writeLog(message, level = 'info') {
    const logPath = this.logPaths.system.devstackbox;
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    try {
      fs.appendFileSync(logPath, logEntry);
    } catch (error) {
      console.error('Failed to write to application log:', error);
    }
  }

  /**
   * Write to services log
   */
  writeServiceLog(service, action, message, level = 'info') {
    const logPath = this.logPaths.system.services;
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${service}] ${action}: ${message}\n`;

    try {
      fs.appendFileSync(logPath, logEntry);
    } catch (error) {
      console.error('Failed to write to services log:', error);
    }
  }

  /**
   * Cleanup - stop all watchers
   */
  cleanup() {
    this.stopAllWatching();
  }
}

module.exports = LogViewerManager;
