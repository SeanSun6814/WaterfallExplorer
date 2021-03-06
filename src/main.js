const electron = require("electron");
const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require("electron");
const path = require("path");
const { Worker } = require("node:worker_threads");
const AutoLaunch = require("auto-launch");
const os = require("os");

if (!app.requestSingleInstanceLock()) {
  console.log("There is already an existing instance of app, exiting...");
  app.quit();
} else {
  let appPath = sanitizePath(__dirname);
  appPath = appPath.substring(0, appPath.length - 4);
  console.log("App path: " + appPath);

  let platform = os.platform();
  console.log(platform);

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
      win.focus();
      return;
    }

    console.log(dim);
    console.log(dim.width * 0.95);
    console.log(Math.max(800, dim.height * 0.7));
    win = new BrowserWindow({
      devTools: true,
      // skipTaskbar: true,
      autoHideMenuBar: true,
      width: width,
      height: height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    if (platform !== "linux") win.hide();

    setupMenu();

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
    // win.webContents.openDevTools(); // TODO: here
  }

  app.whenReady().then(() => {
    createWindow();

    const ret = globalShortcut.register("Alt+E", () => {
      console.log("Alt+E is pressed");
      createWindow();
    });

    if (!ret) {
      console.log("registration failed");
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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

  app.on("second-instance", (event, commandLine, workingDirectory) => {
    console.log("User tried to open another instance of app... Show this one instead.");
    createWindow();
  });

  ipcMain.on("log", (event, arg) => {
    console.log("INFO: " + arg);
    event.returnValue = "done";
  });

  ipcMain.on("showwindow", (event, arg) => {
    console.log("showing window");
    createWindow();
    event.returnValue = "done";
  });

  ipcMain.on("autolaunch", (event, arg) => {
    console.log("Setting autolaunch to: " + arg);
    let autoLaunch = new AutoLaunch({
      name: "WaterfallExplorer",
      path: app.getPath("exe"),
    });
    autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled && arg) autoLaunch.enable();
      else if (isEnabled && !arg) autoLaunch.disable();
    });
    event.returnValue = "done";
  });

  ipcMain.on("run", (event, arg) => {
    console.log("running command: " + arg);
    const worker = new Worker(appPath + "src/backgroundWorker.js", { workerData: arg });
  });

  ipcMain.on("platform", (event, arg) => {
    event.returnValue = platform;
  });

  ipcMain.on("quit", (event, arg) => {
    console.log("Quit signal received.");
    app.quit();
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

  function sanitizePath(str) {
    str = str.trim();
    str = str.replaceAll("\\", "/");
    str = str.replaceAll('"', "");
    str = str.replaceAll(/\/$/g, "");
    str += "/";
    return str;
  }
}
