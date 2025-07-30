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
  
  // App installation
  installApp: (appName) => ipcRenderer.invoke('install-app', appName),
  
  // Configuration
  openConfig: (configType) => ipcRenderer.invoke('open-config', configType),
  
  // Utility functions
  platform: process.platform,
  versions: process.versions
});

// Log that preload script loaded
console.log('DevStackBox preload script loaded successfully');
