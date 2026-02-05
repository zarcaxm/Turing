// Preload script for Electron
// This script runs in a context that has access to both Node.js APIs and the web page
// Use it to expose safe APIs to the renderer process

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Add any APIs you want to expose to the renderer process here
  // Example:
  // sendMessage: (message) => ipcRenderer.send('message', message)
});
