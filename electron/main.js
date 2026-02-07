const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#000000',
    title: 'Turing Task Manager'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    // Development: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Auto-updater configuration
autoUpdater.autoDownload = false;

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: `Version ${info.version} is available. Download now?`,
    buttons: ['Yes', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      mainWindow?.setProgressBar(0);
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.setProgressBar(progress.percent / 100);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.setProgressBar(-1);
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded. The app will restart to install.',
    buttons: ['Restart Now', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  mainWindow?.setProgressBar(-1);
  dialog.showMessageBox(mainWindow, {
    type: 'error',
    title: 'Update Error',
    message: 'Failed to update the application.',
    detail: err?.message || String(err)
  });
});

app.on('ready', () => {
  createWindow();

  // Check for updates in production
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdates();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
