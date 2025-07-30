const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

// Import all managers
const ServiceManager = require('./src/services/ServiceManager');
const PortableServerManager = require('./src/services/PortableServerManager');
const AppInstallerManager = require('./src/services/AppInstallerManager');
const ConfigEditorManager = require('./src/services/ConfigEditorManager');
const LogViewerManager = require('./src/services/LogViewerManager');

// Keep a global reference of the window object
let mainWindow;
let tray;
let serviceManager;
let portableServerManager;
let appInstallerManager;
let configEditorManager;
let logViewerManager;
let isDevMode = process.argv.includes('--dev');

function createWindow() {
  // Create application menu
  createApplicationMenu();
  
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

// Create application menu
function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => createNewProject()
        },
        {
          label: 'Open Web Root',
          accelerator: 'CmdOrCtrl+O',
          click: () => shell.openPath(path.join(__dirname, 'www'))
        },
        {
          label: 'Open Projects Folder',
          click: () => shell.openPath(path.join(__dirname, 'www', 'projects'))
        },
        { type: 'separator' },
        {
          label: 'Download Portable Servers',
          accelerator: 'CmdOrCtrl+D',
          click: async () => {
            try {
              const result = await portableServerManager.installAll((progress) => {
                if (mainWindow) {
                  mainWindow.webContents.send('download-progress', progress);
                }
              });
              
              if (result.success) {
                // Configure servers after download
                await configurePortableServers();
                
                mainWindow.webContents.send('show-notification', {
                  message: '🎉 All portable servers installed and configured! DevStackBox is now fully independent.',
                  type: 'success'
                });
              } else {
                throw new Error(result.error);
              }
            } catch (error) {
              console.error('Download failed:', error);
              mainWindow.webContents.send('show-notification', {
                message: `Download failed: ${error.message}`,
                type: 'error'
              });
            }
          }
        },
        {
          label: 'Check Installation Status',
          click: async () => {
            try {
              const status = await portableServerManager.checkInstallation();
              const statusMessage = `Installation Status:
Apache: ${status.apache ? '✅ Installed' : '❌ Not Installed'}
MySQL: ${status.mysql ? '✅ Installed' : '❌ Not Installed'}
PHP: ${status.php ? '✅ Installed' : '❌ Not Installed'}
phpMyAdmin: ${status.phpmyadmin ? '✅ Installed' : '❌ Not Installed'}`;
              
              const { dialog } = require('electron');
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'DevStackBox Installation Status',
                message: 'Component Installation Status',
                detail: statusMessage,
                buttons: ['OK']
              });
            } catch (error) {
              mainWindow.webContents.send('show-notification', {
                message: `Error checking status: ${error.message}`,
                type: 'error'
              });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Services',
      submenu: [
        {
          label: 'Start All Services',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => startAllServices()
        },
        {
          label: 'Stop All Services',
          accelerator: 'CmdOrCtrl+Shift+X',
          click: () => stopAllServices()
        },
        { type: 'separator' },
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
    {
      label: 'Tools',
      submenu: [
        {
          label: 'phpMyAdmin',
          click: () => shell.openExternal('http://localhost/phpmyadmin/')
        },
        {
          label: 'PHP Info',
          click: () => shell.openExternal('http://localhost/phpinfo.php')
        },
        { type: 'separator' },
        {
          label: 'Apache Config',
          click: () => openConfig('apache')
        },
        {
          label: 'MySQL Config',
          click: () => openConfig('mysql')
        },
        {
          label: 'PHP Config',
          click: () => openConfig('php')
        },
        { type: 'separator' },
        {
          label: 'PHP Extensions Manager',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-php-extensions-dialog');
            }
          }
        },
        {
          label: 'Download Manager',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('focus-download-panel');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'View Apache Logs',
          click: () => viewLogs('apache')
        },
        {
          label: 'View MySQL Logs',
          click: () => viewLogs('mysql')
        }
      ]
    },
    {
      label: 'Install',
      submenu: [
        {
          label: 'WordPress',
          click: () => installApp('wordpress')
        },
        {
          label: 'Laravel',
          click: () => installApp('laravel')
        },
        {
          label: 'CodeIgniter',
          click: () => installApp('codeigniter')
        },
        { type: 'separator' },
        {
          label: 'Download Portable Servers',
          click: async () => {
            try {
              // Show confirmation dialog
              const { dialog } = require('electron');
              const result = await dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['Download All', 'Cancel'],
                defaultId: 0,
                title: 'Download Portable Servers',
                message: 'Download Apache, MySQL, PHP, and phpMyAdmin?',
                detail: 'This will download ~150MB of server binaries for complete portability.'
              });

              if (result.response === 0) {
                mainWindow.webContents.send('show-notification', {
                  message: 'Starting portable server downloads...',
                  type: 'info'
                });
                
                // Start downloads in background
                downloadPortableServers();
              }
            } catch (error) {
              mainWindow.webContents.send('show-notification', {
                message: `Failed to start downloads: ${error.message}`,
                type: 'error'
              });
            }
          }
        },
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => mainWindow.minimize()
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow.close()
        },
        { type: 'separator' },
        {
          label: 'Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.openDevTools()
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About DevStackBox',
          click: () => showAboutDialog()
        },
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://github.com/ProgrammerNomad/DevStackBox/blob/main/README.md')
        },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/ProgrammerNomad/DevStackBox/issues')
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => checkForUpdates()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Menu action implementations
async function createNewProject() {
  const { dialog } = require('electron');
  
  const result = await dialog.showInputBox(mainWindow, {
    title: 'Create New Project',
    label: 'Project Name:',
    value: 'my-project'
  });
  
  if (result.canceled) return;
  
  const projectName = result.value.replace(/[^a-zA-Z0-9-_]/g, '');
  const projectPath = path.join(__dirname, 'www', 'projects', projectName);
  
  try {
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      
      // Create basic index.php
      const indexContent = `<?php
// ${projectName} - Created by DevStackBox
echo "<h1>Welcome to ${projectName}</h1>";
echo "<p>Project created: " . date('Y-m-d H:i:s') . "</p>";
phpinfo();
?>`;
      
      fs.writeFileSync(path.join(projectPath, 'index.php'), indexContent);
      
      // Open project folder
      shell.openPath(projectPath);
      
      // Show success notification
      mainWindow.webContents.send('show-notification', {
        type: 'success',
        message: `Project "${projectName}" created successfully!`
      });
    } else {
      mainWindow.webContents.send('show-notification', {
        type: 'error',
        message: `Project "${projectName}" already exists!`
      });
    }
  } catch (error) {
    mainWindow.webContents.send('show-notification', {
      type: 'error',
      message: `Failed to create project: ${error.message}`
    });
  }
}

