const { clipboard } = require("electron");
const { ipcRenderer } = require("electron");

ipcRenderer.on("onshow", (event, arg) => {
  onWindowShow();
  // console.log(ipcRenderer.sendSync("log", "onWindowShow completed!"));
});

function getClipboard() {
  return clipboard.readText();
}

function setClipboard(str) {
  clipboard.writeText(str);
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
  return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
}

function reverseStr(s) {
  return s.split("").reverse().join("");
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

function idxInBounds(idx, arr) {
  if (idx < 0 || idx >= arr.length) {
    console.trace("Error: Idx [" + idx + "] out of bounds of array length [" + arr.length + "]");
    return false;
  }
  return true;
}
