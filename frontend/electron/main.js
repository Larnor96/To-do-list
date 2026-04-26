/* eslint-disable @typescript-eslint/no-require-imports */

const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const isDev = !app.isPackaged && process.env.ELECTRON_DEV === "1";

app.setPath("userData", path.join(app.getPath("appData"), "LocalTodoApp"));

const dataFile = () => path.join(app.getPath("userData"), "tasks.json");
const legacyDataFile = () =>
  path.join(app.getPath("appData"), "LokalTodoApp", "tasks.json");

function readTasks() {
  const currentFile = dataFile();
  const oldFile = legacyDataFile();
  const sourceFile = fs.existsSync(currentFile) ? currentFile : oldFile;

  if (!fs.existsSync(sourceFile)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(sourceFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTasks(tasks) {
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(dataFile(), JSON.stringify(tasks, null, 2), "utf8");
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 760,
    minHeight: 560,
    title: "Local Todo",
    backgroundColor: "#12151f",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "out", "index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("tasks:load", () => readTasks());
  ipcMain.handle("tasks:save", (_event, tasks) => {
    writeTasks(Array.isArray(tasks) ? tasks : []);
    return true;
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
