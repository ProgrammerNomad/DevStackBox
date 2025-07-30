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
    
    // ✅ HIDE LOADING IMMEDIATELY - FIRST THING!
    this.hideLoading();
    
    // Check if running in Electron
    if (typeof window.electronAPI === 'undefined') {
      console.warn('ElectronAPI not available - running in browser mode');
      this.showError('DevStackBox must be run as an Electron application');
      return;
    }
    
    try {
      // Setup event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadServiceStatus();
      await this.loadPhpVersions();
      await this.checkInstallation();
      
      console.log('DevStackBox initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DevStackBox:', error);
      this.showError('Failed to initialize application: ' + error.message);
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

    // Offline setup guide button
    const offlineSetupBtn = document.getElementById('offlineSetupBtn');
    if (offlineSetupBtn) {
      offlineSetupBtn.addEventListener('click', () => {
        this.showOfflineSetupGuide();
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
        // Check if core components are bundled (Apache, MySQL, PHP 8.2, phpMyAdmin)
        const hasCoreComponents = status.apache && status.mysql && 
                                 (status.php82 || status.php) && status.phpmyadmin;
        
        banner.style.display = hasCoreComponents ? 'none' : 'block';
        
        if (!hasCoreComponents) {
          // Update banner text for bundled setup
          const bannerText = banner.querySelector('.banner-text p');
          if (bannerText) {
            bannerText.textContent = 'DevStackBox requires pre-bundled server binaries. Please ensure Apache, MySQL, PHP 8.2, and phpMyAdmin are included in the application bundle.';
          }
        }
      }

      // Update system information
      this.updateSystemInfo(status);
      
      // Set PHP 8.2 as default if available
      if (status.php && status.php['8.2']) {
        this.currentPhp = '8.2';
        this.updatePhpVersionDisplay('8.2');
      }
    } catch (error) {
      console.error('Failed to check installation:', error);
    }
  }

  updateSystemInfo(status) {
    const apacheStatus = document.getElementById('systemApacheStatus');
    const mysqlStatus = document.getElementById('systemMysqlStatus');
    const phpStatus = document.getElementById('systemPhpStatus');

    if (apacheStatus) {
      apacheStatus.textContent = status.apache ? 'Pre-bundled' : 'Not Bundled';
      apacheStatus.className = status.apache ? 'status-available' : 'status-missing';
    }
    if (mysqlStatus) {
      mysqlStatus.textContent = status.mysql ? 'Pre-bundled' : 'Not Bundled';
      mysqlStatus.className = status.mysql ? 'status-available' : 'status-missing';
    }
    if (phpStatus) {
      const phpVersions = [];
      // Check for new format (status.php object) or old format (status.php81, etc.)
      if (status.php && typeof status.php === 'object') {
        Object.keys(status.php).forEach(version => {
          if (status.php[version]) phpVersions.push(version);
        });
      } else {
        if (status.php81) phpVersions.push('8.1');
        if (status.php82) phpVersions.push('8.2');
        if (status.php83) phpVersions.push('8.3');
      }
      
      if (phpVersions.length > 0) {
        // Prioritize PHP 8.2 in display
        const sortedVersions = phpVersions.sort((a, b) => {
          if (a === '8.2') return -1;
          if (b === '8.2') return 1;
          return a.localeCompare(b);
        });
        phpStatus.textContent = `PHP ${sortedVersions.join(', ')} (8.2 default)`;
        phpStatus.className = 'status-available';
      } else {
        phpStatus.textContent = 'Not Bundled';
        phpStatus.className = 'status-missing';
      }
    }
    
    // Update phpMyAdmin status if element exists
    const pmaStatus = document.getElementById('systemPhpmyadminStatus');
    if (pmaStatus) {
      pmaStatus.textContent = status.phpmyadmin ? 'Pre-bundled' : 'Not Bundled';
      pmaStatus.className = status.phpmyadmin ? 'status-available' : 'status-missing';
    }
  }

  updatePhpVersionDisplay(version) {
    const phpVersionSelect = document.getElementById('phpVersion');
    const phpVersionDisplay = document.getElementById('currentPhpVersion');
    
    if (phpVersionSelect && phpVersionSelect.querySelector(`option[value="${version}"]`)) {
      phpVersionSelect.value = version;
    }
    
    if (phpVersionDisplay) {
      phpVersionDisplay.textContent = `PHP ${version}`;
    }
    
    // Update footer status
    const footerPhpStatus = document.getElementById('footer-php-status');
    if (footerPhpStatus) {
      footerPhpStatus.textContent = `PHP ${version}`;
      footerPhpStatus.className = 'status-running';
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
      overlay.classList.add('show'); // Use CSS class for better control
    }
    if (text) {
      text.textContent = message;
    }
  }

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('show'); // Use CSS class for better control
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

  showOfflineSetupGuide() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'offlineSetupModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <img src="assets/icons/folder.svg" alt="Offline Setup" class="modal-icon">
            Offline Server Setup Guide
          </h2>
          <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div style="max-height: 500px; overflow-y: auto;">
            <h3>📦 Quick Setup Options</h3>
            <div style="margin-bottom: 20px;">
              <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <h4>Download Pre-bundled Binaries</h4>
                <ul style="margin-left: 20px;">
                  <li><strong>Apache:</strong> <a href="https://www.apachelounge.com/download/" target="_blank">apachelounge.com</a> → Extract to <code>apache/</code></li>
                  <li><strong>MySQL:</strong> <a href="https://dev.mysql.com/downloads/mysql/" target="_blank">MySQL Downloads</a> → Extract to <code>mysql/</code></li>
                  <li><strong>PHP:</strong> <a href="https://windows.php.net/downloads/" target="_blank">PHP Windows</a> → Extract to <code>php/8.3/</code></li>
                  <li><strong>phpMyAdmin:</strong> <a href="https://www.phpmyadmin.net/downloads/" target="_blank">phpMyAdmin</a> → Extract to <code>phpmyadmin/</code></li>
                </ul>
              </div>
            </div>
            
            <h3>📁 Expected Folder Structure</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 12px;">
DevStackBox/
├── apache/
│   ├── bin/httpd.exe ✓
│   ├── conf/httpd.conf
│   └── modules/
├── mysql/
│   ├── bin/mysqld.exe ✓
│   └── bin/mysql.exe ✓
├── php/
│   └── 8.3/
│       ├── php.exe ✓
│       └── ext/
└── phpmyadmin/
    ├── index.php ✓
    └── libraries/
            </pre>
            
            <h3>✅ After Setup</h3>
            <p>Restart DevStackBox and all services should show as <strong>"Available"</strong> instead of <strong>"Binaries not found"</strong>.</p>
            
            <div style="padding: 15px; background: #e8f5e8; border-radius: 8px; margin-top: 20px;">
              <strong>💡 Benefits:</strong> No internet required, faster startup, completely portable, version controlled!
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing DevStackBox...');
  
  // FIRST: Immediately hide loading overlay
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show'); // Ensure it's hidden
  }
  
  // Always create DevStackBox instance
  try {
    new DevStackBox();
  } catch (error) {
    console.error('Failed to create DevStackBox:', error);
    
    // Hide loading overlay even on error
    if (overlay) {
      overlay.classList.remove('show');
    }
    
    // Show error message
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
      loadingText.textContent = 'Failed to initialize DevStackBox';
    }
  }
});
