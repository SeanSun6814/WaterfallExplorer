const fs= require('fs');
const { readdirSync } = fs;
const childProcess = require('child_process');

let pathArr = [];
let rootPaths = [];

function readRootPathConfig() {
    try {
        let data = fs.readFileSync("./rootFolders.json", { encoding: "utf8", flag: "r" });
        data = JSON.parse(data);
        rootPaths = data.paths;
    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
}


function removeColumnByLayerIdx(layerIdx) {
    let myColumns = document.getElementById("myColumns");
    let col = document.getElementById("column" + layerIdx);
    if (col != null)
        myColumns.removeChild(col);
}

function setPathArr(layerIdx, name, isFolder) {
    while (pathArr.length > layerIdx) {
        pathArr.pop();
        removeColumnByLayerIdx(pathArr.length + 1);
    }
    if (isFolder)
        pathArr.push(name + "/");
    else
        pathArr.push(name);
    document.getElementById("fullPathText").innerHTML = reverseStr(getFullPath());
}

function getFullPath() {
    // console.log(pathArr.join(""));
    return pathArr.join("");
}

function getDirAndFiles(source) {
    if (source === "") {
        let arr = rootPaths.map((name) => ({ name: name, isFolder: true }));
        return { dirs: arr, files: [] };
    } 
    let arr = readdirSync(source, { withFileTypes: true })
    return {
        dirs: arr.filter(dirent => dirent.isDirectory())
        .map((dirent) => ({ name: dirent.name, isFolder: true })),
        files: arr.filter(dirent => !dirent.isDirectory())
        .map((dirent) => ({ name: dirent.name, isFolder: false }))
    }
}

function openFile(path) {
    childProcess.exec('start "" "' + path + '"');
}

function createHTMLList(data) {
    let list = document.getElementById("myList");

    data.forEach((item) => {
        let li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    })
}

function getHTMLList(array, layerIdx) {
    // let colDiv = document.createElement("div");
    let colUl = document.createElement("ul");
    colUl.setAttribute("id", "column" + layerIdx);
    // colDiv.appendChild(colUl);

    array.forEach((item, idx) => {
        let li = document.createElement("li");
        let id = "li-" + layerIdx + "-" + idx;
        li.innerText = item.name;
        // li.setAttribute("layerIdx", layerIdx);
        li.setAttribute("onmouseenter", "onHover('" + id + "'," + layerIdx + ", \"" + item.name + "\", " + item.isFolder + ")");
        li.setAttribute("onclick", "onClick('" + id + "'," + layerIdx + ", \"" + item.name + "\", " + item.isFolder + ")");
        li.setAttribute("isFolder", item.isFolder);
        li.setAttribute("style", "background-color:" + getHsl(layerIdx, idx) + ";");
        li.setAttribute("id", id);
        li.setAttribute("onmouseleave", "onLeave('" + id + "')");
        if (item.isFolder) {
            li.classList.add("liFolder");
        } else {
            li.classList.add("liFile");
        }
        colUl.appendChild(li);
    });
    // return colDiv;
    return colUl;
}

window.onload = function () {
    readRootPathConfig();
    let results = getDirAndFiles("");
    pathArr.push("");
    let arr = (results.dirs).concat(results.files);
    let elem = getHTMLList(arr, 1);
    let myColumns = document.getElementById("myColumns");
    myColumns.appendChild(elem);
}

function removeClassesFromAll(className) {
    let elems = document.getElementsByClassName(className);
    while (elems[0]) {
        elems[0].classList.remove(className);
    }
}

function onHover(id, layerIdx, name, isFolder) {
    setPathArr(layerIdx, name, isFolder);
    let newPath = getFullPath();
    removeClassesFromAll("liFocused" + layerIdx);
    document.getElementById(id).classList.add("liFocused" + layerIdx);

    if (!isFolder)
        return;
    let results = getDirAndFiles(newPath);
    let arr = (results.dirs).concat(results.files);
    let elem = getHTMLList(arr, layerIdx + 1);
    let myColumns = document.getElementById("myColumns");
    myColumns.appendChild(elem);
}

function playClickedAnimation(id) {
    let el = document.getElementById(id);
    el.classList.add("liClicked");
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null; 
}

function onClick(id, layerIdx, name, isFolder) {
    playClickedAnimation(id);
    openFile(getFullPath());
    window.close();
}

function onLeave(id) {
    // document.getElementById(id).classList.remove("liFocused");
}

function getHsl(colIdx, rowIdx) {
    let h = (70.0 + colIdx * 10.0) / 255.0;
    let s = 1.0;
    let l = 0.6 + rowIdx * 0.025;
    return hslToRgb(h, s, l);
}


function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l;
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    // return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
}


function reverseStr(s){
    return s.split("").reverse().join("");
}