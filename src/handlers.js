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
      event.key === "Escape"
    ) {
      return;
    }
    if (!findWithName(event.key)) {
      event.preventDefault();
    }
  }
});

function findWithName(targetChar) {
  if (!isPrintableStr(targetChar)) return false;
  let column = widget.getLastColumn();
  let lastElem = widget.getLastFocusedItem();
  if (lastElem != null) {
    column = widget.getColumn(lastElem.layerIdx);
  }
  let elemIdx = column.findWithName(targetChar);
  if (elemIdx >= 0) {
    console.log("found at idx" + elemIdx);
    let item = column.getItemByIdx(elemIdx);
    column.scrollToView(elemIdx);
    playClickedAnimation(item.html);
    playMessage("Find " + targetChar);
    widget.focusItem(item.layerIdx, item.idx);
  } else {
    playMessage(targetChar + " not found");
  }
  return true;
}

function addToRootPaths() {
  let str = getClipboard();
  str = sanitizePath(str);
  if (config.paths.includes(str)) {
    playMessage("Already exists");
  } else {
    config.paths.push(str);
    writeConfig();
    window.onload();
    playMessage("Added");
  }
}

function sanitizePath(str) {
  str = str.trim();
  str = str.replaceAll("\\", "/");
  str = str.replaceAll('"', "");
  // str = str.replaceAll(/\/$/g, "");
  return str;
}

function handleDelayedLaunch() {
  if (delayedLaunch) {
    delayedLaunch = false;
    if (delayedLaunchActions.length === 0) {
      playMessage((delayedLaunch ? "Delayed" : "Normal") + " Launch");
    } else {
      launchDelayedLaunch();
    }
  } else {
    delayedLaunch = true;
    playMessage((delayedLaunch ? "Delayed" : "Normal") + " Launch");
  }
}

function removeFromRootPaths() {
  let lastElem = widget.getLastFocusedItem();
  if (lastElem != null && lastElem.layerIdx === 0) {
    let index = config.paths.indexOf(lastElem.name);
    if (index !== -1) {
      config.paths.splice(index, 1);
    }
    writeConfig();
    window.onload();
    playMessage("Removed");
  } else {
    playMessage("No selection");
  }
}

function handleOpenWith(openFunction, msg) {
  let lastElem = widget.getLastFocusedItem();
  if (lastElem != null) {
    let path = widget.getFullPath();
    playClickedAnimation(lastElem.html);
    if (delayedLaunch) {
      addDelayedLaunchAction(() => openFunction(path));
    } else {
      playMessage(msg);
      openFunction(path);
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  } else {
    playMessage("No selection");
  }
}

// function handleOpenWithBrowser() {
//   let lastElem = widget.getLastFocusedItem();
//   if (lastElem != null) {
//     let path = widget.getFullPath();
//     if (delayedLaunch) {
//       playClickedAnimation(lastElem.html);
//       addDelayedLaunchAction(() => openWithBrowser(path));
//     } else {
//       playMessage("Browser");
//       playClickedAnimation(lastElem.html);
//       openWithBrowser(path);
//       setTimeout(() => {
//         window.close();
//       }, 1000);
//     }
//   } else {
//     playMessage("No selection");
//   }
// }

function handleSort(method) {
  let elem = widget.getLastFocusedItem();
  if (elem != null) {
    let column = elem.parentColumn;
    let lastElem = column;
  }
}

function handleFunctionKeys(event) {
  if (event.ctrlKey && event.key === "d") {
    handleDelayedLaunch();
  } else if (event.ctrlKey && event.key === "c") {
    setClipboard(widget.getFullPath());
    playMessage("Copied");
  } else if (event.ctrlKey && event.key === "a") {
    addToRootPaths();
  } else if (!event.ctrlKey && event.key === "Delete") {
    removeFromRootPaths();
  } else if ((event.ctrlKey && event.key === "Enter") || (event.ctrlKey && event.key === "e")) {
    handleOpenWith(openWithCode, "VS Code");
  } else if (event.key === "Enter" || (event.ctrlKey && event.key === "b")) {
    handleOpenWith(openWithBrowser, "Browser");
  } else if (event.key === " " || (event.ctrlKey && event.key === "o")) {
    handleOpenWith(openFile, "Opening");
  } else if (event.ctrlKey && event.key === "s") {
    widget.sortCurrentColumn(-1);
  } else if (event.ctrlKey && event.key === "1") {
    widget.sortCurrentColumn(0);
  } else if (event.ctrlKey && event.key === "2") {
    widget.sortCurrentColumn(1);
  } else if (event.ctrlKey && event.key === "3") {
    widget.sortCurrentColumn(2);
  } else if (event.ctrlKey && event.key === "4") {
    widget.sortCurrentColumn(3);
  } else if (event.ctrlKey && event.key === "5") {
    widget.sortCurrentColumn(4);
    // } else if (event.ctrlKey && event.key === "v") {
    //   modifyFile("copy");
    // } else if (event.ctrlKey && event.key === "m") {
    //   modifyFile("move");
    // } else if (event.ctrlKey && event.key === "Delete") {
    //   modifyFile("delete");
    // } else if (event.ctrlKey && event.key === "n") {
    //   handleMakeDir();
  } else if (event.ctrlKey && event.key === "h") {
    alert("Help!");
  } else {
    return false;
  }
  event.preventDefault();
  return true;
}
