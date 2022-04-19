const fs = require("fs");
const { readdirSync } = fs;
const childProcess = require("child_process");
// const clipboardy = require("clipboardy");
// import clipboard from "clipboardy";
const { clipboard } = require("electron");

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
    let arr = rootPaths.map((name) => ({ name: name, isFolder: true }));
    return { dirs: arr, files: [] };
  }
  let arr = readdirSync(source, { withFileTypes: true });
  return {
    dirs: arr
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => ({ name: dirent.name, isFolder: true })),
    files: arr
      .filter((dirent) => !dirent.isDirectory())
      .map((dirent) => ({ name: dirent.name, isFolder: false })),
  };
}

async function openFile(path) {
  childProcess.exec('start "" "' + path + '"');
}

async function openWithCode(path) {
  childProcess.exec('code "' + path + '"');
}
