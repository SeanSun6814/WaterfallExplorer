let pathArr = [];
let rootPaths = [];
let currentElement = null;

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

  let numFiles = 0,
    numFolders = 0;
  array.forEach((item, idx) => {
    let li = document.createElement("li");
    let id = "li-" + layerIdx + "-" + idx;
    li.innerText = item.name;
    let argStr =
      "'" + id + "'," + layerIdx + ', "' + item.name + '", ' + item.isFolder;
    li.setAttribute("onmouseenter", "onHover(" + argStr + ")");
    li.setAttribute("onclick", "onClick(" + argStr + ")");
    li.setAttribute("isFolder", item.isFolder);
    li.setAttribute("style", "background-color:" + getHsl(layerIdx, idx) + ";");
    li.setAttribute("id", id);
    li.setAttribute("onmouseleave", "onLeave('" + id + "')");
    if (item.isFolder) {
      li.classList.add("liFolder");
      numFolders++;
    } else {
      li.classList.add("liFile");
      numFiles++;
    }
    colUl.appendChild(li);
  });
  let li = document.createElement("li");
  li.classList.add("liCount");
  li.innerHTML = generateCountStr(numFiles, numFolders);
  colUl.appendChild(li);
  return colUl;
}

function generateCountStr(files, folders) {
  if (files === 0 && folders === 0) {
    return "Empty";
  } else if (files === 0) {
    return folders + " folder" + (folders === 1 ? "" : "s");
  } else if (folders === 0) {
    return files + " file" + (files === 1 ? "" : "s");
  } else {
    return generateCountStr(0, folders) + ", " + generateCountStr(files, 0);
  }
}

function playClickedAnimation(id) {
  let el = document.getElementById(id);
  el.classList.add("liClicked");
  el.style.animation = "none";
  el.offsetHeight; /* trigger reflow */
  el.style.animation = null;
}

function playMessage(msg) {
  let el = document.getElementById("messageText");
  el.innerHTML = msg;
  el.classList.add("messageAnimation");
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

function addToRootPaths(str) {
  str = str.trim();
  str = str.replaceAll("\\", "/");
  str = str.replaceAll('"', "");
  str = str.replaceAll(/\/$/g, "");
  if (rootPaths.includes(str)) {
    return false;
  }
  rootPaths.push(str);
  return true;
}

function removeFromRootPaths(str) {
  let index = rootPaths.indexOf(str);
  if (index !== -1) {
    rootPaths.splice(index, 1);
  }
}

window.onload = function () {
  readRootPathConfig();
  let results = getDirAndFiles("");
  pathArr.push("");
  let arr = results.dirs.concat(results.files);
  let elem = getHTMLList(arr, 1);
  let myColumns = document.getElementById("myColumns");
  myColumns.innerHTML = "";
  myColumns.appendChild(elem);
};

function onHover(id, layerIdx, name, isFolder) {
  currentElement = {
    id: id,
    layerIdx: layerIdx,
    name: name,
    isFolder: isFolder,
  };
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
  playMessage("Opening");
  playClickedAnimation(id);
  openFile(getFullPath());
  setTimeout(() => {
    window.close();
  }, 1000);
}

function onLeave(id) {
  // document.getElementById(id).classList.remove("liFocused");
}

document.addEventListener("keypress", function onPress(event) {
  if (event.key === "c") {
    // playClickedAnimation("li-1-1");
    setClipboard(getFullPath());
    playMessage("Copied");
  } else if (event.key === "a") {
    let str = getClipboard();
    if (addToRootPaths(str)) {
      writeRootPathConfig();
      window.onload();
      playMessage("Added");
    } else {
      playMessage("Already added");
    }
  } else if (event.key === "d") {
    if (
      rootPaths.length > 0 &&
      pathArr.length > 0 &&
      currentElement != null &&
      currentElement.layerIdx == 1
    ) {
      removeFromRootPaths(currentElement.name);
      writeRootPathConfig();
      window.onload();
      playMessage("Deleted");
    } else {
      playMessage("No selection");
    }
  } else if (event.key === "e") {
    if (rootPaths.length > 0 && pathArr.length > 0 && currentElement != null) {
      playMessage("VS Code");
      playClickedAnimation(currentElement.id);
      openWithCode(getFullPath());
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      playMessage("No selection");
    }
  } else if (event.key === "b") {
    if (rootPaths.length > 0 && pathArr.length > 0 && currentElement != null) {
      playMessage("Browser");
      playClickedAnimation(currentElement.id);
      openWithBrowser(getFullPath());
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      playMessage("No selection");
    }
  }
});