async function startAllServices() {
  try {
    const results = await serviceManager.startService('apache');
    await serviceManager.startService('mysql');
    
    mainWindow.webContents.send('show-notification', {
      type: 'success',
      message: 'All services started successfully!'
    });
  } catch (error) {
    mainWindow.webContents.send('show-notification', {
      type: 'error',
      message: `Failed to start services: ${error.message}`
    });
  }
}

async function stopAllServices() {
  try {
    await serviceManager.stopAllServices();
    
    mainWindow.webContents.send('show-notification', {
      type: 'success',
      message: 'All services stopped successfully!'
    });
  } catch (error) {
    mainWindow.webContents.send('show-notification', {
      type: 'error',
      message: `Failed to stop services: ${error.message}`
    });
  }
}

function showAboutDialog() {
  const { dialog } = require('electron');
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About DevStackBox',
    message: 'DevStackBox',
    detail: `Version: 1.0.0
A lightweight, portable, open-source local development tool for PHP developers.

Built with Electron and ❤️ by ProgrammerNomad

© 2025 DevStackBox. All rights reserved.`,
    buttons: ['OK']
  });
}

function checkForUpdates() {
  mainWindow.webContents.send('show-notification', {
    type: 'info',
    message: 'Update checking feature coming soon!'
  });
}

