const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getTasks: () => ipcRenderer.invoke('db:getTasks'),
  addTask: (args) => ipcRenderer.invoke('db:addTask', args),
  deleteTask: (args) => ipcRenderer.invoke('db:deleteTask', args),
  toggleComplete: (args) => ipcRenderer.invoke('db:toggleComplete', args),
  toggleExpand: (args) => ipcRenderer.invoke('db:toggleExpand', args),
  updateTask: (args) => ipcRenderer.invoke('db:updateTask', args),
  importFromLocalStorage: (args) => ipcRenderer.invoke('db:importFromLocalStorage', args),
  getTasksByDateRange: (args) => ipcRenderer.invoke('db:getTasksByDateRange', args),
  getDailyScores: (args) => ipcRenderer.invoke('db:getDailyScores', args),
});
