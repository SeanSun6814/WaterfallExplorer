let pathArr = [];
let rootPaths = [];
let currentElement = null;
let currentLists = [];
let sortByIdx = 0;
let sortTypes = ["default", "name", "time", "type", "size"];
let wasFocusedOnItem = false;
let delayedLaunch = false;
let delayedLaunchActions = [];
let delayedLaunchCloseWindowTimer = null;
let ignoreFirstE = false;

function removeColumnByLayerIdx(layerIdx) {
  let myColumns = document.getElementById("myColumns");
  let col = document.getElementById("column" + layerIdx);
  if (col != null) myColumns.removeChild(col);
}

function removeExtraPathArrAndColumns(layerIdx) {
  while (pathArr.length > layerIdx) {
    pathArr.pop();
    removeColumnByLayerIdx(pathArr.length + 1);
  }
}
function setPathArr(layerIdx, name, isFolder) {
  removeExtraPathArrAndColumns(layerIdx);
  if (isFolder) pathArr.push(name + "/");
  else pathArr.push(name);
  document.getElementById("fullPathText").innerHTML = getFullPath();
}

function removeExtraCurrentLists(layerIdx) {
  while (currentLists.length > layerIdx) {
    currentLists.pop();
  }
}

function setCurrentLists(layerIdx, list) {
  removeExtraCurrentLists(layerIdx);
  currentLists.push(list);
}

function getFullPath(excludeLastIfFile) {
  let result = "";
  let endIdx = pathArr.length;
  if (excludeLastIfFile && !currentElement.isFolder) {
    endIdx--;
  }
  for (let i = 0; i < endIdx; i++) {
    result += pathArr[i];
  }
  // console.log(pathArr.join(""));
  return result;
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
      "'" +
      id +
      "'," +
      layerIdx +
      ', "' +
      item.name +
      '", ' +
      item.isFolder +
      "," +
      idx;
    li.setAttribute("onmouseenter", "onHover(" + argStr + ")");
    // li.setAttribute("onscroll", "onHover(" + argStr + ")");
    li.setAttribute("onclick", "onClick(" + argStr + ")");
    li.setAttribute("isFolder", item.isFolder);
    li.setAttribute("style", "background-color:" + getHsl(layerIdx, idx) + ";");
    li.setAttribute("id", id);
    li.setAttribute("idx", idx);
    // li.setAttribute("onmouseleave", "onLeave(" + argStr + ")");
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
  li.classList.add("liCount" + layerIdx);
  li.setAttribute("onmouseenter", "removeFocus(" + layerIdx + ")");
  li.innerHTML = generateCountStr(numFiles, numFolders);
  colUl.appendChild(li);
  return colUl;
}

function getHTMLStatsList(str, layerIdx) {
  let colUl = document.createElement("ul");
  colUl.setAttribute("id", "column" + layerIdx);
  let li = document.createElement("li");
  li.setAttribute("id", "liStats");
  li.classList.add("liStats");
  // li.setAttribute("onmouseenter", "removeFocus(-1)");
  li.innerHTML = str;
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
  let arr = getDirAndFiles("");
  arr = sortDirBy(arr, sortTypes[sortByIdx]);
  pathArr.push("");
  currentLists.push(arr);
  let elem = getHTMLList(arr, 1);
  let myColumns = document.getElementById("myColumns");
  myColumns.innerHTML = "";
  myColumns.appendChild(elem);
};

function onHover(id, layerIdx, name, isFolder, idx) {
  currentElement = {
    id: id,
    layerIdx: layerIdx,
    name: name,
    isFolder: isFolder,
    idx: idx,
  };
  wasFocusedOnItem = true;
  setPathArr(layerIdx, name, isFolder);
  let newPath = getFullPath();
  removeClassesFromAll("liFocused" + layerIdx);
  document.getElementById(id).classList.add("liFocused" + layerIdx);

  if (isFolder) {
    let arr = getDirAndFiles(newPath);
    arr = sortDirBy(arr, sortTypes[sortByIdx]);
    setCurrentLists(layerIdx, arr);
    let elem = getHTMLList(arr, layerIdx + 1);
    let myColumns = document.getElementById("myColumns");
    myColumns.appendChild(elem);
  } else {
    let stats = currentLists[layerIdx - 1][idx].stats;
    let str = "Size: " + formatFileSize(stats.size) + "<br>";
    str += "Created: " + formatDate(stats.birthtime) + "<br>";
    str += "Modified: " + formatDate(stats.mtimeMs) + "<br>";
    str += "Opened: " + formatDate(stats.atimeMs);
    let elem = getHTMLStatsList(str, layerIdx + 1);
    let myColumns = document.getElementById("myColumns");
    myColumns.appendChild(elem);
    setStatsToPosition();
  }
}

