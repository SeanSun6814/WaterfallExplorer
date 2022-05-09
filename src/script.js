const Swal = require("sweetalert2");
let config;
let fullPathText;
let myColumns;
let sortTypes = ["default", "name", "time", "type", "size"];
let delayedLaunch = false;
let delayedLaunchActions = [];
let ignoreFirstE = false;
let alertBlockKeyPress = false;
let widget;
let appPath;
let myMenu;

window.onload = function () {
  appPath = sanitizePath(__dirname);
  appPath = appPath.substring(0, appPath.length - 4);
  myColumns = document.getElementById("myColumns");
  fullPathText = document.getElementById("fullPathText");
  myColumns.innerHTML = "";
  fullPathText.innerHTML = "Waterfall Explorer";
  fullPathText.addEventListener("wheel", onPathScroll);
  config = readConfigFile();
  if (config === false) {
    config = createDefaultConfig();
    writeConfig();
    window.onload();
    showWindow();
    openWelcomeDialogue(() => {
      openHelpDialogue();
    });
    return;
  }
  changeTheme();
  setAutoLaunch(config.autoLaunch);
  let rootPaths = getDirAndFiles("");
  let baseColumn = new Column(0, rootPaths, 0, onItemFocus, onItemSelect);
  widget = new Widget(baseColumn);
};

function onHover(item) {
  widget.focusItem(item.layerIdx, item.idx);
}

function onClick(item) {
  handleOpenWith(openFileCommandStr, "Opening");
}

function onWindowShow() {
  ignoreFirstE = true;
  delayedLaunch = false;
  delayedLaunchActions = [];
}

function onItemFocus(item, isFocused, sortByIdx) {
  if (isFocused) addItemFocus(item, sortByIdx);
  else removeItemFocus(item);
}

function addItemFocus(item, sortByIdx) {
  item.html.classList.add("liFocused");
  let fullPath = widget.getFullPath();
  fullPathText.innerHTML = fullPath;
  deleteStatElem();
  if (myMenu != null) myMenu.delete();
  if (item.layerIdx > 0) {
    myMenu = attachContextMenu(item.html, !item.isFolder, item.isFolder);
  } else {
    myMenu = attachContextMenu(item.html, false, false, true);
  }
  if (item.isFolder) {
    let arr = getDirAndFiles(fullPath);
    arr = sortDirBy(arr, sortTypes[sortByIdx]);
    let column = new Column(item.layerIdx + 1, arr, sortByIdx, onItemFocus, onItemSelect);
    widget.getLastColumn().removeEndPadding();
    column.addEndPadding();
    widget.addColumn(column);
  } else {
    widget.getLastColumn().addEndPadding();
    createStatElem(item);
  }
}

function removeItemFocus(item) {
  item.html.classList.remove("liFocused");
}

function onItemSelect(item, isSelected) {
  console.log("item select is called!");
}

function onScroll() {
  refreshStatsElemLocation();
}

function onHorizontalScroll() {
  refreshStatsElemLocation();
}

function onPathScroll(e) {
  let scroll = e.deltaX + e.deltaY;
  myColumns.scrollLeft += scroll;
}

function onPathHover() {
  let item = widget.getLastFocusedItem();
  if (item != null) {
    myColumns.scrollLeft = item.html.offsetLeft - window.innerWidth * 0.5;
  }
}
function attachContextMenu(html, isFile, isFolder, isRootColumn) {
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
      content: "Paste",
      events: {
        click: (e) => {
          handleCopyFile();
        },
      },
    },
    {
      content: "Move",
      events: {
        click: (e) => {
          handleMoveFile();
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
  ];

  if (isFile || isFolder) {
    menuItems.push(
      {
        content: "Sort: default",
        divider: "top",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(0);
          },
        },
      },
      {
        content: "Sort: name",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(1);
          },
        },
      },
      {
        content: "Sort: time",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(2);
          },
        },
      },
      {
        content: "Sort: type",
        events: {
          click: (e) => {
            widget.sortCurrentColumn(3);
          },
        },
      },
      {
        content: "Sort: size",
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

  let myMenu = new ContextMenu({
    targetNode: html,
    mode: config.colorTheme,
    menuItems,
  });

  myMenu.init();
  return myMenu;
}
