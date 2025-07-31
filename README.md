# DevStackBox

A lightweight, portable, open-source local development environment for PHP developers

## 🚀 Features

- **Apache HTTP Server** - Portable Apache with easy start/stop controls and logical button states
- **MySQL Database** - Embedded MySQL server with GUI management and proper state handling
- **Multiple PHP Versions** - Switch between PHP 8.1, 8.2 (default), 8.3, and 8.4
- **phpMyAdmin** - Built-in database management interface
- **One-Click App Installers** - Install WordPress, Laravel, and more with intuitive UI
- **Tailwind CSS Interface** - Clean, responsive design with no custom CSS dependencies
- **Configuration Management** - Easy access to config files with syntax highlighting
- **Logs Viewer** - View Apache and MySQL logs in real-time (coming soon)
- **System Tray Integration** - Minimize to system tray (coming soon)

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
├── logs/            # Log files directory
├── www/             # Web root directory
├── main.js          # Electron main process
├── preload.js       # Electron bridge
├── index.html       # GUI window
└── package.json     # Project configuration
```

## 🎯 Current Status

The DevStackBox project has made significant progress with the following components ready:

- ✅ Electron application framework
- ✅ Modern GUI interface with Tailwind CSS
- ✅ Service management architecture
- ✅ IPC communication setup
- ✅ Basic styling and responsiveness
- ✅ Apache service start/stop controls with logical button states
- ✅ MySQL service start/stop controls with logical button states
- ✅ One-click installers interface
- ✅ Config editors framework

### Next Steps (In Progress)

- 🔄 Tailwind-based modals for Apache, MySQL, PHP config editors
- 🔄 PHP extensions management interface with toggle switches
- 🔄 Enhanced error handling and notifications
- 🔄 Implement real-time service status monitoring
- 📦 Expand one-click installers functionality
- 📦 Implement log viewers with real-time updates
- 📦 Add system tray integration

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
   - Handles window management
   - Manages service lifecycle
   - Provides system tray functionality

2. **Renderer Process** (`index.html` + `scripts/app.js`)
   - Tailwind CSS-based responsive UI
   - Service controls with logical state management
   - Real-time status updates

3. **Service Manager** (`src/services/ServiceManager.js`)
   - Manages Apache, MySQL, PHP processes
   - Handles service start/stop operations
   - Monitors service status

4. **Configuration UI** (`scripts/config-ui.js`)
   - Tailwind-styled modal interfaces
   - Syntax highlighting for configuration editors
   - Automatic backup and restore functionality

5. **One-Click Installers** (`scripts/one-click-installers.js`)
   - App installation workflow
   - User-friendly interface with Tailwind components
   - Integrated error handling and notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🎨 UI Design with Tailwind CSS

DevStackBox uses Tailwind CSS exclusively for styling with no custom CSS files, providing several benefits:

- **No Custom CSS Required**: All styling is done with utility classes
- **Consistent Design Language**: Unified component styling across the app
- **Mobile-First Responsiveness**: Adapts to any screen size
- **Dark/Light Mode Support**: Easy theming with Tailwind variants
- **Faster Development**: Rapid UI prototyping and implementation

### Component Examples

Our UI components follow consistent patterns:

- **Modals**: For configuration editors and app installations
- **Cards**: For service status displays and app installer cards
- **Forms**: For configuration inputs with consistent styling
- **Buttons**: Using color semantics (primary, success, danger, etc.)

See the [Copilot instructions](/.github/copilot-instructions.md) for detailed UI component patterns.

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

**DevStackBox** - Making local PHP development simple and portable! 🚀
- ✅ MySQL service start/stop controls with logical button states
- ✅ One-click installers interface
- ✅ Config editors framework

### Next Steps (In Progress):

- � Tailwind-based modals for Apache, MySQL, PHP config editors
- � PHP extensions management interface
- 🔄 Enhanced error handling and notifications
- � Implement real-time service status monitoring
- 📦 Expand one-click installers functionality
- 📦 Implement log viewers with real-time updates
- 📦 Add system tray integration

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
   - Handles window management
   - Manages service lifecycle
   - Provides system tray functionality

2. **Renderer Process** (`index.html` + `scripts/app.js`)
   - Tailwind CSS-based responsive UI
   - Service controls with logical state management
   - Real-time status updates

3. **Service Manager** (`src/services/ServiceManager.js`)
   - Manages Apache, MySQL, PHP processes
   - Handles service start/stop operations
   - Monitors service status

4. **Configuration UI** (`scripts/config-ui.js`)
   - Tailwind-styled modal interfaces
   - Syntax highlighting for configuration editors
   - Automatic backup and restore functionality

5. **One-Click Installers** (`scripts/one-click-installers.js`)
   - App installation workflow
   - User-friendly interface with Tailwind components
   - Integrated error handling and notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🎨 UI Design with Tailwind CSS

DevStackBox uses Tailwind CSS exclusively for styling with no custom CSS files, providing several benefits:

- **No Custom CSS Required**: All styling is done with utility classes
- **Consistent Design Language**: Unified component styling across the app
- **Mobile-First Responsiveness**: Adapts to any screen size
- **Dark/Light Mode Support**: Easy theming with Tailwind variants
- **Faster Development**: Rapid UI prototyping and implementation

### Component Examples

Our UI components follow consistent patterns:

- **Modals**: For configuration editors and app installations
- **Cards**: For service status displays and app installer cards
- **Forms**: For configuration inputs with consistent styling
- **Buttons**: Using color semantics (primary, success, danger, etc.)

See the [Copilot instructions](/.github/copilot-instructions.md) for detailed UI component patterns.

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

**DevStackBox** - Making local PHP development simple and portable! 🚀
