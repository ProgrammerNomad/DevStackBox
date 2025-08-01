# DevStackBox

A lightweight, portable, open-source local development environment for PHP developers

## 🚀 Features

- **Apache HTTP Server** – Portable Apache with easy start/stop controls and logical button states
- **MySQL Database** – Embedded MySQL server with GUI management and proper state handling
- **Multiple PHP Versions** – Switch between PHP 8.1, 8.2 (default), 8.3, and 8.4
- **phpMyAdmin** – Built-in database management interface
- **One-Click App Installers** – Install WordPress, Laravel, and more with intuitive UI (Top 10 PHP apps supported)
- **Tailwind CSS Interface** – Clean, responsive design with no custom CSS dependencies
- **Configuration Management** – Easy access to config files with syntax highlighting and automatic backup/restore
- **Logs Viewer** – View Apache, MySQL, PHP, and app logs in real-time with search/filter (in progress)
- **System Tray Integration** – Minimize to system tray and quick actions (in progress)
- **Auto-Update Support** – Electron auto-updates via GitHub Releases (in progress)
- **Crash Reporting System** – Error and crash reporting for diagnostics (planned)
- **PHP Extensions Management** – Enable/disable PHP extensions per version (in progress)
- **Security Analyzer** – Scan PHP configs and code for common security issues (planned)
- **Mail Testing Tools** – Built-in Mailhog or similar for catching outgoing emails (planned)

## 📋 Prerequisites

- Windows 10/11 (Linux and macOS support planned)
- Node.js 18 or newer
- Git

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

## 🏗 Project Structure

```plaintext
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
├── logs/            # Log files directory (Apache, MySQL, PHP, etc.)
├── www/             # Web root directory
├── main.js          # Electron main process
├── preload.js       # Electron bridge
├── index.html       # GUI window
└── package.json     # Project configuration
```

## 🎯 Current Status

DevStackBox is under active development with the following components already **complete**:

- ✅ Electron application framework
- ✅ Modern GUI interface with Tailwind CSS
- ✅ Service management architecture
- ✅ IPC communication setup
- ✅ Apache & MySQL service controls with logical button states
- ✅ One-click installers interface (Top PHP/CMS apps)
- ✅ Config editors framework

### Next Steps (In Progress)

- 🔄 Tailwind-based modals for Apache, MySQL, PHP config editors
- 🔄 PHP extensions management interface with toggle switches
- 🔄 Enhanced error handling and notifications (modals/banners)
- 🔄 Real-time service status monitoring
- 📦 Expand one-click installers functionality (Top 10 PHP/CMS apps)
- 📦 Log viewers with real-time updates, tabs, and search/filter
- 📦 System tray integration (Electron Tray API)
- 📦 Auto-update support using electron-updater and GitHub Releases
- 📦 Application installers
- 📦 Crash reporting system (Sentry or similar)
- 📦 Security analyzer tools
- 📦 Mail testing integration (Mailhog or similar)

### Planned Features

- 🗂 Security analyzer (local code/config scans)
- 🗂 Crash/error reporting
- 🗂 Mail testing utility

## 🧩 One-Click App Installers

Quickly deploy the most popular PHP applications and frameworks:

1. **WordPress**
2. **Laravel**
3. **CodeIgniter**
4. **Drupal**
5. **Joomla**
6. **Symfony**
7. **phpBB**
8. **OpenCart**
9. **PrestaShop**
10. **MediaWiki**

Each installer provides a guided, pre-filled setup for fast local development.

## 🗂 Log Types Displayed

- **Apache**: `access.log`, `error.log`, and per-vhost logs
- **MySQL**: `error.log`, `slow-query.log`, and optionally `general.log`
- **PHP**: Per-version `php_error.log`
- **phpMyAdmin**: Application log (if enabled)
- **DevStackBox**: Internal/app logs, installer logs
- **Custom project logs**: (e.g., Laravel logs in `storage/logs`)
- Logs viewer includes search, filtering, and real-time updates (in progress)

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
   - Start/stop/manage Apache, MySQL, PHP processes
   - Real-time status monitoring

4. **Configuration UI** (`scripts/config-ui.js`)
   - Tailwind-styled modals with syntax highlighting (Monaco/Prism)
   - Backup and restore configs

5. **One-Click Installers** (`scripts/one-click-installers.js`)
   - App installation workflow and error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🎨 UI Design with Tailwind CSS

- **No Custom CSS Required**: All styling is done with utility classes
- **Consistent Design Language**: Unified styling across all components
- **Mobile-First Responsiveness**: Adapts to any screen size
- **Dark/Light Mode Support**: Easy theming with Tailwind variants
- **Faster Development**: Rapid UI prototyping and implementation

### Component Patterns

- **Modals**: Config editors, error dialogs, app installations
- **Cards**: Service status and app installers
- **Forms**: Config inputs, installer forms
- **Buttons**: Semantic coloring (primary, success, danger, etc.)

See the [Copilot instructions](/.github/copilot-instructions.md) for detailed UI component standards.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by local development tools like Laragon and XAMPP
- Built with Electron for cross-platform compatibility
- Designed to be lightweight and developer-friendly

## 📞 Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ProgrammerNomad/DevStackBox/discussions)
- 📧 Email: [shiv@srapsware.com](mailto:shiv@srapsware.com)

---

**DevStackBox** – Making local PHP development simple, modern, and portable! 🚀