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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.devStackBox = new DevStackBox();
});
