let config;
let fullPathText;
let myColumns;
let sortTypes = ["default", "name", "time", "type", "size"];
let delayedLaunch = false;
let delayedLaunchActions = [];
let ignoreFirstE = false;
let widget;

function getHTMLStatsList(str, layerIdx) {
  //to fix
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

window.onload = function () {
  myColumns = document.getElementById("myColumns");
  fullPathText = document.getElementById("fullPathText");
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
  playMessage("Opening");
  playClickedAnimation(item.id);
  openFile(widget.getFullPath());
  setTimeout(() => {
    window.close();
  }, 1000);
}

function onWindowShow() {
  delayedLaunch = false;
  ignoreFirstE = true;
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
  if (!lastFocusedItem.isFolder) {
    widget.focusItem(lastFocusedItem.layerIdx, lastFocusedItem.idx);
  }
}

function onPathScroll(e) {
  let scroll = e.deltaX + e.deltaY;
  myColumns.scrollLeft += scroll;
}
