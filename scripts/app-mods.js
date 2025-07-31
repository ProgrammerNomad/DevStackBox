/**
 * New functions to add to the app.js file
 */

// Add this notification-container div after the header in the HTML
// <div id="notification-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

// Add this to the DevStackBox class:

/**
 * Shows a notification toast with a message and optional type and duration
 */
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

/**
 * Updates the UI to show a service in loading state
 */
updateServiceLoadingState(service, action) {
  const statusEl = document.getElementById(`${service}-status`);
  if (!statusEl) return;
  
  const loadingHTML = `
    <div class="flex items-center">
      <svg class="animate-spin w-3 h-3 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>${action === 'start' ? 'Starting...' : 'Stopping...'}</span>
    </div>
  `;
  
  statusEl.innerHTML = loadingHTML;
  
  // Also update footer status if it exists
  const footerStatus = document.getElementById(`footer-${service}-status`);
  if (footerStatus) {
    footerStatus.textContent = action === 'start' ? 'Starting...' : 'Stopping...';
    footerStatus.className = 'px-2 py-1 rounded-md text-xs font-semibold bg-yellow-500 text-white';
  }
}

// Modified startService method
async startService(service) {
  try {
    // Set button loading state
    this.setButtonLoading(service, 'start', true);
    
    // Update status to show loading
    this.updateServiceLoadingState(service, 'start');
    
    // Show notification
    this.showNotification(`Starting ${service}...`, 'info');
    
    // Check if service is installed first
    const status = await window.electronAPI.getServiceStatus(service);
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

// Modified stopService method
async stopService(service) {
  try {
    // Set button loading state
    this.setButtonLoading(service, 'stop', true);
    
    // Update status to show loading
    this.updateServiceLoadingState(service, 'stop');
    
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
