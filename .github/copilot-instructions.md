# 🤖 GitHub Copilot Contributor Guide for DevStackBox

Welcome to the **DevStackBox** contributor and Copilot guide!  
This file will help you develop for the modern **Tauri + Vite + React + Tailwind CSS + shadcn/ui + Framer Motion** stack, and use GitHub Copilot in **Visual Studio Code** for efficient, maintainable development.

**Author:** Nomad Programmer  
**Contact:** shiv@srapsware.com  
**Repository:** [ProgrammerNomad/DevStackBox](https://github.com/ProgrammerNomad/DevStackBox)  
**Documentation & Issues:** [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues) and [GitHub Wiki](https://github.com/ProgrammerNomad/DevStackBox/wiki)  
**Auto-updates:** Managed via GitHub Releases with Tauri’s updater.

---

## 🚀 Overview

DevStackBox is a lightweight, portable, open-source local development environment for PHP developers.  
It is built with Tauri for a smaller, faster, and more native experience, using a modern, maintainable frontend stack.  
All documentation, project management, and bug reporting are via GitHub.

**Key stack points:**
- All backend/service management runs in Rust via Tauri.
- The frontend is a Vite-powered React app, styled with Tailwind CSS and shadcn/ui, using Framer Motion for animations.
- No custom CSS unless absolutely necessary; dark/light mode is required everywhere.

---

## 🛠️ 1. Development Environment & Prerequisites

- **Primary OS:** Windows 11 (development and primary testing)
- **Editor:** Visual Studio Code (with Copilot extension)
- **Frontend:** Vite + React + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Tauri (Rust)
- **No custom CSS:** Use only Tailwind and shadcn/ui, document any CSS exceptions.
- **Dark/Light Mode:** All UI must fully support both (Tailwind/shadcn/ui patterns).
- **Auto-update:** App is auto-updated from GitHub Releases.

**Install:**
```bash
git clone https://github.com/ProgrammerNomad/DevStackBox.git
cd DevStackBox
pnpm install  # or npm/yarn
cargo install tauri-cli
pnpm tauri dev  # or npm run tauri dev
```

---

## 📂 2. Project Structure

```
DevStackBox/
├── src-tauri/         # Rust backend (service mgmt, config, IPC, updater)
├── src/               # Frontend: Vite + React + Tailwind + shadcn/ui + Framer Motion
├── mysql/             # Portable MySQL setup
├── php/               # PHP 8.2 binaries (default)
├── apache/            # Apache setup (planned)
├── phpmyadmin/        # phpMyAdmin
├── apps/              # One-click app installers (planned)
├── config/            # Config files (php.ini, my.cnf, httpd.conf, etc.)
├── config-backups/    # Config backups
├── logs/              # Service/app logs
├── www/               # Web root (planned)
├── locales/           # i18next translations (EN, HI)
└── package.json
```

---

## 🗂️ 3. Full Feature/Status Table

| Feature                                      | Status        | Description                                                      |
|-----------------------------------------------|--------------|------------------------------------------------------------------|
| MySQL Database                               | ✅ Available  | Embedded MySQL with GUI control                                  |
| phpMyAdmin Integration                        | ✅ Available  | Built-in database management                                     |
| Modern Tailwind/shadcn/ui/Framer UI           | ✅ Available  | Responsive, animated, utility-first UI                           |
| Config Management (Backup/Restore)            | ✅ Available  | Syntax highlighting, backup/restore                              |
| Multilanguage UI (i18next, EN/HI)             | ✅ Available  | English & Hindi, Unicode correct                                 |
| Crash & Bug Reporting via GitHub              | 🔄 In Progress| Report bugs/crashes via GitHub Issues                            |
| Logs Viewer                                   | 🔄 In Progress| Real-time log viewing with filter/search                         |
| System Tray Integration                       | 🔄 In Progress| Minimize to tray/quick actions                                   |
| Auto-Update                                   | 🔄 In Progress| Via GitHub Releases                                              |
| Apache HTTP Server                            | 🕓 Planned    | Portable Apache, vhost & HTTPS                                   |
| Multiple PHP Versions                         | 🕓 Planned    | Download via in-app installer                                    |
| One-Click App Installers                      | 🕓 Planned    | WordPress, Laravel, etc.                                         |
| PHP Extensions Management                     | 🕓 Planned    | Enable/disable per version                                       |
| Security Analyzer                             | 🕓 Planned    | Scan configs/code for issues                                     |
| Mail Testing Tools                            | 🕓 Planned    | Mailhog, etc.                                                    |
| Portable Mode                                 | 🕓 Planned    | All data in app folder                                           |
| Database/User Management                      | 🕓 Planned    | Manage users, backup/restore, SSL                                |
| Database Backup/Restore (One-Click)           | 🕓 Planned    | UI to export/import MySQL databases                              |
| Quick Launch Tools                            | 🕓 Planned    | Terminal (PHP/MySQL CLI), copy connection string, etc.           |
| Full App/Data Backup/Restore                  | 🕓 Planned    | Backup configs, databases, logs in one click                     |
| Automatic Virtual Host Management             | 🕓 Planned    | Pretty URLs like `myapp.test`                                    |
| HTTPS/SSL for Local Sites                     | 🕓 Planned    | One-click SSL for local domains and phpMyAdmin                   |
| Project Templates/Cloning                     | 🕓 Planned    | Clone from Git or use templates for new projects                 |
| Composer Integration                          | 🕓 Planned    | Global/per-project Composer support                              |
| PHP INI & Apache Config Editors               | 🕓 Planned    | User-friendly config editing                                     |
| PHP Error Display Toggle                      | 🕓 Planned    | Enable/disable display_errors from UI                            |
| Service Status & Tray Notifications           | 🕓 Planned    | Tray notifications for service events                            |
| Portable PHP CLI                              | 🕓 Planned    | Terminal with PHP version selector                               |
| Bundled Tools (curl, git, node, npm, etc.)    | 🕓 Planned    | Optionally bundle common CLI tools                               |
| Log Viewer Enhancements                       | 🕓 Planned    | Real-time, filterable, tabbed log viewer for all services/apps   |
| Project Full Backup/Restore                   | 🕓 Planned    | Backup/restore www files, configs, databases                     |

**Legend:**  
✅ Available  🔄 In Progress  🕓 Planned

---

## 🧑‍💻 4. Copilot Usage & Prompt Patterns

- **Backend (Rust, src-tauri):**  
  _"Write a Tauri command to start MySQL and return its status to the frontend."_  
  _"Add a Tauri command to download additional PHP binaries via an in-app installer."_

- **Frontend (React, src/):**  
  _"Create a MySQL control panel using shadcn/ui, Tailwind, Framer Motion; support dark/light mode."_  
  _"Add a modal for backup/restore using shadcn/ui and Tailwind."_  
  _"Implement a language switcher with i18next and Unicode support for Hindi."_

- **Config & Logs:**  
  _"Show a real-time logs viewer with tabs for MySQL, Apache, PHP logs using Tailwind and xterm.js."_  
  _"Add config editor with Monaco and backup/restore UI using shadcn/ui."_

- **General:**  
  _"All UI must support dark/light mode and be styled only with Tailwind/shadcn/ui."_

---

## 📦 5. Binary Management

- **Default PHP:** Only **PHP 8.2** is bundled by default.
- **Other Binaries:** Downloadable on demand via the in-app distribution installer—do not bundle extra binaries by default.

---

## 💡 6. Detailed Copilot Examples

- _"Add a config editor with Monaco and backup/restore, styled with Tailwind and shadcn/ui, supporting dark/light mode."_
- _"Implement a logs viewer in React using xterm.js, with tabs for each service, filter and search, and animated transitions with Framer Motion."_
- _"Write a Tauri command in Rust to download and extract a PHP version into the php/ directory and notify the frontend on completion."_
- _"Create a modal with shadcn/ui for reporting bugs, which opens a GitHub Issue link with prefilled content."_
- _"Implement a multilanguage language switcher with i18next and Unicode support for Hindi, styled for header consistency."_

---

## 🌐 7. Multilanguage & Unicode

- Use i18next for all user-facing text (English & Hindi)
- Use Tailwind and system fonts for perfect Unicode/Devanagari rendering
- Language switcher must use Unicode names ("English", "हिन्दी") and consistent header styling

---

## 🎨 8. UI/UX & Styling Guidelines

- All UI styled only with Tailwind and shadcn/ui; do not use custom CSS unless essential and well-documented.
- All components must support both **dark and light mode** via Tailwind/shadcn/ui.
- Animations and transitions must use Framer Motion (not CSS keyframes or raw JS).
- Responsive, accessible, and visually consistent.
- Use shadcn/ui dialogs, modals, menus everywhere possible.

---

## 🖥️ 9. Modern Menu & Navigation Patterns

**DevStackBox uses a combination of modern, desktop-inspired navigation patterns for clarity and usability:**

- **Sidebar Navigation (Primary):**  
  Use shadcn/ui's `NavigationMenu` or a custom sidebar for main sections (Dashboard, Projects, Services, Logs, Settings, About).  
  - Supports icons, labels, section grouping, and collapsible "rail" mode.  
  - **Copilot prompt:**  
    _"Create a sidebar menu with shadcn/ui and Tailwind, supporting dark/light mode and collapsible icons."_

- **Top Bar (Secondary):**  
  Place global actions (theme switcher, language selector, user menu, updates) in a sticky top bar above or beside the sidebar.  
  - **Copilot prompt:**  
    _"Implement a top bar with theme and language switchers, using shadcn/ui and Tailwind."_

- **Tabs (Sub-navigation):**  
  Use shadcn/ui's `Tabs` for sub-sections within a page (e.g., "Overview | Logs | Settings" for a given service).  
  - **Copilot prompt:**  
    _"Add tabs for logs and settings in a service detail view, using shadcn/ui Tabs."_

- **Context Menus:**  
  Use shadcn/ui's `ContextMenu` for right-click/“more” actions on project, database, or service items.  
  - **Copilot prompt:**  
    _"Add a context menu for each database row with edit/delete options using shadcn/ui."_

- **Command Palette:**  
  Add a command palette (Ctrl+P/Cmd+P) with shadcn/ui's `Command` for fast search, navigation, and command execution (power user feature).  
  - **Copilot prompt:**  
    _"Create a command palette using shadcn/ui Command for quick actions and navigation."_

- **Floating Action Buttons:**  
  For quick “add” actions (e.g., new project/database), use floating shadcn/ui `Button` with fixed positioning (optional, desktop only).

**Guidelines:**  
- All navigation must be accessible (keyboard, screen readers).
- Sidebar and command palette are primary navigation for all major DevStackBox features.
- Always use Tailwind and shadcn/ui components for styling and transitions (no custom CSS unless needed).

---

## 📦 10. Auto-Update & Issue Tracking

- Releases and all auto-updates are via [GitHub Releases](https://github.com/ProgrammerNomad/DevStackBox/releases).
- All bug/crash reporting and documentation is managed via [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues) and [Wiki](https://github.com/ProgrammerNomad/DevStackBox/wiki).

---

## 🤝 11. Contributing

- Fork, branch, code, and PR as usual.
- Use Copilot for both Rust (backend) and React (frontend) code.
- Comment/refactor Copilot suggestions as needed.
- Keep code linted, typed, and documented.
- Test on all platforms (Windows 11 is primary).
- Contact: shiv@srapsware.com

---

**Let’s build the most modern, beautiful, and lightweight PHP dev stack together!**

<sup>Author: Nomad Programmer • Email: shiv@srapsware.com • [Project on GitHub](https://github.com/ProgrammerNomad/DevStackBox)</sup>