/**
 * ConfigurationUI - Advanced Config  createConfigurationModal() {
    const modalHTML = `
    <div class="modal-overlay" id="configModal">
        <div class="modal-content">`ion Management for DevStackBox
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
  async initializeUI() {
    console.log('Initializing Configuration UI...');
    
    // Create configuration modal if not exists
    if (!document.getElementById('configModal')) {
      this.createConfigurationModal();
    }
    
    // Populate PHP version selectors
    await this.populatePhpVersionSelectors();
    
    // Bind configuration button events
    this.bindConfigurationButtons();
  }

  /**
   * Populate PHP version selectors with available versions
   */
  async populatePhpVersionSelectors() {
    try {
      // Get available PHP versions
      const phpVersions = await window.electronAPI.getPhpVersions();
      console.log('Available PHP versions:', phpVersions);
      
      if (phpVersions && phpVersions.length > 0) {
        // Update PHP Config tab selector
        const phpConfigSelector = document.getElementById('php-version-config');
        if (phpConfigSelector) {
          phpConfigSelector.innerHTML = '';
          phpVersions.forEach(version => {
            const option = document.createElement('option');
            option.value = version.version;
            option.textContent = `PHP ${version.version}`;
            if (version.current) {
              option.selected = true;
            }
            phpConfigSelector.appendChild(option);
          });
        }

        // Update PHP Extensions modal selector
        const phpExtensionsSelector = document.getElementById('php-version-extensions');
        if (phpExtensionsSelector) {
          phpExtensionsSelector.innerHTML = '';
          phpVersions.forEach(version => {
            const option = document.createElement('option');
            option.value = version.version;
            option.textContent = `PHP ${version.version}`;
            if (version.current) {
              option.selected = true;
            }
            phpExtensionsSelector.appendChild(option);
          });
        }
      } else {
        // Fallback to default versions if API is not available
        console.log('Using fallback PHP versions');
        this.populateFallbackPhpVersions();
      }
    } catch (error) {
      console.error('Error loading PHP versions:', error);
      this.populateFallbackPhpVersions();
    }
  }

  /**
   * Populate fallback PHP versions
   */
  populateFallbackPhpVersions() {
    const defaultVersions = [
      { version: '8.1', current: false },
      { version: '8.2', current: true },
      { version: '8.3', current: false },
      { version: '8.4', current: false }
    ];

    // Update both selectors
    ['php-version-config', 'php-version-extensions'].forEach(selectorId => {
      const selector = document.getElementById(selectorId);
      if (selector) {
        selector.innerHTML = '';
        defaultVersions.forEach(version => {
          const option = document.createElement('option');
          option.value = version.version;
          option.textContent = `PHP ${version.version}`;
          if (version.current) {
            option.selected = true;
          }
          selector.appendChild(option);
        });
      }
    });
  }

  /**
   * Create the main configuration modal using Downloads & Settings design
   */
  createConfigurationModal() {
    const modalHTML = `
    <div class="modal-overlay" id="configModal">
        <div class="modal-content config-modal-compact">
            <div class="modal-header">
                <h2>
                    <img src="assets/icons/settings.svg" alt="Configuration" class="modal-icon">
                    Server Configuration
                </h2>
                <button class="modal-close" id="configModalClose">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="settings-tabs">
                    <button class="tab-btn active" data-tab="apache">Apache</button>
                    <button class="tab-btn" data-tab="mysql">MySQL</button>
                    <button class="tab-btn" data-tab="php">PHP Config</button>
                    <button class="tab-btn" data-tab="php-extensions">PHP Extensions</button>
                </div>

                <!-- Apache Configuration Tab -->
                <div class="tab-content active" id="apache-tab">
                    <div class="config-section-compact">
                        <h4>Network Settings</h4>
                        <div class="config-grid">
                            <div class="form-group">
                                <label for="apache-port">Port:</label>
                                <input type="number" id="apache-port" min="1" max="65535" value="80">
                            </div>
                            <div class="form-group">
                                <label for="apache-servername">Server Name:</label>
                                <input type="text" id="apache-servername" value="localhost">
                            </div>
                        </div>
                    </div>

                    <div class="config-section-compact">
                        <h4>Directory Settings</h4>
                        <div class="config-grid">
                            <div class="form-group">
                                <label for="apache-document-root">Document Root:</label>
                                <input type="text" id="apache-document-root" readonly>
                            </div>
                            <div class="form-group">
                                <label for="apache-directory-index">Directory Index:</label>
                                <input type="text" id="apache-directory-index" value="index.html index.php">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MySQL Configuration Tab -->
                <div class="tab-content" id="mysql-tab">
                    <div class="config-section-compact">
                        <h4>Connection Settings</h4>
                        <div class="config-grid">
                            <div class="form-group">
                                <label for="mysql-port">Port:</label>
                                <input type="number" id="mysql-port" min="1" max="65535" value="3306">
                            </div>
                            <div class="form-group">
                                <label for="mysql-bind-address">Bind Address:</label>
                                <input type="text" id="mysql-bind-address" value="127.0.0.1">
                            </div>
                        </div>
                    </div>

                    <div class="config-section-compact">
                        <h4>Performance Settings</h4>
                        <div class="config-grid">
                            <div class="form-group">
                                <label for="mysql-max-connections">Max Connections:</label>
                                <input type="number" id="mysql-max-connections" min="1" max="1000" value="151">
                            </div>
                            <div class="form-group">
                                <label for="mysql-innodb-buffer-pool">Buffer Pool Size:</label>
                                <input type="text" id="mysql-innodb-buffer-pool" value="128M">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PHP Configuration Tab -->
                <div class="tab-content" id="php-tab">
                    <div class="config-section-compact">
                        <h4>PHP Version & Basic Settings</h4>
                        <div class="config-grid">
                            <div class="form-group">
                                <label for="php-version-config">PHP Version:</label>
                                <select id="php-version-config">
                                    <option value="8.1">PHP 8.1</option>
                                    <option value="8.2" selected>PHP 8.2</option>
                                    <option value="8.3">PHP 8.3</option>
                                    <option value="8.4">PHP 8.4</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="php-memory-limit">Memory Limit:</label>
                                <input type="text" id="php-memory-limit" value="128M">
                            </div>
                            <div class="form-group">
                                <label for="php-max-execution-time">Max Execution Time:</label>
                                <input type="number" id="php-max-execution-time" min="0" max="3600" value="30">
                            </div>
                            <div class="form-group">
                                <label for="php-upload-max-filesize">Upload Max Size:</label>
                                <input type="text" id="php-upload-max-filesize" value="2M">
                            </div>
                            <div class="form-group">
                                <label for="php-post-max-size">Post Max Size:</label>
                                <input type="text" id="php-post-max-size" value="8M">
                            </div>
                        </div>
                    </div>

                    <div class="config-section-compact">
                        <h4>Error Reporting</h4>
                        <div class="config-grid">
                            <div class="form-group">
                                <label for="php-display-errors">Display Errors:</label>
                                <select id="php-display-errors">
                                    <option value="On">On</option>
                                    <option value="Off">Off</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="php-error-reporting">Error Level:</label>
                                <select id="php-error-reporting">
                                    <option value="E_ALL">All Errors</option>
                                    <option value="E_ALL & ~E_NOTICE">All except Notices</option>
                                    <option value="E_ERROR | E_WARNING | E_PARSE">Errors, Warnings, Parse</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PHP Extensions Configuration Tab -->
                <div class="tab-content" id="php-extensions-tab">
                    <div class="config-section-compact">
                        <h4>PHP Version & Extensions Management</h4>
                        <div class="config-grid">
                            <div class="form-group">
                                <label for="php-version-extensions">PHP Version:</label>
                                <select id="php-version-extensions">
                                    <option value="8.1">PHP 8.1</option>
                                    <option value="8.2" selected>PHP 8.2</option>
                                    <option value="8.3">PHP 8.3</option>
                                    <option value="8.4">PHP 8.4</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <button type="button" id="refresh-extensions-btn" class="btn btn-secondary">
                                    Refresh Extensions
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="config-section-compact">
                        <h4>Available Extensions</h4>
                        <div class="extensions-container">
                            <div class="extensions-grid">
                                <!-- Extensions will be dynamically loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <div class="config-status" id="configStatus">Ready to configure</div>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="configValidateBtn">Validate</button>
                    <button class="btn btn-primary" id="configSaveBtn">Save & Apply</button>
                    <button class="btn btn-secondary" id="configResetBtn">Reset</button>
                    <button class="btn btn-info" id="savePhpExtensionsBtn" style="display:none;">Save Extensions</button>
                    <button class="btn btn-warning" id="resetPhpExtensionsBtn" style="display:none;">Reset Extensions</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Wait for next tick to ensure DOM elements are available
    setTimeout(() => {
      this.bindModalEvents();
      console.log('Configuration modal created and events bound');
      console.log('Modal element:', document.getElementById('configModal'));
    }, 0);
  }

  /**
   * Bind configuration button events
   */
  bindConfigurationButtons() {
    // Wait for DOM to be ready if needed
    const bindButtons = () => {
      // Bind all config buttons with data-config attribute
      const configButtons = document.querySelectorAll('.config-btn[data-config]');
      
      console.log(`Found ${configButtons.length} configuration buttons to bind`);
      
      configButtons.forEach(button => {
        const configType = button.getAttribute('data-config');
        console.log(`Binding ${configType} configuration button`);
        button.addEventListener('click', (e) => {
          e.preventDefault();
          console.log(`Opening ${configType} configuration...`);
          this.openConfigModal(configType);
        });
      });
      
      // Bind the Configure Extensions button
      const configureExtensionsBtn = document.getElementById('configureExtensionsBtn');
      if (configureExtensionsBtn) {
        console.log('Binding Configure Extensions button');
        configureExtensionsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Opening PHP Extensions modal...');
          this.openPhpExtensionsModal();
        });
      }
      
      // Bind the Load Extensions button (from main interface)
      const loadExtensionsBtn = document.getElementById('loadExtensionsBtn');
      if (loadExtensionsBtn) {
        console.log('Binding Load Extensions button');
        loadExtensionsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Opening PHP Extensions modal...');
          this.openPhpExtensionsModal();
        });
      }
      
      // Bind the Reset Extensions button
      const resetExtensionsBtn = document.getElementById('resetExtensionsBtn');
      if (resetExtensionsBtn) {
        console.log('Binding Reset Extensions button');
        resetExtensionsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Resetting PHP extensions to defaults...');
          this.resetPhpExtensions();
        });
      }
      
      // Bind the Refresh Extensions button
      const refreshExtensionsBtn = document.getElementById('refresh-extensions-btn');
      if (refreshExtensionsBtn) {
        console.log('Binding Refresh Extensions button');
        refreshExtensionsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Refreshing PHP extensions...');
          this.loadPhpExtensions();
        });
      }
      
      // Bind the PHP version selector
      const phpVersionExtensions = document.getElementById('php-version-extensions');
      if (phpVersionExtensions) {
        console.log('Binding PHP version extensions selector');
        phpVersionExtensions.addEventListener('change', (e) => {
          const version = e.target.value;
          console.log(`PHP extensions version changed to: ${version}`);
          this.loadPhpExtensions();
        });
      }
      
      console.log(`Bound ${configButtons.length} configuration buttons`);
    };

    // If DOM is ready, bind immediately, otherwise wait
    if (document.readyState !== 'loading') {
      bindButtons();
    } else {
      document.addEventListener('DOMContentLoaded', bindButtons);
    }
  }

  /**
   * Open PHP Extensions modal
   */
  openPhpExtensionsModal() {
    console.log('Opening PHP Extensions configuration...');
    
    try {
      // Open the main configuration modal with PHP Extensions tab
      this.openConfigModal('php-extensions');
    } catch (error) {
      console.error('Error opening PHP Extensions configuration:', error);
      alert('Error opening PHP Extensions configuration: ' + error.message);
    }
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
    
    // PHP Extensions specific buttons
    const savePhpExtensionsBtn = document.getElementById('savePhpExtensionsBtn');
    const resetPhpExtensionsBtn = document.getElementById('resetPhpExtensionsBtn');
    const refreshExtensionsBtn = document.getElementById('refresh-extensions-btn');
    const phpVersionExtensions = document.getElementById('php-version-extensions');

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

    // PHP Extensions specific event handlers
    if (savePhpExtensionsBtn) {
      savePhpExtensionsBtn.addEventListener('click', () => {
        this.savePhpExtensions();
      });
    }

    if (resetPhpExtensionsBtn) {
      resetPhpExtensionsBtn.addEventListener('click', () => {
        this.resetPhpExtensions();
      });
    }

    if (refreshExtensionsBtn) {
      refreshExtensionsBtn.addEventListener('click', () => {
        this.loadPhpExtensions();
      });
    }

    if (phpVersionExtensions) {
      phpVersionExtensions.addEventListener('change', (e) => {
        const version = e.target.value;
        console.log(`PHP extensions version changed to: ${version}`);
        this.loadPhpExtensions();
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  }

  /**
   * Open configuration modal for specific service
   */
  openConfigModal(service = 'apache') {
    console.log(`Opening ${service} configuration modal...`);
    
    try {
      let modal = document.getElementById('configModal');
      if (!modal) {
        console.error('Configuration modal not found! Creating it now...');
        this.createConfigurationModal();
        
        // Wait a bit for modal to be created
        setTimeout(() => {
          modal = document.getElementById('configModal');
          if (modal) {
            console.log('Modal created, showing...');
            console.log('Modal classes before:', modal.className);
            modal.classList.add('active');
            console.log('Modal classes after:', modal.className);
            this.switchConfigTab(service);
          } else {
            console.error('Failed to create configuration modal');
            alert('Unable to open configuration modal. Please refresh the page and try again.');
          }
        }, 100);
      } else {
        console.log('Modal found, showing...');
        console.log('Modal classes before:', modal.className);
        modal.classList.add('active');
        console.log('Modal classes after:', modal.className);
        this.switchConfigTab(service);
      }
    } catch (error) {
      console.error('Error opening configuration modal:', error);
      alert('Error opening configuration modal: ' + error.message);
    }
  }

  /**
   * Switch between configuration tabs
   */
  switchConfigTab(tabName) {
    console.log(`Switching to ${tabName} tab`);
    
    try {
      // Update tab buttons
      const tabButtons = document.querySelectorAll('.tab-btn');
      console.log(`Found ${tabButtons.length} tab buttons`);
      
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
          btn.classList.add('active');
          console.log(`Activated ${tabName} tab button`);
        }
      });

      // Update tab content
      const tabContents = document.querySelectorAll('.tab-content');
      console.log(`Found ${tabContents.length} tab contents`);
      
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      const targetTab = document.getElementById(`${tabName}-tab`);
      if (targetTab) {
        targetTab.classList.add('active');
        console.log(`Activated ${tabName} tab content`);
      } else {
        console.error(`Tab content for ${tabName} not found`);
      }

      // Show/hide appropriate buttons based on tab
      const savePhpExtensionsBtn = document.getElementById('savePhpExtensionsBtn');
      const resetPhpExtensionsBtn = document.getElementById('resetPhpExtensionsBtn');
      const configValidateBtn = document.getElementById('configValidateBtn');
      const configSaveBtn = document.getElementById('configSaveBtn');
      const configResetBtn = document.getElementById('configResetBtn');

      if (tabName === 'php-extensions') {
        // Show PHP Extensions buttons
        if (savePhpExtensionsBtn) savePhpExtensionsBtn.style.display = 'inline-block';
        if (resetPhpExtensionsBtn) resetPhpExtensionsBtn.style.display = 'inline-block';
        // Hide general buttons
        if (configValidateBtn) configValidateBtn.style.display = 'none';
        if (configSaveBtn) configSaveBtn.style.display = 'none';
        if (configResetBtn) configResetBtn.style.display = 'none';
        
        // Load PHP extensions
        this.loadPhpExtensions();
      } else {
        // Hide PHP Extensions buttons
        if (savePhpExtensionsBtn) savePhpExtensionsBtn.style.display = 'none';
        if (resetPhpExtensionsBtn) resetPhpExtensionsBtn.style.display = 'none';
        // Show general buttons
        if (configValidateBtn) configValidateBtn.style.display = 'inline-block';
        if (configSaveBtn) configSaveBtn.style.display = 'inline-block';
        if (configResetBtn) configResetBtn.style.display = 'inline-block';
        
        // Load current configuration for this service
        this.loadConfigurationForService(tabName);
      }
    } catch (error) {
      console.error('Error switching tabs:', error);
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
   * Get default extensions list
   */
  getDefaultExtensions() {
    return {
      // Core extensions
      curl: { enabled: true, category: 'Core', description: 'HTTP requests and API calls' },
      gd: { enabled: true, category: 'Core', description: 'Image processing and thumbnail generation' },
      mbstring: { enabled: true, category: 'Core', description: 'Multibyte string handling (required)' },
      mysqli: { enabled: true, category: 'Database', description: 'MySQL database connection' },
      openssl: { enabled: true, category: 'Security', description: 'SSL/TLS encryption and secure connections' },
      zip: { enabled: true, category: 'Core', description: 'Archive handling for plugins/themes' },
      fileinfo: { enabled: true, category: 'Core', description: 'File type detection and validation' },
      exif: { enabled: true, category: 'Media', description: 'Image metadata extraction' },
      intl: { enabled: true, category: 'Core', description: 'Internationalization support' },
      opcache: { enabled: true, category: 'Performance', description: 'PHP accelerator for better performance' },
      
      // Optional extensions
      ftp: { enabled: false, category: 'Network', description: 'FTP client functionality' },
      soap: { enabled: false, category: 'Web Services', description: 'SOAP web services' },
      sockets: { enabled: false, category: 'Network', description: 'Low-level socket communication' },
      tidy: { enabled: false, category: 'HTML', description: 'HTML cleanup and validation' },
      xsl: { enabled: false, category: 'XML', description: 'XSL transformations' },
      bz2: { enabled: false, category: 'Compression', description: 'Bzip2 compression' }
    };
  }

  /**
   * Render PHP extensions interface
   */
  renderPhpExtensions(extensions) {
    console.log('Rendering PHP extensions:', extensions);
    
    // Find the extensions grid container in PHP Extensions tab
    let extensionsGrid = document.querySelector('#php-extensions-tab .extensions-grid');
    
    // Fallback to main interface extensions grid if tab not found
    if (!extensionsGrid) {
      extensionsGrid = document.querySelector('.extensions-section .extensions-grid');
    }
    
    // Another fallback: try to find any extensions grid
    if (!extensionsGrid) {
      extensionsGrid = document.querySelector('.extensions-grid');
    }
    
    if (!extensionsGrid) {
      console.error('Extensions grid container not found');
      console.log('Available elements with .extensions-grid:', document.querySelectorAll('.extensions-grid'));
      console.log('Available elements with .extensions-section:', document.querySelectorAll('.extensions-section'));
      return;
    }

    console.log('Found extensions grid container:', extensionsGrid);

    // Clear existing content
    extensionsGrid.innerHTML = '';
    
    // Add a temporary loading message to verify container is working
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = 'Loading PHP extensions...';
    loadingDiv.style.padding = '1rem';
    loadingDiv.style.textAlign = 'center';
    extensionsGrid.appendChild(loadingDiv);
    
    // Remove loading message
    extensionsGrid.innerHTML = '';
    
    // Create a simple grid of extensions instead of categories
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
   * Load configuration for a specific service
   */
  async loadConfigurationForService(service) {
    console.log(`Loading configuration for ${service}`);
    
    try {
      if (service === 'apache') {
        const apacheConfig = await window.electronAPI.getApacheConfig();
        if (apacheConfig && !apacheConfig.error) {
          this.populateApacheConfig(apacheConfig);
        }
      } else if (service === 'mysql') {
        const mysqlConfig = await window.electronAPI.getMySQLConfig();
        if (mysqlConfig && !mysqlConfig.error) {
          this.populateMySQLConfig(mysqlConfig);
        }
      } else if (service === 'php') {
        const phpConfig = await window.electronAPI.getPHPConfig();
        if (phpConfig && !phpConfig.error) {
          this.populatePHPConfig(phpConfig);
        }
      }
    } catch (error) {
      console.error(`Error loading ${service} configuration:`, error);
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
      
      // Handle PHP extensions differently
      if (service === 'php-extensions') {
        // Save PHP extensions configuration
        const result = await window.electronAPI.savePHPExtensions(config.version, config.extensions);
        
        if (result.success) {
          this.updateStatus('PHP extensions saved successfully', 'success');
          // Reload extensions to show updated status
          this.loadPhpExtensions();
        } else {
          this.updateStatus(`Extensions save failed: ${result.error}`, 'error');
        }
      } else {
        // Save regular service configuration
        const result = await window.electronAPI.saveConfig(service, config, true);
        
        if (result.success) {
          this.updateStatus('Configuration saved and service restarted', 'success');
        } else {
          this.updateStatus(`Save failed: ${result.error}`, 'error');
        }
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
    } else if (service === 'php-extensions') {
      // Collect PHP extensions configuration
      config.extensions = {};
      
      // Try to get current PHP version
      let phpVersion = '8.2'; // Default fallback
      const phpVersionSelect = document.getElementById('phpVersion');
      if (phpVersionSelect && phpVersionSelect.value) {
        phpVersion = phpVersionSelect.value;
      }
      config.version = phpVersion;
      
      // Get all extension checkboxes
      const extensionItems = document.querySelectorAll('.extension-label input[type="checkbox"]');
      extensionItems.forEach(checkbox => {
        const extensionName = checkbox.dataset.extension || checkbox.value;
        config.extensions[extensionName] = checkbox.checked;
      });
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
   * Save PHP Extensions Configuration
   */
  async savePhpExtensions() {
    try {
      console.log('Saving PHP extensions configuration...');
      
      // Get selected PHP version
      const phpVersionExtensions = document.getElementById('php-version-extensions');
      const version = phpVersionExtensions ? phpVersionExtensions.value : '8.2';
      
      // Collect enabled extensions from the main interface
      const extensionCheckboxes = document.querySelectorAll('.extensions-section input[type="checkbox"]');
      const enabledExtensions = {};
      
      extensionCheckboxes.forEach(checkbox => {
        const extensionName = checkbox.getAttribute('data-extension') || checkbox.value;
        if (extensionName) {
          enabledExtensions[extensionName] = checkbox.checked;
        }
      });
      
      console.log('Extensions to save:', enabledExtensions);
      
      // Send to backend
      if (window.electronAPI && window.electronAPI.savePHPExtensions) {
        const result = await window.electronAPI.savePHPExtensions(version, enabledExtensions);
        
        if (result.success) {
          this.updateStatus('PHP extensions configuration saved successfully!', 'success');
          alert('PHP extensions configuration saved! You may need to restart Apache for changes to take effect.');
        } else {
          this.updateStatus('Failed to save PHP extensions configuration', 'error');
          alert('Error saving PHP extensions: ' + (result.error || 'Unknown error'));
        }
      } else {
        console.warn('electronAPI.savePHPExtensions not available');
        alert('PHP extensions saving functionality is not available yet.');
      }
      
    } catch (error) {
      console.error('Error saving PHP extensions:', error);
      this.updateStatus('Error saving PHP extensions configuration', 'error');
      alert('Error saving PHP extensions: ' + error.message);
    }
  }

  /**
   * Reset PHP Extensions to Defaults
   */
  async resetPhpExtensions() {
    if (!confirm('Are you sure you want to reset PHP extensions to default configuration?')) {
      return;
    }
    
    try {
      console.log('Resetting PHP extensions to defaults...');
      
      // Load default extensions
      const defaultExtensions = this.getDefaultExtensions();
      
      // Re-render with defaults
      this.renderPhpExtensions(defaultExtensions);
      
      this.updateStatus('PHP extensions reset to defaults', 'success');
      
    } catch (error) {
      console.error('Error resetting PHP extensions:', error);
      this.updateStatus('Error resetting PHP extensions', 'error');
    }
  }

  /**
   * Save PHP extensions configuration
   */
  async savePhpExtensions() {
    console.log('Saving PHP extensions configuration...');
    
    try {
      const checkboxes = document.querySelectorAll('#php-extensions-tab input[type="checkbox"][data-extension]');
      const extensions = {};
      
      checkboxes.forEach(checkbox => {
        const extensionName = checkbox.getAttribute('data-extension');
        extensions[extensionName] = {
          enabled: checkbox.checked
        };
      });
      
      console.log('Extensions to save:', extensions);
      
      // Get current PHP version
      const phpVersionExtensions = document.getElementById('php-version-extensions');
      const version = phpVersionExtensions ? phpVersionExtensions.value : '8.2';
      
      if (window.electronAPI && window.electronAPI.savePHPExtensions) {
        const result = await window.electronAPI.savePHPExtensions(version, extensions);
        if (result.success) {
          this.updateConfigStatus('PHP extensions saved successfully!', 'success');
        } else {
          this.updateConfigStatus('Failed to save PHP extensions: ' + result.error, 'error');
        }
      } else {
        console.log('electronAPI.savePHPExtensions not available - simulating save');
        this.updateConfigStatus('PHP extensions configuration saved (simulation)', 'success');
      }
    } catch (error) {
      console.error('Error saving PHP extensions:', error);
      this.updateConfigStatus('Error saving PHP extensions: ' + error.message, 'error');
    }
  }

  /**
   * Reset PHP extensions to defaults
   */
  resetPhpExtensions() {
    console.log('Resetting PHP extensions to defaults...');
    
    try {
      const defaultExtensions = this.getDefaultExtensions();
      this.renderPhpExtensions(defaultExtensions);
      this.updateConfigStatus('PHP extensions reset to defaults', 'info');
    } catch (error) {
      console.error('Error resetting PHP extensions:', error);
      this.updateConfigStatus('Error resetting PHP extensions: ' + error.message, 'error');
    }
  }

  /**
   * Update configuration status message
   */
  updateConfigStatus(message, type = 'info') {
    const statusElement = document.getElementById('configStatus');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `config-status ${type}`;
      
      // Clear status after 5 seconds
      setTimeout(() => {
        statusElement.textContent = 'Ready to configure';
        statusElement.className = 'config-status';
      }, 5000);
    }
  }

  /**
   * Load configuration for a specific service
   */
  async loadConfigurationForService(service) {
    console.log(`Loading configuration for ${service}`);
    
    try {
      if (service === 'php-extensions') {
        // Already handled in switchConfigTab
        return;
      }
      
      // Add other service configuration loading here
      console.log(`Configuration loading for ${service} not implemented yet`);
    } catch (error) {
      console.error(`Error loading configuration for ${service}:`, error);
    }
  }

  /**
   * Validate configuration
   */
  async validateConfiguration() {
    console.log('Validating configuration...');
    this.updateConfigStatus('Validation not implemented yet', 'info');
  }

  /**
   * Save configuration
   */
  async saveConfiguration() {
    console.log('Saving configuration...');
    this.updateConfigStatus('Save not implemented yet', 'info');
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults() {
    console.log('Resetting to defaults...');
    this.updateConfigStatus('Reset not implemented yet', 'info');
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
