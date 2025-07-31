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

  // Notification System
  showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden transform transition-all duration-300 ease-in-out translate-x-full opacity-0`;
    
    const typeStyles = {
      success: 'border-l-4 border-green-400',
      error: 'border-l-4 border-red-400',
      warning: 'border-l-4 border-yellow-400',
      info: 'border-l-4 border-blue-400'
    };

    const typeIcons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const typeColors = {
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };

    notification.className += ` ${typeStyles[type]}`;
    
    notification.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-lg ${typeColors[type]}">${typeIcons[type]}</span>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">${message}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>`;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0');
      notification.classList.add('translate-x-0', 'opacity-100');
    }, 100);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }, duration);
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

  updateServiceUI(service, status, loadingState = null) {
    // Ensure DOM is ready before attempting to update UI
    if (document.readyState === 'loading') {
      console.warn(`DOM not ready, postponing UI update for ${service}`);
      document.addEventListener('DOMContentLoaded', () => {
        this.updateServiceUI(service, status, loadingState);
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
        // Handle loading states
        if (loadingState === 'starting') {
          statusEl.innerHTML = `
            <svg class="animate-spin w-3 h-3 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Starting...
          `;
        } else if (loadingState === 'stopping') {
          statusEl.innerHTML = `
            <svg class="animate-spin w-3 h-3 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Stopping...
          `;
        } else {
          // Normal status display
          if (status.running) {
            statusEl.innerHTML = '<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Running';
          } else {
            const statusText = status.installed ? 'Stopped' : 'Not Installed';
            statusEl.innerHTML = `<span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>${statusText}`;
          }
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
          'px-2 py-1 rounded-md text-xs font-semibold bg-green-500 text-white' : 
          'px-2 py-1 rounded-md text-xs font-semibold bg-red-500 text-white';
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
      // Set button loading state
      this.setButtonLoading(service, 'start', true);
      
      // Show loading status in the UI
      const status = await window.electronAPI.getServiceStatus(service);
      this.updateServiceUI(service, status, 'starting');
      
      // Show notification
      this.showNotification(`Starting ${service}...`, 'info');
      
      // Check if service is installed first
      if (!status.installed) {
        this.showError(`${service} is not installed. Please ensure server binaries are present.`);
        return;
      }
      
      const result = await window.electronAPI.startService(service);
      
      if (result.success) {
        this.showNotification(`${service} started successfully`, 'success');
      } else {
        this.showError(result.error || `Failed to start ${service}`);
      }
    } catch (error) {
      console.error(`Error starting ${service}:`, error);
      this.showError(`Failed to start ${service}: ${error.message}`);
    } finally {
      // Remove button loading state
      this.setButtonLoading(service, 'start', false);
      // Wait a moment before refreshing status to allow process to fully start
      setTimeout(() => {
        this.loadServiceStatus();
      }, 1000);
    }
  }

  async stopService(service) {
    try {
      // Set button loading state
      this.setButtonLoading(service, 'stop', true);
      
      // Show loading status in the UI
      const status = await window.electronAPI.getServiceStatus(service);
      this.updateServiceUI(service, status, 'stopping');
      
      // Show notification
      this.showNotification(`Stopping ${service}...`, 'info');
      
      const result = await window.electronAPI.stopService(service);
      
      if (result.success) {
        this.showNotification(`${service} stopped successfully`, 'success');
      } else {
        this.showError(result.error || `Failed to stop ${service}`);
      }
    } catch (error) {
      console.error(`Error stopping ${service}:`, error);
      this.showError(`Failed to stop ${service}: ${error.message}`);
    } finally {
      // Remove button loading state
      this.setButtonLoading(service, 'stop', false);
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

  showNotification(message, type = 'success') {
    // Create notification element with Tailwind classes
    const notification = document.createElement('div');
    notification.className = `transform transition-all duration-300 ease-in-out translate-x-full opacity-0 flex items-center p-4 mb-2 rounded-lg shadow-lg max-w-xs`;
    
    // Set colors based on type
    switch (type) {
      case 'success':
        notification.className += ` bg-green-50 border-l-4 border-green-400`;
        notification.innerHTML = `
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">${message}</p>
          </div>
        `;
        break;
      case 'error':
        notification.className += ` bg-red-50 border-l-4 border-red-400`;
        notification.innerHTML = `
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">${message}</p>
          </div>
        `;
        break;
      case 'info':
        notification.className += ` bg-blue-50 border-l-4 border-blue-400`;
        notification.innerHTML = `
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-blue-800">${message}</p>
          </div>
        `;
        break;
      case 'warning':
        notification.className += ` bg-yellow-50 border-l-4 border-yellow-400`;
        notification.innerHTML = `
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-yellow-800">${message}</p>
          </div>
        `;
        break;
    }
    
    // Add close button
    notification.innerHTML += `
      <div class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button class="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600" onclick="this.closest('div').remove()">
            <span class="sr-only">Dismiss</span>
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Add to notification container
    const container = document.getElementById('notificationContainer');
    if (container) {
      container.appendChild(notification);
      
      // Animate in
      requestAnimationFrame(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100');
      });
      
      // Auto remove based on type
      const duration = type === 'error' ? 6000 : type === 'info' ? 4000 : 3000;
      setTimeout(() => {
        if (notification.parentNode) {
          notification.classList.add('translate-x-full', 'opacity-0');
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, duration);
    }
  }

  showError(message) {
    this.showNotification(message, 'error');
    console.error('DevStackBox Error:', message);
  }

  setButtonLoading(service, action, isLoading) {
    const button = document.querySelector(`[data-service="${service}"].${action}-btn`);
    if (!button) return;

    if (isLoading) {
      // Store original text and disable button
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.classList.add('opacity-60', 'cursor-not-allowed');
      
      // Add loading spinner and text
      const actionText = action === 'start' ? 'Starting...' : 'Stopping...';
      button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        ${actionText}
      `;
    } else {
      // Restore original state
      button.disabled = false;
      button.classList.remove('opacity-60', 'cursor-not-allowed');
      button.textContent = button.dataset.originalText || (action === 'start' ? 'Start' : 'Stop');
    }
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
