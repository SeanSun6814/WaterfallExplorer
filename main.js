const electron = require("electron");
const { app, BrowserWindow, globalShortcut, Menu } = require("electron");
const path = require("path");

let win = null;
function createWindow() {
  let screenElectron = electron.screen;
  let mainScreen = screenElectron.getPrimaryDisplay();
  let dim = mainScreen.size;
  let width = Math.floor(Math.max(1000, dim.width * 0.95));
  let height = Math.floor(Math.max(600, dim.height * 0.7));

  if (win != null) {
    win.setSize(width, height);
    win.center();
    win.show();
    return;
  }

  console.log(dim);
  console.log(dim.width * 0.95);
  console.log(Math.max(800, dim.height * 0.7));
  win = new BrowserWindow({
    devTools: true,
    autoHideMenuBar: true,
    width: width,
    height: height,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  const { app, Menu } = require("electron");

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Quit",
        accelerator: "Q",
        click() {
          app.quit();
        },
      },
      {
        label: "Hide",
        accelerator: "Esc",
        click() {
          win.hide();
        },
      },
    ])
  );

  win.on("close", (event) => {
    if (app.quitting) {
      win = null;
    } else {
      event.preventDefault();
      win.hide();
    }
  });

  // win.setFullScreen(true);
  win.setSize(width, height);
  win.center();
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  const ret = globalShortcut.register("Alt+E", () => {
    console.log("Alt+E is pressed");
    createWindow();
  });

  if (!ret) {
    console.log("registration failed");
  }
});

app.on("window-all-closed", (e) => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => (app.quitting = true));

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
