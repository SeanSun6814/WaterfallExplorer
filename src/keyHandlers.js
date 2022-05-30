document.addEventListener("keydown", function onPress(event) {
  if (alertBlockKeyPress) {
    return;
  } else if (event.ctrlKey && event.key === "a") {
    event.preventDefault();
  } else if (event.ctrlKey && event.key === "r") {
    event.preventDefault();
    event.stopPropagation();
  } else if (
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.key === "Tab" ||
    event.key === "Backspace"
  ) {
    handleKeyboardNavigation(event.key);
    event.preventDefault();
  } else {
    console.log(event.key);
  }
});

function handleKeyboardNavigation(direction) {
  let lastElem = widget.getLastFocusedItem();
  if (lastElem == null) {
    widget.focusItem(0, 0);
  } else if (direction === "ArrowUp") {
    widget.focusItem(lastElem.layerIdx, lastElem.idx - 1);
    let newLastElem = widget.getLastFocusedItem();
    newLastElem.parentColumn.scrollToView(newLastElem.idx);
  } else if (direction === "ArrowDown") {
    widget.focusItem(lastElem.layerIdx, lastElem.idx + 1);
    let newLastElem = widget.getLastFocusedItem();
    newLastElem.parentColumn.scrollToView(newLastElem.idx);
  } else if ((direction === "Tab" || direction === "ArrowRight") && lastElem.isFolder) {
    widget.focusItem(lastElem.layerIdx + 1, 0);
    onPathHover();
  } else if ((direction === "Backspace" || direction === "ArrowLeft") && lastElem.layerIdx > 0) {
    let parentColumn = widget.getColumn(lastElem.layerIdx - 1);
    let parentElemIdx = parentColumn.getFocusedIdx();
    widget.focusItem(lastElem.layerIdx - 1, parentElemIdx);
    onPathHover();
  }
}