async function viewLogs(service) {
  try {
    const logPath = serviceManager.getLogPath(service);
    if (fs.existsSync(logPath)) {
      shell.openPath(logPath);
    } else {
      mainWindow.webContents.send('show-notification', {
        type: 'warning',
        message: `No log file found for ${service}`
      });
    }
  } catch (error) {
    mainWindow.webContents.send('show-notification', {
      type: 'error',
      message: `Error opening logs: ${error.message}`
    });
  }
}

async function downloadPortableServers() {
  try {
    const downloads = [
      { name: 'Apache', component: 'apache' },
      { name: 'MySQL', component: 'mysql' },
      { name: 'PHP 8.3', component: 'php83' },
      { name: 'PHP 8.2', component: 'php82' },
      { name: 'PHP 8.1', component: 'php81' },
      { name: 'phpMyAdmin', component: 'phpmyadmin' }
    ];

    for (const download of downloads) {
      mainWindow.webContents.send('show-notification', {
        message: `Downloading ${download.name}...`,
        type: 'info'
      });

      try {
        await portableServerManager.installComponent(download.component);
        
        mainWindow.webContents.send('show-notification', {
          message: `✅ ${download.name} installed successfully!`,
          type: 'success'
        });
      } catch (error) {
        console.error(`Failed to install ${download.name}:`, error);
        mainWindow.webContents.send('show-notification', {
          message: `❌ Failed to install ${download.name}: ${error.message}`,
          type: 'error'
        });
      }
    }

    // Configure servers after download
    await configurePortableServers();
    
    mainWindow.webContents.send('show-notification', {
      message: '🎉 All portable servers installed! DevStackBox is now fully independent.',
      type: 'success'
    });

  } catch (error) {
    console.error('Download failed:', error);
    mainWindow.webContents.send('show-notification', {
      message: `Download failed: ${error.message}`,
      type: 'error'
    });
  }
}

async function configurePortableServers() {
  try {
    // Configure Apache
    await configureApache();
    
    // Configure MySQL  
    await configureMysql();
    
    // Configure PHP versions
    await configurePhp();
    
    console.log('✅ All portable servers configured');
  } catch (error) {
    console.error('Configuration failed:', error);
    throw error;
  }
}

async function configureApache() {
  const fs = require('fs').promises;
  const apacheConfPath = path.join(__dirname, 'apache', 'conf', 'httpd.conf');
  
  if (!require('fs').existsSync(apacheConfPath)) {
    throw new Error('Apache configuration file not found');
  }

  try {
    let config = await fs.readFile(apacheConfPath, 'utf8');
    
    // Update paths for DevStackBox
    const serverRoot = path.join(__dirname, 'apache').replace(/\\/g, '/');
    const documentRoot = path.join(__dirname, 'www').replace(/\\/g, '/');
    
    config = config.replace(/^ServerRoot\s+.*/m, `ServerRoot "${serverRoot}"`);
    config = config.replace(/^DocumentRoot\s+.*/m, `DocumentRoot "${documentRoot}"`);
    config = config.replace(/^<Directory\s+".*htdocs.*">/m, `<Directory "${documentRoot}">`);
    
    // Enable PHP
    config += `\n# DevStackBox PHP Configuration
LoadModule php_module "../php/8.3/php8apache2_4.dll"
PHPIniDir "../php/8.3"
AddType application/x-httpd-php .php
DirectoryIndex index.php index.html
`;

    await fs.writeFile(apacheConfPath, config);
    console.log('✅ Apache configured');
  } catch (error) {
    console.error('Apache configuration failed:', error);
    throw error;
  }
}

