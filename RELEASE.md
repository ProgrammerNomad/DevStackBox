# DevStackBox Release Process

## Alpha Release Checklist

1. **Version Bump**: Update version in package.json, Cargo.toml, and tauri.conf.json
2. **Test Locally**: Ensure all services (Apache, MySQL, phpMyAdmin, PHP) work
3. **Prepare Binaries**: Run `npm run prepare-release`
4. **Build**: Run `npm run build:release`
5. **Tag Release**: Run `git tag v0.1.0-alpha.1 && git push --tags`
6. **GitHub Actions**: Will automatically build and create release
7. **Test Auto-Update**: Download and test the updater functionality

## What's Included in Alpha

- ✅ MySQL 8.0 (portable)
- ✅ PHP 8.2 (with essential extensions)
- ✅ Apache HTTP Server (configured)
- ✅ phpMyAdmin (database management)
- ✅ Auto-update system
- ✅ Modern Tauri + React UI
- ✅ Dark/Light theme support
- ✅ English/Hindi language support

## Installation Requirements

- Windows 10/11 (x64)
- 500MB free disk space
- No additional dependencies required