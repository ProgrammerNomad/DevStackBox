# 🤖 Copilot Instructions for DevStackBox (Tauri Edition)

Welcome to the **DevStackBox** contributor and Copilot guide!  
This project is a cross-platform, modern PHP dev environment built with **Tauri + Vite + React + Tailwind CSS + shadcn/ui + Framer Motion**.

**Author:** Nomad Programmer  
**Contact:** shiv@srapsware.com  
**Repository:** [ProgrammerNomad/DevStackBox](https://github.com/ProgrammerNomad/DevStackBox)  
**Documentation & Issues:** Use [GitHub Issues](https://github.com/ProgrammerNomad/DevStackBox/issues) and [GitHub Wiki](https://github.com/ProgrammerNomad/DevStackBox/wiki) for all docs.

---

## 🖥️ Development Environment

- **Primary OS:** Windows 11 (tested and developed on Windows 11)
- **Editor:** Visual Studio Code with [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- **Frontend:** Vite, React, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Tauri (Rust)
- **Styling:** Use **only** Tailwind CSS and shadcn/ui.  
  **Do not use custom CSS unless absolutely necessary**, and document any custom CSS if you must add it.
- **Theming:** The app must always support both **dark mode** and **light mode** (use shadcn/ui and Tailwind theming).

---

## 📦 Binary Management

- **Default PHP:** Only **PHP 8.2** is bundled by default.
- **Other Binaries:** Additional PHP versions and binaries should be made available via an in-app distribution installer (download on demand).  
  Do not bundle multiple PHP versions or extra binaries by default to keep the app lightweight.

---

## 📁 Project Structure

- `src-tauri/` – Rust backend: manages services, configs, IPC, tray, updater, system integration.
- `src/` – Frontend (Vite + React + Tailwind CSS + shadcn/ui + Framer Motion): UI, logic, state, service controls, editors, log viewers.
- `mysql/`, `php/`, `apache/`, `phpmyadmin/` – Portable binaries.
- `apps/` – One-click installers (planned).
- `config/`, `config-backups/` – Configuration management.
- `logs/` – Service and app log files.
- `www/` – Web root (planned).
- `locales/` – i18next translation files.

---

## 🧑‍💻 UI/UX Guidelines

- **React** with **shadcn/ui** components for all UI controls and dialogs.
- **Tailwind CSS utility classes** for styling and layout.  
  *Custom CSS is forbidden* unless absolutely unavoidable, and must be documented and justified.
- **Dark mode and light mode support is required everywhere.**  
  Use shadcn/ui and Tailwind's theming utilities.
- Animations and transitions must use **Framer Motion** (not raw JS or CSS keyframes).
- All UI should be accessible (keyboard, screen reader, high-contrast, etc).
- All user-facing text must use i18next (EN, HI).

---

## 💡 Copilot Prompt Examples

- _"Create a React service control panel using shadcn/ui for MySQL with start/stop/restart buttons, status, and dark/light mode support."_
- _"Add a Tauri Rust command to launch Apache and stream stdout/stderr to the frontend."_
- _"Implement a Framer Motion-powered slide-in drawer for config file editing."_
- _"Make a Tailwind-styled, real-time log viewer component with search and filter."_
- _"Add multilanguage support to all user-facing strings using i18next."_
- _"Create a shadcn/ui modal for backup/restore confirmation, themed for dark and light mode."_
- _"Implement a UI flow for downloading additional PHP versions through the in-app distribution installer."_

---

## 🛠️ Coding Guidelines

- All privileged logic (service management, file I/O) must be handled in Tauri (Rust).
- All frontend logic communicates with backend via Tauri APIs/events, never direct system calls.
- Use `xterm.js` for the embedded terminal.
- Logs viewer must support real-time tailing, search, and filtering.
- Config editors must support backup/restore and syntax highlighting.
- Use shadcn/ui dialogs/alerts/menus for modals, tray menus, and notifications.
- Never introduce custom CSS unless no other solution exists—prefer Tailwind/shadcn/ui utilities.

---

## 🚦 Must-have Features Checklist

- [x] Embedded MySQL server with GUI
- [x] phpMyAdmin integration
- [x] Modern UI: Vite + React + Tailwind + shadcn/ui + Framer Motion
- [x] Config editors (syntax highlight, backup/restore)
- [x] Multilanguage UI (i18next: EN, HI)
- [x] Full dark mode and light mode support everywhere
- [x] Distribution installer for downloading extra PHP versions and binaries
- [ ] Real-time logs viewer (search/filter)
- [ ] System tray integration
- [ ] Auto-update via Tauri (managed via GitHub Releases)
- [ ] Apache HTTP server (portable, vhost, HTTPS)
- [ ] Multiple PHP versions/extensions management
- [ ] One-click app installers
- [ ] Integrated terminal/CLI
- [ ] Security analyzer, mail tools, bundled CLI tools
- [ ] User management, SSL, backup/restore
- [ ] Bug/crash reporting, tray notifications

---

## 🤝 Contributing

- Fork, branch, code, and PR as usual.
- Use Copilot to scaffold UI in React, backend in Rust, and connect via Tauri APIs.
- Keep code linted, typed, and documented.
- Test all major OSes if possible (Windows 11 is primary).

---

**Let’s build the most modern, beautiful, and lightweight PHP dev stack together!**

<sup>Author: Nomad Programmer • Email: shiv@srapsware.com • [Project on GitHub](https://github.com/ProgrammerNomad/DevStackBox)</sup>