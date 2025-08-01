# DevStackBox

A lightweight, portable, open-source local development environment for PHP developers

---

## 🗂 Feature Summary Table

| Feature                                      | Status        | Description                                                        |
|-----------------------------------------------|--------------|--------------------------------------------------------------------|
| **MySQL Database**                           | ✅ Available  | Embedded MySQL server with GUI management                          |
| **phpMyAdmin Integration**                    | ✅ Available  | Built-in database management interface                             |
| **Modern Tailwind CSS UI**                    | ✅ Available  | Responsive, utility-first design                                   |
| **Config Management (Backup/Restore)**        | ✅ Available  | Syntax-highlighting and backup/restore for config files            |
| **Crash & Bug Reporting via GitHub**          | 🔄 In Progress| User-initiated crash/bug reports with pre-filled GitHub Issues     |
| **Logs Viewer**                               | 🔄 In Progress| View MySQL, phpMyAdmin, and app logs; search/filter/real-time      |
| **System Tray Integration**                   | 🔄 In Progress| Minimize to tray, quick actions                                    |
| **Auto-Update Support**                       | 🔄 In Progress| Electron auto-updates via GitHub Releases                          |
| **Apache HTTP Server**                        | 🕓 Planned    | Portable Apache, vhost & HTTPS management                          |
| **Multiple PHP Versions**                     | 🕓 Planned    | Switch between PHP 8.1, 8.2, 8.3, 8.4                              |
| **One-Click App Installers**                  | 🕓 Planned    | Install WordPress, Laravel, more with simple UI                    |
| **PHP Extensions Management**                 | 🕓 Planned    | Enable/disable extensions per PHP version                          |
| **Security Analyzer**                         | 🕓 Planned    | Scan PHP configs/code for security issues                          |
| **Mail Testing Tools**                        | 🕓 Planned    | Built-in Mailhog or similar for email capture                      |
| **Portable Mode / Zero Installation**         | 🕓 Planned    | All data/settings/logs in app folder                               |
| **Database Backup/Restore (One-Click)**       | 🕓 Planned    | UI to export/import MySQL databases                                |
| **MySQL User Management**                     | 🕓 Planned    | Create/edit MySQL users/privileges via UI                          |
| **Quick Launch Tools**                        | 🕓 Planned    | Terminal (PHP/MySQL CLI), copy connection string, etc.             |
| **Full App/Data Backup/Restore**              | 🕓 Planned    | Backup configs, databases, logs in one click                       |
| **Automatic Virtual Host Management**         | 🕓 Planned    | Pretty URLs like `myapp.test`                                      |
| **HTTPS/SSL for Local Sites**                 | 🕓 Planned    | One-click SSL for local domains and phpMyAdmin                     |
| **Multilanguage UI**                          | 🕓 Planned    | Internationalization support                                       |
| **Project Templates/Cloning**                 | 🕓 Planned    | Clone from Git or use templates for new projects                   |
| **Composer Integration**                      | 🕓 Planned    | Global/per-project Composer support                                |
| **PHP INI & Apache Config Editors**           | 🕓 Planned    | User-friendly config editing                                       |
| **PHP Error Display Toggle**                  | 🕓 Planned    | Enable/disable display_errors from UI                              |
| **Service Status & Tray Notifications**       | 🕓 Planned    | Tray notifications for service events                              |
| **Portable PHP CLI**                          | 🕓 Planned    | Terminal with PHP version selector                                 |
| **Bundled Tools (curl, git, node, npm, etc.)**| 🕓 Planned    | Optionally bundle common CLI tools                                 |
| **Log Viewer Enhancements**                   | 🕓 Planned    | Real-time, filterable, tabbed log viewer for all services/apps     |
| **Project Full Backup/Restore**               | 🕓 Planned    | Backup/restore www files, configs, databases                       |

**Legend:**  
✅ Available  🔄 In Progress  🕓 Planned

---

## 🚀 Features

- **MySQL Database** – Embedded MySQL server with GUI management and proper state handling
- **phpMyAdmin** – Built-in database management interface for MySQL
- **Modern Tailwind CSS UI** – Clean, responsive design with no custom CSS dependencies
- **Configuration Management** – Easy access to config files with syntax highlighting and automatic backup/restore
- **Logs Viewer** – View MySQL and phpMyAdmin logs in real-time with search/filter (in progress)
- **System Tray Integration** – Minimize to system tray and quick actions (in progress)
- **Auto-Update Support** – Electron auto-updates via GitHub Releases (in progress)
- **User-Initiated Crash & Bug Reporting via GitHub Issues** – Simple, secure bug/crash reporting from inside the app (in progress)

---

## 📋 Prerequisites

- Windows 10/11 (Linux and macOS support planned)
- Node.js 18 or newer
- Git

---

## 🛠 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ProgrammerNomad/DevStackBox.git
   cd DevStackBox
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the application:**

   ```bash
   npm start
   ```

---

## 🏗 Project Structure

```plaintext
DevStackBox/
├── src/             # Node.js logic (services, config)
├── apache/          # Apache portable setup (planned)
├── mysql/           # MySQL portable setup
├── php/             # Multiple PHP versions (planned)
├── phpmyadmin/      # phpMyAdmin setup
├── apps/            # One-click app installers (planned)
├── scripts/         # Frontend JavaScript modules
├── styles/          # CSS stylesheets (Tailwind)
├── assets/          # Icons and images
├── config/          # Configuration files
├── config-backups/  # Backup files for configurations
├── logs/            # Log files directory (Apache, MySQL, PHP, etc.)
├── www/             # Web root directory (planned)
├── main.js          # Electron main process
├── preload.js       # Electron bridge
├── index.html       # GUI window
└── package.json     # Project configuration
```

