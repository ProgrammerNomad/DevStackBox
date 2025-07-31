
# 🧠 GitHub Copilot Guide for DevStackBox

Welcome to the **DevStackBox** contributor guide!  
This file will help you get started with **GitHub Copilot** in **Visual Studio Code** so you can develop and contribute faster.

---

## 🚀 1. Prerequisites

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

### ➤ Electron GUI (`main.js`)
Start typing:
```js
const { app, BrowserWindow } = require('electron');
// Create the main window...
```
Copilot will auto-generate the window boilerplate.

### ➤ Backend Services (`src/services`)
For example:
```js
const { exec } = require('child_process');

// Function to start Apache server...
```
Copilot will suggest a function to launch Apache using CLI commands.

### ➤ App Installers (`apps`)
In WordPress installer:
```js
// Script to download and extract WordPress...
```
Copilot can help you automate downloading and unzipping.

### ➤ Documentation (`README.md`, etc.)
Start typing:
```md
# DevStackBox

DevStackBox is an open-source local dev environment for PHP...
```
Copilot will suggest full doc templates and usage sections.

---

## ⚙️ 5. Project Structure (for Copilot context)

```
DevStackBox/
├── src/             # Node.js logic (services, config)
├── apache/          # Apache portable setup
├── mysql/           # MySQL portable setup
├── php/             # Multiple PHP versions
├── phpmyadmin/      # phpMyAdmin setup
├── apps/            # One-click WordPress or other installers
├── main.js          # Electron main process
├── preload.js       # Electron bridge
├── index.html       # GUI window
├── package.json
├── LICENSE
└── README.md
```

---

## 🔧 6. Planned Features

| Feature                    | Description                                                                 |
|----------------------------|-----------------------------------------------------------------------------|
| Apache Control             | Start/Stop Apache via Electron GUI                                         |
| MySQL Integration          | Portable MySQL server with port selector                                   |
| Multi PHP Version Support | Switch between PHP versions easily                                         |
| phpMyAdmin                 | Built-in GUI for MySQL management                                          |
| One-click App Installers   | e.g., WordPress installer from GUI                                         |
| Environment Configuration  | Easy access to config files like `php.ini`, `my.ini`                      |
| Logs Viewer                | View Apache/MySQL logs in the interface                                    |
| Port Changer               | GUI support to change Apache and MySQL ports                              |
| System Tray Support        | Minimize to tray like Laragon and XAMPP                                              |
| Open Source and Lightweight| Designed to be minimal yet extendable                                     |

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

## 🛠️ 9. Extended Feature Support (Planned and In Progress)

### 🔌 PHP Extensions Management
- Enable/disable extensions from the GUI
- Automatically edits `php.ini` for selected PHP version
- Visual toggle interface with descriptions for each extension

### 🧾 Config Editors
- **PHP Config Editor**
  - Modify `php.ini` in the GUI
  - Highlight syntax and backup before save
- **Apache Config Editor**
  - GUI-based access to `httpd.conf`, `extra/httpd-vhosts.conf`
  - Change document root, ports, virtual hosts
- **MySQL Config Editor**
  - Edit `my.ini` or `my.cnf` via GUI
  - Change ports, buffer sizes, log settings

### 🧰 Additional Tools
- Syntax highlighting config editors (via Monaco Editor or CodeMirror)
- Backup and restore configuration files
- Test configuration changes without restarting entire stack

---
