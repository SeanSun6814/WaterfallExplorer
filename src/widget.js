class Item {
  constructor(layerIdx, idx, id, name, isFolder, stats, parentColumn) {
    this.layerIdx = layerIdx;
    this.idx = idx;
    this.id = id;
    this.name = name;
    this.isFolder = isFolder;
    this.stats = stats;
    this.parentColumn = parentColumn;
    this.html = null;
  }

  generateHTML() {
    let li = document.createElement("li");
    li.innerText = this.name;
    // let argStr =
    //   "'" + this.id + "'," + this.layerIdx + ', "' + this.name + '", ' + this.isFolder + "," + this.idx;
    let argStr = "widget.getItemByIdx(" + this.layerIdx + "," + this.idx + ")";
    li.setAttribute("onmouseenter", "onHover(" + argStr + ")");
    li.setAttribute("onclick", "onClick(" + argStr + ")");
    li.setAttribute("style", "background-color:" + getHsl(this.layerIdx, this.idx) + ";");
    li.setAttribute("id", this.id);
    li.setAttribute("idx", this.idx);
    if (this.isFolder) {
      li.classList.add("liFolder");
    } else {
      li.classList.add("liFile");
    }
    this.html = li;
    return this.html;
  }
}

class Column {
  #layerIdx;
  #data;
  #focusedIdx;
  #selectedIdx;
  #sortByIdx;
  #html;
  #onFocusCallback;
  #onSelectCallback;

