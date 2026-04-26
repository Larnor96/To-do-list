/* eslint-disable @typescript-eslint/no-require-imports */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("todoData", {
  loadTasks: () => ipcRenderer.invoke("tasks:load"),
  saveTasks: (tasks) => ipcRenderer.invoke("tasks:save", tasks),
});
