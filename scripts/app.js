/**
 * DevStackBox Frontend Application
 * Main UI controller and event handlers
 */

class DevStackBox {
  constructor() {
    this.services = ['apache', 'mysql'];
    this.currentPhp = null;
    this.init();
  }

  async init() {
    console.log('Initializing DevStackBox...');
    
    try {
      // Setup event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadServiceStatus();
      await this.loadPhpVersions();
      await this.checkInstallation();
      
      // Hide loading overlay
      this.hideLoading();
      
      console.log('DevStackBox initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DevStackBox:', error);
      this.showError('Failed to initialize application: ' + error.message);
      this.hideLoading();
    }
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

    // PHP version switcher
    const phpSwitchBtn = document.getElementById('switchPhpBtn');
    if (phpSwitchBtn) {
      phpSwitchBtn.addEventListener('click', () => {
        const select = document.getElementById('phpVersion');
        if (select && select.value) {
          this.switchPhpVersion(select.value);
        }
      });
    }

    // Download settings modal
    const downloadBtn = document.getElementById('downloadSettingsBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.showDownloadModal();
      });
    }

    // Modal close
    const closeModal = document.getElementById('closeDownloadModal');
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        this.hideDownloadModal();
      });
    }

    // Download buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('download-btn')) {
        const component = e.target.dataset.component;
        if (component) {
          this.downloadComponent(component);
        }
      }
    });

    // Setup notification handler if available
    if (window.electronAPI && window.electronAPI.onShowNotification) {
      window.electronAPI.onShowNotification((message) => {
        this.showNotification(message);
      });
    }

    // Update status every 5 seconds
    setInterval(() => {
      this.loadServiceStatus();
    }, 5000);
  }

  async loadServiceStatus() {
    try {
      for (const service of this.services) {
        const status = await window.electronAPI.getServiceStatus(service);
        this.updateServiceUI(service, status);
      }
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  }

  updateServiceUI(service, status) {
    const statusEl = document.getElementById(`${service}-status`);
    const startBtn = document.querySelector(`[data-service="${service}"].start-btn`);
    const stopBtn = document.querySelector(`[data-service="${service}"].stop-btn`);
    const footerStatus = document.getElementById(`footer-${service}-status`);

    if (statusEl) {
      const dot = statusEl.querySelector('.status-dot');
      const text = statusEl.childNodes[statusEl.childNodes.length - 1];
      
      if (status.running) {
        dot.className = 'status-dot running';
        text.textContent = ' Running';
      } else {
        dot.className = 'status-dot stopped';
        text.textContent = status.installed ? ' Stopped' : ' Not Installed';
      }
    }

    if (startBtn) startBtn.disabled = status.running || !status.installed;
    if (stopBtn) stopBtn.disabled = !status.running;
    
    if (footerStatus) {
      footerStatus.textContent = status.running ? 'Running' : 'Stopped';
      footerStatus.className = status.running ? 'status-running' : 'status-stopped';
    }
  }

  async startService(service) {
    try {
      this.showLoading(`Starting ${service}...`);
      const result = await window.electronAPI.startService(service);
      
      if (result.success) {
        this.showNotification(`${service} started successfully`);
      } else {
        this.showError(result.error || `Failed to start ${service}`);
      }
    } catch (error) {
      this.showError(`Failed to start ${service}: ${error.message}`);
    } finally {
      this.hideLoading();
      this.loadServiceStatus();
    }
  }

  async stopService(service) {
    try {
      this.showLoading(`Stopping ${service}...`);
      const result = await window.electronAPI.stopService(service);
      
      if (result.success) {
        this.showNotification(`${service} stopped successfully`);
      } else {
        this.showError(result.error || `Failed to stop ${service}`);
      }
    } catch (error) {
      this.showError(`Failed to stop ${service}: ${error.message}`);
    } finally {
      this.hideLoading();
      this.loadServiceStatus();
    }
  }

  async loadPhpVersions() {
    try {
      const versions = await window.electronAPI.getPhpVersions();
      const select = document.getElementById('phpVersion');
      const currentVersionEl = document.getElementById('currentPhpVersion');
      
      if (select) {
        select.innerHTML = '';
        versions.forEach(version => {
          const option = document.createElement('option');
          option.value = version.version;
          option.textContent = `PHP ${version.version}${version.installed ? '' : ' (Not Installed)'}`;
          option.disabled = !version.installed;
          select.appendChild(option);
        });
      }

      // Set current version
      const currentVersion = versions.find(v => v.current);
      if (currentVersion && currentVersionEl) {
        currentVersionEl.textContent = `PHP ${currentVersion.version}`;
        this.currentPhp = currentVersion.version;
      }
    } catch (error) {
      console.error('Failed to load PHP versions:', error);
    }
  }

  async switchPhpVersion(version) {
    try {
      this.showLoading(`Switching to PHP ${version}...`);
      const result = await window.electronAPI.setPhpVersion(version);
      
      if (result.success) {
        this.showNotification(`Switched to PHP ${version}`);
        this.loadPhpVersions();
      } else {
        this.showError(result.error || `Failed to switch to PHP ${version}`);
      }
    } catch (error) {
      this.showError(`Failed to switch PHP version: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  async checkInstallation() {
    try {
      const status = await window.electronAPI.checkInstallation();
      const banner = document.getElementById('installationBanner');
      
      if (banner) {
        const hasAnyService = status.apache || status.mysql || status.php81 || status.php82 || status.php83;
        banner.style.display = hasAnyService ? 'none' : 'block';
      }

      // Update system information
      this.updateSystemInfo(status);
    } catch (error) {
      console.error('Failed to check installation:', error);
    }
  }

  updateSystemInfo(status) {
    const apacheStatus = document.getElementById('systemApacheStatus');
    const mysqlStatus = document.getElementById('systemMysqlStatus');
    const phpStatus = document.getElementById('systemPhpStatus');

    if (apacheStatus) {
      apacheStatus.textContent = status.apache ? 'Installed' : 'Not Installed';
    }
    if (mysqlStatus) {
      mysqlStatus.textContent = status.mysql ? 'Installed' : 'Not Installed';
    }
    if (phpStatus) {
      const phpVersions = [];
      if (status.php81) phpVersions.push('8.1');
      if (status.php82) phpVersions.push('8.2');
      if (status.php83) phpVersions.push('8.3');
      phpStatus.textContent = phpVersions.length > 0 ? `PHP ${phpVersions.join(', ')}` : 'Not Installed';
    }
  }

  showDownloadModal() {
    const modal = document.getElementById('downloadSettingsModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  hideDownloadModal() {
    const modal = document.getElementById('downloadSettingsModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  async downloadComponent(component) {
    try {
      this.showLoading(`Downloading ${component}...`);
      const result = await window.electronAPI.installComponent(component);
      
      if (result.success) {
        this.showNotification(`${component} downloaded and installed successfully`);
        this.checkInstallation();
      } else {
        this.showError(result.error || `Failed to download ${component}`);
      }
    } catch (error) {
      this.showError(`Failed to download ${component}: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    
    if (overlay) {
      overlay.style.display = 'flex';
    }
    if (text) {
      text.textContent = message;
    }
  }

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    console.error('DevStackBox Error:', message);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.electronAPI) {
    new DevStackBox();
  } else {
    console.error('Electron API not available');
    document.getElementById('loadingText').textContent = 'Failed to load - Electron API not available';
  }
});
