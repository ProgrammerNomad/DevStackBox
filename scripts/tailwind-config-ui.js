/**
 * ConfigurationUI - Advanced Configuration Management for DevStackBox
 * Pure Tailwind CSS implementation with no custom CSS dependencies
 */

class ConfigurationUI {
  constructor() {
    this.activeTab = 'apache';
    this.currentConfig = {
      apache: {},
      mysql: {},
      php: {}
    };
    this.phpExtensions = {};
    this.currentPhpVersion = '8.2';
  }

  /**
   * Initialize the configuration UI
   */
  async initializeUI() {
    // Bind configuration buttons
    this.bindConfigurationButtons();
    
    // Create the configuration modal
    this.createConfigurationModal();
    
    // Load current configurations
    try {
      await this.loadCurrentConfigurations();
      console.log('Current configurations loaded');
    } catch (error) {
      console.error('Failed to load current configurations:', error);
    }
    
    // Populate PHP version selectors
    await this.populatePhpVersionSelectors();
  }

  /**
   * Populate PHP version selectors with available versions
   */
  async populatePhpVersionSelectors() {
    try {
      if (window.electronAPI && window.electronAPI.getPhpVersions) {
        const versions = await window.electronAPI.getPhpVersions();
        
        if (versions && versions.length > 0) {
          this.populateVersionSelector('php-version-config', versions);
          this.populateVersionSelector('php-version-extensions', versions);
          
          // Find the current version
          const currentVersion = versions.find(v => v.current);
          if (currentVersion) {
            this.currentPhpVersion = currentVersion.version;
          }
        }
      }
    } catch (error) {
      console.error('Error populating PHP version selectors:', error);
      // Fallback to default versions if API call fails
      this.populateFallbackPhpVersions();
    }
  }

  /**
   * Populate fallback PHP versions
   */
  populateFallbackPhpVersions() {
    const fallbackVersions = [
      { version: '8.1', installed: true, current: false },
      { version: '8.2', installed: true, current: true },
      { version: '8.3', installed: false, current: false },
      { version: '8.4', installed: false, current: false }
    ];
    
    this.populateVersionSelector('php-version-config', fallbackVersions);
    this.populateVersionSelector('php-version-extensions', fallbackVersions);
  }

  /**
   * Helper to populate a specific version selector
   */
  populateVersionSelector(selectorId, versions) {
    const select = document.getElementById(selectorId);
    if (!select) return;
    
    select.innerHTML = '';
    
    versions.forEach(version => {
      const option = document.createElement('option');
      option.value = version.version;
      option.textContent = `PHP ${version.version}${version.current ? ' (Default)' : ''}${!version.installed ? ' (Not Installed)' : ''}`;
      option.disabled = !version.installed;
      option.selected = version.current;
      select.appendChild(option);
    });
  }