function setStatsToPosition() {
  let elem = document.getElementById(currentElement.id);
  let statElem = document.getElementById("liStats");
  let top = elem.getBoundingClientRect().top;
  top += elem.getBoundingClientRect().height / 2.0;
  top -= statElem.getBoundingClientRect().height / 2.0;
  statElem.style.position = "absolute";
  statElem.style.top = Math.floor(top) + "px";
}

function resetDelayedLaunchCloseWindowTimer() {
  if (delayedLaunchCloseWindowTimer == null) {
    delayedLaunchCloseWindowTimer = setTimeout(() => {
      playMessage(delayedLaunchActions.length + " actions");
      delayedLaunchActions.forEach((item) => {
        item();
      });
      delayedLaunch = false;
      delayedLaunchActions = [];
      delayedLaunchCloseWindowTimer = null;
      setTimeout(() => {
        window.close();
      }, 1000);
    }, 3000);
  } else {
    clearTimeout(delayedLaunchCloseWindowTimer);
    delayedLaunchCloseWindowTimer = null;
    resetDelayedLaunchCloseWindowTimer();
  }
}

function addDelayedLaunchAction(fn) {
  delayedLaunchActions.push(fn);
  resetDelayedLaunchCloseWindowTimer();
}

function onClick(id, layerIdx, name, isFolder, idx) {
  if (delayedLaunch) {
    playClickedAnimation(id);
    let path = getFullPath();
    addDelayedLaunchAction(() => openFile(path));
    return;
  }
  playMessage("Opening");
  playClickedAnimation(id);
  openFile(getFullPath());
  setTimeout(() => {
    window.close();
  }, 1000);
}

function onLeave(id, layerIdx, name, isFolder, idx) {
  // document.getElementById(id).classList.remove("liFocused" + layerIdx);
  // removeExtraPathArrAndColumns(layerIdx);
  // removeExtraCurrentLists(layerIdx);
}

function removeFocus(layerIdx) {
  if (layerIdx === -1) {
    if (currentElement == null || !wasFocusedOnItem) return;
    layerIdx = currentElement.layerIdx;
    wasFocusedOnItem = false;
  }
  let elemClass = "liFocused" + layerIdx;
  let elem = document.getElementsByClassName(elemClass);
  if (elem.length > 0) {
    elem = elem[0];
    if (elem != null) elem.classList.remove(elemClass);
  }
  removeExtraPathArrAndColumns(layerIdx);
  removeExtraCurrentLists(layerIdx);
  if (layerIdx !== 1) {
    let parentClass = "liFocused" + (layerIdx - 1);
    let parentElem = document.getElementsByClassName(parentClass);
    if (parentElem.length > 0) {
      parentElem = parentElem[0];
      if (parentElem != null) {
        currentElement = {
          id: parentElem.getAttribute("id"),
          layerIdx: layerIdx - 1,
          name: parentElem.innerText,
          isFolder: parentElem.getAttribute("isFolder"),
          idx: parentElem.getAttribute("idx"),
        };
      }
    }
  }
  document.getElementById("fullPathText").innerHTML = getFullPath();
}

document.addEventListener("keydown", function onPress(event) {
  if (event.ctrlKey && event.key === "a") {
    event.preventDefault();
  }
});
document.addEventListener("keyup", function onPress(event) {
  if (ignoreFirstE && event.key === "e") {
    ignoreFirstE = false;
    event.preventDefault();
    return;
  } else if (event.key === "Alt" || event.altKey) {
    event.preventDefault();
    return;
  }
  if (!handleFunctionKeys(event)) {
    if (
      (event.key === "f" && event.ctrlKey) ||
      event.key === "Control" ||
      event.key === "Shift" ||
      event.key === "Tab" ||
      event.key === "Escape" ||
      currentElement == null
    ) {
      return;
    }
    findWithName(event.key, currentElement.idx);
  }
});

function findWithName(targetChar, startIdx) {
  let currentList = currentLists[currentElement.layerIdx - 1];
  targetChar = targetChar.toLowerCase();
  for (let i = startIdx + 1; i < startIdx + currentList.length + 1; i++) {
    let idx = i % currentList.length;
    let char = currentList[idx].name.charAt(0);
    if (char.toLowerCase() === targetChar) {
      let elemId = "li-" + currentElement.layerIdx + "-" + idx;
      scrollToView(currentElement.layerIdx, idx);
      onHover(
        elemId,
        currentElement.layerIdx,
        currentList[idx].name,
        currentList[idx].isFolder,
        idx
      );
      playClickedAnimation(elemId);
      playMessage("Find '" + targetChar + "'");
      return;
    }
  }
  playMessage("'" + targetChar + "' not found");
  // console.log("not found");
}

