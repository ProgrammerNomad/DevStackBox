/**
 * DevStackBox Frontend Application
 * Main UI controller and event handlers
 */

class DevStackBox {
  constructor() {
    this.services = ['apache', 'mysql'];
    this.currentPhp = null;
    // Don't initialize immediately - wait for proper DOM ready state
    this.initWhenReady();
  }

  initWhenReady() {
    // Double-check DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      // DOM is already loaded
      this.init();
    }
  }

  async init() {
    console.log('Initializing DevStackBox...');
    
    // Additional safety check - wait a moment for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    // ✅ HIDE LOADING IMMEDIATELY - FIRST THING!
    this.hideLoading();
    
    // Check if running in Electron
    if (typeof window.electronAPI === 'undefined') {
      console.warn('ElectronAPI not available - running in browser mode');
      this.showError('DevStackBox must be run as an Electron application');
      return;
    }
    
    try {
      // Initialize Configuration UI
      console.log('Initializing Configuration UI...');
      this.configUI = new ConfigurationUI();
      
      // Make configUI available globally for cross-component communication
      window.configUI = this.configUI;
      
      // Initialize One-Click Installers
      console.log('Initializing One-Click Installers...');
      this.installers = new OneClickInstallers();
      await this.installers.init();
      
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

    // Quick Actions
    const openPhpMyAdminBtn = document.getElementById('openPhpMyAdmin');
    if (openPhpMyAdminBtn) {
      openPhpMyAdminBtn.addEventListener('click', () => {
        this.openPhpMyAdmin();
      });
    }

    const openWebRootBtn = document.getElementById('openWebRoot');
    if (openWebRootBtn) {
      openWebRootBtn.addEventListener('click', () => {
        this.openWebRoot();
      });
    }

    const viewLogsBtn = document.getElementById('viewLogs');
    if (viewLogsBtn) {
      viewLogsBtn.addEventListener('click', () => {
        this.viewLogs();
      });
    }

    const createProjectBtn = document.getElementById('createProject');
    if (createProjectBtn) {
      createProjectBtn.addEventListener('click', () => {
        this.createProject();
      });
    }

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
    // Ensure DOM is ready before attempting to update UI
    if (document.readyState === 'loading') {
      console.warn(`DOM not ready, postponing UI update for ${service}`);
      document.addEventListener('DOMContentLoaded', () => {
        this.updateServiceUI(service, status);
      });
      return;
    }

    try {
      const statusEl = document.getElementById(`${service}-status`);
      const startBtn = document.querySelector(`[data-service="${service}"].start-btn`);
      const stopBtn = document.querySelector(`[data-service="${service}"].stop-btn`);
      const footerStatus = document.getElementById(`footer-${service}-status`);

      if (!statusEl) {
        console.warn(`Status element not found for service: ${service}`);
        return;
      }

      if (statusEl) {
        // Find the status dot (span with rounded-full class) and text content
        const dot = statusEl.querySelector('span.rounded-full');
        
        if (status.running) {
          if (dot) {
            dot.className = 'w-2 h-2 bg-green-500 rounded-full mr-2';
          } else {
            console.warn(`Status dot not found for service: ${service}, creating new status element`);
            statusEl.innerHTML = '<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Running';
            return; // Skip text node manipulation since we rebuilt the element
          }
          // Update text content - get all text after the dot
          const textNodes = statusEl.childNodes;
          for (let i = 0; i < textNodes.length; i++) {
            if (textNodes[i].nodeType === Node.TEXT_NODE) {
              textNodes[i].textContent = 'Running';
              break;
            }
          }
          // If no text node found, set the statusEl textContent directly but preserve the dot
          if (!Array.from(textNodes).some(node => node.nodeType === Node.TEXT_NODE)) {
            // Clear and rebuild the status element
            statusEl.innerHTML = '<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Running';
          }
        } else {
          if (dot) {
            dot.className = 'w-2 h-2 bg-red-500 rounded-full mr-2';
          } else {
            console.warn(`Status dot not found for service: ${service}, creating new status element`);
            const statusText = status.installed ? 'Stopped' : 'Not Installed';
            statusEl.innerHTML = `<span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>${statusText}`;
            return; // Skip text node manipulation since we rebuilt the element
          }
          // Update text content
          const textNodes = statusEl.childNodes;
          const statusText = status.installed ? 'Stopped' : 'Not Installed';
          for (let i = 0; i < textNodes.length; i++) {
            if (textNodes[i].nodeType === Node.TEXT_NODE) {
              textNodes[i].textContent = statusText;
              break;
            }
          }
          // If no text node found, rebuild the status element
          if (!Array.from(textNodes).some(node => node.nodeType === Node.TEXT_NODE)) {
            statusEl.innerHTML = `<span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>${statusText}`;
          }
        }
      } else {
        console.warn(`Status element not found for service: ${service}`);
      }

      if (startBtn) {
        startBtn.disabled = status.running || !status.installed;
      } else {
        console.warn(`Start button not found for service: ${service}`);
      }
      
      if (stopBtn) {
        stopBtn.disabled = !status.running;
      } else {
        console.warn(`Stop button not found for service: ${service}`);
      }
      
      if (footerStatus) {
        footerStatus.textContent = status.running ? 'Running' : 'Stopped';
        footerStatus.className = status.running ? 
          'ml-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800' : 
          'ml-1 px-2 py-1 rounded text-xs bg-red-100 text-red-800';
      } else {
        console.warn(`Footer status not found for service: ${service}`);
      }

      // Update PHP Info button when Apache status changes
      if (service === 'apache' && window.configUI && window.configUI.updatePhpInfoButton) {
        window.configUI.updatePhpInfoButton();
      }
    } catch (error) {
      console.error(`Error updating UI for service ${service}:`, error);
    }
  }

  async startService(service) {
    try {
      this.showLoading(`Starting ${service}...`);
      
      // Check if service is installed first
      const status = await window.electronAPI.getServiceStatus(service);
      if (!status.installed) {
        this.showError(`${service} is not installed. Please ensure server binaries are present.`);
        return;
      }
      
      const result = await window.electronAPI.startService(service);
      
      if (result.success) {
        this.showNotification(`${service} started successfully`);
      } else {
        this.showError(result.error || `Failed to start ${service}`);
      }
    } catch (error) {
      console.error(`Error starting ${service}:`, error);
      this.showError(`Failed to start ${service}: ${error.message}`);
    } finally {
      this.hideLoading();
      // Wait a moment before refreshing status to allow process to fully start
      setTimeout(() => {
        this.loadServiceStatus();
      }, 1000);
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
      console.error(`Error stopping ${service}:`, error);
      this.showError(`Failed to stop ${service}: ${error.message}`);
    } finally {
      this.hideLoading();
      // Wait a moment before refreshing status to allow process to fully stop
      setTimeout(() => {
        this.loadServiceStatus();
      }, 1000);
    }
  }

  async loadPhpVersions() {
    try {
      console.log('Loading PHP versions...');
      const versions = await window.electronAPI.getPhpVersions();
      console.log('Received PHP versions:', versions);
      
      const select = document.getElementById('phpVersion');
      const currentVersionEl = document.getElementById('currentPhpVersion');
      
      if (select) {
        select.innerHTML = '';
        
        if (versions && versions.length > 0) {
          versions.forEach(version => {
            const option = document.createElement('option');
            option.value = version.version;
            
            if (version.installed) {
              option.textContent = `PHP ${version.version}${version.current ? ' (Default)' : ''}`;
              option.disabled = false;
            } else {
              option.textContent = `PHP ${version.version} (Not Installed)`;
              option.disabled = true;
            }
            
            if (version.current) {
              option.selected = true;
            }
            
            select.appendChild(option);
          });
        } else {
          // Fallback if no versions found
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No PHP versions found';
          option.disabled = true;
          select.appendChild(option);
        }
      }

      // Set current version display
      const currentVersion = versions.find(v => v.current) || versions.find(v => v.installed) || versions[0];
      if (currentVersion && currentVersionEl) {
        if (currentVersion.installed) {
          currentVersionEl.textContent = `PHP ${currentVersion.version}`;
          this.currentPhp = currentVersion.version;
        } else {
          currentVersionEl.textContent = 'No PHP version installed';
          this.currentPhp = null;
        }
      }
    } catch (error) {
      console.error('Failed to load PHP versions:', error);
      
      // Fallback UI update
      const select = document.getElementById('phpVersion');
      const currentVersionEl = document.getElementById('currentPhpVersion');
      
      if (select) {
        select.innerHTML = '<option value="" disabled>Error loading PHP versions</option>';
      }
      if (currentVersionEl) {
        currentVersionEl.textContent = 'Error loading PHP version';
      }
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
                                 (status.php82 || (status.php && status.php['8.2'])) && 
                                 status.phpmyadmin;
        
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
      if (status.php82 || (status.php && status.php['8.2'])) {
        this.currentPhp = '8.2';
        this.updatePhpVersionDisplay('8.2');
      }
      
      // Update services status based on installation status
      await this.loadServiceStatus();
      
    } catch (error) {
      console.error('Failed to check installation:', error);
    }
  }

  // Legacy method for compatibility - redirect to loadServiceStatus
  async updateServicesStatus() {
    console.warn('updateServicesStatus is deprecated, use loadServiceStatus instead');
    return await this.loadServiceStatus();
  }

  updateSystemInfo(status) {
    try {
      const apacheStatus = document.getElementById('systemApacheStatus');
      const mysqlStatus = document.getElementById('systemMysqlStatus');
      const phpStatus = document.getElementById('systemPhpStatus');

      if (apacheStatus) {
        apacheStatus.textContent = status.apache ? 'Pre-bundled' : 'Not Bundled';
        apacheStatus.className = status.apache ? 'text-sm font-semibold text-green-600' : 'text-sm font-semibold text-red-600';
      } else {
        console.warn('Apache status element not found');
      }
      
      if (mysqlStatus) {
        mysqlStatus.textContent = status.mysql ? 'Pre-bundled' : 'Not Bundled';
        mysqlStatus.className = status.mysql ? 'text-sm font-semibold text-green-600' : 'text-sm font-semibold text-red-600';
      } else {
        console.warn('MySQL status element not found');
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
        if (status.php84) phpVersions.push('8.4');
      }
      
      if (phpVersions.length > 0) {
        // Prioritize PHP 8.2 in display
        const sortedVersions = phpVersions.sort((a, b) => {
          if (a === '8.2') return -1;
          if (b === '8.2') return 1;
          return a.localeCompare(b);
        });
        phpStatus.textContent = `PHP ${sortedVersions.join(', ')} (8.2 default)`;
        phpStatus.className = 'text-sm font-semibold text-green-600';
      } else {
        phpStatus.textContent = 'Not Bundled';
        phpStatus.className = 'text-sm font-semibold text-red-600';
      }
    }
    
    // Update phpMyAdmin status if element exists
    const pmaStatus = document.getElementById('systemPhpmyadminStatus');
    if (pmaStatus) {
      pmaStatus.textContent = status.phpmyadmin ? 'Pre-bundled' : 'Not Bundled';
      pmaStatus.className = status.phpmyadmin ? 'text-sm font-semibold text-green-600' : 'text-sm font-semibold text-red-600';
    } else {
      console.warn('phpMyAdmin status element not found');
    }
    
    } catch (error) {
      console.error('Failed to update system info:', error);
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
      footerPhpStatus.className = 'ml-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800';
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
      overlay.style.display = 'flex'; // Force show with inline style
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
      overlay.style.display = 'none'; // Force hide with inline style
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
            <img src="assets/icons/system.svg" alt="System Status" class="modal-icon">
            Pre-bundled Server Status
          </h2>
          <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div style="max-height: 500px; overflow-y: auto;">
            <h3>✅ Pre-bundled Components</h3>
            <div style="margin-bottom: 20px;">
              <div style="padding: 15px; border: 1px solid #28a745; border-radius: 8px; background: #f8fff8;">
                <h4>🚀 Ready to Use - No Downloads Required!</h4>
                <ul style="margin-left: 20px; line-height: 1.8;">
                  <li><strong>✅ Apache:</strong> Pre-installed and ready</li>
                  <li><strong>✅ MySQL:</strong> Pre-installed and ready</li>
                  <li><strong>✅ PHP 8.1:</strong> Available for switching</li>
                  <li><strong>✅ PHP 8.2:</strong> <span style="color: #28a745; font-weight: bold;">Default Version</span></li>
                  <li><strong>✅ PHP 8.3:</strong> Available for switching</li>
                  <li><strong>✅ PHP 8.4:</strong> Available for switching</li>
                  <li><strong>✅ phpMyAdmin:</strong> Pre-installed and ready</li>
                </ul>
              </div>
            </div>
            
            <h3>📁 Current Structure</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 12px;">
DevStackBox/
├── apache/          ✅ Ready
│   ├── bin/httpd.exe
│   ├── conf/httpd.conf
│   └── modules/
├── mysql/           ✅ Ready
│   ├── bin/mysqld.exe
│   └── bin/mysql.exe
├── php/
│   ├── 8.1/         ✅ Available
│   ├── 8.2/         ✅ Default
│   ├── 8.3/         ✅ Available
│   └── 8.4/         ✅ Available
└── phpmyadmin/      ✅ Ready
    ├── index.php
    └── libraries/
            </pre>
            
            <h3>⚙️ Settings</h3>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <p><strong>Default PHP Version:</strong> 8.2 (can be changed from main panel)</p>
              <p><strong>Server Binaries:</strong> All pre-bundled, no internet required</p>
              <p><strong>Status:</strong> Fully portable and offline-ready</p>
            </div>
            
            <div style="padding: 15px; background: #e8f5e8; border-radius: 8px; margin-top: 20px;">
              <strong>💡 Benefits:</strong> Instant startup, no downloads, completely portable, version controlled, offline development ready!
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  updateDownloadModalStatus(status) {
    try {
      // Update Apache status
      const apacheStatus = document.getElementById('apache-download-status');
      if (apacheStatus) {
        apacheStatus.textContent = status.apache ? '✅ Pre-bundled' : '❌ Missing';
        apacheStatus.className = status.apache ? 'status-badge status-success' : 'status-badge status-error';
      }

      // Update MySQL status
      const mysqlStatus = document.getElementById('mysql-download-status');
      if (mysqlStatus) {
        mysqlStatus.textContent = status.mysql ? '✅ Pre-bundled' : '❌ Missing';
        mysqlStatus.className = status.mysql ? 'status-badge status-success' : 'status-badge status-error';
      }

      // Update phpMyAdmin status
    const phpmyadminStatus = document.getElementById('phpmyadmin-download-status');
    if (phpmyadminStatus) {
      phpmyadminStatus.textContent = status.phpmyadmin ? '✅ Pre-bundled' : '❌ Missing';
      phpmyadminStatus.className = status.phpmyadmin ? 'status-badge status-success' : 'status-badge status-error';
    }

    // Update PHP versions status
    if (status.php) {
      ['8.1', '8.2', '8.3', '8.4'].forEach(version => {
        const phpStatus = document.getElementById(`php${version.replace('.', '')}-status`);
        if (phpStatus) {
          const isInstalled = status.php[version];
          phpStatus.textContent = isInstalled ? '✅ Pre-bundled' : '❌ Missing';
          phpStatus.className = isInstalled ? 'version-status status-success' : 'version-status status-error';
        }
      });
    }

    // Update download buttons to show pre-bundled status
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(btn => {
      const component = btn.getAttribute('data-component');
      if ((component === 'apache' && status.apache) ||
          (component === 'mysql' && status.mysql) ||
          (component === 'phpmyadmin' && status.phpmyadmin)) {
        btn.innerHTML = '<img src="assets/icons/system.svg" alt="Bundled" class="w-4 h-4 mr-2"> Pre-bundled';
        btn.disabled = true;
        btn.className = 'inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded opacity-60 cursor-not-allowed download-btn';
      }
    });
    
    } catch (error) {
      console.error('Failed to update download modal status:', error);
    }
  }

  // Quick Actions Methods
  async openPhpMyAdmin() {
    try {
      // Check if both Apache and MySQL are running
      const apacheStatus = await window.electronAPI.getServiceStatus('apache');
      const mysqlStatus = await window.electronAPI.getServiceStatus('mysql');
      
      if (!apacheStatus.running) {
        this.showError('Apache is not running. Please start Apache first.');
        return;
      }
      
      if (!mysqlStatus.running) {
        this.showError('MySQL is not running. Please start MySQL first.');
        return;
      }
      
      // Open phpMyAdmin in external browser
      if (window.electronAPI && window.electronAPI.openUrl) {
        await window.electronAPI.openUrl('http://localhost/phpmyadmin/');
      } else {
        // Fallback - show URL to user
        this.showNotification('Please open http://localhost/phpmyadmin/ in your browser');
      }
    } catch (error) {
      console.error('Error opening phpMyAdmin:', error);
      this.showError('Failed to open phpMyAdmin: ' + error.message);
    }
  }

  async openWebRoot() {
    try {
      if (window.electronAPI && window.electronAPI.openFolder) {
        await window.electronAPI.openFolder('www');
      } else {
        this.showNotification('Web root folder: www/');
      }
    } catch (error) {
      console.error('Error opening web root:', error);
      this.showError('Failed to open web root folder');
    }
  }

  async viewLogs() {
    try {
      if (window.electronAPI && window.electronAPI.viewLogs) {
        await window.electronAPI.viewLogs('all');
      } else {
        this.showNotification('Logs feature not available');
      }
    } catch (error) {
      console.error('Error viewing logs:', error);
      this.showError('Failed to open logs viewer');
    }
  }

  async createProject() {
    try {
      // Show a simple project creation dialog
      const projectName = prompt('Enter project name:');
      if (projectName && projectName.trim()) {
        if (window.electronAPI && window.electronAPI.createProject) {
          const result = await window.electronAPI.createProject(projectName.trim());
          if (result.success) {
            this.showNotification(`Project "${projectName}" created successfully!`);
          } else {
            this.showError(result.error || 'Failed to create project');
          }
        } else {
          this.showNotification('Please create the project manually in the www/projects/ folder');
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      this.showError('Failed to create project: ' + error.message);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing DevStackBox...');
  
  // FIRST: Immediately hide loading overlay
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show'); // Ensure it's hidden
    overlay.style.display = 'none'; // Force hide with inline style
  }
  
  // Always create DevStackBox instance
  try {
    new DevStackBox();
  } catch (error) {
    console.error('Failed to create DevStackBox:', error);
    
    // Hide loading overlay even on error
    if (overlay) {
      overlay.classList.remove('show');
      overlay.style.display = 'none';
    }
    
    // Show error message
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
      loadingText.textContent = 'Failed to initialize DevStackBox';
    }
  }
});
