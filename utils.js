const fs = require("fs");
const { readdirSync } = fs;
// const childProcess = require("child_process");
// const clipboardy = require("clipboardy");
// import clipboard from "clipboardy";
const { clipboard } = require("electron");
const fse = require("fs-extra");
var path = require("path");
const { ipcRenderer } = require("electron");

ipcRenderer.on("onshow", (event, arg) => {
  // console.log("electron onshow");
  // console.log(arg);
  onWindowShow();
  // console.log(ipcRenderer.sendSync("log", "onWindowShow completed!"));
});

function makeDir(path, dirName) {
  fse.ensureDirSync(path + dirName);
}

function copyFile(sourcePath, destFolder) {
  try {
    let fileName = getFileName(sourcePath);
    fse.copySync(sourcePath, destFolder + fileName);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function moveFile(sourcePath, destFolder) {
  try {
    let fileName = getFileName(sourcePath);
    fse.moveSync(sourcePath, destFolder + fileName);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function deleteFile(sourcePath) {
  try {
    fse.removeSync(sourcePath);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function getFileName(pathStr) {
  return path.basename(pathStr);
}

function getClipboard() {
  return clipboard.readText();
  // return clipboard.readSync();
}

function setClipboard(str) {
  clipboard.writeText(str);
  // clipboard.writeSync(str);
}

function getHsl(colIdx, rowIdx) {
  let h = (70.0 + colIdx * 10.0) / 255.0;
  let s = 1.0;
  let l = 0.6 + rowIdx * 0.025;
  return hslToRgb(h, s, l);
}

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l;
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  // return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  return (
    "rgb(" +
    Math.round(r * 255) +
    "," +
    Math.round(g * 255) +
    "," +
    Math.round(b * 255) +
    ")"
  );
}

function reverseStr(s) {
  return s.split("").reverse().join("");
}

function readRootPathConfig() {
  try {
    let data = fs.readFileSync("./rootFolders.json", {
      encoding: "utf8",
      flag: "r",
    });
    data = JSON.parse(data);
    rootPaths = data.paths;
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
}

function writeRootPathConfig() {
  let json = JSON.stringify({ paths: rootPaths });
  fs.writeFileSync("./rootFolders.json", json);
}

function getDirAndFiles(source) {
  if (source === "") {
    return rootPaths.map((name) => ({
      name: name,
      isFolder: true,
      stats: null,
    }));
  }

  try {
    let arr = readdirSync(source, { withFileTypes: true });

    return arr.map((dirent) => ({
      name: dirent.name,
      isFolder: dirent.isDirectory(),
      stats: getFileStats(source + dirent.name),
    }));
  } catch (e) {
    console.log(e);
    return [];
  }
}

function sortDirBy(arr, method) {
  let sortFn = null;
  function cmpName(a, b) {
    a = a.name.replace("_", ".");
    b = b.name.replace("_", ".");
    return a.localeCompare(b);
  }

  if (method === "type") {
    sortFn = function (a, b) {
      if (a.isFolder && b.isFolder) return 0;
      else if (!a.isFolder && b.isFolder) return 1; // b on top
      else if (a.isFolder && !b.isFolder) return -1; // a on top

      try {
        let aExt = a.name.match(/\.[0-9a-z]+$/i);
        let bExt = b.name.match(/\.[0-9a-z]+$/i);
        aExt = aExt.length > 0 ? aExt[0] : "";
        bExt = bExt.length > 0 ? bExt[0] : "";

        let cmp = cmpName({ name: aExt }, { name: bExt });
        if (cmp !== 0) return cmp;
      } catch (e) {}
      return cmpName(a, b);
    };
  } else if (method === "size") {
    sortFn = function (a, b) {
      if (a.isFolder && b.isFolder) return 0;
      else if (!a.isFolder && b.isFolder) return 1; // b on top
      else if (a.isFolder && !b.isFolder) return -1; // a on top

      try {
        if (a.stats.size < b.stats.size) return 1; // b on top
        else if (a.stats.size > b.stats.size) return -1; // a on top
      } catch (e) {}
      return cmpName(a, b);
    };
  } else if (method === "time") {
    sortFn = function (a, b) {
      try {
        if (a.stats.mtimeMs < b.stats.mtimeMs) return 1; // b on top
        else if (a.stats.mtimeMs > b.stats.mtimeMs) return -1; // a on top
      } catch (e) {}
      return cmpName(a, b);
    };
  } else if (method === "name") {
    sortFn = cmpName;
  } else {
    // (method === "folder")
    sortFn = function (a, b) {
      if (!a.isFolder && b.isFolder) return 1; // b on top
      else if (a.isFolder && !b.isFolder) return -1; // a on top
      return cmpName(a, b);
    };
  }
  return arr.sort(sortFn);
}

function getFileStats(path) {
  try {
    const stats = fs.statSync(path);
    return stats;
  } catch (e) {
    // console.log(e);
    return null;
  }
}

function formatFileSize(bytes) {
  let fileSize = bytes;
  let fileSizeKB = round2d(fileSize * 0.001);
  let fileSizeMB = round2d(fileSizeKB * 0.001);
  let fileSizeGB = round2d(fileSizeMB * 0.001);

  if (fileSizeGB >= 1) {
    return fileSizeGB + " GB";
  } else if (fileSizeMB >= 1) {
    return fileSizeMB + " MB";
  } else if (fileSizeKB >= 1) {
    return fileSizeKB + " KB";
  } else {
    return fileSize + " Bytes";
  }
}

function round2d(value) {
  return Math.round(value * 100) / 100;
}

function formatDate(millis) {
  var myDate = new Date(millis);
  return (
    myDate.getFullYear() +
    "-" +
    ("0" + (myDate.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + myDate.getDate()).slice(-2) +
    " " +
    myDate.getHours() +
    ":" +
    ("0" + myDate.getMinutes()).slice(-2) +
    ":" +
    ("0" + myDate.getSeconds()).slice(-2)
  );
}

async function openFile(path) {
  // childProcess.exec('start "" "' + path + '"');
  console.log("running openFile function");
  sendCommand('start "" "' + path + '"');
  console.log("exiting openFile function");
}

async function openWithCode(path) {
  // childProcess.exec('code "' + path + '"');
  sendCommand('code "' + path + '"');
}

async function openWithBrowser(path) {
  // childProcess.exec('start chrome "' + path + '"');
  sendCommand('start chrome "' + path + '"');
}

function sendCommand(command) {
  console.log("web app sending command" + command);
  ipcRenderer.send("run", command);
}