function handleFunctionKeys(event) {
  if (event.ctrlKey && event.key === "d") {
    delayedLaunch = !delayedLaunch;
    playMessage((delayedLaunch ? "Delayed" : "Normal") + " Launch");
  } else if (event.ctrlKey && event.key === "c") {
    // playClickedAnimation("li-1-1");
    setClipboard(getFullPath());
    playMessage("Copied");
  } else if (event.ctrlKey && event.key === "a") {
    let str = getClipboard();
    if (addToRootPaths(str)) {
      writeRootPathConfig();
      window.onload();
      playMessage("Added");
    } else {
      playMessage("Already added");
    }
  } else if (!event.ctrlKey && event.key === "Delete") {
    if (
      rootPaths.length > 0 &&
      pathArr.length > 1 &&
      currentElement != null &&
      currentElement.layerIdx == 1
    ) {
      removeFromRootPaths(currentElement.name);
      writeRootPathConfig();
      window.onload();
      playMessage("Removed");
    } else {
      playMessage("No selection");
    }
  } else if (
    (event.ctrlKey && event.key === "Enter") ||
    (event.ctrlKey && event.key === "e")
  ) {
    if (rootPaths.length > 0 && pathArr.length > 1 && currentElement != null) {
      if (delayedLaunch) {
        playClickedAnimation(currentElement.id);
        let path = getFullPath();
        addDelayedLaunchAction(() => openWithCode(path));
      } else {
        playMessage("VS Code");
        playClickedAnimation(currentElement.id);
        openWithCode(getFullPath());
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    } else {
      playMessage("No selection");
    }
  } else if (event.key === "Enter" || (event.ctrlKey && event.key === "b")) {
    if (rootPaths.length > 0 && pathArr.length > 1 && currentElement != null) {
      if (delayedLaunch) {
        playClickedAnimation(currentElement.id);
        let path = getFullPath();
        addDelayedLaunchAction(() => openWithBrowser(path));
      } else {
        playMessage("Browser");
        playClickedAnimation(currentElement.id);
        openWithBrowser(getFullPath());
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    } else {
      playMessage("No selection");
    }
  } else if (event.key === " " || (event.ctrlKey && event.key === "o")) {
    if (rootPaths.length > 0 && pathArr.length > 1 && currentElement != null) {
      onClick(
        currentElement.id,
        currentElement.layerIdx,
        currentElement.name,
        currentElement.isFolder,
        currentElement.idx
      );
    } else {
      playMessage("No selection");
    }
  } else if (event.ctrlKey && event.key === "s") {
    sortByIdx = (sortByIdx + 1) % sortTypes.length;
    playMessage("Sort: " + sortTypes[sortByIdx]);
    reSort();
  } else if (event.ctrlKey && event.key === "1") {
    if (sortByIdx !== 0) {
      sortByIdx = 0;
      reSort();
    }
    playMessage("Sort: " + sortTypes[sortByIdx]);
  } else if (event.ctrlKey && event.key === "2") {
    if (sortByIdx !== 1) {
      sortByIdx = 1;
      reSort();
    }
    playMessage("Sort: " + sortTypes[sortByIdx]);
  } else if (event.ctrlKey && event.key === "3") {
    if (sortByIdx !== 2) {
      sortByIdx = 2;
      reSort();
    }
    playMessage("Sort: " + sortTypes[sortByIdx]);
  } else if (event.ctrlKey && event.key === "4") {
    if (sortByIdx !== 3) {
      sortByIdx = 3;
      reSort();
    }
    playMessage("Sort: " + sortTypes[sortByIdx]);
  } else if (event.ctrlKey && event.key === "5") {
    if (sortByIdx !== 4) {
      sortByIdx = 4;
      reSort();
    }
    playMessage("Sort: " + sortTypes[sortByIdx]);
  } else if (event.ctrlKey && event.key === "v") {
    modifyFile("copy");
  } else if (event.ctrlKey && event.key === "m") {
    modifyFile("move");
  } else if (event.ctrlKey && event.key === "Delete") {
    modifyFile("delete");
  } else if (event.ctrlKey && event.key === "n") {
    handleMakeDir();
  } else {
    return false;
  }
  event.preventDefault();
  return true;
}

function handleMakeDir() {
  // let name = prompt("Create folder", "New Folder");
  // if (name != null) {
  //   makeDir(getFullPath(true), name);
  //   playMessage("Created");
  // } else {
  //   playMessage("Canceled");
  // }
}

function modifyFile(operation) {
  if (pathArr.length <= 1 || currentElement == null) {
    playMessage("No selection");
    return;
  }
  let source = getClipboard().replace(/\/$/, "");
  let dest = getFullPath(true);
  console.log("source: " + source);
  console.log("dest: " + dest);

  if (operation === "move") {
    let str = "Move\n" + source + "\nto\n" + dest;
    if (!confirm(str)) {
      playMessage("Canceled");
      return;
    }
    if (moveFile(source, dest)) {
      playMessage("Moved");
    } else {
      playMessage("Failed");
      return;
    }
    if (currentElement.isFolder) {
      refreshCurrentElement();
    } else {
      refreshCurrentParent();
    }
    removeFromView(source);
  } else if (operation === "copy") {
    let str = "Copy\n" + source + "\nto\n" + dest;
    if (!confirm(str)) {
      playMessage("Canceled");
      return;
    }
    if (copyFile(source, dest)) {
      playMessage("Copied");
    } else {
      playMessage("Failed");
      return;
    }
    if (currentElement.isFolder) {
      refreshCurrentElement();
    } else {
      refreshCurrentParent();
    }
  } else if (operation === "delete") {
    let path = getFullPath();
    let str = "Delete\n" + path;
    path = path.replace(/\/$/, "");
    if (!confirm(str)) {
      playMessage("Canceled");
      return;
    }
    if (deleteFile(path)) {
      playMessage("Deleted");
    } else {
      playMessage("Failed");
      return;
    }
    refreshCurrentParent();
  }
}

function reSort() {
  if (pathArr.length <= 1) return;
  if (currentElement.isFolder) {
    refreshCurrentFirstChild();
  }
  refreshCurrentParent();
  let idx = 0;
  let layerIdx = currentElement.layerIdx + 1;
  let elemId = "li-" + layerIdx + "-" + idx;
  let currentList = currentLists[layerIdx - 1];
  onHover(
    elemId,
    layerIdx,
    currentList[idx].name,
    currentList[idx].isFolder,
    idx
  );
  scrollToView(layerIdx, idx);
  removeFocus(-1);
}

function scrollToView(layerIdx, idx) {
  let elemId = "li-" + layerIdx + "-" + idx;
  let top = document.getElementById(elemId).offsetTop;
  document.getElementById("column" + layerIdx).scrollTop = top - 150;
}

function refreshCurrentParent() {
  let layerIdx = currentElement.layerIdx;
  let parentClass = "liFocused" + (layerIdx - 1);
  let parentElem = document.getElementsByClassName(parentClass)[0];
  if (parentElem == null) return;
  onHover(
    parentElem.getAttribute("id"),
    layerIdx - 1,
    parentElem.innerText,
    parentElem.getAttribute("isFolder"),
    parentElem.getAttribute("idx")
  );
}

function refreshCurrentElement() {
  onHover(
    currentElement.id,
    currentElement.layerIdx,
    currentElement.name,
    currentElement.isFolder,
    currentElement.idx
  );
}

function refreshCurrentFirstChild() {
  if (currentElement == null) return;
  let layerIdx = currentElement.layerIdx + 1;
  let elemId = "li-" + layerIdx + "-" + 0;
  let elem = document.getElementById(elemId);
  if (elem == null) return;
  onHover(
    elem.getAttribute("id"),
    layerIdx,
    elem.innerText,
    elem.getAttribute("isFolder"),
    elem.getAttribute("idx")
  );
}

function removeFromView(targetPath) {
  targetPath = targetPath.replace(/\/$/, "");
  let path = "";
  let layerIdx = -1;
  let idx = -1;
  for (let layer = 0; layer < currentLists.length; layer++) {
    let currentList = currentLists[layer];
    for (let i = 0; i < currentList.length; i++) {
      let tmpPath = (path + currentList[i].name).replace(/\/$/, "");
      if (tmpPath === targetPath) {
        layerIdx = layer;
        idx = i;
        break;
      }
    }
    if (layerIdx != -1) break;
    path += pathArr[layer + 1];
  }

  if (layerIdx == -1) return;
  layerIdx++;
  let elemId = "li-" + layerIdx + "-" + idx;
  let elem = document.getElementById(elemId);
  let isFolder = elem.getAttribute("isFolder");
  elem.outerHTML = "";
  let countElemId = "liCount" + layerIdx;
  let countElem = document.getElementsByClassName(countElemId)[0];
  let numFiles = isFolder == true ? 0 : -1,
    numFolders = isFolder == true ? -1 : 0;
  currentLists[layerIdx - 1].forEach((item) => {
    if (item.isFolder) numFolders++;
    else numFiles++;
  });
  countElem.innerHTML = generateCountStr(numFiles, numFolders);
}

function onWindowShow() {
  delayedLaunch = false;
  ignoreFirstE = true;
}
