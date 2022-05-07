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

function handleFunctionKeys(event) {
  return false;
  if (event.ctrlKey && event.key === "d") {
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
  } else if (event.ctrlKey && event.key === "c") {
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
  } else if ((event.ctrlKey && event.key === "Enter") || (event.ctrlKey && event.key === "e")) {
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