  constructor(layerIdx, nameArr, sortByIdx, onFocusCallback, onSelectCallback) {
    this.#layerIdx = layerIdx;
    this.#onFocusCallback = onFocusCallback;
    this.#onSelectCallback = onSelectCallback;
    this.#focusedIdx = -1;
    this.#sortByIdx = sortByIdx;
    this.#selectedIdx = new Set();
    this.#data = this.#toItemArr(nameArr);
    this.#html = this.#generateHTML();
    myColumns.appendChild(this.#html);
  }

  getData() {
    return this.#data;
  }

  getSortedByIdx() {
    return this.#sortByIdx;
  }

  getLayerIdx() {
    return this.#layerIdx;
  }

  getFocusedIdx() {
    return this.#focusedIdx;
  }

  getSelectedIdx() {
    return this.#selectedIdx;
  }

  getItemByIdx(idx) {
    return this.#data[idx];
  }

  getItemByName(name) {
    for (let i = 0; i < this.#data.length; i++) {
      if (this.#data[i].name === name) return this.#data[i];
    }
    return null;
  }

  getItemById(id) {
    for (let i = 0; i < this.#data.length; i++) {
      if (this.#data[i].id === id) return this.#data[i];
    }
    return null;
  }

  focusItem(idx, sortByIdx) {
    if (!idxInBounds(idx, this.#data)) return;
    this.unfocusItem();
    this.#focusedIdx = idx;
    this.#onFocusCallback(this.#data[this.#focusedIdx], true, sortByIdx);
  }

  unfocusItem() {
    if (!idxInBounds(this.#focusedIdx, this.#data)) return;
    let idx = this.#focusedIdx;
    this.#focusedIdx = -1;
    this.#onFocusCallback(this.#data[idx], false);
  }

  selectItem(idx) {
    if (!idxInBounds(idx, this.#data)) return;
    if (this.#selectedIdx.has(idx)) return console.log("Ignoring same select");
    this.#onSelectCallback(this.#data[idx], true);
    this.#selectedIdx.add(idx);
  }

  deselectItem(idx) {
    if (!idxInBounds(idx, this.#data)) return;
    if (!this.#selectedIdx.has(idx)) return console.log("Ignoring same deselect");
    this.#onSelectCallback(this.#data[idx], false);
    this.#selectedIdx.delete(idx);
  }

  selectAll() {
    for (let idx = 0; idx < this.#data.length; idx++) {
      this.#onSelectCallback(this.#data[idx], true);
      this.#selectedIdx.add(idx);
    }
  }

  deselectAll() {
    if (this.#selectedIdx.size === 0) return;
    for (let idx of this.#selectedIdx) {
      this.#onSelectCallback(this.#data[idx], false);
    }
    this.#selectedIdx.clear();
  }

  deleteItem(idx) {
    // todo
  }

  focusPrev() {
    if (this.#focusedIdx > 0) this.#focusedIdx--;
  }

  focusNext() {
    if (this.#focusedIdx < this.#data.length - 1) this.#focusedIdx++;
  }

  scrollToView(idx) {
    if (!idxInBounds(idx, this.#data)) return;
    let top = this.#data[idx].html.offsetTop;
    this.#html.scrollTop = top - 150;
  }

  findWithName(targetChar, startIdx) {
    if (this.#data.length === 0) return -1;
    if (startIdx === undefined) startIdx = this.#focusedIdx;
    // if (!idxInBounds(startIdx, this.#data)) startIdx = -1;
    targetChar = targetChar.toLowerCase();
    for (let i = startIdx + 1; i < startIdx + this.#data.length + 1; i++) {
      let idx = i % this.#data.length;
      let char = this.#data[idx].name.charAt(0);
      if (char.toLowerCase() === targetChar) {
        return idx;
      }
    }
    return -1;
  }

  #toItemArr(nameArr) {
    let res = [];
    for (let i = 0; i < nameArr.length; i++) {
      let elemId = "li-" + this.#layerIdx + "-" + i;
      let item = new Item(
        this.#layerIdx,
        i,
        elemId,
        nameArr[i].name,
        nameArr[i].isFolder,
        nameArr[i].stats,
        this
      );
      item.generateHTML();
      res.push(item);
    }
    return res;
  }

  #generateHTML() {
    let div = document.createElement("div");
    div.setAttribute("onscroll", "onScroll()");
    div.classList.add("myUl");
    let colUl = document.createElement("ul");
    colUl.setAttribute("id", "column" + this.#layerIdx);
    this.#data.forEach((item) => {
      colUl.appendChild(item.html);
    });
    colUl.appendChild(this.#getCountHTML());
    div.appendChild(colUl);
    return div;
  }

  #getCountHTML() {
    let li = document.createElement("li");
    let numFiles = 0;
    let numFolders = 0;
    for (let i = 0; i < this.#data.length; i++) {
      if (this.#data[i].isFolder) numFolders++;
      else numFiles++;
    }
    li.classList.add("liCount" + this.#layerIdx); // todo: handle events better
    // li.setAttribute("onmouseenter", "removeFocus(" + this.#layerIdx + ")");
    li.innerHTML = this.#generateCountStr(numFiles, numFolders);
    return li;
  }

  addEndPadding() {
    this.#html.classList.add("liEndPadding");
    // this.#html.style.width = window.innerWidth * 0.9 + "px";
  }

  removeEndPadding() {
    this.#html.classList.remove("liEndPadding");
    // this.#html.style.width = "auto";
  }

  deleteHTML() {
    this.#html.outerHTML = "";
  }

  #generateCountStr(files, folders) {
    if (files === 0 && folders === 0) {
      return "Empty";
    } else if (files === 0) {
      return folders + " folder" + (folders === 1 ? "" : "s");
    } else if (folders === 0) {
      return files + " file" + (files === 1 ? "" : "s");
    } else {
      return this.#generateCountStr(0, folders) + ", " + this.#generateCountStr(files, 0);
    }
  }
}

class Widget {
  #data;
  constructor(baseColumn) {
    this.#data = [baseColumn];
  }

  getData() {
    return this.#data;
  }

  addColumn(column) {
    // this.deleteExtraColumns(column.getLayerIdx());
    this.#data.push(column);
  }

  getItemByIdx(layerIdx, idx) {
    if (!idxInBounds(layerIdx, this.#data)) return null;
    return this.#data[layerIdx].getItemByIdx(idx);
  }

  getFullPath() {
    let res = "";
    for (let i = 0; i < this.#data.length; i++) {
      let focusedIdx = this.#data[i].getFocusedIdx();
      if (focusedIdx === -1) continue;
      let item = this.#data[i].getItemByIdx(focusedIdx);
      res += item.name;
    }
    return res;
  }

  focusItem(layerIdx, idx, sortByIdx) {
    if (!idxInBounds(layerIdx, this.#data)) return;
    if (sortByIdx === undefined) sortByIdx = config.defaultSortByIdx;
    this.deleteExtraColumns(layerIdx);
    this.#data[layerIdx].focusItem(idx, sortByIdx);
  }

  selectItem(layerIdx, idx) {
    if (!idxInBounds(layerIdx, this.#data)) return;
    this.#data[layerIdx].selectItem(idx);
  }

  deSelectItem(layerIdx, idx) {
    if (!idxInBounds(layerIdx, this.#data)) return;
    this.#data[layerIdx].deSelectItem(idx);
  }

  scrollToView(layerIdx, idx) {
    if (!idxInBounds(layerIdx, this.#data)) return;
    this.#data[layerIdx].scrollToView(idx);
  }

  sortCurrentColumn(method) {
    let elem = this.getLastFocusedItem();
    if (elem == null || elem.layerIdx === 0) return playMessage("Nothing to sort", "error");
    let parentLayerIdx, currentMethod;
    parentLayerIdx = elem.layerIdx - 1;
    currentMethod = this.#data[elem.layerIdx].getSortedByIdx();

    if (!idxInBounds(method, sortTypes)) {
      currentMethod = (currentMethod + 1) % sortTypes.length;
    } else {
      currentMethod = method;
    }
    this.focusItem(parentLayerIdx, this.#data[parentLayerIdx].getFocusedIdx(), currentMethod);
    this.focusItem(elem.layerIdx, 0);
    playMessage("Sorting by " + sortTypes[currentMethod], "info");
  }

  getMaxLayerIdx() {
    return this.#data.length - 1;
  }

  getColumn(layerIdx) {
    return this.#data[layerIdx];
  }

  getLastColumn() {
    return this.#data[this.getMaxLayerIdx()];
  }

  getLastFocusedItem() {
    for (let i = this.#data.length - 1; i >= 0; i--) {
      if (this.#data[i].getFocusedIdx() !== -1)
        return this.#data[i].getItemByIdx(this.#data[i].getFocusedIdx());
    }
    return null;
  }

  deleteExtraColumns(lastLayerIdxToDelete) {
    while (this.#data.length - 1 > lastLayerIdxToDelete) {
      this.#data.pop().deleteHTML();
    }
  }
}
