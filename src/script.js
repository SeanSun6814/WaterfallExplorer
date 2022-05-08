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

window.onload = function () {
  myColumns = document.getElementById("myColumns");
  fullPathText = document.getElementById("fullPathText");
  myColumns.innerHTML = "";
  fullPathText.addEventListener("wheel", onPathScroll);
  config = readConfigFile();
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

function onHorizontalScroll() {
  let lastFocusedItem = widget.getLastFocusedItem();
  if (lastFocusedItem != null && !lastFocusedItem.isFolder) {
    widget.focusItem(lastFocusedItem.layerIdx, lastFocusedItem.idx);
  }
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
