const electron = require("electron");
const {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  ipcMain,
} = require("electron");
const path = require("path");
const { Worker } = require("node:worker_threads");

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
    win.webContents.send("onshow", "");
    win.show();
    return;
  }

  console.log(dim);
  console.log(dim.width * 0.95);
  console.log(Math.max(800, dim.height * 0.7));
  win = new BrowserWindow({
    devTools: true,
    skipTaskbar: true,
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

  // setupMenu();

  win.on("close", (event) => {
    if (app.quitting) {
      win = null;
    } else {
      event.preventDefault();
      win.hide();
    }
  });

  win.on("minimize", function (event) {
    event.preventDefault();
    win.hide();
  });

  // win.setFullScreen(true);
  win.setSize(width, height);
  win.center();
  win.loadFile("./src/index.html");
  win.hide();
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
    app.quit();
  }

  app.on("window-all-closed", (e) => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("before-quit", () => (app.quitting = true));

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
});

ipcMain.on("log", (event, arg) => {
  console.log(arg);
  event.returnValue = "done";
});

ipcMain.on("run", (event, arg) => {
  console.log("running command: " + arg);
  console.log("main app running worker thread");
  const worker = new Worker("./src/backgroundWorker.js", { workerData: arg });
  worker.on("message", (msg) => {
    console.log("main app detected worker thread message" + msg);
  });
  worker.on("error", (err) => {
    console.log("main app detected worker thread error" + err);
  });
  worker.on("exit", (code) => {
    console.log("main app detected worker thread exiting with code " + code);
  });
});

function setupMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
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
      {
        label: "Hide",
        accelerator: "CmdOrCtrl+H",
        click() {
          win.hide();
        },
      },
      {
        label: "Maximize",
        accelerator: "CmdOrCtrl+F",
        click() {
          if (win.isMaximized()) win.unmaximize();
          else win.maximize();
        },
      },
    ])
  );
}