  /**
   * Create the main configuration modal using Tailwind CSS
   */
  createConfigurationModal() {
    const modalHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-overlay" id="configModal" style="display: none;">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                    <img src="assets/icons/settings.svg" alt="Configuration" class="w-5 h-5 mr-3">
                    Server Configuration
                </h2>
                <button class="text-gray-400 hover:text-gray-600 text-2xl font-semibold" id="configModalClose">&times;</button>
            </div>
            
            <div class="flex-1 overflow-hidden">
                <div class="flex border-b border-gray-200">
                    <button class="px-4 py-2 font-medium text-sm text-primary hover:text-primary hover:bg-gray-50 focus:outline-none border-b-2 border-primary" data-tab="apache">Apache</button>
                    <button class="px-4 py-2 font-medium text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none border-b-2 border-transparent" data-tab="mysql">MySQL</button>
                    <button class="px-4 py-2 font-medium text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none border-b-2 border-transparent" data-tab="php">PHP Config</button>
                    <button class="px-4 py-2 font-medium text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none border-b-2 border-transparent" data-tab="php-extensions">PHP Extensions</button>
                </div>

                <div class="overflow-y-auto p-6" style="max-height: calc(90vh - 160px);">
                    <!-- Apache Configuration Tab -->
                    <div class="block" id="apache-tab">
                        <div class="mb-6">
                            <h4 class="text-base font-medium text-gray-900 mb-3">Network Settings</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="apache-port" class="block text-sm font-medium text-gray-700 mb-1">Port:</label>
                                    <input type="number" id="apache-port" min="1" max="65535" value="80" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                                <div>
                                    <label for="apache-servername" class="block text-sm font-medium text-gray-700 mb-1">Server Name:</label>
                                    <input type="text" id="apache-servername" value="localhost" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                            </div>
                        </div>

                        <div class="mb-6">
                            <h4 class="text-base font-medium text-gray-900 mb-3">Directory Settings</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="apache-document-root" class="block text-sm font-medium text-gray-700 mb-1">Document Root:</label>
                                    <input type="text" id="apache-document-root" readonly class="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                                <div>
                                    <label for="apache-directory-index" class="block text-sm font-medium text-gray-700 mb-1">Directory Index:</label>
                                    <input type="text" id="apache-directory-index" value="index.html index.php" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MySQL Configuration Tab -->
                    <div class="hidden" id="mysql-tab">
                        <div class="mb-6">
                            <h4 class="text-base font-medium text-gray-900 mb-3">Connection Settings</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="mysql-port" class="block text-sm font-medium text-gray-700 mb-1">Port:</label>
                                    <input type="number" id="mysql-port" min="1" max="65535" value="3306" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                                <div>
                                    <label for="mysql-bind-address" class="block text-sm font-medium text-gray-700 mb-1">Bind Address:</label>
                                    <input type="text" id="mysql-bind-address" value="127.0.0.1" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                            </div>
                        </div>

                        <div class="mb-6">
                            <h4 class="text-base font-medium text-gray-900 mb-3">Performance Settings</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="mysql-max-connections" class="block text-sm font-medium text-gray-700 mb-1">Max Connections:</label>
                                    <input type="number" id="mysql-max-connections" min="1" max="1000" value="151" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                                <div>
                                    <label for="mysql-innodb-buffer-pool" class="block text-sm font-medium text-gray-700 mb-1">Buffer Pool Size:</label>
                                    <input type="text" id="mysql-innodb-buffer-pool" value="128M" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PHP Configuration Tab -->
                    <div class="hidden" id="php-tab">
                        <div class="mb-6">
                            <h4 class="text-base font-medium text-gray-900 mb-3">PHP Version & Basic Settings</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="php-version-config" class="block text-sm font-medium text-gray-700 mb-1">PHP Version:</label>
                                    <select id="php-version-config" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                        <option value="8.1">PHP 8.1</option>
                                        <option value="8.2" selected>PHP 8.2</option>
                                        <option value="8.3">PHP 8.3</option>
                                        <option value="8.4">PHP 8.4</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="php-memory-limit" class="block text-sm font-medium text-gray-700 mb-1">Memory Limit:</label>
                                    <input type="text" id="php-memory-limit" value="128M" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                                <div>
                                    <label for="php-max-execution-time" class="block text-sm font-medium text-gray-700 mb-1">Max Execution Time:</label>
                                    <input type="number" id="php-max-execution-time" min="0" max="3600" value="30" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                                <div>
                                    <label for="php-upload-max-filesize" class="block text-sm font-medium text-gray-700 mb-1">Upload Max Size:</label>
                                    <input type="text" id="php-upload-max-filesize" value="2M" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                                <div>
                                    <label for="php-post-max-size" class="block text-sm font-medium text-gray-700 mb-1">Post Max Size:</label>
                                    <input type="text" id="php-post-max-size" value="8M" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- PHP Extensions Tab -->
                    <div class="hidden" id="php-extensions-tab">
                        <div class="mb-6">
                            <div class="flex flex-wrap items-center gap-4">
                                <div class="w-full md:w-auto flex-1">
                                    <label for="php-version-extensions" class="block text-sm font-medium text-gray-700 mb-1">PHP Version:</label>
                                    <select id="php-version-extensions" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                        <option value="8.1">PHP 8.1</option>
                                        <option value="8.2" selected>PHP 8.2 (Default)</option>
                                        <option value="8.3">PHP 8.3</option>
                                        <option value="8.4">PHP 8.4</option>
                                    </select>
                                </div>
                                <div class="w-full md:w-auto md:self-end">
                                    <button type="button" id="refresh-extensions-btn" class="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                                        </svg>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mb-6">
                            <h4 class="text-base font-medium text-gray-900 mb-3">Available Extensions</h4>
                            <div class="border border-gray-200 rounded-lg overflow-hidden">
                                <div class="max-h-[400px] overflow-y-auto p-4 extensions-categories">
                                    <!-- Extension categories will be dynamically loaded here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div id="configStatus" class="text-sm text-gray-600">Ready to configure</div>
                <div class="flex flex-wrap gap-2">
                    <button class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors" id="configValidateBtn">
                        Validate
                    </button>
                    <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors" id="configSaveBtn">
                        Save & Apply
                    </button>
                    <button class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors" id="configResetBtn">
                        Reset
                    </button>
                    <button class="hidden px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors" id="savePhpExtensionsBtn">
                        Save Extensions
                    </button>
                    <button class="hidden px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors" id="resetPhpExtensionsBtn">
                        Reset Extensions
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Wait for next tick to ensure DOM elements are available
    setTimeout(() => {
      this.bindModalEvents();
      console.log('Configuration modal created and events bound');
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
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindButtons);
    } else {
      bindButtons();
    }
  }

