# DevStackBox

A lightweight, portable, open-source local development environment for PHP developers

---

## 🚀 Features

- **Apache HTTP Server** – Portable Apache with easy start/stop controls and logical button states (planned)
- **MySQL Database** – Embedded MySQL server with GUI management and proper state handling
- **phpMyAdmin** – Built-in database management interface for MySQL
- **Multiple PHP Versions** – Switch between PHP 8.1, 8.2 (default), 8.3, and 8.4 (planned)
- **One-Click App Installers** – Install WordPress, Laravel, and more with intuitive UI (planned)
- **Tailwind CSS Interface** – Clean, responsive design with no custom CSS dependencies
- **Configuration Management** – Easy access to config files with syntax highlighting and automatic backup/restore
- **Logs Viewer** – View Apache, MySQL, PHP, and app logs in real-time with search/filter (in progress)
- **System Tray Integration** – Minimize to system tray and quick actions (in progress)
- **Auto-Update Support** – Electron auto-updates via GitHub Releases (in progress)
- **User-Initiated Crash & Bug Reporting via GitHub Issues** – Simple, secure bug/crash reporting from inside the app (in progress)
- **Security Analyzer** – Scan PHP configs and code for common security issues (planned)
- **Mail Testing Tools** – Built-in Mailhog or similar for catching outgoing emails (planned)
- **PHP Extensions Management** – Enable/disable PHP extensions per version (planned)
- **Portable Mode / Zero Installation** – Run without installation, keep all settings/logs/projects in app folder (planned)
- **Database Backup/Restore (One-Click)** – Simple UI to export/import MySQL databases (planned)
- **MySQL User Management** – UI for creating/editing MySQL users and privileges (planned)
- **Quick Launch Tools** – One-click open for terminal (with PHP/MySQL CLI), copy connection string, etc. (planned)
- **Full App/Data Backup/Restore** – Option to back up all configs, databases, and logs in one click (planned)
- **Automatic Virtual Host Management** – Pretty URLs like `myapp.test` (planned)
- **HTTPS/SSL for Local Sites** – One-click self-signed SSL for local domains and phpMyAdmin (planned)
- **Multilanguage UI** – Internationalization support (planned)
- **Project Templates/Cloning** – Clone projects from a git URL or start from template (planned)

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

### Next Steps (In Progress)

- 🔄 Enhanced error handling and notifications (modals/banners)
- 🔄 Real-time MySQL service status monitoring
- 📦 Log viewers with real-time updates, tabs, and search/filter
- 📦 System tray integration (Electron Tray API)
- 📦 Auto-update support using electron-updater and GitHub Releases
- 📦 User-initiated crash and bug reporting to GitHub Issues
- 📦 Security analyzer tools
- 📦 Mail testing integration (Mailhog or similar)

---

## 🔮 Planned Features

The following features, commonly found in tools like Laragon, XAMPP, and WAMP, are planned for future releases (PHP/MySQL focused):

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
  One-click terminal (with PHP/MySQL CLI), copy connection string, etc.

- **Full App/Data Backup/Restore**  
  Back up all configs, databases, and logs in one click

- **Multilanguage UI**  
  Internationalization support for global users

- **Project Templates & Cloning**  
  Easily create new projects from templates or clone from Git

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