document.addEventListener("keyup", function onPress(event) {
  if (alertBlockKeyPress) {
    return;
  } else if (ignoreFirstE && event.key === "e") {
    ignoreFirstE = false;
    event.preventDefault();
    return;
  } else if (ignoreFirstEnter && event.key === "Enter") {
    ignoreFirstEnter = false;
    event.preventDefault();
    return;
  } else if (event.key === "Alt" || event.altKey) {
    event.preventDefault();
    return;
  } else if (event.ctrlKey && event.key === "r") {
    event.preventDefault();
    event.stopPropagation();
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
  if (!isPrintableStr(targetChar) || targetChar.length > 1) return false;
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
  str = str.replaceAll(/\/$/g, "");
  str += "/";
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
      sendCommand(cmdStrFunction(path, lastElem.isFolder));
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
    handleOpenWith(openWithCodeCommandStr, "Open in VS Code");
  } else if (event.key === "Enter") {
    handleOpenWith(openWithBrowserCommandStr, "Open in Chrome");
  } else if (event.key === " ") {
    handleOpenWith(openFileCommandStr, "Open item");
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
  } else if (event.ctrlKey && event.key === "v") {
    handleCopyFile();
  } else if (event.ctrlKey && event.key === "m") {
    handleMoveFile();
  } else if (event.ctrlKey && event.key === "Delete") {
    handleDeleteFile();
  } else if (event.ctrlKey && event.key === "n") {
    handleMakeDir();
  } else if (event.ctrlKey && event.key === "r") {
    handleRenameFile();
  } else if (event.ctrlKey && event.key === "h") {
    openHelpDialogue();
  } else if (event.ctrlKey && event.key === "l") {
    handleRunOnStartUp();
  } else if (event.ctrlKey && event.key === "t") {
    handleColorTheme();
  } else if (event.ctrlKey && event.key === ",") {
    handleSettings();
  } else {
    return false;
  }
  event.preventDefault();
  return true;
}

function handleMakeDir() {
  let dest = widget.getFullDirectory();
  let lastElem = widget.getLastFocusedItem();
  let str =
    "'<b>newFile.txt</b>' to create new file<br>" +
    // "<br>or<br>" +
    "'<b>newFolder/</b>' to create new folder<br>" +
    // "<br>or<br>" +
    "'<b>newFolder/anotherFolder/newFile.txt</b>' to create both";

  alertBlockKeyPress = true;
  Swal.fire({
    title: "Create item?",
    input: "text",
    icon: "warning",
    html: str,
    inputValue: "",
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: "Create",
    confirmButtonColor: "#c6323b",
    didOpen: (swalElem) => {
      swalSetIgnoreEnter(swalElem);
    },
    preConfirm: (value) => {
      value = value.trim().replaceAll("\\", "/");
      if (value && value !== "") {
        let tokens = value.split("/");
        let createFile = tokens[tokens.length - 1] !== "";
        let pathStr = value.substring(0, value.lastIndexOf("/") + 1);
        let createPath = pathStr !== "";
        // console.log("create file: " + createFile + ", folder: " + createPath);

        let createError;
        if (createFile && createPath && makeDir(dest, pathStr) && makeFile(dest + value)) {
          createError = false;
          playMessage("Items created", "success");
        } else if (createPath && makeDir(dest, pathStr)) {
          createError = false;
          playMessage("Folder created", "success");
        } else if (createFile && makeFile(dest + value)) {
          createError = false;
          playMessage("File created", "success");
        } else {
          createError = true;
          playMessage("Create failed", "error");
        }

        if (!createError) {
          let parentColumn = widget.getColumn(lastElem.layerIdx - (lastElem.isFolder ? 0 : 1));
          let parentElemIdx = parentColumn.getFocusedIdx();
          widget.focusItem(parentColumn.getLayerIdx(), parentElemIdx);
        }
      } else {
        playMessage("Create canceled", "info");
      }
    },
  }).then((result) => {
    alertBlockKeyPress = false;
    if (!result.isConfirmed) {
      playMessage("Create canceled", "info");
    }
  });
  fixSweetAlertAlignmentBug();
}

function handleColorTheme() {
  if (config.colorTheme === "light") {
    config.colorTheme = "dark";
  } else {
    config.colorTheme = "light";
  }
  writeConfig();
  window.onload();
}

function handleSettings() {
  playMessage("Opening settings file ", "success");
  sendCommand(openFileCommandStr(appPath + "config.json", false));
}

function handleRunOnStartUp() {
  config.autoLaunch = !config.autoLaunch;
  setAutoLaunch(config.autoLaunch);
  writeConfig();
  playMessage("Run on startup: " + (config.autoLaunch ? "enabled" : "disabled"), "success");
}

function handleRenameFile() {
  let lastElem = widget.getLastFocusedItem();
  let parentPath = widget.getFullPathUpTo(lastElem.layerIdx - 1);

  alertBlockKeyPress = true;
  Swal.fire({
    title: "Rename item?",
    input: "text",
    icon: "warning",
    inputLabel: parentPath + lastElem.name,
    inputValue: lastElem.name,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: "Rename",
    confirmButtonColor: "#c6323b",
    didOpen: (swalElem) => {
      swalSetIgnoreEnter(swalElem);
      let input = document.getElementById("swal2-input");
      input.focus();
      if (lastElem.isFolder) {
        input.setSelectionRange(0, lastElem.name.lastIndexOf("/"));
      } else {
        input.setSelectionRange(0, lastElem.name.lastIndexOf("."));
      }
    },
    preConfirm: (value) => {
      if (value && value !== "") {
        if (renameFile(parentPath + lastElem.name, parentPath + value)) {
          let parentColumn = widget.getColumn(lastElem.layerIdx - 1);
          let parentElemIdx = parentColumn.getFocusedIdx();
          widget.focusItem(lastElem.layerIdx - 1, parentElemIdx);
          playMessage("Item renamed", "success");
        } else {
          playMessage("Rename failed", "error");
        }
      } else {
        playMessage("Rename canceled", "info");
      }
    },
  }).then((result) => {
    alertBlockKeyPress = false;
    if (!result.isConfirmed) {
      playMessage("Rename canceled", "info");
    }
  });
  fixSweetAlertAlignmentBug();
}

function handleMoveFile() {
  let source = sanitizePath(getClipboard()).replace(/\/$/, "");
  let dest = widget.getFullDirectory();
  let lastElem = widget.getLastFocusedItem();
  let str = source + "<br>-><br>" + dest;

  alertBlockKeyPress = true;
  Swal.fire({
    title: "Move item?",
    html: str,
    icon: "warning",
    showCancelButton: true,
    showDenyButton: true,
    showConfirmButton: false,
    reverseButtons: true,
    focusDeny: true,
    denyButtonText: "Move",
    cancelButtonText: "Cancel",
    didOpen: swalSetIgnoreEnter,
  }).then((result) => {
    alertBlockKeyPress = false;
    if (result.isDenied) {
      if (moveFile(source, dest)) {
        if (lastElem.isFolder) {
          widget.focusItem(lastElem.layerIdx, lastElem.idx);
        } else {
          let parentColumn = widget.getColumn(lastElem.layerIdx - 1);
          let parentElemIdx = parentColumn.getFocusedIdx();
          widget.focusItem(lastElem.layerIdx - 1, parentElemIdx);
        }
        widget.removeItemByPath(source);
        playMessage("Item moved", "success");
      } else {
        playMessage("Move failed", "error");
      }
    } else {
      playMessage("Move canceled", "info");
    }
  });
  fixSweetAlertAlignmentBug();
}

function handleCopyFile() {
  let source = sanitizePath(getClipboard()).replace(/\/$/, "");
  let dest = widget.getFullDirectory();
  let lastElem = widget.getLastFocusedItem();
  let str = source + "<br>-><br>" + dest;

  alertBlockKeyPress = true;
  Swal.fire({
    title: "Copy item?",
    html: str,
    icon: "warning",
    showCancelButton: true,
    showDenyButton: true,
    showConfirmButton: false,
    reverseButtons: true,
    focusDeny: true,
    denyButtonText: "Copy",
    cancelButtonText: "Cancel",
    didOpen: swalSetIgnoreEnter,
  }).then((result) => {
    alertBlockKeyPress = false;
    if (result.isDenied) {
      if (copyFile(source, dest)) {
        if (lastElem.isFolder) {
          widget.focusItem(lastElem.layerIdx, lastElem.idx);
        } else {
          let parentColumn = widget.getColumn(lastElem.layerIdx - 1);
          let parentElemIdx = parentColumn.getFocusedIdx();
          widget.focusItem(lastElem.layerIdx - 1, parentElemIdx);
        }
        playMessage("Item copied", "success");
      } else {
        playMessage("Copy failed", "error");
      }
    } else {
      playMessage("Copy canceled", "info");
    }
  });
  fixSweetAlertAlignmentBug();
}

function handleDeleteFile(operation) {
  let path = widget.getFullPath().replace(/\/$/, "");
  let lastElem = widget.getLastFocusedItem();

  alertBlockKeyPress = true;
  Swal.fire({
    title: "Delete item?",
    html: path,
    icon: "warning",
    showCancelButton: true,
    showDenyButton: true,
    showConfirmButton: false,
    reverseButtons: true,
    focusDeny: true,
    denyButtonText: "Delete permanently",
    cancelButtonText: "Cancel",
    didOpen: swalSetIgnoreEnter,
  }).then((result) => {
    alertBlockKeyPress = false;
    if (result.isDenied) {
      if (deleteFile(path)) {
        let parentColumn = widget.getColumn(lastElem.layerIdx - 1);
        let parentElemIdx = parentColumn.getFocusedIdx();
        widget.focusItem(lastElem.layerIdx - 1, parentElemIdx);
        playMessage("Item deleted", "success");
      } else {
        playMessage("Delete failed", "error");
      }
    } else {
      playMessage("Delete canceled", "info");
    }
  });
  fixSweetAlertAlignmentBug();
}

function openWelcomeDialogue(callback) {
  alertBlockKeyPress = true;
  Swal.fire(
    "<big>Welcome</big>",
    "<big>Waterfall Explorer has been successfully installed and is set to autorun on system startup.</big><br><br>" +
      "<big>At Waterfall Explorer, we strive to make finding files an easy and enjoyable experience.</big><br><br>" +
      "<big>Here are a few hints to get you started...</big>",
    "success"
  ).then((result) => {
    alertBlockKeyPress = false;
    callback();
  });
  fixSweetAlertAlignmentBug();
}

function openConfigErrorDialogue() {
  alertBlockKeyPress = true;
  Swal.fire(
    "<big>Error in config file</big>",
    "<big>Oops... There's an error in the config file.</big><br><br>" +
      "<big>Please fix it and come back again.</big><br><br>" +
      "<big>For a fresh start, delete the config file.</big>",
    "error"
  ).then((result) => {
    alertBlockKeyPress = false;
    quitApp();
  });
  fixSweetAlertAlignmentBug();
}

function openHelpDialogue() {
  alertBlockKeyPress = true;
  Swal.fire(
    "Help",
    "<b>Show this page:</b> Ctrl + H<br>" +
      "<b>Show app:</b> Alt + E<br>" +
      "<b>Hide app:</b> Esc<br>" +
      "<b>Quit app:</b> Ctrl + Q<br>" +
      "<b>Fullscreen:</b> Ctrl + F<br>" +
      "<b>Open:</b> Click, Space<br>" +
      "<b>Open in Chrome:</b> Enter<br>" +
      "<b>Open in VS Code:</b> Ctrl + Enter<br>" +
      "<b>Copy path:</b> Ctrl + C<br>" +
      "<b>Sort:</b> Ctrl + [S, 1, 2, 3, 4, 5]<br>" +
      "<b>Add to root paths:</b> Ctrl + C then Ctrl + A<br>" +
      "<b>Remove from root paths:</b> Delete<br>" +
      "<b>Copy file:</b> Ctrl + C then Ctrl + V<br>" +
      "<b>Move file:</b> Ctrl + C then Ctrl + M<br>" +
      "<b>Rename file:</b> Ctrl + R<br>" +
      "<b>Delete file:</b> Ctrl + Delete <br>" +
      "<b>Goto:</b> [any char]<br>" +
      "<b>Delayed open mode:</b> Ctrl + D<br>" +
      "<b>Auto scroll:</b> mouse hover over path<br>" +
      "<b>Settings:</b> Ctrl + ,<br>" +
      "<b>Change color theme:</b> Ctrl + T<br>" +
      "<b>Run on startup:</b> Ctrl + L",
    "question"
  ).then((result) => {
    alertBlockKeyPress = false;
  });
  fixSweetAlertAlignmentBug();
}

function attachContextMenu(html, isFile, isFolder, isRootColumn) {
  if (myMenu != null) myMenu.delete();

  let menuItems = [
    {
      content: "Open",
      events: {
        click: (e) => {
          handleOpenWith(openFileCommandStr, "Opening");
        },
      },
    },
    {
      content: "Open in Chrome",
      events: {
        click: (e) => {
          handleOpenWith(openWithBrowserCommandStr, "Browser");
        },
      },
    },
    {
      content: "Open in VS Code",
      events: {
        click: (e) => {
          handleOpenWith(openWithCodeCommandStr, "VS Code");
        },
      },
    },
    {
      content: "Copy",
      divider: "top",
      events: {
        click: (e) => {
          setClipboard(widget.getFullPath());
          playMessage("Path copied to clipboard", "success");
        },
      },
    },
    {
      content: "Paste here",
      events: {
        click: (e) => {
          handleCopyFile();
        },
      },
    },
    {
      content: "Move here",
      events: {
        click: (e) => {
          handleMoveFile();
        },
      },
    },
    {
      content: "Create item",
      events: {
        click: (e) => {
          handleMakeDir();
        },
      },
    },
  ];

  if (isFile || isFolder) {
    menuItems.push(
      {
        content: "Rename",
        events: {
          click: (e) => {
            handleRenameFile();
          },
        },
      },
      {
        content: "Delete",
        events: {
          click: (e) => {
            handleDeleteFile();
          },
        },
      },
      {
        content: "Sort by default",
        divider: "top",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(0);
          },
        },
      },
      {
        content: "Sort by name",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(1);
          },
        },
      },
      {
        content: "Sort by time",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(2);
          },
        },
      },
      {
        content: "Sort by type",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(3);
          },
        },
      },
      {
        content: "Sort by size",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(4);
          },
        },
      }
    );
  }

  if (isFolder) {
    menuItems.push({
      content: "Add to root paths",
      divider: "top",
      events: {
        click: (e) => {
          setClipboard(widget.getFullPath());
          addToRootPaths();
        },
      },
    });
  }

  if (isRootColumn) {
    menuItems.push({
      content: "Remove from root paths",
      divider: "top",
      events: {
        click: (e) => {
          removeFromRootPaths();
        },
      },
    });
  }

  let menu = new ContextMenu({
    targetNode: html,
    mode: config.colorTheme,
    menuItems,
  });

  menu.init();
  myMenu = menu;
  return menu;
}

function attachGeneralContextMenu(html) {
  if (myMenu != null) myMenu.delete();

  let menuItems = [
    {
      content: "Help",
      events: {
        click: (e) => {
          openHelpDialogue();
        },
      },
    },
    {
      content: "Settings",
      divider: "top",
      events: {
        click: (e) => {
          handleSettings();
        },
      },
    },
    {
      content: "Change color theme",
      events: {
        click: (e) => {
          handleColorTheme();
        },
      },
    },
    {
      content: "Change run on startup",
      events: {
        click: (e) => {
          handleRunOnStartUp();
        },
      },
    },
    {
      content: "Quit",
      divider: "top",
      events: {
        click: (e) => {
          quitApp();
        },
      },
    },
  ];

  let menu = new ContextMenu({
    targetNode: html,
    mode: config.colorTheme,
    menuItems,
  });
  menu.init();
  myMenu = menu;
  return menu;
}

function fixSweetAlertAlignmentBug() {
  document.body.classList.remove("swal2-height-auto");
}

let swalSetIgnoreEnter = (swalElem) => {
  swalElem.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      ignoreFirstEnter = true;
    }
  });
};