  /**
   * Bind modal events
   */
  bindModalEvents() {
    // Close button
    const closeBtn = document.getElementById('configModalClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeConfigModal();
      });
    }

    // Tab buttons
    const tabBtns = document.querySelectorAll('#configModal [data-tab]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        this.switchConfigTab(tabName);
      });
    });

    // Save button
    const saveBtn = document.getElementById('configSaveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        await this.saveConfiguration();
      });
    }

    // Validate button
    const validateBtn = document.getElementById('configValidateBtn');
    if (validateBtn) {
      validateBtn.addEventListener('click', async () => {
        await this.validateConfiguration();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('configResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.loadConfigurationForService(this.activeTab);
      });
    }

    // PHP Extensions specific buttons
    const saveExtBtn = document.getElementById('savePhpExtensionsBtn');
    if (saveExtBtn) {
      saveExtBtn.addEventListener('click', async () => {
        await this.savePhpExtensions();
      });
    }

    const resetExtBtn = document.getElementById('resetPhpExtensionsBtn');
    if (resetExtBtn) {
      resetExtBtn.addEventListener('click', () => {
        this.resetPhpExtensions();
      });
    }

    // PHP version selector
    const phpVersionSelect = document.getElementById('php-version-extensions');
    if (phpVersionSelect) {
      phpVersionSelect.addEventListener('change', () => {
        this.loadPhpExtensions();
      });
    }

    // Refresh extensions button
    const refreshBtn = document.getElementById('refresh-extensions-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadPhpExtensions();
      });
    }
  }

  /**
   * Open configuration modal for specific service
   */
  openConfigModal(service = 'apache') {
    const modal = document.getElementById('configModal');
    if (!modal) {
      console.error('Configuration modal not found');
      return;
    }

    // Show modal
    modal.style.display = 'flex';

    // Switch to the appropriate tab
    this.switchConfigTab(service);

    // Load configuration for service
    this.loadConfigurationForService(service);
  }

  /**
   * Close configuration modal
   */
  closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Switch between configuration tabs
   */
  switchConfigTab(tabName) {
    try {
      // Get all tab buttons and content panels
      const tabButtons = document.querySelectorAll('#configModal [data-tab]');
      const tabPanels = document.querySelectorAll('#configModal [id$="-tab"]');

      // Hide all tabs
      tabPanels.forEach(panel => {
        panel.classList.add('hidden');
      });

      // Deactivate all tab buttons
      tabButtons.forEach(button => {
        button.classList.remove('text-primary', 'border-primary');
        button.classList.add('text-gray-600', 'border-transparent');
      });

      // Show the selected tab
      const selectedTab = document.getElementById(`${tabName}-tab`);
      if (selectedTab) {
        selectedTab.classList.remove('hidden');
      }

      // Activate the selected tab button
      const activeButton = document.querySelector(`#configModal [data-tab="${tabName}"]`);
      if (activeButton) {
        activeButton.classList.remove('text-gray-600', 'border-transparent');
        activeButton.classList.add('text-primary', 'border-primary');
      }

      // Save the active tab
      this.activeTab = tabName;

      // Update which buttons are shown based on active tab
      this.updateButtonVisibility(tabName);

      // If PHP Extensions tab is selected, load extensions
      if (tabName === 'php-extensions') {
        this.loadPhpExtensions();
      }
    } catch (error) {
      console.error('Error switching tabs:', error);
    }
  }

  /**
   * Update button visibility based on active tab
   */
  updateButtonVisibility(tabName) {
    const saveBtn = document.getElementById('configSaveBtn');
    const validateBtn = document.getElementById('configValidateBtn');
    const resetBtn = document.getElementById('configResetBtn');
    const saveExtBtn = document.getElementById('savePhpExtensionsBtn');
    const resetExtBtn = document.getElementById('resetPhpExtensionsBtn');

    if (tabName === 'php-extensions') {
      // Show PHP Extensions specific buttons
      if (saveBtn) saveBtn.classList.add('hidden');
      if (validateBtn) validateBtn.classList.add('hidden');
      if (resetBtn) resetBtn.classList.add('hidden');
      if (saveExtBtn) saveExtBtn.classList.remove('hidden');
      if (resetExtBtn) resetExtBtn.classList.remove('hidden');
    } else {
      // Show normal config buttons
      if (saveBtn) saveBtn.classList.remove('hidden');
      if (validateBtn) validateBtn.classList.remove('hidden');
      if (resetBtn) resetBtn.classList.remove('hidden');
      if (saveExtBtn) saveExtBtn.classList.add('hidden');
      if (resetExtBtn) resetExtBtn.classList.add('hidden');
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
   * Render PHP extensions interface with categories using Tailwind CSS
   */
  renderPhpExtensions(extensions) {
    console.log('Rendering categorized PHP extensions:', extensions);
    
    // Find the extensions categories container
    const extensionsContainer = document.querySelector('.extensions-categories');
    if (!extensionsContainer) {
      console.error('Extensions container not found');
      return;
    }

    // Clear existing content
    extensionsContainer.innerHTML = '';
    
    // Create categories
    Object.entries(extensions).forEach(([categoryName, categoryExtensions]) => {
      // Skip empty categories
      if (Object.keys(categoryExtensions).length === 0) return;
      
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'mb-6 last:mb-0 border border-gray-200 rounded-lg overflow-hidden';
      
      // Category header
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer';
      categoryHeader.setAttribute('data-category', categoryName);
      
      const categoryTitle = document.createElement('h5');
      categoryTitle.className = 'text-sm font-medium text-gray-900';
      categoryTitle.textContent = categoryName;
      
      const categoryToggle = document.createElement('span');
      categoryToggle.className = 'transform transition-transform duration-200';
      categoryToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      `;
      
      categoryHeader.appendChild(categoryTitle);
      categoryHeader.appendChild(categoryToggle);
      
      // Category content
      const categoryContent = document.createElement('div');
      categoryContent.className = 'divide-y divide-gray-200';
      
      // Create extension items
      Object.entries(categoryExtensions).forEach(([extensionName, config]) => {
        const extensionItem = document.createElement('div');
        extensionItem.className = 'p-4 flex items-start hover:bg-gray-50 transition-colors';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'php-ext';
        checkbox.value = extensionName;
        checkbox.checked = config.enabled;
        checkbox.setAttribute('data-extension', extensionName);
        checkbox.setAttribute('data-category', categoryName);
        checkbox.className = 'h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mt-1 mr-3';
        
        const extensionInfo = document.createElement('div');
        extensionInfo.className = 'flex-1';
        
        const extensionNameEl = document.createElement('div');
        extensionNameEl.className = 'text-sm font-medium text-gray-900 mb-1';
        extensionNameEl.textContent = extensionName;
        
        const extensionDesc = document.createElement('div');
        extensionDesc.className = 'text-xs text-gray-500';
        extensionDesc.textContent = config.description || 'PHP Extension';
        
        extensionInfo.appendChild(extensionNameEl);
        extensionInfo.appendChild(extensionDesc);
        
        extensionItem.appendChild(checkbox);
        extensionItem.appendChild(extensionInfo);
        
        categoryContent.appendChild(extensionItem);
      });
      
      // Add toggle functionality
      categoryHeader.addEventListener('click', () => {
        const isHidden = categoryContent.classList.contains('hidden');
        if (isHidden) {
          categoryContent.classList.remove('hidden');
          categoryToggle.style.transform = 'rotate(0deg)';
        } else {
          categoryContent.classList.add('hidden');
          categoryToggle.style.transform = 'rotate(-90deg)';
        }
      });
      
      categoryDiv.appendChild(categoryHeader);
      categoryDiv.appendChild(categoryContent);
      extensionsContainer.appendChild(categoryDiv);
    });
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
    
    return categorized;
  }

  /**
   * Get version-specific extensions (adjusts defaults based on PHP version)
   */
  getVersionSpecificExtensions(version) {
    const baseExtensions = this.getDefaultExtensions();
    
    // Clone the extensions to avoid modifying the base
    const versionSpecific = JSON.parse(JSON.stringify(baseExtensions));
    
    // Version specific adjustments (Add/remove/disable extensions based on PHP version)
    if (version === '8.3' || version === '8.4') {
      // Some extensions might be removed or renamed in newer PHP versions
      if (versionSpecific['Database']['mysql']) {
        versionSpecific['Database']['mysql'].enabled = false;
        versionSpecific['Database']['mysql'].description += ' (Not available in PHP 8.3+)';
      }
    }
    
    if (version === '8.1') {
      // Some extensions might have different defaults in older versions
      if (versionSpecific['Security']['sodium']) {
        versionSpecific['Security']['sodium'].enabled = true;
      }
    }
    
    return versionSpecific;
  }

  /**
   * Get default extensions list with WordPress and Laravel support
   */
  getDefaultExtensions() {
    return {
      'Core': {
        'Core': { enabled: true, description: 'PHP core features' },
        'date': { enabled: true, description: 'Date and time related functions' },
        'pcre': { enabled: true, description: 'Regular expression functions (Perl-Compatible)' },
        'reflection': { enabled: true, description: 'Class and object reflection API' },
        'spl': { enabled: true, description: 'Standard PHP Library' },
      },
      'Database': {
        'mysqli': { enabled: true, description: 'MySQL Improved Extension' },
        'pdo_mysql': { enabled: true, description: 'PDO MySQL driver' },
        'mysql': { enabled: false, description: 'MySQL database driver (deprecated)' },
        'pdo_sqlite': { enabled: true, description: 'SQLite database driver for PDO' },
        'sqlite3': { enabled: true, description: 'SQLite3 database driver' },
        'pdo_pgsql': { enabled: false, description: 'PostgreSQL database driver for PDO' },
      },
      'Web Development': {
        'curl': { enabled: true, description: 'Client URL library for HTTP requests' },
        'fileinfo': { enabled: true, description: 'File information functions' },
        'ftp': { enabled: true, description: 'FTP client functions' },
        'session': { enabled: true, description: 'Session handling' },
        'soap': { enabled: true, description: 'SOAP web services' },
        'xml': { enabled: true, description: 'XML parsing and generation' },
        'xmlrpc': { enabled: false, description: 'XML-RPC web services' },
      },
      'Images': {
        'gd': { enabled: true, description: 'Image processing and GD' },
        'exif': { enabled: true, description: 'Exchangeable image information' },
        'imagick': { enabled: false, description: 'ImageMagick image processing' },
      },
      'Security': {
        'openssl': { enabled: true, description: 'OpenSSL for secure communications' },
        'sodium': { enabled: true, description: 'Modern cryptography library' },
        'password': { enabled: true, description: 'Password hashing functions' },
      },
      'Performance': {
        'opcache': { enabled: true, description: 'OPcache improves PHP performance by caching precompiled script bytecode' },
        'apcu': { enabled: false, description: 'APC User Cache for in-memory key-value store' },
      },
      'Compression': {
        'zip': { enabled: true, description: 'ZIP file manipulation' },
        'zlib': { enabled: true, description: 'Compression functions' },
        'bz2': { enabled: false, description: 'BZip2 compression' },
      },
      'Other': {
        'mbstring': { enabled: true, description: 'Multibyte string functions' },
        'intl': { enabled: true, description: 'Internationalization functions' },
        'gettext': { enabled: false, description: 'Internationalization and localization' },
        'calendar': { enabled: true, description: 'Calendar conversion functions' },
      }
    };
  }

  /**
   * Load configuration for a specific service
   */
  async loadConfigurationForService(service) {
    console.log(`Loading configuration for ${service}...`);
    this.updateConfigStatus(`Loading ${service} configuration...`, 'info');
    
    try {
      switch (service) {
        case 'apache':
          if (window.electronAPI && window.electronAPI.getApacheConfig) {
            const config = await window.electronAPI.getApacheConfig();
            if (config) {
              this.populateApacheConfig(config);
              this.updateConfigStatus('Apache configuration loaded', 'success');
            }
          } else {
            this.updateConfigStatus('Apache configuration API not available', 'warning');
          }
          break;
          
        case 'mysql':
          if (window.electronAPI && window.electronAPI.getMySQLConfig) {
            const config = await window.electronAPI.getMySQLConfig();
            if (config) {
              this.populateMySQLConfig(config);
              this.updateConfigStatus('MySQL configuration loaded', 'success');
            }
          } else {
            this.updateConfigStatus('MySQL configuration API not available', 'warning');
          }
          break;
          
        case 'php':
          if (window.electronAPI && window.electronAPI.getPHPConfig) {
            const config = await window.electronAPI.getPHPConfig();
            if (config) {
              this.populatePHPConfig(config);
              this.updateConfigStatus('PHP configuration loaded', 'success');
            }
          } else {
            this.updateConfigStatus('PHP configuration API not available', 'warning');
          }
          break;
          
        case 'php-extensions':
          await this.loadPhpExtensions();
          break;
          
        default:
          this.updateConfigStatus(`Unknown service: ${service}`, 'error');
      }
    } catch (error) {
      console.error(`Error loading ${service} configuration:`, error);
      this.updateConfigStatus(`Error loading ${service} configuration: ${error.message}`, 'error');
    }
  }

  /**
   * Update configuration status message
   */
  updateConfigStatus(message, type = 'info') {
    const statusEl = document.getElementById('configStatus');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    
    // Clear all status classes
    statusEl.className = 'text-sm';
    
    // Set color based on type
    switch (type) {
      case 'success':
        statusEl.classList.add('text-green-600');
        break;
      case 'error':
        statusEl.classList.add('text-red-600');
        break;
      case 'warning':
        statusEl.classList.add('text-yellow-600');
        break;
      case 'info':
      default:
        statusEl.classList.add('text-gray-600');
    }
  }

  /**
   * Populate Apache configuration form
   */
  populateApacheConfig(config) {
    document.getElementById('apache-port')?.setAttribute('value', config.port || 80);
    document.getElementById('apache-servername')?.setAttribute('value', config.serverName || 'localhost');
    document.getElementById('apache-document-root')?.setAttribute('value', config.documentRoot || '');
    document.getElementById('apache-directory-index')?.setAttribute('value', config.directoryIndex || 'index.html index.php');
  }

  /**
   * Populate MySQL configuration form
   */
  populateMySQLConfig(config) {
    document.getElementById('mysql-port')?.setAttribute('value', config.port || 3306);
    document.getElementById('mysql-bind-address')?.setAttribute('value', config.bindAddress || '127.0.0.1');
    document.getElementById('mysql-max-connections')?.setAttribute('value', config.maxConnections || 151);
    document.getElementById('mysql-innodb-buffer-pool')?.setAttribute('value', config.innodbBufferPool || '128M');
  }

  /**
   * Populate PHP configuration form
   */
  populatePHPConfig(config) {
    // Set PHP version if available
    if (config.version) {
      const versionSelect = document.getElementById('php-version-config');
      if (versionSelect) {
        for (let i = 0; i < versionSelect.options.length; i++) {
          if (versionSelect.options[i].value === config.version) {
            versionSelect.selectedIndex = i;
            break;
          }
        }
      }
    }
    
    document.getElementById('php-memory-limit')?.setAttribute('value', config.memoryLimit || '128M');
    document.getElementById('php-max-execution-time')?.setAttribute('value', config.maxExecutionTime || 30);
    document.getElementById('php-upload-max-filesize')?.setAttribute('value', config.uploadMaxFilesize || '2M');
    document.getElementById('php-post-max-size')?.setAttribute('value', config.postMaxSize || '8M');
  }

  /**
   * Validate configuration
   */
  async validateConfiguration() {
    this.updateConfigStatus('Validating configuration...', 'info');
    
    try {
      // Get current service
      const service = this.activeTab;
      
      // Create configuration object
      const config = this.getCurrentConfig(service);
      
      // Validate configuration
      if (window.electronAPI && window.electronAPI.validateConfig) {
        const result = await window.electronAPI.validateConfig(service, config);
        
        if (result.success) {
          this.updateConfigStatus('Configuration is valid', 'success');
        } else {
          this.updateConfigStatus(`Validation failed: ${result.error}`, 'error');
        }
      } else {
        this.updateConfigStatus('Validation API not available', 'warning');
      }
    } catch (error) {
      console.error('Error validating configuration:', error);
      this.updateConfigStatus(`Validation error: ${error.message}`, 'error');
    }
  }

  /**
   * Save configuration
   */
  async saveConfiguration() {
    this.updateConfigStatus('Saving configuration...', 'info');
    
    try {
      // Get current service
      const service = this.activeTab;
      
      // Create configuration object
      const config = this.getCurrentConfig(service);
      
      // Save configuration
      if (window.electronAPI && window.electronAPI.saveConfig) {
        const result = await window.electronAPI.saveConfig(service, config, true);
        
        if (result.success) {
          this.updateConfigStatus('Configuration saved and service restarted', 'success');
        } else {
          this.updateConfigStatus(`Save failed: ${result.error}`, 'error');
        }
      } else {
        this.updateConfigStatus('Save API not available', 'warning');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      this.updateConfigStatus(`Save error: ${error.message}`, 'error');
    }
  }

  /**
   * Get current configuration from form
   */
  getCurrentConfig(service) {
    switch (service) {
      case 'apache':
        return {
          port: parseInt(document.getElementById('apache-port')?.value || 80),
          serverName: document.getElementById('apache-servername')?.value || 'localhost',
          documentRoot: document.getElementById('apache-document-root')?.value || '',
          directoryIndex: document.getElementById('apache-directory-index')?.value || 'index.html index.php'
        };
        
      case 'mysql':
        return {
          port: parseInt(document.getElementById('mysql-port')?.value || 3306),
          bindAddress: document.getElementById('mysql-bind-address')?.value || '127.0.0.1',
          maxConnections: parseInt(document.getElementById('mysql-max-connections')?.value || 151),
          innodbBufferPool: document.getElementById('mysql-innodb-buffer-pool')?.value || '128M'
        };
        
      case 'php':
        return {
          version: document.getElementById('php-version-config')?.value || '8.2',
          memoryLimit: document.getElementById('php-memory-limit')?.value || '128M',
          maxExecutionTime: parseInt(document.getElementById('php-max-execution-time')?.value || 30),
          uploadMaxFilesize: document.getElementById('php-upload-max-filesize')?.value || '2M',
          postMaxSize: document.getElementById('php-post-max-size')?.value || '8M'
        };
        
      default:
        return {};
    }
  }

  /**
   * Save PHP extensions configuration
   */
  async savePhpExtensions() {
    this.updateConfigStatus('Saving PHP extensions...', 'info');
    
    try {
      // Get PHP version
      const version = document.getElementById('php-version-extensions')?.value || '8.2';
      
      // Get all extension checkboxes
      const checkboxes = document.querySelectorAll('input[name="php-ext"]');
      
      // Create extensions object
      const extensions = {};
      checkboxes.forEach(checkbox => {
        const name = checkbox.getAttribute('data-extension');
        extensions[name] = { enabled: checkbox.checked };
      });
      
      // Save extensions
      if (window.electronAPI && window.electronAPI.savePHPExtensions) {
        const result = await window.electronAPI.savePHPExtensions(version, extensions);
        
        if (result.success) {
          this.updateConfigStatus('PHP extensions saved successfully', 'success');
        } else {
          this.updateConfigStatus(`Failed to save extensions: ${result.error}`, 'error');
        }
      } else {
        this.updateConfigStatus('PHP extensions API not available', 'warning');
      }
    } catch (error) {
      console.error('Error saving PHP extensions:', error);
      this.updateConfigStatus(`Error saving extensions: ${error.message}`, 'error');
    }
  }

  /**
   * Reset PHP extensions to defaults
   */
  resetPhpExtensions() {
    this.updateConfigStatus('Resetting PHP extensions to defaults...', 'info');
    
    try {
      // Get PHP version
      const version = document.getElementById('php-version-extensions')?.value || '8.2';
      
      // Get default extensions for this version
      const defaultExtensions = this.getVersionSpecificExtensions(version);
      
      // Render default extensions
      this.renderPhpExtensions(defaultExtensions);
      
      this.updateConfigStatus('PHP extensions reset to defaults', 'success');
    } catch (error) {
      console.error('Error resetting PHP extensions:', error);
      this.updateConfigStatus(`Error resetting extensions: ${error.message}`, 'error');
    }
  }
}

// Initialize Configuration UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.configUI = new ConfigurationUI();
  window.configUI.initializeUI();
});