---

## 🎯 Current Status

DevStackBox is under active development, aiming to simplify local PHP and MySQL development. The following components are already **complete** or in progress:

- ✅ Electron application framework
- ✅ Modern GUI interface with Tailwind CSS
- ✅ MySQL service controls with logical button states
- ✅ Config editors framework
- ✅ phpMyAdmin integration

---

## 🔮 Planned Features

To become a truly powerful and complete solution for PHP developers, DevStackBox aims to include all essential features found in Laragon, XAMPP, and WAMP, plus modern improvements:

- **Apache HTTP Server Integration**  
  Portable Apache server with easy start/stop and virtual host management

- **Multiple PHP Versions & Extensions Management**  
  Switch between PHP versions and manage extensions easily

- **Automatic Virtual Host Management**  
  Pretty URLs like `myapp.test` for local projects

- **HTTPS/SSL for Local Sites & phpMyAdmin**  
  One-click self-signed SSL for secure local development

- **One-Click App Installers**  
  Quickly install WordPress, Laravel, and other popular PHP apps

- **Portable Mode / Zero Installation**  
  Run DevStackBox without installation, fully portable

- **Database Backup/Restore (One-Click)**  
  Export/import MySQL databases from the UI

- **MySQL User Management**  
  Create/edit MySQL users and privileges from the UI

- **Quick Launch Tools**  
  One-click terminal (with PHP/MySQL CLI), copy connection string, open Composer/Artisan, etc.

- **Full App/Data Backup/Restore**  
  Back up all configs, databases, and logs in one click

- **Multilanguage UI**  
  Internationalization support for global users

- **Project Templates & Cloning**  
  Easily create new projects from templates or clone from Git

- **Composer Integration**  
  Install and manage Composer globally and per project

- **PHP INI & Apache Config GUI Editors**  
  Direct, user-friendly access and editing

- **PHP Error Display Toggle**  
  Enable/disable `display_errors` from the UI

- **Service Status & Tray Notifications**  
  Tray notifications for service start/stop/status

- **Portable PHP CLI**  
  Terminal with PHP version selector and correct PATH

- **Bundled Tools**  
  Option to install tools like curl, openssl, git, nodejs, npm, etc.

- **Log Viewer Enhancements**  
  Real-time logs, filters, tabs for Apache, MySQL, PHP, phpMyAdmin, and custom project logs

- **Project Full Backup/Restore**  
  Backup and restore for www files, configs, and databases

---

## 🐞 Crash & Bug Reporting

DevStackBox uses a **user-initiated, secure crash and bug reporting system**:

- Users can easily report bugs or crashes directly from the app via a “Report a Bug” option.
- This opens a pre-filled [GitHub Issue form](https://github.com/ProgrammerNomad/DevStackBox/issues/new) in the user’s browser, including details like error messages, stack traces, and environment info.
- **No GitHub login is required inside the app.**  
  Users submit the report through their browser, using their own GitHub account.
- This approach is fully secure: no authentication tokens or sensitive data are stored or sent by the app.

---

## 🗂 Log Types Displayed

- **Apache**: `access.log`, `error.log`, and per-vhost logs (planned)
- **MySQL**: `error.log`, `slow-query.log`, and optionally `general.log`
- **PHP**: Per-version `php_error.log` (planned)
- **phpMyAdmin**: Application log (if enabled)
- **DevStackBox**: Internal/app logs, installer logs
- **Custom project logs**: (e.g., Laravel logs in `storage/logs`) (planned)
- Logs viewer includes search, filtering, and real-time updates (in progress)

---

## 🔧 Development

### Running in Development Mode

```bash
npm run dev
```

This will open the app with developer tools enabled.

### Building for Distribution

```bash
npm run build
```

### Code Style

We use ESLint for code quality:

```bash
npm run lint
npm run lint:fix
```

---

## 🧩 Architecture

### Main Components

1. **Electron Main Process** (`main.js`)
   - Window and system tray management
   - Service lifecycle and auto-update logic

2. **Renderer Process** (`index.html` + `scripts/app.js`)
   - Tailwind CSS-based responsive UI
   - Service controls and real-time status
   - Log viewer and notification system

3. **Service Manager** (`src/services/ServiceManager.js`)
   - Start/stop/manage MySQL/Apache/PHP processes
   - Real-time status monitoring

4. **Configuration UI** (`scripts/config-ui.js`)
   - Tailwind-styled modals with syntax highlighting (Monaco/Prism)
   - Backup and restore configs

5. **One-Click Installers** (`scripts/one-click-installers.js`) (planned)
   - App installation workflow and error handling

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 🎨 UI Design with Tailwind CSS

- **No Custom CSS Required**: All styling is done with utility classes
- **Consistent Design Language**: Unified styling across all components
- **Mobile-First Responsiveness**: Adapts to any screen size
- **Dark/Light Mode Support**: Easy theming with Tailwind variants
- **Faster Development**: Rapid UI prototyping and implementation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by local development tools like Laragon and XAMPP
- Built with Electron for cross-platform compatibility
- Designed to be lightweight and developer-friendly

---

## 📞 Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ProgrammerNomad/DevStackBox/discussions)
- 📧 Email: [shiv@srapsware.com](mailto:shiv@srapsware.com)

---

**DevStackBox** – Making local PHP & MySQL development simple, modern, and portable! 🚀
