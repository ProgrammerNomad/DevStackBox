# 🤖 GitHub Copilot Contributor Guide for DevStackBox (from Electron to Tauri)

Welcome to the **DevStackBox** contributor and Copilot guide!  
This file will help you transition from the Electron architecture to the new **Tauri + Vite + React + Tailwind CSS + shadcn/ui + Framer Motion** stack, and use GitHub Copilot in **Visual Studio Code** for efficient, maintainable development.

**Author:** Nomad Programmer  
**Contact:** shiv@srapsware.com  
**Repository:** [ProgrammerNomad/DevStackBox](https://github.com/ProgrammerNomad/DevStackBox)  
**Documentation & Issues:** [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues) and [GitHub Wiki](https://github.com/ProgrammerNomad/DevStackBox/wiki)  
**Auto-updates:** Managed via GitHub Releases with Tauri’s updater.

---

## 🚀 Introduction & Transition Overview

DevStackBox started as an Electron-based PHP dev environment and is now being rebuilt with Tauri for a smaller, faster, and more native experience.  
This guide is for contributors who are familiar with the Electron (Node.js) approach and want to adapt to the new Tauri (Rust backend + modern React frontend) architecture.

**Key differences:**
- All backend/service management now runs in Rust via Tauri, not Node.js.
- The frontend is a Vite-powered React app, styled with Tailwind CSS and shadcn/ui, using Framer Motion for animations.
- No custom CSS unless absolutely necessary; dark/light mode is required everywhere.
- All documentation, project management, and bug reporting are via GitHub.

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

## 🧑‍💻 3. Copilot Usage & Prompt Patterns

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

## 📦 4. Binary Management

- **Default PHP:** Only **PHP 8.2** is bundled by default.
- **Other Binaries:** Downloadable on demand via the in-app distribution installer—do not bundle extra binaries by default.

---

## 🗃️ 5. Feature/Status Table

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

## 📦 9. Auto-Update & Issue Tracking

- Releases and all auto-updates are via [GitHub Releases](https://github.com/ProgrammerNomad/DevStackBox/releases).
- All bug/crash reporting and documentation is managed via [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues) and [Wiki](https://github.com/ProgrammerNomad/DevStackBox/wiki).

---

## 🤝 10. Contributing

- Fork, branch, code, and PR as usual.
- Use Copilot for both Rust (backend) and React (frontend) code.
- Comment/refactor Copilot suggestions as needed.
- Keep code linted, typed, and documented.
- Test on all platforms (Windows 11 is primary).
- Contact: shiv@srapsware.com

---

**Let’s build the most modern, beautiful, and lightweight PHP dev stack together!**

<sup>Author: Nomad Programmer • Email: shiv@srapsware.com • [Project on GitHub](https://github.com/ProgrammerNomad/DevStackBox)</sup>