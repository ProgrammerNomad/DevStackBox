const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

// Import ServiceManager
const ServiceManager = require('./src/services/ServiceManager');

// Keep a global reference of the window object
let mainWindow;
let tray;
let serviceManager;
let isDevMode = process.argv.includes('--dev');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false // Don't show until ready
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDevMode) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create system tray
function createTray() {
  const trayIcon = path.join(__dirname, 'assets', 'tray-icon.png');
  
  // Check if icon exists, skip tray creation if not
  if (!fs.existsSync(trayIcon)) {
    console.log('Tray icon not found, skipping tray creation');
    return;
  }
  
  try {
    tray = new Tray(trayIcon);
  
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show DevStackBox',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Services',
        submenu: [
          {
            label: 'Start Apache',
            click: () => startService('apache')
          },
          {
            label: 'Stop Apache',
            click: () => stopService('apache')
          },
          { type: 'separator' },
          {
            label: 'Start MySQL',
            click: () => startService('mysql')
          },
          {
            label: 'Stop MySQL',
            click: () => stopService('mysql')
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Quit DevStackBox',
        click: () => {
          app.quit();
        }
      }
    ]);
    
    tray.setToolTip('DevStackBox - Local Development Environment');
    tray.setContextMenu(contextMenu);
    
    // Double click to show window
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (error) {
    console.error('Error creating tray:', error);
  }
}

// App event handlers
app.whenReady().then(() => {
  // Initialize ServiceManager
  serviceManager = new ServiceManager(__dirname);
  
  createWindow();
  createTray();
  
  // macOS specific - recreate window if needed
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC Handlers for service management
ipcMain.handle('start-service', async (event, serviceName) => {
  return await startService(serviceName);
});

ipcMain.handle('stop-service', async (event, serviceName) => {
  return await stopService(serviceName);
});

ipcMain.handle('get-service-status', async (event, serviceName) => {
  return await getServiceStatus(serviceName);
});

ipcMain.handle('get-php-versions', async () => {
  return await getPhpVersions();
});

ipcMain.handle('set-php-version', async (event, version) => {
  return await setPhpVersion(version);
});

ipcMain.handle('install-app', async (event, appName) => {
  return await installApp(appName);
});

ipcMain.handle('open-config', async (event, configType) => {
  return await openConfig(configType);
});

ipcMain.handle('fetch-joke', async () => {
  return await fetchRandomJoke();
});

// Service management functions - now using ServiceManager
async function startService(serviceName) {
  try {
    return await serviceManager.startService(serviceName);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function stopService(serviceName) {
  try {
    return await serviceManager.stopService(serviceName);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function getServiceStatus(serviceName) {
  try {
    return await serviceManager.getServiceStatus(serviceName);
  } catch (error) {
    return {
      running: false,
      error: error.message
    };
  }
}

async function getPhpVersions() {
  const versions = [];
  
  // Check DevStackBox PHP directory
  const phpDir = path.join(__dirname, 'php');
  if (fs.existsSync(phpDir)) {
    try {
      const phpVersions = fs.readdirSync(phpDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      versions.push(...phpVersions);
    } catch (error) {
      console.error('Error reading DevStackBox PHP versions:', error);
    }
  }
  
  // Check XAMPP PHP as fallback
  const xamppPhpDir = 'C:\\xampp\\php';
  if (fs.existsSync(xamppPhpDir)) {
    try {
      // Get XAMPP PHP version
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('"C:\\xampp\\php\\php.exe" -v');
      const match = stdout.match(/PHP (\d+\.\d+)/);
      if (match) {
        versions.push(`${match[1]} (XAMPP)`);
      }
    } catch (error) {
      console.error('Error getting XAMPP PHP version:', error);
    }
  }
  
  return [...new Set(versions)]; // Remove duplicates
}

async function setPhpVersion(version) {
  // This would implement PHP version switching logic
  // For now, just return success
  return {
    success: true,
    message: `PHP version set to ${version}`,
    version: version
  };
}

async function installApp(appName) {
  // This would implement app installation logic
  // For now, just return success
  return {
    success: true,
    message: `${appName} installation started`,
    app: appName
  };
}

async function openConfig(configType) {
  let configPath;
  
  switch (configType) {
    case 'php':
      configPath = path.join(__dirname, 'php', 'php.ini');
      break;
    case 'apache':
      configPath = path.join(__dirname, 'apache', 'conf', 'httpd.conf');
      break;
    case 'mysql':
      configPath = path.join(__dirname, 'mysql', 'my.ini');
      break;
    default:
      return { success: false, error: 'Unknown config type' };
  }
  
  try {
    await shell.openPath(configPath);
    return { success: true, path: configPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function fetchRandomJoke() {
  try {
    // Try to fetch from external API first
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const joke = await response.json();
    
    // Validate joke structure
    if (!joke.setup || !joke.punchline) {
      throw new Error('Invalid joke format received');
    }
    
    return {
      success: true,
      joke: {
        setup: joke.setup,
        punchline: joke.punchline,
        type: joke.type || 'general',
        id: joke.id || Date.now()
      }
    };
    
  } catch (error) {
    console.log('External API failed, using built-in jokes:', error.message);
    
    // Fallback to built-in jokes
    const builtInJokes = [
      {
        setup: "Why don't scientists trust atoms?",
        punchline: "Because they make up everything!",
        type: "science"
      },
      {
        setup: "Why did the developer go broke?",
        punchline: "Because he used up all his cache!",
        type: "programming"
      },
      {
        setup: "Why do programmers prefer dark mode?",
        punchline: "Because light attracts bugs!",
        type: "programming"
      },
      {
        setup: "How do you comfort a JavaScript bug?",
        punchline: "You console it!",
        type: "programming"
      },
      {
        setup: "Why did the programmer quit his job?",
        punchline: "He didn't get arrays!",
        type: "programming"
      },
      {
        setup: "What's a computer's favorite snack?",
        punchline: "Microchips!",
        type: "technology"
      },
      {
        setup: "Why was the database administrator unexcited?",
        punchline: "Because he was just doing CRUD work!",
        type: "programming"
      },
      {
        setup: "What do you call a programmer from Finland?",
        punchline: "Nerdic!",
        type: "programming"
      }
    ];
    
    const randomJoke = builtInJokes[Math.floor(Math.random() * builtInJokes.length)];
    
    return {
      success: true,
      joke: {
        setup: randomJoke.setup,
        punchline: randomJoke.punchline,
        type: randomJoke.type,
        id: Date.now(),
        source: 'built-in'
      }
    };
  }
}

// Handle app cleanup on quit
app.on('before-quit', async () => {
  // Stop services gracefully using ServiceManager
  if (serviceManager) {
    try {
      await serviceManager.stopAllServices();
      console.log('All services stopped gracefully');
    } catch (error) {
      console.error('Error stopping services:', error);
    }
  }
});
