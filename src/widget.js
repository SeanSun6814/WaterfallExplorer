class Item {
  constructor(layerIdx, idx, id, name, isFolder, parentColumn) {
    this.layerIdx = layerIdx;
    this.idx = idx;
    this.id = id;
    this.name = name;
    this.isFolder = isFolder;
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
  #html;
  #onFocusCallback;
  #onSelectCallback;

  constructor(layerIdx, nameArr, onFocusCallback, onSelectCallback) {
    this.#layerIdx = layerIdx;
    this.#onFocusCallback = onFocusCallback;
    this.#onSelectCallback = onSelectCallback;
    this.#focusedIdx = -1;
    this.#selectedIdx = new Set();
    this.#data = this.#toItemArr(nameArr);
    this.#html = this.#generateHTML();
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

  focusItem(idx) {
    if (!this.#checkIdxBounds(idx)) return;
    // if (idx === this.#focusedIdx) return console.log("Ignoring same focus");
    unfocusItem();
    this.#onFocusCallback(this.#data[idx], true);
    this.#focusedIdx = idx;
  }

  unfocusItem() {
    this.#onFocusCallback(this.#data[this.#focusedIdx], false);
    this.#focusedIdx = -1;
  }

  selectItem(idx) {
    if (!this.#checkIdxBounds(idx)) return;
    if (this.#selectedIdx.has(idx)) return console.log("Ignoring same select");
    this.#onSelectCallback(this.#data[idx], true);
    this.#selectedIdx.add(idx);
  }

  deselectItem(idx) {
    if (!this.#checkIdxBounds(idx)) return;
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
    for (let idx of this.#selectedIdx) {
      this.#onSelectCallback(this.#data[idx], false);
    }
    this.#selectedIdx.clear();
  }

  deleteItem(idx) {}

  #checkIdxBounds(idx) {
    if (idx < 0 || idx >= this.#data.length) {
      console.trace("Item idx [" + idx + "] out of bounds of [0 - " + (this.#data.length - 1) + "]");
      return false;
    }
    return true;
  }

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
      let item = new Item(this.#layerIdx, i, elemId, nameArr[i].name, nameArr[i].isFolder, this);
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
}
