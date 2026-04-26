# Local Todo

Local Todo is an offline-first desktop todo app for Windows. It runs as a normal desktop application, stores tasks locally on the PC, and can be added to Windows Startup so it opens automatically when you sign in.

The app is built with Electron for the desktop shell, React and Next.js for the interface, Tailwind CSS for styling, and local JSON file storage under `%APPDATA%\LocalTodoApp`.

## Features

- Add, complete, filter, and delete tasks
- Local offline storage
- Desktop shortcut support
- Optional Windows startup integration
- Modern React-based UI inside an Electron window

## Run

```powershell
cd frontend
npm.cmd install
npm.cmd run desktop
```

## Install Shortcuts

```powershell
npm.cmd run install-desktop
npm.cmd run install-startup
```
