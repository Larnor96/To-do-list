# Local Todo App

This is a local Electron + React todo app. It opens as a normal Windows desktop app, works offline, and stores app data under `%APPDATA%\LocalTodoApp`.

## Run The App

```powershell
npm.cmd run desktop
```

The script builds the static React app if needed, then opens it in Electron.

## Put The App On The Desktop

```powershell
npm.cmd run install-desktop
```

This creates a shortcut named `Local Todo` on the desktop.

## Start Automatically With Windows

Run this once from the `frontend` folder:

```powershell
npm.cmd run install-startup
```

This adds `LocalTodoApp.cmd` to your Windows user Startup folder. The next time you sign in, the app starts automatically.

## Next.js Development

```powershell
npm.cmd run dev
```

Open `http://localhost:3000`.
