# Local Todo App

This is a local todo app. The desktop app runs in its own Windows window and stores tasks in `%APPDATA%\LocalTodoApp\tasks.json`.

## Run The Desktop App

```powershell
npm.cmd run desktop
```

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

## Offline HTML Version

`local-todo-app.html` can still be opened directly from disk if you want the browser version.

## Next.js Development

```powershell
npm.cmd run dev
```

Open `http://localhost:3000`.
