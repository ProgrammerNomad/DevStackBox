
# 🧠 GitHub Copilot Guide for DevStackBox

Welcome to the **DevStackBox** contributor guide!  
This file will help you get started with **GitHub Copilot** in **Visual Studio Code** so you can develop and contri### 📂 Folders You'll Work With

- `src/` → Logic for starting/stopping services
- `php/` → Place multiple PHP versions here (8.1, 8.2, 8.3, 8.4)
- `apache/` → Portable Apache setup
- `mysql/` → Portable MySQL (or MariaDB) with default users
- `phpmyadmin/` → Preinstalled phpMyAdmin config
- `apps/` → Installers for popular PHP apps (Top 10 CMS/frameworks)
- `logs/` → Log files directory (Apache, MySQL, PHP, etc.)
- `config-backups/` → Automatic backups of configuration files
- `tmp/` → Temporary files and downloads during installations
- `www/` → Web root directory for projectster.

---

## 1. Prerequisites

Before using Copilot effectively with this project, ensure you have:

- ✅ Windows 10/11 (Linux and macOS support planned)
- ✅ [Node.js](https://nodejs.org/) (v18 or newer)
- ✅ [Git](https://git-scm.com/)
- ✅ [Visual Studio Code](https://code.visualstudio.com/)
- ✅ GitHub Copilot extension installed and signed in ([Install here](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot))

---

## 📦 2. Project Setup

```bash
git clone https://github.com/ProgrammerNomad/DevStackBox.git
cd DevStackBox
npm install
```

To run the Electron app:
```bash
npm start
```

---

## 🧩 3. Recommended VS Code Extensions

- 🧠 GitHub Copilot
- ✨ ESLint
- 🎨 Prettier - Code formatter
- ⚡ Electron Snippets (optional)
- 📄 Markdown All in One (for docs)

---

## ✍️ 4. Tips for Using Copilot in DevStackBox

### ➤ Service Management (`scripts/app.js`)
Start typing:
```js
// Function to update service UI based on status
updateServiceUI(service, status, loadingState = null) {
  // Ensure DOM is ready before updating UI...
```
Copilot will suggest the implementation for handling service UI states.

### ➤ Configuration Editor (`scripts/config-ui.js`)
For example:
```js
// Function to load and display Apache configuration
loadApacheConfig() {
  // Get config file content...
```
Copilot will suggest logic for loading and displaying config files.

### ➤ App Installers (`scripts/one-click-installers.js`)
Example:
```js
// Perform the WordPress installation
async installWordPress(options) {
  // Download WordPress...
```
Copilot can help with installation flows and error handling.

### ➤ UI Components (Tailwind CSS)
For modals and components:
```html
<div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
  <!-- Modal header -->
```
Copilot will suggest Tailwind classes for responsive UI components.

### ➤ Documentation (`README.md`, etc.)
Start typing:
```md
## 🚀 New Feature: PHP Extensions Manager

This feature allows users to easily enable or disable PHP extensions through a...
```
Copilot will suggest complete documentation sections.

---

## ⚙️ 5. Project Structure (for Copilot context)

```
DevStackBox/
├── src/             # Node.js logic (services, config)
├── apache/          # Apache portable setup
├── mysql/           # MySQL portable setup
├── php/             # Multiple PHP versions
├── phpmyadmin/      # phpMyAdmin setup
├── apps/            # One-click app installers
├── scripts/         # Frontend JavaScript modules
│   ├── app.js       # Main application logic
│   ├── config-ui.js # Configuration UI handling
│   ├── one-click-installers.js # App installation module
│   └── service-status-helper.js # Service status management
├── styles/          # CSS stylesheets (Tailwind)
├── assets/          # Icons and images
├── config/          # Configuration files
├── config-backups/  # Backup files for configurations
├── logs/            # Log files directory
├── www/             # Web root directory
├── main.js          # Electron main process
├── preload.js       # Electron bridge
├── index.html       # GUI window
├── package.json
├── LICENSE
└── README.md
```

---

## 🔧 6. Implemented & Planned Features

| Feature                    | Status      | Description                                                                 |
|----------------------------|-------------|-----------------------------------------------------------------------------|
| Electron Application       | ✅ Done     | Modern GUI interface with Tailwind CSS framework                            |
| Apache Control             | 📋 Planned  | Portable Apache with easy start/stop controls and logical button states     |
| MySQL Integration          | ✅ Done     | Start/Stop MySQL server with logical button states                          |
| Service Management         | ✅ Done     | Service management architecture with IPC communication                       |
| phpMyAdmin                 | ✅ Done     | Built-in database management interface                                       |
| Config Editors Framework   | ✅ Done     | Configuration management foundation with backup/restore                      |
| Tailwind UI                | ✅ Done     | All UI components use Tailwind CSS (no custom CSS dependencies)             |
| Multi PHP Version Support  | � Planned  | Switch between PHP 8.1, 8.2 (default), 8.3, and 8.4                      |
| PHP Extensions Management  | � Planned  | Enable/disable PHP extensions per version                                    |
| Enhanced Error Handling    | 🔄 In Progress | Improved notifications with modals/banners                                 |
| Real-time Status Monitor   | 🔄 In Progress | Live service status monitoring and updates                                 |
| Logs Viewer                | 🔄 In Progress | Real-time log viewing with tabs, search/filter for Apache, MySQL, PHP      |
| System Tray Support        | 🔄 In Progress | Minimize to tray with quick actions (like Laragon/XAMPP)                   |
| Auto-Update Support        | 🔄 In Progress | Electron auto-updates via GitHub Releases                                  |
| User-Initiated Bug Reporting | 🔄 In Progress | Simple, secure bug/crash reporting from inside the app                   |
| One-click App Installers   | 📋 Planned  | Install WordPress, Laravel, and more with intuitive UI                      |
| Security Analyzer          | 📋 Planned  | Scan PHP configs and code for common security issues                       |
| Mail Testing Tools         | 📋 Planned  | Built-in Mailhog or similar for catching outgoing emails                   |
| Portable Mode              | 📋 Planned  | Run without installation, keep all settings/logs/projects in app folder    |
| Database Backup/Restore    | 📋 Planned  | Simple UI to export/import MySQL databases                                 |
| MySQL User Management      | 📋 Planned  | UI for creating/editing MySQL users and privileges                         |
| Quick Launch Tools         | 📋 Planned  | One-click open for terminal, copy connection string, etc.                  |
| Full App/Data Backup       | 📋 Planned  | Option to back up all configs, databases, and logs in one click           |
| Virtual Host Management    | 📋 Planned  | Pretty URLs like `myapp.test`                                              |
| HTTPS/SSL Support          | 📋 Planned  | One-click self-signed SSL for local domains and phpMyAdmin                |
| Multilanguage UI           | 📋 Planned  | Internationalization support                                               |
| Project Templates/Cloning  | 📋 Planned  | Clone projects from a git URL or start from template                      |

---

## � Crash & Bug Reporting

DevStackBox uses a **user-initiated, secure crash and bug reporting system**:

- Users can easily report bugs or crashes directly from the app via a "Report a Bug" option.
- This opens a pre-filled [GitHub Issue form](https://github.com/ProgrammerNomad/DevStackBox/issues/new) in the user's browser, including details like error messages, stack traces, and environment info.
- **No GitHub login is required inside the app.**  
  Users submit the report through their browser, using their own GitHub account.
- This approach is fully secure: no authentication tokens or sensitive data are stored or sent by the app.

**Why this approach?**  
It keeps reporting simple, protects user privacy, and leverages GitHub's powerful open source collaboration features.

---

## �🙌 7. Copilot Usage Etiquette

- Use Copilot as a helper, not a replacement for critical thinking
- Review code suggestions carefully
- Comment your code — especially anything auto-generated
- If Copilot gives you something cool, document it or refactor it

---

## 💬 8. Questions?

If you're stuck, open an issue or reach out on discussions tab in the GitHub repo.

Happy coding with Copilot ✨

---

## 📘 9. Project Instructions

This section explains how DevStackBox works internally and how to contribute effectively.

### 🏗️ Project Workflow Overview

1. **Electron App (GUI):**
   - Renders the main window using `index.html`
   - Launches background services using Node.js child processes
   - Allows GUI controls to start/stop Apache, MySQL, PHP versions

2. **Service Layer (`src/services`):**
   - Shell/PowerShell commands to manage Apache, MySQL, PHP
   - Optional: Create a central `ServiceManager` to handle lifecycle

3. **Configuration Handling:**
   - Users can edit PHP, Apache, MySQL config files via GUI
   - GUI provides a simple "Edit Config" button per service

4. **App Installers:**
   - One-click install scripts for WordPress, etc.
   - Auto-download zip, extract to `www/`, configure database

5. **Port Management:**
   - Ports for Apache/MySQL are set via GUI
   - Config files are auto-updated when ports are changed

6. **Multiple PHP Versions:**
   - Support for selecting between PHP 8.1, 8.2 (default), 8.3, and 8.4
   - The selected version is symlinked or used in Apache/PHP CLI config
   - Each version can have independent extension management

7. **Log Management:**
   - Apache: `access.log`, `error.log`, per-vhost logs
   - MySQL: `error.log`, `slow-query.log`, optionally `general.log`
   - PHP: Per-version `php_error.log`
   - phpMyAdmin: Application log (if enabled)
   - DevStackBox: Internal/app logs, installer logs
   - Custom project logs: (e.g., Laravel logs in `storage/logs`)

8. **Security & Monitoring:**
   - Security analyzer for local code/config scans
   - Crash/error reporting system
   - Mail testing utility integration

---

### 📂 Folders You’ll Work With

- `src/` → Logic for starting/stopping services
- `php/` → Place multiple PHP versions here
- `apache/` → Portable Apache setup
- `mysql/` → Portable MySQL (or MariaDB) with default users
- `phpmyadmin/` → Preinstalled phpMyAdmin config
- `apps/` → Installers for popular PHP apps

---

### 🔧 Contributing

- Add features inside `src/services/`
- For GUI changes, edit `index.html` or related JS
- Create pull requests with clear commits and documentation
- Suggest new features or report bugs via GitHub issues

---


---

## 🛠️ 10. Current Development Focus

### 🔌 PHP Extensions Management
- Tailwind-based toggle switches for enabling/disabling extensions
- Responsive grid layout for extension management
- Visual indicators for active/inactive extensions
- Search and filter functionality for finding extensions
- Automatically edits `php.ini` for selected PHP version
- Real-time status updates using Tailwind transitions
- Support for PHP 8.1, 8.2, 8.3, and 8.4

### 🧾 Config Editors
- **PHP Config Editor**
  - Modify `php.ini` in the GUI with Tailwind-based interface
  - Syntax highlighting with Monaco Editor
  - Automatic backup before save
  - Support for multiple PHP versions
- **Apache Config Editor**
  - GUI-based access to `httpd.conf`, `extra/httpd-vhosts.conf`
  - Tailwind UI for intuitive editing experience
  - Change document root, ports, virtual hosts
  - Virtual host management
- **MySQL Config Editor**
  - Edit `my.ini` or `my.cnf` via Tailwind-styled GUI
  - Change ports, buffer sizes, log settings
  - Configuration validation before saving

### 📱 One-Click App Installers (Top 10)
1. **WordPress** - Most popular CMS
2. **Laravel** - Modern PHP framework
3. **CodeIgniter** - Lightweight PHP framework
4. **Drupal** - Enterprise CMS
5. **Joomla** - Content management system
6. **Symfony** - PHP framework components
7. **phpBB** - Forum software
8. **OpenCart** - E-commerce platform
9. **PrestaShop** - E-commerce solution
10. **MediaWiki** - Wiki software

### 📊 Log Management System
- **Apache Logs**: `access.log`, `error.log`, per-vhost logs
- **MySQL Logs**: `error.log`, `slow-query.log`, `general.log`
- **PHP Logs**: Per-version `php_error.log`
- **phpMyAdmin Logs**: Application logs
- **DevStackBox Logs**: Internal app logs, installer logs
- **Project Logs**: Laravel, custom application logs
- Real-time viewing with search/filter functionality

### 🔒 Security & Monitoring Features
- **Security Analyzer**: Scan PHP configs and code for vulnerabilities
- **Crash Reporting**: Error reporting for diagnostics
- **Mail Testing**: Built-in Mailhog integration for email testing
- **Real-time Monitoring**: Live service status updates
- **Auto-Updates**: Electron auto-updater via GitHub Releases

---

## 🎨 11. Working with Tailwind CSS

DevStackBox uses Tailwind CSS exclusively for styling without custom CSS files. When working on UI components:

### 🎨 UI Component Guidelines

- Always use Tailwind utility classes instead of custom CSS
- Follow these component patterns for consistency:

#### Modals
```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
    <!-- Modal header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Modal Title</h2>
      <button class="text-gray-400 hover:text-gray-600">&times;</button>
    </div>
    <!-- Modal body -->
    <div class="px-6 py-4 overflow-y-auto">
      <!-- Content here -->
    </div>
    <!-- Modal footer -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
      <button class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50">
        Cancel
      </button>
      <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700">
        Confirm
      </button>
    </div>
  </div>
</div>
```

#### Forms and Inputs
```html
<div class="space-y-4">
  <div class="form-group">
    <label for="input-id" class="block text-sm font-medium text-gray-700 mb-1">Label</label>
    <input type="text" id="input-id" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
  </div>
  
  <div class="form-group">
    <label for="select-id" class="block text-sm font-medium text-gray-700 mb-1">Select</label>
    <select id="select-id" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
      <option value="">Select an option</option>
    </select>
  </div>
</div>
```

#### Cards
```html
<div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200">
  <div class="flex items-center space-x-3 mb-3">
    <img src="image.svg" alt="Icon" class="w-10 h-10">
    <div>
      <h3 class="text-base font-medium text-gray-900">Card Title</h3>
      <p class="text-sm text-gray-500">Subtitle or description</p>
    </div>
  </div>
  <div class="mt-4">
    <p class="text-sm text-gray-600">Card content goes here...</p>
  </div>
</div>
```

### 🎯 Tailwind Color Scheme

Use these color variables consistently:

- Primary: Blue (`bg-primary`, `text-primary`, etc.) - For main actions
- Secondary: Gray (`bg-secondary`, `text-gray-600`) - For secondary actions
- Success: Green (`bg-success`, `text-green-600`) - For success states
- Danger: Red (`bg-danger`, `text-red-600`) - For errors or destructive actions
- Warning: Yellow (`bg-yellow-500`, `text-yellow-600`) - For warnings

### 📱 Responsive Design

Always design for mobile-first, then scale up:

```html
<!-- Mobile: Full width, Desktop: Half width -->
<div class="w-full md:w-1/2">
  <!-- Content -->
</div>

<!-- Mobile: Stack, Desktop: Side by side -->
<div class="flex flex-col md:flex-row">
  <!-- Content -->
</div>
```

### 🌓 Dark Mode Support

When adding dark mode, use the `dark:` variant:

```html
<div class="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
  <!-- Content that works in both light and dark modes -->
</div>
```

---

## 12. Recent Progress and Priorities

### ✅ Completed
- Electron application framework
- Modern GUI interface with Tailwind CSS
- MySQL service controls with logical button states
- Config editors framework
- phpMyAdmin integration

### 🔄 In Progress
- Enhanced error handling and notifications (modals/banners)
- Real-time MySQL service status monitoring
- Log viewers with real-time updates, tabs, and search/filter
- System tray integration (Electron Tray API)
- Auto-update support using electron-updater and GitHub Releases
- User-initiated crash and bug reporting to GitHub Issues
- Security analyzer tools
- Mail testing integration (Mailhog or similar)
- Real-time service status monitoring
- Log viewer implementation with search/filter
- System tray integration
- Auto-update support using electron-updater and GitHub Releases
- User-initiated crash and bug reporting to GitHub Issues

### 📅 Next Up
- Apache HTTP Server integration
- Multiple PHP versions & extensions management  
- Automatic virtual host management
- HTTPS/SSL for local sites & phpMyAdmin
- One-click app installers implementation
- Portable mode / zero installation
- Database backup/restore (one-click)
- MySQL user management
- Quick launch tools
- Full app/data backup/restore
- Multilanguage UI
- Project templates & cloning

---

## 13. Implementation Breakdown & Tasks

### 🎯 Priority 1: Core Service Management
**Goal**: Robust service lifecycle management with real-time status

#### Tasks:
1. **Real-time Status Monitoring**
   - Implement WebSocket/IPC for live status updates
   - Add service health checks (every 5-10 seconds)
   - Visual status indicators (running/stopped/error states)

2. **Enhanced Service Controls**
   - Graceful service shutdown with timeout handling
   - Service restart functionality
   - Auto-restart on crash detection

3. **Error Handling & Recovery**
   - Comprehensive error logging and user notifications
   - Automatic service recovery mechanisms
   - Port conflict detection and resolution

### 🎯 Priority 2: Configuration Management
**Goal**: User-friendly config editing with backup/restore

#### Tasks:
1. **Config Editor UI (Tailwind)**
   - Monaco Editor integration for syntax highlighting
   - Real-time validation of configuration syntax
   - Side-by-side diff view for changes

2. **Backup & Restore System**
   - Automatic backups before any config changes
   - Timestamp-based backup naming
   - One-click restore from backup list

3. **Configuration Templates**
   - Pre-configured templates for common setups
   - Virtual host templates for different frameworks
   - PHP configuration presets for development/production

### 🎯 Priority 3: PHP Multi-Version Support
**Goal**: Seamless switching between PHP versions

#### Tasks:
1. **PHP Version Manager**
   - Download and install PHP versions (8.1, 8.2, 8.3, 8.4)
   - Symlink management for active PHP version
   - Apache module configuration updates

2. **PHP Extensions Management**
   - Per-version extension enable/disable UI
   - Extension availability checker
   - Automatic php.ini updates

3. **CLI Integration**
   - Command-line PHP version switching
   - Composer integration with correct PHP version
   - Path environment management

### 🎯 Priority 4: Application Installers
**Goal**: One-click installation of popular PHP applications

#### Tasks:
1. **Installer Framework**
   - Download progress tracking with UI feedback
   - Zip extraction with error handling
   - Database setup automation

2. **Top 10 App Support**
   - WordPress: Auto-download, wp-config setup, database creation
   - Laravel: Composer installation, .env configuration
   - Drupal: Installation profile selection, database setup
   - [Continue for all 10 applications]

3. **Post-Installation Setup**
   - Virtual host creation for new apps
   - SSL certificate generation (optional)
   - Basic security configuration

### 🎯 Priority 5: Log Management System
**Goal**: Comprehensive log viewing and analysis

#### Tasks:
1. **Log Viewer UI**
   - Tabbed interface for different log types
   - Real-time log streaming with auto-scroll
   - Search and filter functionality

2. **Log Analysis Features**
   - Error pattern detection and highlighting
   - Log rotation management
   - Export functionality (CSV, JSON)

3. **Alert System**
   - Critical error notifications
   - Disk space warnings for log files
   - Configurable alert thresholds

### 🎯 Priority 6: Advanced Features
**Goal**: Professional development environment features

#### Tasks:
1. **System Tray Integration**
   - Minimize to tray functionality
   - Quick actions menu (start/stop services)
   - Service status indicators in tray

2. **Security Tools**
   - PHP configuration security scanner
   - File permission checker
   - Vulnerability database integration

3. **Mail Testing**
   - Mailhog integration or similar
   - Email capture and viewing interface
   - SMTP testing tools

### 🎯 Priority 7: Quality & Maintenance
**Goal**: Reliable and maintainable application

#### Tasks:
1. **Auto-Update System**
   - Electron auto-updater implementation
   - Update notification system
   - Rollback mechanism for failed updates

2. **Crash Reporting**
   - Error tracking integration (Sentry or similar)
   - Automatic crash report submission
   - User feedback collection

3. **Testing & Documentation**
   - Unit tests for core functionality
   - Integration tests for service management
   - User guide and troubleshooting docs

---

## 14. Development Guidelines

### 🧹 Code Quality Standards
- Use ESLint and Prettier for consistent formatting
- Comment complex logic, especially service management
- Follow semantic versioning for releases
- Write descriptive commit messages

### 🔧 Architecture Principles
- Keep UI and business logic separated
- Use IPC for all main process communication
- Implement graceful error handling everywhere
- Design for cross-platform compatibility

### 🎨 UI/UX Guidelines
- Mobile-first responsive design with Tailwind
- Consistent color scheme and typography
- Loading states for all async operations
- Intuitive navigation and clear labeling

### 🔒 Security Considerations
- Validate all user inputs in config editors
- Secure file path handling to prevent directory traversal
- Sanitize commands before shell execution
- Regular security audits of dependencies

---

## 📞 Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ProgrammerNomad/DevStackBox/discussions)
- 📧 Email: [shiv@srapsware.com](mailto:shiv@srapsware.com)

**DevStackBox** – Making local PHP development simple, modern, and portable! 🚀

---
