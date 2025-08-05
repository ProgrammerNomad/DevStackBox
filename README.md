# DevStackBox (Tauri Edition)

A lightweight, portable, open-source local development environment for PHP developers — now powered by [Tauri](https://tauri.app/) and a modern UI stack: **Vite + React + Tailwind CSS + shadcn/ui + Framer Motion**.

**Author:** Nomad Programmer  
**Contact:** shiv@srapsware.com  
**Repository:** [ProgrammerNomad/DevStackBox on GitHub](https://github.com/ProgrammerNomad/DevStackBox)  
**Issues & Documentation:** All documentation and issue tracking are managed through [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues) and [GitHub Wiki](https://github.com/ProgrammerNomad/DevStackBox/wiki) (if available).

---

## 🚀 Overview

**DevStackBox** is a modern, portable tool for local PHP development. With pre-bundled MySQL, PHP 8.2 (default), Apache (planned), phpMyAdmin, a beautiful GUI, and deep configurability — all in an ultra-lightweight app built on Tauri.

- **Super lightweight:** Tauri apps are typically 5–30MB (excluding server binaries)
- **Cross-platform:** Windows, macOS, and Linux
- **Modern UI:** Built with Vite, React, Tailwind CSS, shadcn/ui, and Framer Motion
- **Preinstalled dev stack:** MySQL, PHP 8.2, phpMyAdmin, and more
- **Zero-install portable mode:** All data and settings in the app folder
- **Auto-update:** App is auto-updated via GitHub Releases

---

## 🗂 Feature Summary Table

| Category             | Feature                                         | Status        | Description                                               |
|----------------------|-------------------------------------------------|--------------|-----------------------------------------------------------|
| **Core Services**    | MySQL Database                                  | ✅ Available  | Embedded MySQL server with GUI management                 |
|                      | phpMyAdmin Integration                          | ✅ Available  | Built-in database management interface                    |
|                      | Apache HTTP Server                              | 🕓 Planned    | Portable Apache, vhost & HTTPS management                 |
|                      | Multiple PHP Versions                           | 🕓 Planned    | Additional PHP versions downloadable via installer        |
| **Project & Apps**   | One-Click App Installers                        | 🕓 Planned    | Install WordPress, Laravel, more with simple UI           |
|                      | Project Templates/Cloning                       | 🕓 Planned    | Clone or template new projects                            |
| **Configuration**    | Config Management (Backup/Restore, Highlight)   | ✅ Available  | Syntax-highlighting and backup/restore for config files   |
|                      | PHP INI & Apache Config Editors                 | 🕓 Planned    | User-friendly config editors                              |
|                      | PHP Extensions Management                       | 🕓 Planned    | Enable/disable extensions per PHP version                 |
|                      | Portable Mode / Zero Installation               | 🕓 Planned    | All data/settings/logs in app folder                      |
| **Developer Tools**  | Integrated Terminal (Portable CLI)              | 🕓 Planned    | Built-in terminal, PHP version selector                   |
|                      | Composer Integration                            | 🕓 Planned    | Global/per-project Composer support                       |
|                      | Bundled Tools (curl, git, node, npm, etc.)      | 🕓 Planned    | Optionally bundle common CLI tools                        |
|                      | Security Analyzer                               | 🕓 Planned    | Scan PHP configs/code for security issues                 |
|                      | Mail Testing Tools                              | 🕓 Planned    | Built-in Mailhog or similar for email capture             |
| **User Experience**  | Modern Tailwind CSS UI                          | ✅ Available  | Responsive, utility-first design, shadcn/ui components    |
|                      | Logs Viewer (real-time, filter/search)          | 🔄 In Progress| View MySQL, phpMyAdmin, Apache, PHP, app logs             |
|                      | System Tray Integration                         | 🔄 In Progress| Minimize to tray, quick actions                           |
|                      | Service Status & Tray Notifications             | 🕓 Planned    | Tray notifications for service events                     |
|                      | Multilanguage UI                                | ✅ Available  | i18next-based internationalization (EN, HI, etc.)         |
|                      | Dark/Light Mode                                 | ✅ Available  | Easy theming with Tailwind and shadcn/ui                  |
|                      | Animations                                      | ✅ Available  | Smooth transitions with Framer Motion                     |
| **Backup & Restore** | Database Backup/Restore                         | 🕓 Planned    | One-click database export/import                          |
|                      | Full App/Data Backup/Restore                    | 🕓 Planned    | Backup/restore all configs, logs, and databases           |
| **User/Security**    | MySQL User Management                           | 🕓 Planned    | Manage MySQL users/privileges via UI                      |
|                      | HTTPS/SSL for Local Sites                       | 🕓 Planned    | One-click SSL for local domains and phpMyAdmin            |
| **Support**          | Crash & Bug Reporting via GitHub                | 🔄 In Progress| Report issues from inside the app                         |
|                      | Auto-Update Support                             | 🔄 In Progress| Tauri auto-updates via GitHub Releases                    |

**Legend:**  
✅ Available  🔄 In Progress  🕓 Planned

---

## 🏗 Project Structure

```plaintext
DevStackBox/
├── src-tauri/         # Tauri (Rust) backend for process mgmt, IPC, native ops
├── src/               # Frontend (Vite + React + Tailwind + shadcn/ui + Framer Motion)
├── mysql/             # Portable MySQL setup
├── php/               # PHP 8.2 binaries (default)
├── apache/            # Apache portable setup (planned)
├── phpmyadmin/        # phpMyAdmin setup
├── apps/              # One-click app installers (planned)
├── config/            # Config files (php.ini, my.cnf, httpd.conf, etc.)
├── config-backups/    # Config backup files
├── logs/              # Log files (Apache, MySQL, PHP, etc.)
├── www/               # Web root directory (planned)
├── locales/           # Translation files (EN, HI, etc.)
└── package.json       # Project config (frontend)
```

---

## 🚦 Prerequisites

- Windows 10/11, macOS, or Linux
- [Node.js 18+](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri backend)
- [Git](https://git-scm.com/)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/)

---

## 🛠 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ProgrammerNomad/DevStackBox.git
   cd DevStackBox
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Install Tauri CLI:**
   ```bash
   cargo install tauri-cli
   ```

4. **Run the development app:**
   ```bash
   pnpm tauri dev
   # or
   npm run tauri dev
   ```

---

## 🎨 UI Technologies

- **Frontend:** [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Styling:** Tailwind CSS for utility-first, modern design with shadcn/ui components
- **i18n:** i18next for multilanguage support (EN, HI, etc.)
- **Animation:** Framer Motion for smooth UI/UX transitions
- **Dark/Light Mode:** Fully supported everywhere via shadcn/ui and Tailwind

---

## 🧩 Architecture

### Tauri Backend (`src-tauri/`)
- Written in Rust
- Launches & manages MySQL, PHP, Apache processes
- Handles config edits, file I/O, and system integration (tray, notifications)
- Exposes secure API to the frontend via Tauri IPC

### Frontend (`src/`)
- Vite + React + Tailwind CSS + shadcn/ui + Framer Motion
- Controls services, config editors, logs, backups, and UI state
- Talks to backend via Tauri commands/events

---

## 🖥️ Portable CLI Terminal

- **Integrated Terminal:** Embedded xterm.js terminal using Tauri’s process management
- **PHP Version Selector:** (Planned) Change PHP version per session (other versions downloadable)
- **Composer & MySQL CLI:** Available in the app terminal
- **Bundled Tools:** Optionally ship with curl, git, node, npm, etc.

---

## 🔄 Auto-Update Support

- **Distribution:** Releases and auto-updates are managed via [GitHub Releases](https://github.com/ProgrammerNomad/DevStackBox/releases).
- **Update:** App will auto-update itself from GitHub (using Tauri's built-in updater).

---

## 🗃️ Backup & Restore

- **Config Backup/Restore:** Automatic and manual backups for all configs
- **Database Backup/Restore:** One-click export/import for MySQL databases
- **Full App Backup/Restore:** Backup/restore all critical files and databases

---

## 🗂 Log Viewer

- Real-time, searchable log viewer for MySQL, Apache, PHP, phpMyAdmin, and app logs

---

## 🛡️ Security

- **User-initiated bug/crash reporting:** Pre-filled GitHub issues from the app
- **Security analyzer:** (Planned) Scan configs and code for common issues
- **HTTPS/SSL:** One-click SSL for local projects (planned)
- **MySQL user management:** GUI for users/privileges

---

## 🤝 Contributing

1. Fork this repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License – see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- Inspired by Laragon, XAMPP, and the open-source community
- Built with [Tauri](https://tauri.app/), [Vite](https://vitejs.dev/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), and [Framer Motion](https://www.framer.com/motion/)

---

**DevStackBox** – The next generation portable PHP dev stack! 🚀

<sup>Author: Nomad Programmer • Email: shiv@srapsware.com • [Project on GitHub](https://github.com/ProgrammerNomad/DevStackBox)</sup>