async function configureMysql() {
  const fs = require('fs').promises;
  const mysqlConfPath = path.join(__dirname, 'mysql', 'my.ini');
  
  const config = `[mysqld]
# DevStackBox MySQL Configuration
basedir=${path.join(__dirname, 'mysql').replace(/\\/g, '/')}
datadir=${path.join(__dirname, 'mysql', 'data').replace(/\\/g, '/')}
port=3306
max_connections=100
table_open_cache=32
key_buffer_size=8M
max_allowed_packet=1M
sort_buffer_size=512K
net_buffer_length=8K
read_buffer_size=256K
read_rnd_buffer_size=512K
myisam_sort_buffer_size=8M

[mysql]
default-character-set=utf8

[client]
default-character-set=utf8
`;

  try {
    await fs.writeFile(mysqlConfPath, config);
    
    // Initialize MySQL data directory if needed
    const dataDir = path.join(__dirname, 'mysql', 'data');
    if (!require('fs').existsSync(dataDir)) {
      await fs.mkdir(dataDir, { recursive: true });
      
      // Initialize MySQL
      const mysqldPath = path.join(__dirname, 'mysql', 'bin', 'mysqld.exe');
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      await execAsync(`"${mysqldPath}" --initialize-insecure --basedir="${path.join(__dirname, 'mysql')}" --datadir="${dataDir}"`);
    }
    
    console.log('✅ MySQL configured');
  } catch (error) {
    console.error('MySQL configuration failed:', error);
    throw error;
  }
}

