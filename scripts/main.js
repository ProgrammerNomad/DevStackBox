// DevStackBox Main JavaScript
class DevStackBox {
  constructor() {
    this.services = ['apache', 'mysql'];
    this.currentPhpVersion = null;
    this.init();
  }

  async init() {
    console.log('Initializing DevStackBox...');
    
    // Check if electronAPI is available
    if (typeof window.electronAPI === 'undefined') {
      console.error('Electron API not available');
      this.showError('Application not properly loaded. Please restart.');
      return;
    }

    this.setupEventListeners();
    await this.loadInitialData();
    this.startStatusPolling();
    
    console.log('DevStackBox initialized successfully');
  }

  setupEventListeners() {
    // Service control buttons
    document.querySelectorAll('.start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const service = e.target.dataset.service;
        this.startService(service);
      });
    });

    document.querySelectorAll('.stop-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const service = e.target.dataset.service;
        this.stopService(service);
      });
    });

    // Configuration buttons
    document.querySelectorAll('.config-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const config = e.target.dataset.config;
        this.openConfig(config);
      });
    });

    // Menu event handlers from main process
    window.electronAPI.onNotification((event, data) => {
      this.showNotification(data.message, data.type);
    });

    // Listen for menu actions from main process via IPC events
    window.electronAPI.onCreateNewProject(() => {
      this.showProjectCreationDialog();
    });

    window.electronAPI.onViewLogs((event, service) => {
      this.openLogViewer(service);
    });

    window.electronAPI.onInstallApp((event, appName) => {
      this.showAppInstallDialog(appName);
    });

    window.electronAPI.onOpenConfig((event, configType) => {
      this.openConfigEditor(configType);
    });

    // PHP version switching
    const switchPhpBtn = document.getElementById('switchPhpBtn');
    if (switchPhpBtn) {
      switchPhpBtn.addEventListener('click', () => {
        this.switchPhpVersion();
      });
    }

    // Quick action buttons
    const quickActions = {
      'openPhpMyAdmin': () => this.openUrl('http://localhost/phpmyadmin'),
      'openWebRoot': () => this.openWebRoot(),
      'viewLogs': () => this.viewLogs(),
      'installWordPress': () => this.installApp('wordpress'),
      'phpInfoBtn': () => this.showPhpInfo()
    };

    Object.entries(quickActions).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('click', handler);
      }
    });

    // App installer buttons
    document.querySelectorAll('.install-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const app = e.target.dataset.app;
        this.installApp(app);
      });
    });

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openSettings();
      });
    }
  }

  async loadInitialData() {
    try {
      // Check portable server installation status
      await this.checkPortableServers();
      
      // Load PHP versions
      await this.loadPhpVersions();
      
      // Check initial service status
      await this.updateAllServiceStatus();
      
      // Update system info
      this.updateSystemInfo();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showError('Failed to load application data');
    }
  }

  async checkPortableServers() {
    try {
      const status = await window.electronAPI.checkInstallation();
      const allInstalled = Object.values(status).every(installed => installed);
      
      const banner = document.getElementById('installationBanner');
      if (!allInstalled) {
        // Show installation banner
        banner.style.display = 'block';
        
        // Set up download button
        const downloadBtn = document.getElementById('downloadServersBtn');
        downloadBtn.addEventListener('click', async () => {
          this.showInfo('Starting portable server downloads...');
          banner.style.display = 'none';
          
          try {
            await window.electronAPI.installAllComponents();
            this.showSuccess('All portable servers installed successfully!');
          } catch (error) {
            this.showError(`Failed to install servers: ${error.message}`);
            banner.style.display = 'block'; // Show banner again
          }
        });
      } else {
        banner.style.display = 'none';
        console.log('✅ All portable servers are installed');
      }
    } catch (error) {
      console.error('Failed to check portable servers:', error);
      // Show banner if we can't check
      const banner = document.getElementById('installationBanner');
      banner.style.display = 'block';
    }
  }

  async loadPhpVersions() {
    try {
      const versions = await window.electronAPI.getPhpVersions();
      const select = document.getElementById('phpVersion');
      
      if (select) {
        select.innerHTML = '';
        
        if (versions.length === 0) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No PHP versions found';
          select.appendChild(option);
        } else {
          versions.forEach(version => {
            const option = document.createElement('option');
            option.value = version;
            option.textContent = `PHP ${version}`;
            select.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Error loading PHP versions:', error);
    }
  }

  async startService(serviceName) {
    try {
      this.showLoading(`Starting ${serviceName}...`);
      
      const result = await window.electronAPI.startService(serviceName);
      
      if (result.success) {
        this.showSuccess(result.message);
        await this.updateServiceStatus(serviceName);
      } else {
        this.showError(result.error || `Failed to start ${serviceName}`);
      }
    } catch (error) {
      console.error(`Error starting ${serviceName}:`, error);
      this.showError(`Failed to start ${serviceName}: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  async stopService(serviceName) {
    try {
      this.showLoading(`Stopping ${serviceName}...`);
      
      const result = await window.electronAPI.stopService(serviceName);
      
      if (result.success) {
        this.showSuccess(result.message);
        await this.updateServiceStatus(serviceName);
      } else {
        this.showError(result.error || `Failed to stop ${serviceName}`);
      }
    } catch (error) {
      console.error(`Error stopping ${serviceName}:`, error);
      this.showError(`Failed to stop ${serviceName}: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  async updateServiceStatus(serviceName) {
    try {
      const status = await window.electronAPI.getServiceStatus(serviceName);
      this.updateServiceUI(serviceName, status.running);
    } catch (error) {
      console.error(`Error checking ${serviceName} status:`, error);
    }
  }

  async updateAllServiceStatus() {
    for (const service of this.services) {
      await this.updateServiceStatus(service);
    }
  }

  updateServiceUI(serviceName, isRunning) {
    // Update status indicator
    const statusIndicator = document.getElementById(`${serviceName}-status`);
    const statusDot = statusIndicator?.querySelector('.status-dot');
    
    if (statusIndicator && statusDot) {
      statusDot.className = `status-dot ${isRunning ? 'running' : 'stopped'}`;
      statusIndicator.childNodes[2].textContent = isRunning ? 'Running' : 'Stopped';
    }

    // Update buttons
    const serviceCard = document.querySelector(`[data-service="${serviceName}"]`);
    if (serviceCard) {
      const startBtn = serviceCard.querySelector('.start-btn');
      const stopBtn = serviceCard.querySelector('.stop-btn');
      
      if (startBtn && stopBtn) {
        startBtn.disabled = isRunning;
        stopBtn.disabled = !isRunning;
      }
    }

    // Update footer status
    const footerStatus = document.getElementById(`footer-${serviceName}-status`);
    if (footerStatus) {
      footerStatus.textContent = isRunning ? 'Running' : 'Stopped';
      footerStatus.style.color = isRunning ? 'var(--success-color)' : 'var(--danger-color)';
    }
  }

  async switchPhpVersion() {
    const select = document.getElementById('phpVersion');
    const version = select?.value;
    
    if (!version) {
      this.showError('Please select a PHP version');
      return;
    }

    try {
      this.showLoading(`Switching to PHP ${version}...`);
      
      const result = await window.electronAPI.setPhpVersion(version);
      
      if (result.success) {
        this.currentPhpVersion = version;
        this.updateCurrentPhpVersion(version);
        this.showSuccess(result.message);
      } else {
        this.showError(result.error || 'Failed to switch PHP version');
      }
    } catch (error) {
      console.error('Error switching PHP version:', error);
      this.showError(`Failed to switch PHP version: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  updateCurrentPhpVersion(version) {
    const currentVersionElement = document.getElementById('currentPhpVersion');
    if (currentVersionElement) {
      currentVersionElement.textContent = `PHP ${version}`;
    }
  }

  async installApp(appName) {
    try {
      this.showLoading(`Installing ${appName}...`);
      
      const result = await window.electronAPI.installApp(appName);
      
      if (result.success) {
        this.showSuccess(result.message);
      } else {
        this.showError(result.error || `Failed to install ${appName}`);
      }
    } catch (error) {
      console.error(`Error installing ${appName}:`, error);
      this.showError(`Failed to install ${appName}: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  async openConfig(configType) {
    try {
      const result = await window.electronAPI.openConfig(configType);
      
      if (result.success) {
        this.showSuccess(`Opened ${configType} configuration`);
      } else {
        this.showError(result.error || `Failed to open ${configType} config`);
      }
    } catch (error) {
      console.error(`Error opening ${configType} config:`, error);
      this.showError(`Failed to open ${configType} config: ${error.message}`);
    }
  }

  openUrl(url) {
    // This would typically use shell.openExternal in the main process
    console.log(`Opening URL: ${url}`);
    this.showInfo(`Opening ${url}...`);
  }

  openWebRoot() {
    console.log('Opening web root directory...');
    this.showInfo('Opening web root directory...');
  }

  viewLogs() {
    console.log('Opening logs viewer...');
    this.showInfo('Opening logs viewer...');
  }

  showPhpInfo() {
    console.log('Showing PHP info...');
    this.showInfo('Opening PHP info...');
  }

  openSettings() {
    console.log('Opening settings...');
    this.showInfo('Opening settings...');
  }

  startStatusPolling() {
    // Poll service status every 10 seconds
    setInterval(() => {
      this.updateAllServiceStatus();
    }, 10000);
  }

  updateSystemInfo() {
    const systemInfo = document.getElementById('systemInfo');
    if (systemInfo && window.electronAPI) {
      const platform = window.electronAPI.platform;
      const nodeVersion = window.electronAPI.versions?.node;
      systemInfo.textContent = `${platform} | Node.js ${nodeVersion || 'Unknown'}`;
    }
  }

  // UI Helper Methods
  showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    
    if (overlay && text) {
      text.textContent = message;
      overlay.classList.add('show');
    }
  }

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }

  showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 400px;
          animation: slideInRight 0.3s ease;
        }
        
        .notification-success {
          background-color: var(--success-color);
          color: white;
        }
        
        .notification-error {
          background-color: var(--danger-color);
          color: white;
        }
        
        .notification-info {
          background-color: var(--primary-color);
          color: white;
        }
        
        .notification button {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showInfo(message) {
    this.showNotification(message, 'info');
  }

  // Menu action handlers
  async showProjectCreationDialog() {
    const projectName = prompt('Enter project name:');
    if (projectName) {
      try {
        this.showInfo('Creating project...');
        // You can customize this to show a proper dialog later
        const result = await window.electronAPI.createProject(projectName, 'basic');
        this.showSuccess(`Project "${projectName}" created successfully!`);
      } catch (error) {
        this.showError(`Failed to create project: ${error.message}`);
      }
    }
  }

  async openLogViewer(service) {
    try {
      this.showInfo(`Opening ${service} logs...`);
      const logs = await window.electronAPI.getLogs(service, 100);
      this.showLogViewerWindow(service, logs);
    } catch (error) {
      this.showError(`Failed to open logs: ${error.message}`);
    }
  }

  showLogViewerWindow(service, logs) {
    // Create a modal window for log viewing
    const modal = document.createElement('div');
    modal.className = 'log-viewer-modal';
    modal.innerHTML = `
      <div class="log-viewer-content">
        <div class="log-viewer-header">
          <h3>${service.toUpperCase()} Logs</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="log-viewer-body">
          <pre id="log-content">${logs}</pre>
        </div>
        <div class="log-viewer-footer">
          <button class="btn btn-secondary" id="refreshLogs">Refresh</button>
          <button class="btn btn-secondary" id="clearLogs">Clear</button>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .log-viewer-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .log-viewer-content {
        background: #1e1e1e;
        border-radius: 8px;
        width: 80%;
        height: 70%;
        display: flex;
        flex-direction: column;
      }
      .log-viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #333;
        color: white;
      }
      .log-viewer-body {
        flex: 1;
        overflow: auto;
        padding: 15px;
      }
      .log-viewer-body pre {
        color: #fff;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        margin: 0;
        white-space: pre-wrap;
      }
      .log-viewer-footer {
        padding: 15px;
        border-top: 1px solid #333;
        display: flex;
        gap: 10px;
      }
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    // Event handlers
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.querySelector('#refreshLogs').onclick = async () => {
      try {
        const newLogs = await window.electronAPI.getLogs(service, 100);
        modal.querySelector('#log-content').textContent = newLogs;
      } catch (error) {
        this.showError(`Failed to refresh logs: ${error.message}`);
      }
    };

    modal.querySelector('#clearLogs').onclick = async () => {
      try {
        await window.electronAPI.clearLog(service, 'access');
        modal.querySelector('#log-content').textContent = 'Log cleared.';
        this.showSuccess('Log cleared successfully');
      } catch (error) {
        this.showError(`Failed to clear log: ${error.message}`);
      }
    };

    document.body.appendChild(modal);
  }

  async showAppInstallDialog(appName) {
    const projectName = prompt(`Enter project name for ${appName}:`);
    if (projectName) {
      try {
        this.showInfo(`Installing ${appName}...`);
        const result = await window.electronAPI.installAppNew(appName, projectName, {});
        this.showSuccess(`${appName} installed successfully as "${projectName}"!`);
      } catch (error) {
        this.showError(`Failed to install ${appName}: ${error.message}`);
      }
    }
  }

  async openConfigEditor(configType) {
    try {
      this.showInfo(`Opening ${configType} configuration...`);
      const configs = await window.electronAPI.getAvailableConfigs();
      
      // Find the appropriate service and type
      let service = 'apache';
      let type = 'main';
      
      if (configType.includes('mysql')) {
        service = 'mysql';
      }
      if (configType.includes('php')) {
        service = 'php';
      }

      const content = await window.electronAPI.readConfig(service, type);
      this.showConfigEditorWindow(service, type, content);
    } catch (error) {
      this.showError(`Failed to open config: ${error.message}`);
    }
  }

  showConfigEditorWindow(service, type, content) {
    // Create a modal window for config editing
    const modal = document.createElement('div');
    modal.className = 'config-editor-modal';
    modal.innerHTML = `
      <div class="config-editor-content">
        <div class="config-editor-header">
          <h3>${service.toUpperCase()} Configuration</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="config-editor-body">
          <textarea id="config-content">${content}</textarea>
        </div>
        <div class="config-editor-footer">
          <button class="btn btn-primary" id="saveConfig">Save</button>
          <button class="btn btn-secondary" id="createBackup">Create Backup</button>
          <button class="btn btn-secondary" id="testConfig">Test Config</button>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .config-editor-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .config-editor-content {
        background: #1e1e1e;
        border-radius: 8px;
        width: 80%;
        height: 70%;
        display: flex;
        flex-direction: column;
      }
      .config-editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #333;
        color: white;
      }
      .config-editor-body {
        flex: 1;
        padding: 15px;
      }
      .config-editor-body textarea {
        width: 100%;
        height: 100%;
        background: #2d2d2d;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 10px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        resize: none;
      }
      .config-editor-footer {
        padding: 15px;
        border-top: 1px solid #333;
        display: flex;
        gap: 10px;
      }
    `;
    document.head.appendChild(style);

    // Event handlers
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.querySelector('#saveConfig').onclick = async () => {
      try {
        const newContent = modal.querySelector('#config-content').value;
        await window.electronAPI.writeConfig(service, type, newContent, true);
        this.showSuccess('Configuration saved successfully');
        modal.remove();
      } catch (error) {
        this.showError(`Failed to save config: ${error.message}`);
      }
    };

    modal.querySelector('#createBackup').onclick = async () => {
      try {
        await window.electronAPI.createBackup(service, type);
        this.showSuccess('Backup created successfully');
      } catch (error) {
        this.showError(`Failed to create backup: ${error.message}`);
      }
    };

    modal.querySelector('#testConfig').onclick = async () => {
      try {
        const result = await window.electronAPI.testConfig(service, type);
        if (result.success) {
          this.showSuccess('Configuration is valid');
        } else {
          this.showError(`Configuration error: ${result.error}`);
        }
      } catch (error) {
        this.showError(`Failed to test config: ${error.message}`);
      }
    };

    document.body.appendChild(modal);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.devStackBox = new DevStackBox();
});
