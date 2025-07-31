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
    
    // Update PHP Info button state
    await this.updatePhpInfoButton();
    
    // Set up periodic status updates for PHP Info button
    setInterval(() => {
      this.updatePhpInfoButton();
    }, 5000);
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
            option.textContent = version.version === '8.2' ? `PHP ${version.version} (Default)` : `PHP ${version.version}`;
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
          option.textContent = version.version === '8.2' ? `PHP ${version.version} (Default)` : `PHP ${version.version}`;
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
                        <h4>PHP Extensions Manager</h4>
                        <div class="config-grid" style="grid-template-columns: 1fr auto auto; gap: 1rem; align-items: end;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label for="php-version-extensions">PHP Version:</label>
                                <select id="php-version-extensions" style="width: 100%;">
                                    <option value="8.1">PHP 8.1</option>
                                    <option value="8.2" selected>PHP 8.2 (Default)</option>
                                    <option value="8.3">PHP 8.3</option>
                                    <option value="8.4">PHP 8.4</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <button type="button" id="refresh-extensions-btn" class="btn btn-secondary" style="height: 38px;">
                                    <img src="assets/icons/refresh.svg" alt="Refresh" style="width: 14px; height: 14px; margin-right: 4px;">
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="config-section-compact">
                        <h4>Available Extensions</h4>
                        <div class="extensions-container" style="max-height: 400px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 6px; padding: 0;">
                            <div class="extensions-categories" style="padding: 1rem;">
                                <!-- Extension categories will be dynamically loaded here -->
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
      
      // Bind the PHP Info button
      const phpInfoBtn = document.getElementById('phpInfoBtn');
      if (phpInfoBtn) {
        console.log('Binding PHP Info button');
        phpInfoBtn.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Check if button is disabled and show immediate feedback
          if (phpInfoBtn.disabled) {
            console.log('PHP Info button clicked but is disabled');
            const isApacheRunning = window.electronAPI ? false : null; // Will be checked in openPhpInfo
            
            if (isApacheRunning === false) {
              alert('PHP Info is not available.\n\nApache server must be running to view PHP information.\n\nPlease start Apache first and try again.');
            } else {
              alert('PHP Info is not available at the moment.\n\nPlease check that Apache is running and try again.');
            }
            return;
          }
          
          console.log('Opening PHP Info...');
          this.openPhpInfo();
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
   * Load PHP Extensions status for specific PHP version
   */
  async loadPhpExtensions() {
    console.log('Loading PHP extensions status...');
    
    try {
      // Get current PHP version from extensions tab selector
      let version = '8.2'; // Default fallback
      
      const phpVersionExtensions = document.getElementById('php-version-extensions');
      if (phpVersionExtensions && phpVersionExtensions.value) {
        version = phpVersionExtensions.value;
        console.log('Loading extensions for PHP version:', version);
      }
      
      // Show loading state
      this.updateConfigStatus(`Loading PHP ${version} extensions...`, 'info');
      
      // Try to get real extensions status from backend
      if (window.electronAPI && window.electronAPI.getPHPExtensions) {
        console.log(`Requesting real PHP extensions for version ${version}...`);
        const result = await window.electronAPI.getPHPExtensions(version);
        
        if (result && result.success && result.extensions) {
          console.log('Successfully loaded real PHP extensions:', result.extensions);
          
          // Convert flat extension list to categorized format
          const categorizedExtensions = this.categorizeFlatExtensions(result.extensions, version);
          this.renderPhpExtensions(categorizedExtensions);
          this.updateConfigStatus(`Loaded real extensions for PHP ${version}`, 'success');
          return;
        } else {
          console.warn('Failed to load real PHP extensions:', result?.error || 'Unknown error');
          this.updateConfigStatus(`Failed to load real extensions for PHP ${version}, using defaults`, 'warning');
        }
      } else {
        console.warn('electronAPI.getPHPExtensions not available');
      }
      
      // Fallback to default extensions with version-specific adjustments
      console.log('Using default extensions configuration with version adjustments');
      const defaultExtensions = this.getVersionSpecificExtensions(version);
      this.renderPhpExtensions(defaultExtensions);
      this.updateConfigStatus(`Loaded default extensions for PHP ${version}`, 'info');
      
    } catch (error) {
      console.error('Error loading PHP extensions:', error);
      this.updateConfigStatus('Error loading PHP extensions: ' + error.message, 'error');
      
      // Final fallback
      const fallbackExtensions = this.getDefaultExtensions();
      this.renderPhpExtensions(fallbackExtensions);
    }
  }

  /**
   * Convert flat extensions list to categorized format
   */
  categorizeFlatExtensions(flatExtensions, version) {
    const defaultCategories = this.getDefaultExtensions();
    const categorized = {};
    
    // Initialize categories
    Object.keys(defaultCategories).forEach(category => {
      categorized[category] = {};
    });
    
    // Map flat extensions to categories
    Object.entries(flatExtensions).forEach(([extName, config]) => {
      let placed = false;
      
      // Try to find the extension in default categories
      for (const [categoryName, categoryExtensions] of Object.entries(defaultCategories)) {
        if (categoryExtensions[extName]) {
          categorized[categoryName][extName] = {
            enabled: config.enabled || config.loaded || false,
            description: categoryExtensions[extName].description
          };
          placed = true;
          break;
        }
      }
      
      // If not found in default categories, add to 'Other'
      if (!placed) {
        if (!categorized['Other']) {
          categorized['Other'] = {};
        }
        categorized['Other'][extName] = {
          enabled: config.enabled || config.loaded || false,
          description: config.description || 'Additional PHP extension'
        };
      }
    });
    
    // Remove empty categories
    Object.keys(categorized).forEach(category => {
      if (Object.keys(categorized[category]).length === 0) {
        delete categorized[category];
      }
    });
    
    return categorized;
  }

  /**
   * Get version-specific extensions (adjusts defaults based on PHP version)
   */
  getVersionSpecificExtensions(version) {
    const extensions = this.getDefaultExtensions();
    
    // Version-specific adjustments
    if (version === '8.4') {
      // PHP 8.4 specific adjustments
      extensions['Security']['mcrypt'].enabled = false;
      extensions['Security']['mcrypt'].description += ' (deprecated in PHP 8.4)';
    } else if (version === '8.3') {
      // PHP 8.3 specific adjustments
      extensions['Security']['mcrypt'].enabled = false;
      extensions['Security']['mcrypt'].description += ' (deprecated in PHP 8.3)';
    } else if (version === '8.1') {
      // PHP 8.1 might have some extensions not available
      extensions['Performance']['apcu'].description += ' (check availability for PHP 8.1)';
    }
    
    return extensions;
  }

  /**
   * Get default extensions list with WordPress and Laravel support
   */
  getDefaultExtensions() {
    return {
      // Core Extensions (Always Required)
      'Core': {
        json: { enabled: true, description: 'JavaScript Object Notation support (required)' },
        session: { enabled: true, description: 'Session handling support (required)' },
        ctype: { enabled: true, description: 'Character type checking functions (required)' },
        tokenizer: { enabled: true, description: 'PHP tokenizer for parsing (required)' },
        filter: { enabled: true, description: 'Data filtering support (required)' },
        hash: { enabled: true, description: 'Hashing algorithms (required)' }
      },
      
      // WordPress & Laravel Essentials
      'WordPress & Laravel': {
        curl: { enabled: true, description: 'HTTP requests and API calls (required for WordPress/Laravel)' },
        mbstring: { enabled: true, description: 'Multibyte string handling (required for WordPress/Laravel)' },
        openssl: { enabled: true, description: 'SSL/TLS encryption (required for WordPress/Laravel)' },
        zip: { enabled: true, description: 'Archive handling for plugins/packages (required)' },
        fileinfo: { enabled: true, description: 'File type detection and validation (required)' },
        gd: { enabled: true, description: 'Image processing and thumbnail generation (recommended)' },
        exif: { enabled: true, description: 'Image metadata extraction (recommended for WordPress)' },
        xml: { enabled: true, description: 'XML processing support (required)' },
        dom: { enabled: true, description: 'DOM manipulation support (required)' },
        libxml: { enabled: true, description: 'XML library support (required)' }
      },
      
      // Database Extensions
      'Database': {
        mysqli: { enabled: true, description: 'MySQL Improved Extension (recommended)' },
        pdo: { enabled: true, description: 'PHP Data Objects (recommended)' },
        pdo_mysql: { enabled: true, description: 'PDO MySQL driver (recommended)' },
        pdo_sqlite: { enabled: false, description: 'PDO SQLite driver (optional)' },
        pdo_pgsql: { enabled: false, description: 'PDO PostgreSQL driver (optional)' }
      },
      
      // Performance & Caching
      'Performance': {
        opcache: { enabled: true, description: 'PHP OPcache for better performance (highly recommended)' },
        apcu: { enabled: false, description: 'APCu user cache (recommended for Laravel)' },
        redis: { enabled: false, description: 'Redis support for caching (optional)' },
        memcached: { enabled: false, description: 'Memcached support for caching (optional)' }
      },
      
      // Security & Encryption
      'Security': {
        sodium: { enabled: true, description: 'Modern cryptography library (recommended)' },
        bcmath: { enabled: true, description: 'Arbitrary precision mathematics (recommended for Laravel)' },
        mcrypt: { enabled: false, description: 'Legacy encryption (deprecated, use sodium instead)' }
      },
      
      // Internationalization
      'Internationalization': {
        intl: { enabled: true, description: 'Internationalization functions (recommended for WordPress/Laravel)' },
        iconv: { enabled: true, description: 'Character set conversion (recommended)' },
        gettext: { enabled: false, description: 'GNU gettext translation support (optional)' }
      },
      
      // Media & Content
      'Media': {
        imagick: { enabled: false, description: 'ImageMagick for advanced image processing (optional)' },
        webp: { enabled: false, description: 'WebP image format support (optional)' },
        tidy: { enabled: false, description: 'HTML cleanup and validation (optional)' }
      },
      
      // Network & Communication
      'Network': {
        ftp: { enabled: false, description: 'FTP client functionality (optional)' },
        ssh2: { enabled: false, description: 'SSH2 protocol support (optional)' },
        sockets: { enabled: false, description: 'Low-level socket communication (optional)' },
        imap: { enabled: false, description: 'IMAP, POP3 and NNTP support (optional)' }
      },
      
      // Web Services
      'Web Services': {
        soap: { enabled: false, description: 'SOAP web services support (optional)' },
        xmlrpc: { enabled: false, description: 'XML-RPC protocol support (optional)' },
        xsl: { enabled: false, description: 'XSL transformations (optional)' }
      },
      
      // Development & Debugging
      'Development': {
        xdebug: { enabled: false, description: 'Debugging and profiling tool (development only)' },
        pcov: { enabled: false, description: 'Code coverage driver (development only)' }
      },
      
      // Compression & Archives
      'Compression': {
        zlib: { enabled: true, description: 'Compression support (recommended)' },
        bz2: { enabled: false, description: 'Bzip2 compression support (optional)' },
        rar: { enabled: false, description: 'RAR archive support (optional)' }
      }
    };
  }

  /**
   * Render PHP extensions interface with categories
   */
  renderPhpExtensions(extensions) {
    console.log('Rendering categorized PHP extensions:', extensions);
    
    // Find the extensions categories container in PHP Extensions tab
    let extensionsContainer = document.querySelector('#php-extensions-tab .extensions-categories');
    
    // Fallback to main interface extensions grid if tab not found
    if (!extensionsContainer) {
      extensionsContainer = document.querySelector('.extensions-section .extensions-grid');
    }
    
    // Another fallback: try to find any extensions grid
    if (!extensionsContainer) {
      extensionsContainer = document.querySelector('.extensions-grid');
    }
    
    if (!extensionsContainer) {
      console.error('Extensions container not found');
      console.log('Available elements with .extensions-categories:', document.querySelectorAll('.extensions-categories'));
      console.log('Available elements with .extensions-grid:', document.querySelectorAll('.extensions-grid'));
      return;
    }

    console.log('Found extensions container:', extensionsContainer);

    // Clear existing content
    extensionsContainer.innerHTML = '';
    
    // Add loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = 'Loading PHP extensions...';
    loadingDiv.style.padding = '1rem';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.color = '#666';
    extensionsContainer.appendChild(loadingDiv);
    
    // Remove loading message and render categories
    setTimeout(() => {
      extensionsContainer.innerHTML = '';
      extensionsContainer.style.overflow = 'visible'; // Ensure no inner scroll
      
      // Create categories
      Object.entries(extensions).forEach(([categoryName, categoryExtensions]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'extension-category';
        categoryDiv.style.marginBottom = '1.5rem';
        
        // Category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'extension-category-header';
        categoryHeader.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px 6px 0 0;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          user-select: none;
        `;
        
        const categoryTitle = document.createElement('span');
        categoryTitle.textContent = categoryName;
        
        const categoryToggle = document.createElement('span');
        categoryToggle.textContent = '▼';
        categoryToggle.style.transition = 'transform 0.2s ease';
        
        categoryHeader.appendChild(categoryTitle);
        categoryHeader.appendChild(categoryToggle);
        
        // Category content
        const categoryContent = document.createElement('div');
        categoryContent.className = 'extension-category-content';
        categoryContent.style.cssText = `
          border: 1px solid #e9ecef;
          border-top: none;
          border-radius: 0 0 6px 6px;
          padding: 1rem;
          background: #fff;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 0.75rem;
          overflow: visible;
        `;
        
        // Add toggle functionality
        categoryHeader.addEventListener('click', () => {
          const isCollapsed = categoryContent.style.display === 'none';
          categoryContent.style.display = isCollapsed ? 'grid' : 'none';
          categoryToggle.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)';
        });
        
        // Create extension items
        Object.entries(categoryExtensions).forEach(([extensionName, config]) => {
          const extensionItem = document.createElement('div');
          extensionItem.className = 'extension-item';
          extensionItem.style.cssText = `
            display: flex;
            align-items: flex-start;
            padding: 0.5rem;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            background: #fafafa;
            transition: background-color 0.2s ease;
          `;
          
          extensionItem.addEventListener('mouseenter', () => {
            extensionItem.style.backgroundColor = '#f0f0f0';
          });
          
          extensionItem.addEventListener('mouseleave', () => {
            extensionItem.style.backgroundColor = '#fafafa';
          });
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'php-ext';
          checkbox.value = extensionName;
          checkbox.checked = config.enabled;
          checkbox.setAttribute('data-extension', extensionName);
          checkbox.setAttribute('data-category', categoryName);
          checkbox.style.cssText = `
            margin-right: 0.75rem;
            margin-top: 0.25rem;
            transform: scale(1.1);
          `;
          
          const extensionInfo = document.createElement('div');
          extensionInfo.style.flex = '1';
          
          const extensionName_span = document.createElement('div');
          extensionName_span.className = 'extension-name';
          extensionName_span.textContent = extensionName;
          extensionName_span.style.cssText = `
            font-weight: 600;
            color: #212529;
            margin-bottom: 0.25rem;
          `;
          
          const extensionDesc = document.createElement('div');
          extensionDesc.className = 'extension-desc';
          extensionDesc.textContent = config.description || 'PHP Extension';
          extensionDesc.style.cssText = `
            font-size: 0.875rem;
            color: #6c757d;
            line-height: 1.4;
          `;
          
          extensionInfo.appendChild(extensionName_span);
          extensionInfo.appendChild(extensionDesc);
          
          extensionItem.appendChild(checkbox);
          extensionItem.appendChild(extensionInfo);
          
          categoryContent.appendChild(extensionItem);
        });
        
        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(categoryContent);
        extensionsContainer.appendChild(categoryDiv);
      });
      
      console.log('Categorized PHP extensions rendered successfully');
    }, 100);
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
      const extensionsByCategory = {};
      
      checkboxes.forEach(checkbox => {
        const extensionName = checkbox.getAttribute('data-extension');
        const category = checkbox.getAttribute('data-category');
        
        extensions[extensionName] = {
          enabled: checkbox.checked,
          category: category
        };
        
        if (!extensionsByCategory[category]) {
          extensionsByCategory[category] = {};
        }
        extensionsByCategory[category][extensionName] = {
          enabled: checkbox.checked
        };
      });
      
      console.log('Extensions to save:', extensions);
      console.log('Extensions by category:', extensionsByCategory);
      
      // Get current PHP version
      const phpVersionExtensions = document.getElementById('php-version-extensions');
      const version = phpVersionExtensions ? phpVersionExtensions.value : '8.2';
      
      this.updateConfigStatus(`Saving PHP ${version} extensions configuration...`, 'info');
      
      if (window.electronAPI && window.electronAPI.savePHPExtensions) {
        const result = await window.electronAPI.savePHPExtensions(version, extensions);
        if (result && result.success) {
          this.updateConfigStatus(`PHP ${version} extensions saved successfully! Service restart may be required.`, 'success');
        } else {
          this.updateConfigStatus('Failed to save PHP extensions: ' + (result?.error || 'Unknown error'), 'error');
        }
      } else {
        console.log('electronAPI.savePHPExtensions not available - simulating save');
        this.updateConfigStatus(`PHP ${version} extensions configuration saved (simulation)`, 'success');
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

  /**
   * Update PHP Info button state based on Apache status
   * This method is called:
   * - During UI initialization
   * - When Apache service status changes
   * - Periodically to ensure button state is correct
   */
  async updatePhpInfoButton() {
    const phpInfoBtn = document.getElementById('phpInfoBtn');
    if (!phpInfoBtn) return;

    try {
      if (window.electronAPI && window.electronAPI.getServiceStatus) {
        // Use a timeout to prevent hanging
        const statusPromise = window.electronAPI.getServiceStatus('apache');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Status check timeout')), 5000)
        );
        
        const status = await Promise.race([statusPromise, timeoutPromise]);
        
        if (status && status.running) {
          // Apache is running - enable button
          phpInfoBtn.disabled = false;
          phpInfoBtn.classList.remove('disabled');
          phpInfoBtn.title = 'View PHP configuration and information';
          console.log('PHP Info button enabled - Apache is running');
        } else {
          // Apache is not running - disable button
          phpInfoBtn.disabled = true;
          phpInfoBtn.classList.add('disabled');
          phpInfoBtn.title = 'Apache must be running to view PHP Info';
          console.log('PHP Info button disabled - Apache is not running');
        }
      } else {
        // API not available - disable button
        phpInfoBtn.disabled = true;
        phpInfoBtn.classList.add('disabled');
        phpInfoBtn.title = 'Unable to check Apache status';
        console.log('PHP Info button disabled - API not available');
      }
    } catch (error) {
      console.error('Error updating PHP Info button:', error);
      // On error, disable button
      phpInfoBtn.disabled = true;
      phpInfoBtn.classList.add('disabled');
      phpInfoBtn.title = 'Error checking Apache status';
    }
  }

  /**
   * Open PHP Info page in a new window
   * Only works when Apache is running since PHP info requires a web server
   */
  async openPhpInfo() {
    console.log('Opening PHP Info page...');
    
    const phpInfoBtn = document.getElementById('phpInfoBtn');
    
    // Check if button is disabled
    if (phpInfoBtn && phpInfoBtn.disabled) {
      console.log('PHP Info button is disabled, showing error message');
      alert('PHP Info is not available.\n\nApache server must be running to view PHP information.\n\nPlease start Apache first and try again.');
      return;
    }
    
    try {
      // Check if Apache is running first
      if (window.electronAPI && window.electronAPI.getServiceStatus) {
        const status = await window.electronAPI.getServiceStatus('apache');
        if (status && status.running) {
          // Apache is running, open phpinfo.php
          const phpInfoUrl = 'http://localhost/phpinfo.php';
          console.log(`Opening PHP Info URL: ${phpInfoUrl}`);
          window.open(phpInfoUrl, '_blank', 'noopener,noreferrer');
          
          // Show success feedback if we have updateConfigStatus method
          if (typeof this.updateConfigStatus === 'function') {
            this.updateConfigStatus('Opening PHP Info page...', 'info');
          }
        } else {
          // Apache is not running
          console.log('Apache is not running, cannot open PHP Info');
          alert('Apache server is not running.\n\nPHP Info requires Apache to be running.\n\nPlease start Apache first and try again.');
        }
      } else {
        // No electronAPI available, still try to open the URL
        console.log('ElectronAPI not available, trying to open PHP Info anyway');
        const phpInfoUrl = 'http://localhost/phpinfo.php';
        window.open(phpInfoUrl, '_blank', 'noopener,noreferrer');
        
        // Show warning
        alert('Unable to verify Apache status.\n\nIf the page doesn\'t load, please ensure Apache is running.');
      }
    } catch (error) {
      console.error('Error opening PHP Info:', error);
      alert(`Error opening PHP Info: ${error.message}\n\nPlease ensure Apache is running and try again.`);
    }
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
