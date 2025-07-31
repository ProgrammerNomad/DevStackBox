
# 🧠 GitHub Copilot Guide for DevStackBox

Welcome to the **DevStackBox** contributor guide!  
This file will help you get started with **GitHub Copilot** in **Visual Studio Code** so you can develop and contribute faster.

---

## ## 🎨 10. Working with Tailwind CSS 1. Prerequisites

Before using Copilot effectively with this project, ensure you have:

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
npm run start
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
| Apache Control             | ✅ Done     | Start/Stop Apache via Electron GUI with logical button states               |
| MySQL Integration          | ✅ Done     | Start/Stop MySQL server with logical button states                          |
| Multi PHP Version Support  | 🔄 Partial  | Switch between PHP versions via dropdown interface                          |
| phpMyAdmin                 | 🔄 Partial  | Access to MySQL management interface                                        |
| One-click App Installers   | 🔄 Partial  | Front-end framework for app installers completed                            |
| Environment Configuration  | 🔄 Partial  | Initial config framework implemented; modals in progress                    |
| PHP Extensions Management  | 🔄 WIP      | Tailwind-based UI for enabling/disabling PHP extensions                     |
| Logs Viewer                | 📋 Planned  | View Apache/MySQL logs in the interface                                     |
| Port Changer               | 📋 Planned  | GUI support to change Apache and MySQL ports                                |
| System Tray Support        | 📋 Planned  | Minimize to tray like Laragon and XAMPP                                     |
| Tailwind UI                | ✅ Done     | All UI components use Tailwind CSS (no custom CSS)                          |
| Service Button Logic       | ✅ Done     | Start/Stop buttons correctly disabled based on service state                |

---

## 🙌 7. Copilot Usage Etiquette

- Use Copilot as a helper, not a replacement for critical thinking
- Review code suggestions carefully
- Comment your code — especially anything auto-generated
- If Copilot gives you something cool, document it or refactor it

---

## 💬 Questions?

If you're stuck, open an issue or reach out on discussions tab in the GitHub repo.

Happy coding with Copilot ✨

---

## 📘 8. Project Instructions

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
   - Support for selecting between PHP 7.x, 8.x+
   - The selected version is symlinked or used in Apache/PHP CLI config

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

## 🛠️ 9. Current Development Focus

### 🔌 PHP Extensions Management
- Tailwind-based toggle switches for enabling/disabling extensions
- Responsive grid layout for extension management
- Visual indicators for active/inactive extensions
- Search and filter functionality for finding extensions
- Automatically edits `php.ini` for selected PHP version
- Real-time status updates using Tailwind transitions

### 🧾 Config Editors
- **PHP Config Editor**
  - Modify `php.ini` in the GUI with Tailwind-based interface
  - Syntax highlighting with Monaco Editor
  - Automatic backup before save
- **Apache Config Editor**
  - GUI-based access to `httpd.conf`, `extra/httpd-vhosts.conf`
  - Tailwind UI for intuitive editing experience
  - Change document root, ports, virtual hosts
- **MySQL Config Editor**
  - Edit `my.ini` or `my.cnf` via Tailwind-styled GUI
  - Change ports, buffer sizes, log settings
  - Configuration validation before saving

---

## � 10. Working with Tailwind CSS

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

## 11. Recent Progress and Priorities

### ✅ Completed
- Logical start/stop button states for Apache and MySQL services
- Basic UI framework for all main components
- Responsive layout with Tailwind CSS

### 🔄 In Progress
- Converting configuration modals to pure Tailwind (no custom CSS)
- PHP Extensions management UI with toggle switches
- Config editors for Apache, MySQL, and PHP with syntax highlighting

### 📅 Next Up
- Real-time service status updates
- Log viewer implementation
- System tray integration
- Virtual hosts management

---
