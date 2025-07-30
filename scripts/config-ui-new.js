/**
 * ConfigurationUI - Advanced Configuration Management for DevStackBox
 * Uses the same design as Downloads & Settings modal
 */

class ConfigurationUI {
  constructor() {
    console.log('ConfigurationUI constructor called');
    
    this.currentConfigs = {
      apache: {},
      mysql: {},
      php: {}
    };
    
    this.isValidating = false;
    this.pendingRestart = new Set();
    
    console.log('Initializing UI...');
    this.initializeUI();
    
    console.log('Loading current configurations...');
    this.loadCurrentConfigurations();
  }

  /**
   * Initialize the configuration UI
   */
  initializeUI() {
    // Create configuration modal if not exists
    if (!document.getElementById('configModal')) {
      this.createConfigurationModal();
    }
    
    // Bind configuration button events
    this.bindConfigurationButtons();
  }

  /**
   * Create the main configuration modal using Downloads & Settings design
   */
  createConfigurationModal() {
    const modalHTML = `
    <div class="modal-overlay" id="configModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>
                    <img src="assets/icons/settings.svg" alt="Configuration" class="modal-icon">
                    Server Configuration
                </h2>
                <button class="modal-close" id="configModalClose">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="settings-tabs">
                    <button class="tab-btn active" data-tab="apache">Apache HTTP Server</button>
                    <button class="tab-btn" data-tab="mysql">MySQL Database</button>
                    <button class="tab-btn" data-tab="php">PHP Settings</button>
                    <button class="tab-btn" data-tab="extensions">PHP Extensions</button>
                </div>

                <!-- Apache Configuration Tab -->
                <div class="tab-content active" id="apache-tab">
                    <h3>Apache HTTP Server Configuration</h3>
                    
                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/apache.svg" alt="Apache" class="section-icon-small">
                                Network Settings
                            </h4>
                        </div>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="apache-port">Server Port:</label>
                                <input type="number" id="apache-port" min="1" max="65535" value="80">
                                <small class="form-help">Default: 80 (HTTP), 443 (HTTPS)</small>
                            </div>
                            <div class="form-group">
                                <label for="apache-servername">Server Name:</label>
                                <input type="text" id="apache-servername" value="localhost">
                                <small class="form-help">Domain name or IP address</small>
                            </div>
                        </div>
                    </div>

                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/folder.svg" alt="Directory" class="section-icon-small">
                                Directory Settings
                            </h4>
                        </div>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="apache-document-root">Document Root:</label>
                                <input type="text" id="apache-document-root" readonly>
                                <small class="form-help">Main web directory (auto-configured)</small>
                            </div>
                            <div class="form-group">
                                <label for="apache-directory-index">Directory Index:</label>
                                <input type="text" id="apache-directory-index" value="index.html index.php">
                                <small class="form-help">Default files to serve</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MySQL Configuration Tab -->
                <div class="tab-content" id="mysql-tab">
                    <h3>MySQL Database Configuration</h3>
                    
                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/mysql.svg" alt="MySQL" class="section-icon-small">
                                Connection Settings
                            </h4>
                        </div>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="mysql-port">MySQL Port:</label>
                                <input type="number" id="mysql-port" min="1" max="65535" value="3306">
                                <small class="form-help">Default: 3306</small>
                            </div>
                            <div class="form-group">
                                <label for="mysql-bind-address">Bind Address:</label>
                                <input type="text" id="mysql-bind-address" value="127.0.0.1">
                                <small class="form-help">IP address to bind to</small>
                            </div>
                        </div>
                    </div>

                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/performance.svg" alt="Performance" class="section-icon-small">
                                Performance Settings
                            </h4>
                        </div>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="mysql-max-connections">Max Connections:</label>
                                <input type="number" id="mysql-max-connections" min="1" max="1000" value="151">
                                <small class="form-help">Maximum concurrent connections</small>
                            </div>
                            <div class="form-group">
                                <label for="mysql-innodb-buffer-pool">InnoDB Buffer Pool Size:</label>
                                <input type="text" id="mysql-innodb-buffer-pool" value="128M">
                                <small class="form-help">Memory for caching data and indexes</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PHP Configuration Tab -->
                <div class="tab-content" id="php-tab">
                    <h3>PHP Configuration</h3>
                    
                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/php.svg" alt="PHP" class="section-icon-small">
                                Memory & Execution
                            </h4>
                        </div>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="php-memory-limit">Memory Limit:</label>
                                <input type="text" id="php-memory-limit" value="128M">
                                <small class="form-help">Maximum memory per script</small>
                            </div>
                            <div class="form-group">
                                <label for="php-max-execution-time">Max Execution Time:</label>
                                <input type="number" id="php-max-execution-time" min="0" max="3600" value="30">
                                <small class="form-help">Maximum execution time in seconds</small>
                            </div>
                            <div class="form-group">
                                <label for="php-upload-max-filesize">Upload Max Filesize:</label>
                                <input type="text" id="php-upload-max-filesize" value="2M">
                                <small class="form-help">Maximum file upload size</small>
                            </div>
                        </div>
                    </div>

                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/error.svg" alt="Error" class="section-icon-small">
                                Error Reporting
                            </h4>
                        </div>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="php-display-errors">Display Errors:</label>
                                <select id="php-display-errors">
                                    <option value="On">On</option>
                                    <option value="Off">Off</option>
                                </select>
                                <small class="form-help">Show errors in browser</small>
                            </div>
                            <div class="form-group">
                                <label for="php-error-reporting">Error Reporting Level:</label>
                                <select id="php-error-reporting">
                                    <option value="E_ALL">All Errors</option>
                                    <option value="E_ALL & ~E_NOTICE">All except Notices</option>
                                    <option value="E_ERROR | E_WARNING | E_PARSE">Errors, Warnings, Parse</option>
                                </select>
                                <small class="form-help">Types of errors to report</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PHP Extensions Configuration Tab -->
                <div class="tab-content" id="extensions-tab">
                    <h3>PHP Extensions Manager</h3>
                    
                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/php.svg" alt="PHP Extensions" class="section-icon-small">
                                PHP Version & Extensions
                            </h4>
                        </div>
                        <div class="config-form">
                            <div class="form-group">
                                <label for="php-version-extensions">PHP Version:</label>
                                <select id="php-version-extensions">
                                    <!-- Options will be populated dynamically -->
                                </select>
                                <small class="form-help">Select PHP version to manage extensions</small>
                            </div>
                            <div class="form-group">
                                <button type="button" id="refresh-extensions-btn" class="btn btn-secondary">
                                    <img src="assets/icons/refresh.svg" alt="Refresh" class="btn-icon">
                                    Refresh Extensions
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="download-section">
                        <div class="section-header">
                            <h4>
                                <img src="assets/icons/extension.svg" alt="Extensions" class="section-icon-small">
                                Available Extensions
                            </h4>
                        </div>
                        <div class="extensions-container">
                            <div class="extensions-grid">
                                <!-- Extensions will be dynamically loaded here -->
                                <div class="loading-message">Loading PHP extensions... Please wait.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <div class="config-status" id="configStatus">Ready to configure</div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="configValidateBtn">
                        <img src="assets/icons/check.svg" alt="Validate" class="btn-icon">
                        Validate Configuration
                    </button>
                    <button class="btn btn-primary" id="configSaveBtn">
                        <img src="assets/icons/save.svg" alt="Save" class="btn-icon">
                        Save & Apply
                    </button>
                    <button class="btn btn-secondary" id="configResetBtn">Reset to Defaults</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.bindModalEvents();
  }

  /**
   * Bind configuration button events
   */
  bindConfigurationButtons() {
    // Bind all config buttons with data-config attribute
    const configButtons = document.querySelectorAll('.config-btn[data-config]');
    
    configButtons.forEach(button => {
      const configType = button.getAttribute('data-config');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Opening ${configType} configuration...`);
        this.openConfigModal(configType);
      });
    });
    
    console.log(`Bound ${configButtons.length} configuration buttons`);
  }

  /**
   * Bind modal events
   */
  bindModalEvents() {
    const modal = document.getElementById('configModal');
    const closeBtn = document.getElementById('configModalClose');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const validateBtn = document.getElementById('configValidateBtn');
    const saveBtn = document.getElementById('configSaveBtn');
    const resetBtn = document.getElementById('configResetBtn');

    // Close modal
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    // Tab switching
    tabButtons.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchConfigTab(tabName);
      });
    });

    // Validate configuration
    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        this.validateConfiguration();
      });
    }

    // Save configuration
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveConfiguration();
      });
    }

    // Reset to defaults
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetToDefaults();
      });
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  /**
   * Open configuration modal for specific service
   */
  openConfigModal(service = 'apache') {
    console.log(`Opening ${service} configuration modal...`);
    
    const modal = document.getElementById('configModal');
    if (!modal) {
      console.error('Configuration modal not found! Creating it now...');
      this.createConfigurationModal();
    }
    
    const finalModal = document.getElementById('configModal');
    if (finalModal) {
      console.log('Modal found, showing...');
      finalModal.classList.add('active');
      this.switchConfigTab(service);
    } else {
      console.error('Failed to create/find configuration modal');
    }
  }

  /**
   * Switch between configuration tabs
   */
  switchConfigTab(tabName) {
    console.log(`Switching to ${tabName} tab`);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
      targetTab.classList.add('active');
    }
  }

  /**
   * Load current configurations from server
   */
  async loadCurrentConfigurations() {
    try {
      this.updateStatus('Loading current configurations...', 'info');
      
      // Load Apache config
      const apacheConfig = await window.electronAPI.getApacheConfig();
      if (apacheConfig && !apacheConfig.error) {
        this.populateApacheConfig(apacheConfig);
      }

      // Load MySQL config
      const mysqlConfig = await window.electronAPI.getMySQLConfig();
      if (mysqlConfig && !mysqlConfig.error) {
        this.populateMySQLConfig(mysqlConfig);
      }

      // Load PHP config
      const phpConfig = await window.electronAPI.getPHPConfig();
      if (phpConfig && !phpConfig.error) {
        this.populatePHPConfig(phpConfig);
      }

      this.updateStatus('Configuration loaded successfully', 'success');
      
    } catch (error) {
      console.error('Error loading configurations:', error);
      this.updateStatus('Error loading configurations', 'error');
    }
  }

  /**
   * Populate Apache configuration form
   */
  populateApacheConfig(config) {
    if (config.port) document.getElementById('apache-port').value = config.port;
    if (config.serverName) document.getElementById('apache-servername').value = config.serverName;
    if (config.documentRoot) document.getElementById('apache-document-root').value = config.documentRoot;
    if (config.directoryIndex) document.getElementById('apache-directory-index').value = config.directoryIndex;
  }

  /**
   * Populate MySQL configuration form
   */
  populateMySQLConfig(config) {
    if (config.port) document.getElementById('mysql-port').value = config.port;
    if (config.bindAddress) document.getElementById('mysql-bind-address').value = config.bindAddress;
    if (config.maxConnections) document.getElementById('mysql-max-connections').value = config.maxConnections;
    if (config.innodbBufferPoolSize) document.getElementById('mysql-innodb-buffer-pool').value = config.innodbBufferPoolSize;
  }

  /**
   * Populate PHP configuration form
   */
  populatePHPConfig(config) {
    if (config.memoryLimit) document.getElementById('php-memory-limit').value = config.memoryLimit;
    if (config.maxExecutionTime) document.getElementById('php-max-execution-time').value = config.maxExecutionTime;
    if (config.uploadMaxFilesize) document.getElementById('php-upload-max-filesize').value = config.uploadMaxFilesize;
    if (config.displayErrors) document.getElementById('php-display-errors').value = config.displayErrors;
    if (config.errorReporting) document.getElementById('php-error-reporting').value = config.errorReporting;
  }

  /**
   * Validate configuration
   */
  async validateConfiguration() {
    try {
      this.updateStatus('Validating configuration...', 'info');
      
      // Get current tab
      const activeTab = document.querySelector('.tab-btn.active');
      const service = activeTab ? activeTab.dataset.tab : 'apache';
      
      // Collect configuration data
      const config = this.collectConfigurationData(service);
      
      // Validate via backend
      const result = await window.electronAPI.validateConfig(service, config);
      
      if (result.valid) {
        this.updateStatus('Configuration is valid', 'success');
        document.getElementById('configSaveBtn').disabled = false;
      } else {
        this.updateStatus(`Validation failed: ${result.error}`, 'error');
        document.getElementById('configSaveBtn').disabled = true;
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      this.updateStatus('Validation error occurred', 'error');
    }
  }

  /**
   * Save configuration
   */
  async saveConfiguration() {
    try {
      this.updateStatus('Saving configuration...', 'info');
      
      // Get current tab
      const activeTab = document.querySelector('.tab-btn.active');
      const service = activeTab ? activeTab.dataset.tab : 'apache';
      
      // Collect configuration data
      const config = this.collectConfigurationData(service);
      
      // Save via backend
      const result = await window.electronAPI.saveConfig(service, config, true);
      
      if (result.success) {
        this.updateStatus('Configuration saved and service restarted', 'success');
      } else {
        this.updateStatus(`Save failed: ${result.error}`, 'error');
      }
      
    } catch (error) {
      console.error('Save error:', error);
      this.updateStatus('Save error occurred', 'error');
    }
  }

  /**
   * Collect configuration data from form
   */
  collectConfigurationData(service) {
    const config = {};
    
    if (service === 'apache') {
      config.port = document.getElementById('apache-port').value;
      config.serverName = document.getElementById('apache-servername').value;
      config.documentRoot = document.getElementById('apache-document-root').value;
      config.directoryIndex = document.getElementById('apache-directory-index').value;
    } else if (service === 'mysql') {
      config.port = document.getElementById('mysql-port').value;
      config.bindAddress = document.getElementById('mysql-bind-address').value;
      config.maxConnections = document.getElementById('mysql-max-connections').value;
      config.innodbBufferPoolSize = document.getElementById('mysql-innodb-buffer-pool').value;
    } else if (service === 'php') {
      config.memoryLimit = document.getElementById('php-memory-limit').value;
      config.maxExecutionTime = document.getElementById('php-max-execution-time').value;
      config.uploadMaxFilesize = document.getElementById('php-upload-max-filesize').value;
      config.displayErrors = document.getElementById('php-display-errors').value;
      config.errorReporting = document.getElementById('php-error-reporting').value;
    }
    
    return config;
  }

  /**
   * Reset to defaults
   */
  resetToDefaults() {
    const activeTab = document.querySelector('.tab-btn.active');
    const service = activeTab ? activeTab.dataset.tab : 'apache';
    
    if (service === 'apache') {
      document.getElementById('apache-port').value = '80';
      document.getElementById('apache-servername').value = 'localhost';
      document.getElementById('apache-directory-index').value = 'index.html index.php';
    } else if (service === 'mysql') {
      document.getElementById('mysql-port').value = '3306';
      document.getElementById('mysql-bind-address').value = '127.0.0.1';
      document.getElementById('mysql-max-connections').value = '151';
      document.getElementById('mysql-innodb-buffer-pool').value = '128M';
    } else if (service === 'php') {
      document.getElementById('php-memory-limit').value = '128M';
      document.getElementById('php-max-execution-time').value = '30';
      document.getElementById('php-upload-max-filesize').value = '2M';
      document.getElementById('php-display-errors').value = 'On';
      document.getElementById('php-error-reporting').value = 'E_ALL';
    }
    
    this.updateStatus('Reset to default values', 'info');
  }

  /**
   * Update status message
   */
  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('configStatus');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `config-status ${type}`;
    }
  }

  /**
   * Populate PHP version selectors with available versions
   */
  async populatePhpVersionSelectors() {
    try {
      console.log('Populating PHP version selectors...');
      
      let phpVersions = [];
      
      // Try to get versions from backend
      if (window.electronAPI && window.electronAPI.getPHPVersions) {
        const result = await window.electronAPI.getPHPVersions();
        if (result && result.success && result.versions) {
          phpVersions = result.versions;
          console.log('PHP versions from backend:', phpVersions);
        }
      }
      
      // Fallback to default versions if none found
      if (phpVersions.length === 0) {
        console.log('Using fallback PHP versions');
        phpVersions = ['8.2', '8.1', '8.0', '7.4'];
      }
      
      // Populate main PHP version selector
      const phpVersionSelect = document.getElementById('phpVersion');
      if (phpVersionSelect) {
        phpVersionSelect.innerHTML = '';
        phpVersions.forEach(version => {
          const option = document.createElement('option');
          option.value = version;
          option.textContent = `PHP ${version}`;
          phpVersionSelect.appendChild(option);
        });
      }
      
      // Update PHP Extensions modal selector
      const phpExtensionsSelector = document.getElementById('php-version-extensions');
      if (phpExtensionsSelector) {
        phpExtensionsSelector.innerHTML = '';
        phpVersions.forEach(version => {
          const option = document.createElement('option');
          option.value = version;
          option.textContent = `PHP ${version}`;
          if (version === '8.2') option.selected = true; // Default to 8.2
          phpExtensionsSelector.appendChild(option);
        });
        
        // Add change event listener to reload extensions when version changes
        phpExtensionsSelector.addEventListener('change', () => {
          this.loadPhpExtensions();
        });
      }
      
      console.log('PHP version selectors populated successfully');
      
    } catch (error) {
      console.error('Error populating PHP version selectors:', error);
      this.populateFallbackPhpVersions();
    }
  }

  /**
   * Populate fallback PHP versions
   */
  populateFallbackPhpVersions() {
    const fallbackVersions = ['8.2', '8.1', '8.0', '7.4'];
    
    // Populate PHP Extensions selector with fallback
    const phpExtensionsSelector = document.getElementById('php-version-extensions');
    if (phpExtensionsSelector) {
      phpExtensionsSelector.innerHTML = '';
      fallbackVersions.forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = `PHP ${version}`;
        phpExtensionsSelector.appendChild(option);
      });
    }
  }

  /**
   * Load PHP Extensions status
   */
  async loadPhpExtensions() {
    console.log('Loading PHP extensions status...');
    
    try {
      // Try to get current PHP version from extensions tab selector
      let version = '8.2'; // Default fallback
      
      // Check the PHP version selector in extensions tab first
      const phpVersionExtensions = document.getElementById('php-version-extensions');
      if (phpVersionExtensions && phpVersionExtensions.value) {
        version = phpVersionExtensions.value;
        console.log('Found PHP version from extensions selector:', version);
      } else {
        // Fallback to main PHP version selector
        const phpVersionSelect = document.getElementById('phpVersion');
        if (phpVersionSelect && phpVersionSelect.value) {
          version = phpVersionSelect.value;
          console.log('Found PHP version from main selector:', version);
        } else {
          console.log('Using default PHP version:', version);
        }
      }
      
      // Get extensions status from backend
      if (window.electronAPI && window.electronAPI.getPHPExtensions) {
        console.log(`Requesting PHP extensions for version ${version}...`);
        const result = await window.electronAPI.getPHPExtensions(version);
        
        if (result.success) {
          console.log('Successfully loaded PHP extensions:', result.extensions);
          this.renderPhpExtensions(result.extensions);
          return;
        } else {
          console.error('Failed to load PHP extensions:', result.error);
        }
      } else {
        console.error('electronAPI.getPHPExtensions not available');
      }
      
      // Fallback to default extensions
      console.log('Using default extensions configuration');
      this.renderPhpExtensions(this.getDefaultExtensions());
      
    } catch (error) {
      console.error('Error loading PHP extensions:', error);
      // Fallback to default extensions
      this.renderPhpExtensions(this.getDefaultExtensions());
    }
  }

  /**
   * Render PHP extensions interface
   */
  renderPhpExtensions(extensions) {
    console.log('Rendering PHP extensions:', extensions);
    
    // Find the extensions grid container in the extensions tab
    let extensionsGrid = document.querySelector('#extensions-tab .extensions-grid');
    
    if (!extensionsGrid) {
      console.error('Extensions grid container not found in extensions tab');
      return;
    }

    console.log('Found extensions grid container:', extensionsGrid);

    // Clear existing content
    extensionsGrid.innerHTML = '';
    
    // Create extension items
    Object.entries(extensions).forEach(([name, config]) => {
      const extensionItem = document.createElement('div');
      extensionItem.className = 'extension-item';
      
      const extensionLabel = document.createElement('label');
      extensionLabel.className = 'extension-label';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'php-ext';
      checkbox.value = name;
      checkbox.checked = config.enabled;
      checkbox.setAttribute('data-extension', name);
      
      const extensionName = document.createElement('span');
      extensionName.className = 'extension-name';
      extensionName.textContent = name;
      
      const extensionDesc = document.createElement('span');
      extensionDesc.className = 'extension-desc';
      extensionDesc.textContent = config.description || 'PHP Extension';
      
      // Build the structure
      extensionLabel.appendChild(checkbox);
      extensionLabel.appendChild(extensionName);
      extensionLabel.appendChild(extensionDesc);
      extensionItem.appendChild(extensionLabel);
      
      extensionsGrid.appendChild(extensionItem);
    });

    console.log('PHP extensions rendered successfully');
  }

  /**
   * Get default extensions for fallback
   */
  getDefaultExtensions() {
    return {
      'curl': { enabled: true, description: 'Client URL Library' },
      'gd': { enabled: true, description: 'Image Processing and GD' },
      'mbstring': { enabled: true, description: 'Multibyte String' },
      'mysqli': { enabled: true, description: 'MySQL Improved Extension' },
      'pdo_mysql': { enabled: true, description: 'PDO Driver for MySQL' },
      'openssl': { enabled: true, description: 'OpenSSL Support' },
      'zip': { enabled: true, description: 'Zip Archive Support' },
      'xml': { enabled: true, description: 'XML Parser' },
      'json': { enabled: true, description: 'JavaScript Object Notation' },
      'fileinfo': { enabled: true, description: 'File Information' },
      'intl': { enabled: false, description: 'Internationalization Functions' },
      'imap': { enabled: false, description: 'IMAP, POP3 and NNTP' },
      'ldap': { enabled: false, description: 'LDAP Protocol Support' },
      'soap': { enabled: false, description: 'SOAP Protocol Support' },
      'xdebug': { enabled: false, description: 'Debugging and Profiling Tool' }
    };
  }
}

// Initialize Configuration UI when DOM is loaded and Electron API is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, waiting for Electron API...');
  
  // Wait for Electron API to be ready before initializing ConfigurationUI
  const waitForElectronAPI = () => {
    if (window.electronAPI && window.electronAPI.invoke) {
      console.log('Electron API ready, initializing ConfigurationUI...');
      try {
        window.configUI = new ConfigurationUI();
        console.log('ConfigurationUI initialized successfully');
      } catch (error) {
        console.error('Error initializing ConfigurationUI:', error);
      }
    } else {
      console.log('Waiting for Electron API...');
      setTimeout(waitForElectronAPI, 100);
    }
  };
  
  waitForElectronAPI();
});
