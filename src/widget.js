class Item {
  constructor(layerIdx, idx, id, name, isFolder, stats, parentColumn) {
    this.layerIdx = layerIdx;
    this.idx = idx;
    this.id = id;
    this.name = name;
    this.isFolder = isFolder;
    this.stats = stats;
    this.parentColumn = parentColumn;
    this.htmlObj = null;
  }

  generateHTML() {
    let li = document.createElement("li");
    li.innerText = this.name;
    let argStr =
      "'" + this.id + "'," + this.layerIdx + ', "' + this.name + '", ' + this.isFolder + "," + this.idx;
    li.setAttribute("onmouseenter", "onHover(" + argStr + ")");
    li.setAttribute("onclick", "onClick(" + argStr + ")");
    li.setAttribute("style", "background-color:" + getHsl(layerIdx, idx) + ";");
    li.setAttribute("id", id);
    li.setAttribute("idx", idx);
    if (this.isFolder) {
      li.classList.add("liFolder");
    } else {
      li.classList.add("liFile");
    }
    this.htmlObj = li;
    return this.htmlObj;
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
    // if (idx === this.#focusedIdx) return console.log("Ignoring same focus");
    unfocusItem();
    this.#onFocusCallback(this.#data[idx], true, sortByIdx);
    this.#focusedIdx = idx;
  }

  unfocusItem() {
    if (!idxInBounds(this.#focusedIdx, this.#data)) return;
    this.#onFocusCallback(this.#data[this.#focusedIdx], false);
    this.#focusedIdx = -1;
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

  deleteItem(idx) {}

  focusPrev() {
    if (this.#focusedIdx > 0) this.#focusedIdx--;
  }

  focusNext() {
    if (this.#focusedIdx < this.#data.length - 1) this.#focusedIdx++;
  }

  #toItemArr(nameArr) {
    let res = [];
    for (let i = 0; i < nameArr.length; i++) {
      let elemId = "li-" + this.#layerIdx + "-" + idx;
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
    let colUl = document.createElement("ul");
    colUl.setAttribute("id", "column" + this.#layerIdx);
    this.#data.forEach((item) => {
      colUl.appendChild(item);
    });
    colUl.appendChild(this.#getCountHTML());
  }

  #getCountHTML() {
    let li = document.createElement("li");
    li.classList.add("liCount" + this.#layerIdx); // todo: handle events better
    li.setAttribute("onmouseenter", "removeFocus(" + this.#layerIdx + ")");
    li.innerHTML = this.#generateCountStr(numFiles, numFolders);
    return li;
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
  #defaultSortByIdx;
  constructor(defaultSortByIdx) {
    this.#data = [];
    this.#defaultSortByIdx = defaultSortByIdx;
  }

  getFullPath() {
    let res = "";
    for (let i = 0; i < this.#data.length; i++) {
      let focusedIdx = this.#data[i].getFocusedIdx;
      let item = this.#data[i].getItemByIdx(focusedIdx);
      res += item.name;
    }
    return res;
  }

  focusItem(layerIdx, idx, sortByIdx) {
    if (!idxInBounds(layerIdx, this.#data)) return;
    if (sortByIdx === undefined) sortByIdx = this.#defaultSortByIdx;
    deleteExtraColumns(layerIdx);
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

  sortCurrentColumn(method) {
    let elem = this.getLastFocusedItem();
    if (elem == null) return;
    let parentLayerIdx, currentMethod;
    if (elem.isFolder) {
      parentLayerIdx = elem.layerIdx;
      currentMethod = this.#data[parentLayerIdx + 1].getSortedByIdx();
    } else {
      parentLayerIdx = elem.layerIdx - 1;
      currentMethod = this.#data[parentLayerIdx].getSortedByIdx();
    }

    if (!idxInBounds(method, sortTypes)) {
      currentMethod = (currentMethod + 1) % sortTypes.length;
    } else {
      currentMethod = method;
    }
    this.#data[parentLayerIdx].focusItem(idx, currentMethod);
  }

  getMaxLayerIdx() {
    return this.#data.length - 1;
  }

  getLastFocusedItem() {
    for (let i = this.#data.length - 1; i >= 0; i--) {
      if (this.#data[i].getFocusedIdx() !== -1)
        return this.#data[i].getItemByIdx(this.#data[i].getFocusedIdx());
    }
    return null;
  }

  deleteExtraColumns(lastLayerIdxToKeep) {
    while (this.#data.length - 1 > lastLayerIdxToKeep) {
      this.#data.pop().deleteHTML();
    }
  }
}
