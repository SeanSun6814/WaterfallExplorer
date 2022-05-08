document.addEventListener("keydown", function onPress(event) {
  if (alertBlockKeyPress) {
    return;
  } else if (event.ctrlKey && event.key === "a") {
    event.preventDefault();
  }
});

document.addEventListener("keyup", function onPress(event) {
  if (alertBlockKeyPress) {
    return;
  } else if (ignoreFirstE && event.key === "e") {
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
    let item = column.getItemByIdx(elemIdx);
    column.scrollToView(elemIdx);
    playClickedAnimation(item.html);
    playMessage("Search " + targetChar, "success");
    widget.focusItem(item.layerIdx, item.idx);
  } else {
    playMessage(targetChar + " not found", "error");
  }
  return true;
}

function addToRootPaths() {
  let str = getClipboard();
  str = sanitizePath(str);
  if (config.paths.includes(str)) {
    playMessage("Root path already exists", "error");
  } else {
    config.paths.push(str);
    writeConfig();
    window.onload();
    playMessage("Root path added", "success");
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
      playMessage((delayedLaunch ? "Delayed" : "Normal") + " Opening Mode", "info");
    } else {
      launchDelayedLaunch();
    }
  } else {
    delayedLaunch = true;
    playMessage((delayedLaunch ? "Delayed" : "Normal") + " Opening Mode", "info");
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
    playMessage("Root path removed", "success");
  } else {
    playMessage("No root path selected", "error");
  }
}

function handleOpenWith(cmdStrFunction, msg) {
  let lastElem = widget.getLastFocusedItem();
  if (lastElem != null) {
    let path = widget.getFullPath();
    playClickedAnimation(lastElem.html);
    if (delayedLaunch) {
      addDelayedLaunchAction(cmdStrFunction(path));
    } else {
      playMessage(msg, "success");
      console.log("path is: " + cmdStrFunction(path));
      sendCommand(cmdStrFunction(path));
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  } else {
    playMessage("No item selected", "error");
  }
}

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
    playMessage("Path copied to clipboard", "success");
  } else if (event.ctrlKey && event.key === "a") {
    addToRootPaths();
  } else if (!event.ctrlKey && event.key === "Delete") {
    removeFromRootPaths();
  } else if (event.ctrlKey && event.key === "Enter") {
    handleOpenWith(openWithCodeCommandStr, "VS Code");
  } else if (event.key === "Enter") {
    handleOpenWith(openWithBrowserCommandStr, "Browser");
  } else if (event.key === " ") {
    handleOpenWith(openFileCommandStr, "Opening");
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
    // alert("Help!");
    alertBlockKeyPress = true;
    Swal.fire(
      "Help",
      "<b>Help:</b> Ctrl + h<br><b>Open:</b> Click, Space<br><b>Open in Chrome:</b> Enter<br><b>Open in VS Code:</b> Ctrl + Enter<br><b>Sort:</b> Ctrl + [s, 1, 2, 3, 4, 5]\n",
      "question"
    ).then((result) => {
      alertBlockKeyPress = false;
    });
  } else {
    return false;
  }
  event.preventDefault();
  return true;
}
