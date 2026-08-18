const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('remindMe', {
  addTask: (text, time) => ipcRenderer.invoke('add-task', text, time),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  onTasksUpdated: (cb) => ipcRenderer.on('tasks-updated', (_, tasks) => cb(tasks)),
  onShowReminder: (cb) => ipcRenderer.on('show-reminder', (_, text) => cb(text)),
  overlayDone: () => ipcRenderer.send('overlay-done'),
  closeWindow: () => ipcRenderer.send('close-task-window'),
});
