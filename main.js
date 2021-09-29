const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    log.info('ready-to-show')
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on('ready', () => {
  log.info('app ready');
  autoUpdater.checkForUpdates();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  log.info('update-available')
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('checking-for-update', () => {
  log.info('checking-for-update')
});

autoUpdater.on('update-not-available', () => {
  log.info('update-not-available')
});

autoUpdater.on('update-downloaded', () => {
  log.info('update-downloaded')
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});
