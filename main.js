const { app, BrowserWindow, globalShortcut, Menu } = require('electron')
const path = require('path')

let win = null;
function createWindow() {
  if (win != null) {
    win.show();
    return;
  }
  win = new BrowserWindow({
    devTools: true,
    autoHideMenuBar: true,
    width: 1600,
    height: 800,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  const {app, Menu} = require('electron');

  Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
        click() {
          app.quit();
        }
      },
      {
        label: "Hide",
        accelerator: "Esc",
        click() {
          win.hide();
        }
      }
  ]));

  win.on('close', (event) => {
     if (app.quitting) {
      win = null
    } else {
      event.preventDefault()
      win.hide()
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  const ret = globalShortcut.register('Alt+E', () => {
    console.log('Alt+E is pressed')
    createWindow();
  })

  if (!ret) {
    console.log('registration failed')
  }
})

app.on('window-all-closed', (e) => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => app.quitting = true)


app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})