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

function openFileCommandStr(path) {
  return 'start "" "' + path + '"';
}

function openWithCodeCommandStr(path) {
  return 'code "' + path + '"';
}

function openWithBrowserCommandStr(path) {
  return 'start chrome "' + path + '"';
}