async function configurePhp() {
  const fs = require('fs').promises;
  const phpVersions = ['8.1', '8.2', '8.3', '8.4'];
  
  for (const version of phpVersions) {
    const phpDir = path.join(__dirname, 'php', version);
    const phpIniPath = path.join(phpDir, 'php.ini');
    const phpIniDevPath = path.join(phpDir, 'php.ini-development');
    
    if (require('fs').existsSync(phpIniDevPath) && !require('fs').existsSync(phpIniPath)) {
      try {
        await fs.copyFile(phpIniDevPath, phpIniPath);
        
        // Basic PHP configuration for DevStackBox
        let config = await fs.readFile(phpIniPath, 'utf8');
        config = config.replace(/;extension=mysqli/g, 'extension=mysqli');
        config = config.replace(/;extension=pdo_mysql/g, 'extension=pdo_mysql');
        config = config.replace(/;extension=openssl/g, 'extension=openssl');
        config = config.replace(/;extension=curl/g, 'extension=curl');
        
        await fs.writeFile(phpIniPath, config);
        console.log(`✅ PHP ${version} configured`);
      } catch (error) {
        console.error(`PHP ${version} configuration failed:`, error);
      }
    }
  }
}
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

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('create-new-project');
            }
          }
        },
        {
          label: 'Open Web Root',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            shell.openPath(path.join(__dirname, 'www'));
          }
        },
        {
          label: 'Open Projects Folder',
          click: () => {
            shell.openPath(path.join(__dirname, 'www', 'projects'));
          }
        },
        {
          label: 'Download Portable Servers',
          click: async () => {
            try {
              const result = await portableServerManager.installAllComponents();
              mainWindow.webContents.send('show-notification', {
                message: 'Started downloading portable servers...',
                type: 'info'
              });
            } catch (error) {
              mainWindow.webContents.send('show-notification', {
                message: `Failed to download servers: ${error.message}`,
                type: 'error'
              });
            }
          }
        },
        {
          label: 'Check Installation Status',
          click: async () => {
            try {
              const status = await portableServerManager.checkInstallation();
              const message = Object.entries(status).map(([key, value]) => 
                `${key}: ${value ? '✓' : '✗'}`
              ).join('\n');
              
              mainWindow.webContents.send('show-notification', {
                message: `Installation Status:\n${message}`,
                type: 'info'
              });
            } catch (error) {
              mainWindow.webContents.send('show-notification', {
                message: `Failed to check status: ${error.message}`,
                type: 'error'
              });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Services',
      submenu: [
        {
          label: 'Start All Services',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            await startService('apache');
            await startService('mysql');
          }
        },
        {
          label: 'Stop All Services',
          accelerator: 'CmdOrCtrl+Shift+X',
          click: async () => {
            await stopService('apache');
            await stopService('mysql');
          }
        },
        { type: 'separator' },
        {
          label: 'Apache',
          submenu: [
            {
              label: 'Start Apache',
              click: () => startService('apache')
            },
            {
              label: 'Stop Apache',
              click: () => stopService('apache')
            },
            {
              label: 'Restart Apache',
              click: async () => {
                await stopService('apache');
                setTimeout(() => startService('apache'), 2000);
              }
            },
            { type: 'separator' },
            {
              label: 'View Apache Logs',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('view-logs', 'apache');
                }
              }
            },
            {
              label: 'Edit Apache Config',
              click: () => openConfig('apache')
            }
          ]
        },
        {
          label: 'MySQL',
          submenu: [
            {
              label: 'Start MySQL',
              click: () => startService('mysql')
            },
            {
              label: 'Stop MySQL',
              click: () => stopService('mysql')
            },
            {
              label: 'Restart MySQL',
              click: async () => {
                await stopService('mysql');
                setTimeout(() => startService('mysql'), 2000);
              }
            },
            { type: 'separator' },
            {
              label: 'View MySQL Logs',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('view-logs', 'mysql');
                }
              }
            },
            {
              label: 'Edit MySQL Config',
              click: () => openConfig('mysql')
            },
            {
              label: 'Open phpMyAdmin',
              click: () => {
                shell.openExternal('http://localhost/phpmyadmin');
              }
            }
          ]
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Show Available Apps',
          click: async () => {
            try {
              const apps = await appInstallerManager.getAvailableApps();
              const appList = apps.map(app => `• ${app.name} - ${app.description}`).join('\n');
              mainWindow.webContents.send('show-notification', {
                message: `Available Apps:\n${appList}`,
                type: 'info'
              });
            } catch (error) {
              mainWindow.webContents.send('show-notification', {
                message: `Failed to get apps: ${error.message}`,
                type: 'error'
              });
            }
          }
        },
        {
          label: 'Show Installed Apps',
          click: async () => {
            try {
              const apps = await appInstallerManager.getInstalledApps();
              const appList = apps.length > 0 ? 
                apps.map(app => `• ${app}`).join('\n') : 
                'No apps installed yet';
              mainWindow.webContents.send('show-notification', {
                message: `Installed Apps:\n${appList}`,
                type: 'info'
              });
            } catch (error) {
              mainWindow.webContents.send('show-notification', {
                message: `Failed to get installed apps: ${error.message}`,
                type: 'error'
              });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'App Installers',
          submenu: [
            {
              label: 'Install WordPress',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('install-app', 'wordpress');
                }
              }
            },
            {
              label: 'Install Laravel',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('install-app', 'laravel');
                }
              }
            },
            {
              label: 'Install CodeIgniter',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('install-app', 'codeigniter');
                }
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Configuration Editors',
          submenu: [
            {
              label: 'Edit PHP Config (php.ini)',
              click: () => openConfig('php')
            },
            {
              label: 'Edit Apache Config (httpd.conf)',
              click: () => openConfig('apache')
            },
            {
              label: 'Edit MySQL Config (my.ini)',
              click: () => openConfig('mysql')
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Log Viewers',
          submenu: [
            {
              label: 'View Apache Logs',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('view-logs', 'apache');
                }
              }
            },
            {
              label: 'View MySQL Logs',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('view-logs', 'mysql');
                }
              }
            },
            {
              label: 'View PHP Error Logs',
              click: () => {
                if (mainWindow) {
                  mainWindow.webContents.send('view-logs', 'php');
                }
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-settings');
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            if (mainWindow) {
              mainWindow.minimize();
            }
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reload();
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About DevStackBox',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        },
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/ProgrammerNomad/DevStackBox/blob/main/README.md');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/ProgrammerNomad/DevStackBox/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('check-updates');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  // Initialize all managers
  serviceManager = new ServiceManager(__dirname);
  portableServerManager = new PortableServerManager(__dirname);
  appInstallerManager = new AppInstallerManager(__dirname);
  configEditorManager = new ConfigEditorManager(__dirname);
  logViewerManager = new LogViewerManager(__dirname);
  
  createWindow();
  createMenu();
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

// Portable Server Manager IPC Handlers
ipcMain.handle('check-installation', async () => {
  try {
    return await portableServerManager.checkInstallation();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('install-component', async (event, component) => {
  try {
    return await portableServerManager.installComponent(component, (progress) => {
      event.sender.send('install-progress', { component, ...progress });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-all-components', async (event) => {
  try {
    return await portableServerManager.installAll((progress) => {
      event.sender.send('install-all-progress', progress);
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App Installer Manager IPC Handlers
ipcMain.handle('get-available-apps', async () => {
  try {
    return appInstallerManager.getAvailableApps();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('install-app-new', async (event, appId, projectName, options) => {
  try {
    return await appInstallerManager.installApp(appId, projectName, options, (progress) => {
      event.sender.send('app-install-progress', { appId, projectName, ...progress });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-installed-apps', async () => {
  try {
    return appInstallerManager.getInstalledApps();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('uninstall-app', async (event, projectName) => {
  try {
    return await appInstallerManager.uninstallApp(projectName);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Quick Actions IPC Handlers
ipcMain.handle('open-url', async (event, url) => {
  try {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    const { shell } = require('electron');
    const path = require('path');
    const fullPath = path.join(__dirname, folderPath);
    await shell.openPath(fullPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-project', async (event, projectName) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const projectPath = path.join(__dirname, 'www', 'projects', projectName);
    
    // Check if project already exists
    if (fs.existsSync(projectPath)) {
      return { success: false, error: 'Project already exists' };
    }
    
    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });
    
    // Create a basic index.php file
    const indexContent = `<?php
echo "<h1>Welcome to ${projectName}</h1>";
echo "<p>This is your new project!</p>";
echo "<p>Current time: " . date('Y-m-d H:i:s') . "</p>";
?>`;
    
    fs.writeFileSync(path.join(projectPath, 'index.php'), indexContent);
    
    return { success: true, path: projectPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Config Editor Manager IPC Handlers
ipcMain.handle('get-available-configs', async () => {
  try {
    return configEditorManager.getAvailableConfigs();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('read-config', async (event, service, type) => {
  try {
    return await configEditorManager.readConfig(service, type);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('write-config', async (event, service, type, content, createBackup = true) => {
  try {
    return await configEditorManager.writeConfig(service, type, content, createBackup);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-backup', async (event, service, type) => {
  try {
    return await configEditorManager.createBackup(service, type);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-backup', async (event, service, type, backupFilename) => {
  try {
    return await configEditorManager.restoreBackup(service, type, backupFilename);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-backups', async (event, service, type) => {
  try {
    return configEditorManager.getBackups(service, type);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('delete-backup', async (event, backupFilename) => {
  try {
    return await configEditorManager.deleteBackup(backupFilename);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('test-config', async (event, service, type) => {
  try {
    return await configEditorManager.testConfig(service, type);
  } catch (error) {
    return { valid: false, error: error.message };
  }
});

// Log Viewer Manager IPC Handlers
ipcMain.handle('get-available-logs', async () => {
  try {
    return logViewerManager.getAvailableLogs();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('read-log', async (event, service, type, options) => {
  try {
    return await logViewerManager.readLog(service, type, options);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('watch-log', async (event, service, type) => {
  try {
    logViewerManager.watchLog(service, type, (error, data) => {
      if (error) {
        event.sender.send('log-watch-error', { service, type, error: error.message });
      } else {
        event.sender.send('log-update', data);
      }
    });
    return { success: true, message: `Started watching ${service} ${type} log` };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-watching-log', async (event, service, type) => {
  try {
    logViewerManager.stopWatching(service, type);
    return { success: true, message: `Stopped watching ${service} ${type} log` };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clear-log', async (event, service, type) => {
  try {
    return await logViewerManager.clearLog(service, type);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('archive-log', async (event, service, type) => {
  try {
    return await logViewerManager.archiveLog(service, type);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-log-stats', async (event, service, type) => {
  try {
    return await logViewerManager.getLogStats(service, type);
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('search-logs', async (event, services, query, options) => {
  try {
    return await logViewerManager.searchLogs(services, query, options);
  } catch (error) {
    return { error: error.message };
  }
});

// Additional IPC handlers for missing functionality
ipcMain.handle('create-project', async (event, projectName, template) => {
  try {
    const projectPath = path.join(__dirname, 'www', 'projects', projectName);
    const fs = require('fs').promises;
    
    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create basic files based on template
    if (template === 'basic') {
      await fs.writeFile(path.join(projectPath, 'index.php'), `<?php
echo "<h1>Welcome to ${projectName}</h1>";
echo "<p>Your project is ready!</p>";
phpinfo();
?>`);
      
      await fs.writeFile(path.join(projectPath, 'README.md'), `# ${projectName}

This is a basic PHP project created with DevStackBox.

## Access
Visit: http://localhost/projects/${projectName}/

## Files
- index.php - Main entry point
`);
    }
    
    return { success: true, path: projectPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-logs', async (event, service, lines = 100) => {
  try {
    const result = await logViewerManager.readLog(service, 'access', { lines });
    return result.content || result;
  } catch (error) {
    return `Error reading ${service} logs: ${error.message}`;
  }
});

ipcMain.handle('get-projects', async () => {
  try {
    const fs = require('fs').promises;
    const projectsPath = path.join(__dirname, 'www', 'projects');
    
    // Create projects directory if it doesn't exist
    try {
      await fs.mkdir(projectsPath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    const projects = await fs.readdir(projectsPath);
    return projects.filter(async (project) => {
      const projectPath = path.join(projectsPath, project);
      const stat = await fs.stat(projectPath);
      return stat.isDirectory();
    });
  } catch (error) {
    return [];
  }
});

ipcMain.handle('delete-project', async (event, projectName) => {
  try {
    const fs = require('fs').promises;
    const projectPath = path.join(__dirname, 'www', 'projects', projectName);
    await fs.rmdir(projectPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-url', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-path', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-in-folder', async (event, filePath) => {
  try {
    shell.showItemInFolder(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Additional handlers for the simple UI
ipcMain.handle('start-all-services', async () => {
  try {
    const apacheResult = await serviceManager.startService('apache');
    const mysqlResult = await serviceManager.startService('mysql');
    return { success: true, apache: apacheResult, mysql: mysqlResult };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-all-services', async () => {
  try {
    const apacheResult = await serviceManager.stopService('apache');
    const mysqlResult = await serviceManager.stopService('mysql');
    return { success: true, apache: apacheResult, mysql: mysqlResult };
  } catch (error) {
    return { success: false, error: error.message };
  }
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
  
  // Check DevStackBox PHP directory for pre-bundled versions
  const phpDir = path.join(__dirname, 'php');
  console.log('Checking PHP directory:', phpDir);
  
  if (fs.existsSync(phpDir)) {
    try {
      const phpVersions = fs.readdirSync(phpDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => /^\d+\.\d+$/.test(name)) // Only valid version numbers
        .sort();
      
      console.log('Found PHP versions:', phpVersions);
      
      // Convert to proper format expected by frontend
      for (const version of phpVersions) {
        const phpExe = path.join(phpDir, version, 'php.exe');
        const isInstalled = fs.existsSync(phpExe);
        console.log(`PHP ${version}: ${isInstalled ? 'FOUND' : 'MISSING'} at ${phpExe}`);
        
        versions.push({
          version: version,
          installed: isInstalled,
          current: version === '8.2', // Set 8.2 as default/current
          path: phpExe
        });
      }
    } catch (error) {
      console.error('Error reading DevStackBox PHP versions:', error);
    }
  } else {
    console.warn('PHP directory not found:', phpDir);
  }
  
  // If no versions found, check if we have the expected pre-bundled versions
  if (versions.length === 0) {
    const expectedVersions = ['8.1', '8.2', '8.3', '8.4'];
    for (const version of expectedVersions) {
      const phpExe = path.join(phpDir, version, 'php.exe');
      const isInstalled = fs.existsSync(phpExe);
      
      versions.push({
        version: version,
        installed: isInstalled,
        current: version === '8.2', // Set 8.2 as default
        path: phpExe
      });
    }
  }
  
  console.log('Final PHP versions array:', versions);
  return versions;
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

  // Cleanup log watchers
  if (logViewerManager) {
    logViewerManager.cleanup();
    console.log('Log watchers cleaned up');
  }
});
