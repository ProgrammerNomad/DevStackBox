# DevStackBox

A lightweight, portable, open-source local development tool for PHP developers

## 🚀 Features

- **Apache HTTP Server** - Portable Apache with easy start/stop controls
- **MySQL Database** - Embedded MySQL server with GUI management
- **Multiple PHP Versions** - Switch between PHP versions easily
- **phpMyAdmin** - Built-in database management interface
- **One-Click App Installers** - Install WordPress, Laravel, and more
- **System Tray Support** - Minimize to system tray like Laragon
- **Configuration Management** - Easy access to config files
- **Logs Viewer** - View Apache and MySQL logs in real-time

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

```
DevStackBox/
├── src/             # Node.js logic (services, config)
├── apache/          # Apache portable setup (to be added)
├── mysql/           # MySQL portable setup (to be added)
├── php/             # Multiple PHP versions (to be added)
├── phpmyadmin/      # phpMyAdmin setup (to be added)
├── apps/            # One-click app installers (to be added)
├── main.js          # Electron main process
├── preload.js       # Electron bridge
├── index.html       # GUI window
├── styles/          # CSS stylesheets
├── scripts/         # Frontend JavaScript
├── assets/          # Icons and images
└── package.json     # Project configuration
```

## 🎯 Current Status

This is the initial implementation with the core Electron application structure. The following components are ready:

- ✅ Electron application framework
- ✅ Modern GUI interface
- ✅ Service management architecture
- ✅ IPC communication setup
- ✅ Basic styling and responsiveness

### Next Steps (Planned):

- 📦 Add portable Apache binaries
- 📦 Add portable MySQL binaries  
- 📦 Add multiple PHP versions
- 📦 Implement phpMyAdmin integration
- 📦 Create app installers (WordPress, Laravel, etc.)
- 📦 Add configuration editors
- 📦 Implement log viewers

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

2. **Renderer Process** (`index.html` + `scripts/main.js`)
   - User interface
   - Service controls
   - Real-time status updates

3. **Service Manager** (`src/services/ServiceManager.js`)
   - Manages Apache, MySQL, PHP processes
   - Handles service start/stop operations
   - Monitors service status

4. **IPC Bridge** (`preload.js`)
   - Secure communication between main and renderer
   - Exposes limited API to frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by XAMPP, Laragon, and similar local development tools
- Built with Electron for cross-platform compatibility
- Designed to be lightweight and developer-friendly

## 📞 Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ProgrammerNomad/DevStackBox/discussions)
- 📧 Email: [support@devstackbox.com](mailto:support@devstackbox.com)

---

**DevStackBox** - Making local PHP development simple and portable! 🚀
