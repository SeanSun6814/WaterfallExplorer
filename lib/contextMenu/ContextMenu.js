class ContextMenu {
  #documentEventListener = null;
  #targetEventListener = null;
  #contextMenu = null;
  
  constructor({ targetNode = null, menuItems = [], mode = "dark" }) {
    this.menuItems = menuItems;
    this.mode = mode;
    this.targetNode = targetNode;
    this.menuItemsNode = this.getMenuItemsNode();
  }

  getMenuItemsNode() {
    const nodes = [];
    if (!this.menuItems) {
      console.error("getMenuItemsNode :: Please enter menu items");
      return [];
    }
    this.menuItems.forEach((data, index) => {
      const item = this.createItemMarkup(data);
      item.firstChild.setAttribute("style", `animation-delay: ${index * 0.08}s`);
      nodes.push(item);
    });
    return nodes;
  }

  createItemMarkup(data) {
    const button = document.createElement("button");
    const item = document.createElement("li");
    button.innerHTML = data.content;
    button.classList.add("contextMenu-button");
    item.classList.add("contextMenu-item");
    if (data.divider) item.setAttribute("data-divider", data.divider);
    item.appendChild(button);
    if (data.events && data.events.length !== 0) {
      Object.entries(data.events).forEach((event) => {
        const [key, value] = event;
        button.addEventListener(key, value);
      });
    }
    return item;
  }

  renderMenu() {
    const menuContainer = document.createElement("ul");
    menuContainer.classList.add("contextMenu");
    menuContainer.setAttribute("data-theme", this.mode);
    this.menuItemsNode.forEach((item) => menuContainer.appendChild(item));
    return menuContainer;
  }

  closeMenu(menu) {
    menu.remove();
  }

  init() {
    this.#contextMenu = this.renderMenu();
    this.#documentEventListener = (e) => {
      if (!e.target.contains(this.targetNode)) {
        console.log("closing menu of " + this.targetNode.innerHTML);
        this.#contextMenu.remove();
      }
    };

    this.#targetEventListener = (e) => {
      console.log("opening menu of " + this.targetNode.innerHTML);
      e.preventDefault();

      const { clientX, clientY } = e;
      document.body.appendChild(this.#contextMenu);

      const positionY =
        clientY + this.#contextMenu.scrollHeight >= window.innerHeight
          ? window.innerHeight - this.#contextMenu.scrollHeight - 20
          : clientY;
      const positionX =
        clientX + this.#contextMenu.scrollWidth >= window.innerWidth
          ? window.innerWidth - this.#contextMenu.scrollWidth - 20
          : clientX;

      this.#contextMenu.setAttribute(
        "style",
        `width: ${this.#contextMenu.scrollWidth}px;
          height: ${this.#contextMenu.scrollHeight}px;
          top: ${positionY}px;
          left: ${positionX}px;`
      );
    };
    document.addEventListener("click", () => this.closeMenu(this.#contextMenu));
    window.addEventListener("blur", () => this.closeMenu(this.#contextMenu));
    document.addEventListener("contextmenu", this.#documentEventListener);
    this.targetNode.addEventListener("contextmenu", this.#targetEventListener);
  }

  delete() {
    this.closeMenu(this.#contextMenu);
    document.removeEventListener("contextmenu", this.#documentEventListener);
    this.targetNode.removeEventListener("contextmenu", this.#targetEventListener);
  }
}
