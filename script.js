let pathArr = [];
let rootPaths = [];

function removeColumnByLayerIdx(layerIdx) {
  let myColumns = document.getElementById("myColumns");
  let col = document.getElementById("column" + layerIdx);
  if (col != null) myColumns.removeChild(col);
}

function setPathArr(layerIdx, name, isFolder) {
  while (pathArr.length > layerIdx) {
    pathArr.pop();
    removeColumnByLayerIdx(pathArr.length + 1);
  }
  if (isFolder) pathArr.push(name + "/");
  else pathArr.push(name);
  document.getElementById("fullPathText").innerHTML = reverseStr(getFullPath());
}

function getFullPath() {
  // console.log(pathArr.join(""));
  return pathArr.join("");
}

function getHTMLList(array, layerIdx) {
  let colUl = document.createElement("ul");
  colUl.setAttribute("id", "column" + layerIdx);

  array.forEach((item, idx) => {
    let li = document.createElement("li");
    let id = "li-" + layerIdx + "-" + idx;
    li.innerText = item.name;
    li.setAttribute(
      "onmouseenter",
      "onHover('" +
        id +
        "'," +
        layerIdx +
        ', "' +
        item.name +
        '", ' +
        item.isFolder +
        ")"
    );
    li.setAttribute(
      "onclick",
      "onClick('" +
        id +
        "'," +
        layerIdx +
        ', "' +
        item.name +
        '", ' +
        item.isFolder +
        ")"
    );
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
  return colUl;
}

function playClickedAnimation(id) {
  let el = document.getElementById(id);
  el.classList.add("liClicked");
  el.style.animation = "none";
  el.offsetHeight; /* trigger reflow */
  el.style.animation = null;
}

function removeClassesFromAll(className) {
  let elems = document.getElementsByClassName(className);
  while (elems[0]) {
    elems[0].classList.remove(className);
  }
}

window.onload = function () {
  readRootPathConfig();
  let results = getDirAndFiles("");
  pathArr.push("");
  let arr = results.dirs.concat(results.files);
  let elem = getHTMLList(arr, 1);
  let myColumns = document.getElementById("myColumns");
  myColumns.appendChild(elem);
};

function onHover(id, layerIdx, name, isFolder) {
  setPathArr(layerIdx, name, isFolder);
  let newPath = getFullPath();
  removeClassesFromAll("liFocused" + layerIdx);
  document.getElementById(id).classList.add("liFocused" + layerIdx);

  if (!isFolder) return;
  let results = getDirAndFiles(newPath);
  let arr = results.dirs.concat(results.files);
  let elem = getHTMLList(arr, layerIdx + 1);
  let myColumns = document.getElementById("myColumns");
  myColumns.appendChild(elem);
}

function onClick(id, layerIdx, name, isFolder) {
  playClickedAnimation(id);
  openFile(getFullPath());
  window.close();
}

function onLeave(id) {
  // document.getElementById(id).classList.remove("liFocused");
}

document.addEventListener("keypress", function onPress(event) {
  if (event.key === "c") {
    // alert("c key!!!");
  } else if (event.key === "v") {
    // alert("v key!!!");
  }
});
