/**
 * One-Click Installers Management Class
 * Handles loading, displaying, and managing application installers
 */
class OneClickInstallers {
  constructor() {
    this.installers = [];
    this.categories = [];
    this.currentFilter = 'all';
    this.currentSearch = '';
    
    console.log('OneClickInstallers initialized');
  }

  /**
   * Initialize the installers interface
   */
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      await this.loadInstallers();
      this.renderInterface();
      this.bindEvents();
      console.log('OneClickInstallers interface ready');
    } catch (error) {
      console.error('Error initializing OneClickInstallers:', error);
    }
  }

  /**
   * Load installers from JSON configuration
   */
  async loadInstallers() {
    try {
      const response = await fetch('config/installers.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      this.installers = data.installers || [];
      this.categories = data.categories || [];
      
      console.log(`Loaded ${this.installers.length} installers and ${this.categories.length} categories`);
    } catch (error) {
      console.error('Error loading installers:', error);
      // Fallback to empty arrays
      this.installers = [];
      this.categories = [];
    }
  }

  /**
   * Render the main installers interface
   */
  renderInterface() {
    const container = document.getElementById('installersContainer');
    if (!container) {
      console.error('Installers container not found');
      return;
    }

    // Simply render the installers grid in the existing container
    container.innerHTML = this.renderInstallers();
    
    // Update search and filter functionality
    this.updateSearchAndFilter();
  }

  /**
   * Update search and filter functionality for existing HTML elements
   */
  updateSearchAndFilter() {
    // Update category filter options
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.innerHTML = `
        <option value="">All Categories</option>
        ${this.categories.map(category => `
          <option value="${category.id}">${category.name}</option>
        `).join('')}
      `;
    }
  }

  /**
   * Get count of installers by category
   */
  getInstallerCountByCategory(categoryId) {
    return this.installers.filter(installer => 
      installer.category.toLowerCase() === categoryId.toLowerCase()
    ).length;
  }

  /**
   * Render installers grid
   */
  renderInstallers() {
    const filteredInstallers = this.getFilteredInstallers();
    
    if (filteredInstallers.length === 0) {
      return `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <img src="assets/icons/error.svg" alt="No applications" class="w-16 h-16 mb-4 opacity-50">
          <h3 class="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p class="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      `;
    }

    return `
        ${filteredInstallers.map(installer => `
          <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full" data-installer="${installer.id}">
            <div class="flex items-center space-x-3 mb-3">
              <img src="${installer.icon}" alt="${installer.name}" class="w-10 h-10 object-contain" onerror="this.src='assets/icons/installer.svg'">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-medium text-gray-900">${installer.name}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-block bg-primary text-white text-xs px-2 py-0.5 rounded-full">v${installer.version}</span>
                  <span class="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">${installer.category}</span>
                </div>
              </div>
            </div>
            
            <div class="mb-4">
              <p class="text-sm text-gray-600 line-clamp-2">${installer.description}</p>
            </div>

            <div class="mt-auto flex gap-2">
              <button class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors install-btn" data-installer="${installer.id}">
                <img src="assets/icons/download.svg" alt="Install" class="w-4 h-4 mr-2">
                Install
              </button>
              <button class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors info-btn" data-installer="${installer.id}">
                <img src="assets/icons/system.svg" alt="More Info" class="w-4 h-4 mr-2">
                Details
              </button>
            </div>
          </div>
        `).join('')}
    `;
  }

  /**
   * Get filtered installers based on current filter and search
   */
  getFilteredInstallers() {
    let filtered = this.installers;

    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(installer => 
        installer.category.toLowerCase() === this.currentFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (this.currentSearch) {
      const searchTerm = this.currentSearch.toLowerCase();
      filtered = filtered.filter(installer => 
        installer.name.toLowerCase().includes(searchTerm) ||
        installer.description.toLowerCase().includes(searchTerm) ||
        installer.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Search input - use the existing HTML element
    const searchInput = document.getElementById('installerSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearchChange(e.target.value);
      });
    }

    // Category filter - use the existing HTML element  
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.handleFilterChange(e.target.value);
      });
    }

    // Install buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.install-btn') || e.target.closest('.install-btn')) {
        const button = e.target.matches('.install-btn') ? e.target : e.target.closest('.install-btn');
        const installerId = button.getAttribute('data-installer');
        this.handleInstallClick(installerId);
      }
    });

    // Info buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.info-btn') || e.target.closest('.info-btn')) {
        const button = e.target.matches('.info-btn') ? e.target : e.target.closest('.info-btn');
        const installerId = button.getAttribute('data-installer');
        this.handleInfoClick(installerId);
      }
    });
  }

  /**
   * Handle filter change
   */
  handleFilterChange(filterValue) {
    // Update current filter
    this.currentFilter = filterValue || 'all';

    // Re-render installers
    this.updateInstallersGrid();
  }

  /**
   * Handle search change
   */
  handleSearchChange(searchValue) {
    this.currentSearch = searchValue;
    this.updateInstallersGrid();
  }

  /**
   * Update installers grid
   */
  updateInstallersGrid() {
    const container = document.getElementById('installersContainer');
    if (container) {
      container.innerHTML = this.renderInstallers();
    }
  }

  /**
   * Handle install button click
   */
  handleInstallClick(installerId) {
    const installer = this.installers.find(i => i.id === installerId);
    if (!installer) {
      console.error('Installer not found:', installerId);
      return;
    }

    console.log('Installing:', installer.name);
    
    // Show installation modal/dialog
    this.showInstallationDialog(installer);
  }

  /**
   * Handle info button click
   */
  handleInfoClick(installerId) {
    const installer = this.installers.find(i => i.id === installerId);
    if (!installer) {
      console.error('Installer not found:', installerId);
      return;
    }

    console.log('Showing info for:', installer.name);
    
    // Show info modal/dialog
    this.showInfoDialog(installer);
  }

  /**
   * Show installation dialog
   */
  showInstallationDialog(installer) {
    // Use the existing modal from HTML
    const modal = document.getElementById('installerModal');
    if (!modal) {
      console.error('Installer modal not found');
      return;
    }

    // Update modal content
    const modalIcon = document.getElementById('modalInstallerIcon');
    const modalName = document.getElementById('modalInstallerName');
    const modalContent = document.getElementById('installerModalContent');
    const confirmBtn = document.getElementById('confirmInstallBtn');
    const cancelBtn = document.getElementById('cancelInstallBtn');
    const closeBtn = document.getElementById('closeInstallerModal');

    if (modalIcon) modalIcon.src = installer.icon;
    if (modalIcon) modalIcon.alt = installer.name;
    if (modalName) modalName.textContent = `Install ${installer.name}`;

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="installation-info">
          <div class="app-info">
            <img src="${installer.icon}" alt="${installer.name}" class="app-icon">
            <div>
              <h3>${installer.name} v${installer.version}</h3>
              <p>${installer.description}</p>
            </div>
          </div>
          
          <div class="installation-options">
            <div class="form-group">
              <label for="install-folder">Installation Folder:</label>
              <input type="text" id="install-folder" value="${installer.installation.extractTo.split('/')[1]}" class="form-input">
            </div>
            
            ${installer.installation.databaseRequired ? `
              <div class="form-group">
                <label for="database-name">Database Name:</label>
                <input type="text" id="database-name" value="${installer.installation.defaultDatabase}" class="form-input">
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Show modal
    modal.style.display = 'flex';

    // Bind events
    const closeModal = () => {
      modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        this.performInstallation(installer, modal);
      };
    }
  }

  /**
   * Show info dialog
   */
  showInfoDialog(installer) {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    dialog.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <img src="${installer.icon}" alt="${installer.name}" class="w-6 h-6 mr-3" onerror="this.src='assets/icons/installer.svg'">
            ${installer.name}
          </h2>
          <button class="text-gray-400 hover:text-gray-600 text-2xl font-semibold">&times;</button>
        </div>
        <div class="px-6 py-4 overflow-y-auto">
          <div class="space-y-6">
            <!-- Basic info -->
            <div class="flex flex-col sm:flex-row sm:items-center p-4 bg-gray-50 rounded-lg gap-4">
              <img src="${installer.icon}" alt="${installer.name}" class="w-16 h-16 object-contain mx-auto sm:mx-0" onerror="this.src='assets/icons/installer.svg'">
              <div>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span class="inline-block bg-primary text-white text-xs px-2 py-1 rounded-full">v${installer.version}</span>
                  <span class="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">${installer.category}</span>
                </div>
                <a href="${installer.officialSite}" target="_blank" class="text-primary hover:underline text-sm flex items-center">
                  Visit Official Website
                  <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <!-- Description -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p class="text-gray-600">${installer.description}</p>
            </div>

            <!-- Features -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Key Features</h3>
              <ul class="list-disc pl-5 text-gray-600 space-y-1">
                ${installer.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>

            <!-- Requirements -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">System Requirements</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                  <span class="block text-xs text-gray-500 mb-1">PHP Version</span>
                  <span class="block text-sm font-medium text-gray-700">${installer.requirements.php}</span>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                  <span class="block text-xs text-gray-500 mb-1">MySQL Version</span>
                  <span class="block text-sm font-medium text-gray-700">${installer.requirements.mysql}</span>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                  <span class="block text-xs text-gray-500 mb-1">Disk Space</span>
                  <span class="block text-sm font-medium text-gray-700">${installer.requirements.diskSpace}</span>
                </div>
              </div>
            </div>

            <!-- Installation Details -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Installation Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-gray-50 p-3 rounded-lg">
                  <span class="block text-xs text-gray-500 mb-1">Install Location</span>
                  <span class="block text-sm font-medium text-gray-700">${installer.installation.extractTo}</span>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <span class="block text-xs text-gray-500 mb-1">Setup URL</span>
                  <span class="block text-sm font-medium text-gray-700">${installer.installation.setupUrl}</span>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <span class="block text-xs text-gray-500 mb-1">Database Required</span>
                  <span class="block text-sm font-medium text-gray-700">${installer.installation.databaseRequired ? 'Yes' : 'No'}</span>
                </div>
                ${installer.installation.composerRequired ? `
                <div class="bg-gray-50 p-3 rounded-lg">
                  <span class="block text-xs text-gray-500 mb-1">Composer Required</span>
                  <span class="block text-sm font-medium text-gray-700">Yes</span>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors close-info">
            Close
          </button>
          <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors install-from-info" data-installer="${installer.id}">
            Install Now
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Bind modal events
    dialog.querySelector('button:first-of-type').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    dialog.querySelector('.close-info').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });

    dialog.querySelector('.install-from-info').addEventListener('click', () => {
      document.body.removeChild(dialog);
      this.handleInstallClick(installer.id);
    });
  }

  /**
   * Perform the actual installation
   */
  async performInstallation(installer, modal) {
    console.log('Starting installation of:', installer.name);
    
    // This is where you would integrate with the backend installation process
    // For now, we'll show a mock installation process
    
    const installButton = document.getElementById('confirmInstallBtn');
    if (!installButton) return;
    
    const originalText = installButton.innerHTML;
    
    installButton.disabled = true;
    installButton.innerHTML = '<img src="assets/icons/refresh.svg" class="btn-icon spinning"> Installing...';
    
    try {
      // Mock installation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success
      installButton.innerHTML = '<img src="assets/icons/check.svg" class="btn-icon"> Installation Complete!';
      installButton.classList.remove('btn-primary');
      installButton.classList.add('btn-success');
      
      setTimeout(() => {
        modal.style.display = 'none';
        installButton.innerHTML = originalText;
        installButton.classList.remove('btn-success');
        installButton.classList.add('btn-primary');
        installButton.disabled = false;
        this.showInstallationSuccess(installer);
      }, 2000);
      
    } catch (error) {
      console.error('Installation failed:', error);
      installButton.innerHTML = '<img src="assets/icons/error.svg" class="btn-icon"> Installation Failed';
      installButton.classList.remove('btn-primary');
      installButton.classList.add('btn-danger');
      
      setTimeout(() => {
        installButton.innerHTML = originalText;
        installButton.classList.remove('btn-danger');
        installButton.classList.add('btn-primary');
        installButton.disabled = false;
      }, 3000);
    }
  }

  /**
   * Show installation success notification
   */
  showInstallationSuccess(installer) {
    // Show success notification/toast
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
      <div class="notification-content">
        <img src="assets/icons/success.svg" alt="Success" class="notification-icon">
        <div class="notification-text">
          <h4>${installer.name} installed successfully!</h4>
          <p>You can now access it at: <a href="${installer.installation.setupUrl}" target="_blank">${installer.installation.setupUrl}</a></p>
        </div>
        <button class="notification-close">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      document.body.removeChild(notification);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('installers-container')) {
    window.oneClickInstallers = new OneClickInstallers();
    window.oneClickInstallers.init();
  }
});
