const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Service management
  startService: (serviceName) => ipcRenderer.invoke('start-service', serviceName),
  stopService: (serviceName) => ipcRenderer.invoke('stop-service', serviceName),
  getServiceStatus: (serviceName) => ipcRenderer.invoke('get-service-status', serviceName),
  
  // PHP version management
  getPhpVersions: () => ipcRenderer.invoke('get-php-versions'),
  setPhpVersion: (version) => ipcRenderer.invoke('set-php-version', version),
  
  // Legacy app installation (keep for compatibility)
  installApp: (appName) => ipcRenderer.invoke('install-app', appName),
  
  // Configuration
  openConfig: (configType) => ipcRenderer.invoke('open-config', configType),

  // Portable Server Manager
  checkInstallation: () => ipcRenderer.invoke('check-installation'),
  installComponent: (component) => ipcRenderer.invoke('install-component', component),
  installAllComponents: () => ipcRenderer.invoke('install-all-components'),

  // App Installer Manager
  getAvailableApps: () => ipcRenderer.invoke('get-available-apps'),
  installAppNew: (appId, projectName, options) => ipcRenderer.invoke('install-app-new', appId, projectName, options),
  getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
  uninstallApp: (projectName) => ipcRenderer.invoke('uninstall-app', projectName),

  // Config Editor Manager
  getAvailableConfigs: () => ipcRenderer.invoke('get-available-configs'),
  readConfig: (service, type) => ipcRenderer.invoke('read-config', service, type),
  writeConfig: (service, type, content, createBackup) => ipcRenderer.invoke('write-config', service, type, content, createBackup),
  createBackup: (service, type) => ipcRenderer.invoke('create-backup', service, type),
  restoreBackup: (service, type, backupFilename) => ipcRenderer.invoke('restore-backup', service, type, backupFilename),
  getBackups: (service, type) => ipcRenderer.invoke('get-backups', service, type),
  deleteBackup: (backupFilename) => ipcRenderer.invoke('delete-backup', backupFilename),
  testConfig: (service, type) => ipcRenderer.invoke('test-config', service, type),

  // Log Viewer Manager
  getAvailableLogs: () => ipcRenderer.invoke('get-available-logs'),
  readLog: (service, type, options) => ipcRenderer.invoke('read-log', service, type, options),
  watchLog: (service, type) => ipcRenderer.invoke('watch-log', service, type),
  stopWatchingLog: (service, type) => ipcRenderer.invoke('stop-watching-log', service, type),
  clearLog: (service, type) => ipcRenderer.invoke('clear-log', service, type),
  archiveLog: (service, type) => ipcRenderer.invoke('archive-log', service, type),
  getLogStats: (service, type) => ipcRenderer.invoke('get-log-stats', service, type),
  searchLogs: (services, query, options) => ipcRenderer.invoke('search-logs', services, query, options),

  // Event listeners for progress updates
  onInstallProgress: (callback) => ipcRenderer.on('install-progress', callback),
  onInstallAllProgress: (callback) => ipcRenderer.on('install-all-progress', callback),
  onAppInstallProgress: (callback) => ipcRenderer.on('app-install-progress', callback),
  onLogUpdate: (callback) => ipcRenderer.on('log-update', callback),
  onLogWatchError: (callback) => ipcRenderer.on('log-watch-error', callback),

  // Menu action event listeners
  onCreateNewProject: (callback) => ipcRenderer.on('create-new-project', callback),
  onViewLogs: (callback) => ipcRenderer.on('view-logs', callback),
  onInstallApp: (callback) => ipcRenderer.on('install-app', callback),
  onOpenConfig: (callback) => ipcRenderer.on('open-config', callback),

  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Additional service management
  startAllServices: () => ipcRenderer.invoke('start-all-services'),
  stopAllServices: () => ipcRenderer.invoke('stop-all-services'),
  
  // System utilities  
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  openPath: (path) => ipcRenderer.invoke('open-path', path),
  showInFolder: (path) => ipcRenderer.invoke('show-in-folder', path),
  
  // Utility functions
  platform: process.platform,
  versions: process.versions
});

// Log that preload script loaded
console.log('DevStackBox preload script loaded successfully');
