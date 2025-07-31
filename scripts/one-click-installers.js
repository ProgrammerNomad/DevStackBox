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
        <div class="no-installers">
          <img src="assets/icons/error.svg" alt="No applications" class="empty-icon">
          <h3>No applications found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      `;
    }

    return `
      <div class="installers-grid">
        ${filteredInstallers.map(installer => `
          <div class="installer-card" data-installer="${installer.id}">
            <div class="installer-header">
              <img src="${installer.icon}" alt="${installer.name}" class="installer-icon" 
                   onerror="this.src='assets/icons/installer.svg'">
              <div class="installer-info">
                <h3 class="installer-name">${installer.name}</h3>
                <span class="installer-version">v${installer.version}</span>
                <span class="installer-category">${installer.category}</span>
              </div>
            </div>
            
            <div class="installer-description">
              <p>${installer.description}</p>
            </div>

            <div class="installer-features">
              <div class="features-list">
                ${installer.features.slice(0, 4).map(feature => `
                  <span class="feature-tag">${feature}</span>
                `).join('')}
              </div>
            </div>

            <div class="installer-requirements">
              <div class="requirement">
                <span class="req-label">PHP:</span>
                <span class="req-value">${installer.requirements.php}</span>
              </div>
              <div class="requirement">
                <span class="req-label">MySQL:</span>
                <span class="req-value">${installer.requirements.mysql}</span>
              </div>
              <div class="requirement">
                <span class="req-label">Size:</span>
                <span class="req-value">${installer.requirements.diskSpace}</span>
              </div>
            </div>

            <div class="installer-actions">
              <button class="btn btn-primary install-btn" data-installer="${installer.id}">
                <img src="assets/icons/download.svg" alt="Install" class="btn-icon">
                Install Now
              </button>
              <button class="btn btn-secondary info-btn" data-installer="${installer.id}">
                <img src="assets/icons/system.svg" alt="More Info" class="btn-icon">
                Details
              </button>
            </div>
          </div>
        `).join('')}
      </div>
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
    dialog.className = 'modal-overlay installer-info-modal';
    dialog.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${installer.name} Details</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="app-details">
            <div class="app-header">
              <img src="${installer.icon}" alt="${installer.name}" class="app-icon">
              <div class="app-basic-info">
                <h3>${installer.name}</h3>
                <p class="version">Version ${installer.version}</p>
                <p class="category">${installer.category}</p>
                <a href="${installer.officialSite}" target="_blank" class="official-link">
                  Visit Official Website →
                </a>
              </div>
            </div>
            
            <div class="app-description">
              <h4>Description</h4>
              <p>${installer.description}</p>
            </div>

            <div class="app-features">
              <h4>Key Features</h4>
              <ul>
                ${installer.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>

            <div class="app-requirements">
              <h4>System Requirements</h4>
              <div class="requirements-grid">
                <div class="requirement">
                  <strong>PHP Version:</strong> ${installer.requirements.php}
                </div>
                <div class="requirement">
                  <strong>MySQL Version:</strong> ${installer.requirements.mysql}
                </div>
                <div class="requirement">
                  <strong>Disk Space:</strong> ${installer.requirements.diskSpace}
                </div>
              </div>
            </div>

            <div class="app-installation">
              <h4>Installation Details</h4>
              <div class="installation-details">
                <p><strong>Install Location:</strong> ${installer.installation.extractTo}</p>
                <p><strong>Setup URL:</strong> ${installer.installation.setupUrl}</p>
                <p><strong>Database Required:</strong> ${installer.installation.databaseRequired ? 'Yes' : 'No'}</p>
                ${installer.installation.composerRequired ? '<p><strong>Composer Required:</strong> Yes</p>' : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-info">Close</button>
          <button class="btn btn-primary install-from-info" data-installer="${installer.id}">Install Now</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    dialog.classList.add('active');

    // Bind modal events
    dialog.querySelector('.modal-close').addEventListener('click', () => {
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
