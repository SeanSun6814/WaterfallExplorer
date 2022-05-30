const fs = require("fs");
const { readdirSync } = fs;
const fse = require("fs-extra");
const path = require("path");

function renameFile(oldPath, newPath) {
  try {
    fs.renameSync(oldPath, newPath);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function makeFile(path, data) {
  if (data === undefined) data = "";
  try {
    fs.writeFileSync(path, data);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function makeDir(path, dirName) {
  try {
    fse.ensureDirSync(path + dirName);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
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

function readConfigFile() {
  let data;
  try {
    data = fs.readFileSync(appPath + "config.json", {
      encoding: "utf8",
      flag: "r",
    });
  } catch (err) {
    console.log("Error reading file:", err);
    return false;
  }
  try {
    data = JSON.parse(data);
    if (!checkConfig(data)) return true;
    return data;
  } catch (err) {
    console.log("Error parsing JSON string:", err);
    playMessage("Error reading config: " + err, "error");
    return true;
  }
}

function writeConfig() {
  let json = JSON.stringify(config);
  fs.writeFileSync(appPath + "config.json", json);
}

function getDirAndFiles(source) {
  if (source === "") {
    return config.paths.map((name) => ({
      name: name,
      isFolder: true,
      stats: null,
    }));
  }

  try {
    let arr = readdirSync(source, { withFileTypes: true });

    return arr.map((dirent) => ({
      name: dirent.name + (dirent.isDirectory() ? "/" : ""),
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

function openFileCommandStr(path, isFolder) {
  if (isFolder) {
    return config.launchSettings.openFolder.replace(/(\$\{PATH\})/, path);
  } else {
    return config.launchSettings.openFile.replace(/(\$\{PATH\})/, path);
  }
}

function openWithCodeCommandStr(path) {
  return config.launchSettings.openInVSCode.replace(/(\$\{PATH\})/, path);
}

function openWithBrowserCommandStr(path) {
  return config.launchSettings.openInChrome.replace(/(\$\{PATH\})/, path);
}

function createDefaultConfig() {
  if (platform === "linux") {
    return {
      paths: ["/"],
      autoLaunch: true,
      colorTheme: "light",
      defaultSortByIdx: 0,
      launchSettings: {
        openFile: 'xdg-open "${PATH}"',
        openFolder: 'cd "${PATH}" && gnome-terminal',
        openInChrome: 'google-chrome "${PATH}"',
        openInVSCode: 'code "${PATH}"',
      },
    };
  } else {
    return {
      paths: ["C:/"],
      autoLaunch: true,
      colorTheme: "light",
      defaultSortByIdx: 0,
      launchSettings: {
        openFile: 'start "" "${PATH}"',
        openFolder: 'start "" "${PATH}"',
        openInChrome: 'start chrome "${PATH}"',
        openInVSCode: 'code "${PATH}"',
      },
    };
  }
}

function checkConfig(config) {
  if (config == null) return false;
  if (config.paths == null || !Array.isArray(config.paths)) return false;
  config.paths.forEach((element) => {
    if (typeof element !== "string" || element.trim() === "") return false;
  });

  if (config.autoLaunch == null || typeof config.autoLaunch !== "boolean") return false;
  if (config.colorTheme == null || (config.colorTheme !== "light" && config.colorTheme !== "dark"))
    return false;
  if (
    config.defaultSortByIdx == null ||
    !Number.isInteger(config.defaultSortByIdx) ||
    config.defaultSortByIdx < 0 ||
    config.defaultSortByIdx >= sortTypes.length
  )
    return false;

  if (config.launchSettings == null) return false;
  if (config.launchSettings.openFile == null || typeof config.launchSettings.openFile !== "string")
    return false;
  if (config.launchSettings.openFolder == null || typeof config.launchSettings.openFolder !== "string")
    return false;
  if (config.launchSettings.openInChrome == null || typeof config.launchSettings.openInChrome !== "string")
    return false;
  if (config.launchSettings.openInVSCode == null || typeof config.launchSettings.openInVSCode !== "string")
    return false;

  return true;
}
