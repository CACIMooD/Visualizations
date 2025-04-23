export class ContextMenuManager {
  constructor (navigable, navigateFunc, menuItems) {
    this.menu = null
    this.navigable = navigable
    this.navigateFunc = navigateFunc
    this.menuItems = menuItems
    this.menuItemHandlers = []
    this.focusedItemIndex = 0
  }

  createMenu = (event, cell) => {
    event.preventDefault()
    this.cleanup()
    if (!this.menuItems.length || (!this.navigable && !cell.getColumn()?.getDefinition()?.editor)) return

    this.menu = document.createElement('div')
    this.menu.classList.add('custom-context-menu')
    this.menu.setAttribute('role', 'menu')
    this.menu.setAttribute('tabindex', '-1')

    this.menuItems.forEach((item, index) => {
      const menuItem = document.createElement('div')
      menuItem.className = 'context-menu-item'
      menuItem.textContent = item.text
      menuItem.setAttribute('data-action', item.action)
      menuItem.setAttribute('role', 'menuitem')
      menuItem.setAttribute('tabindex', index === 0 ? '0' : '-1')
      const onClick = (e) => {
        if (item.action === 'navigate' && this.navigateFunc) {
          this.navigateFunc(e, cell)
        } else if (item.action === 'edit') {
          cell.edit()
        }
        this.cleanup()
      }
      menuItem.addEventListener('click', onClick)
      this.menuItemHandlers.push(onClick)
      this.menu.appendChild(menuItem)
    })

    const cellRect = cell.getElement().getBoundingClientRect()
    this.menu.style.position = 'absolute'
    this.menu.style.left = `${cellRect.left}px`
    this.menu.style.top = `${cellRect.bottom}px`

    document.body.appendChild(this.menu)

    document.querySelector('.context-menu-item[tabindex="0"]')?.focus()

    document.body.addEventListener('click', this.cleanupHelper)
    document.addEventListener('contextmenu', this.contextListener)
    this.menu.addEventListener('keydown', this.handleKeydown)
  }

  cleanupHelper = (e) => {
    const button = e.which || e.button // Firefox - Right click check
    if (button && button !== 1) {
      return
    }
    this.cleanup()
  }

  cleanup = () => {
    if (this.menu) {
      this.focusedItemIndex = 0
      this.menu.removeEventListener('keydown', this.handleKeydown)
      document.body.removeEventListener('click', this.cleanupHelper)
      document.removeEventListener('contextmenu', this.contextListener)
      this.menuItemHandlers.forEach((handler) => {
        document.removeEventListener('click', handler)
      })
      this.menuItemHandlers = []
      this.menu.remove()
      this.menu = null
    }
  }

  contextListener = (e) => {
    const element = e.srcElement || e.target
    if (
      element.classList.contains('tabulator-cell') ||
      element.classList.contains('context-menu-item')
    ) {
      return
    }
    this.cleanup()
  }

  updateFocusedItem = (menuItems, focusedItemIndex) => {
    menuItems.forEach((item, index) => {
      item.tabIndex = index === focusedItemIndex ? '0' : '-1'
    })
    menuItems[focusedItemIndex].focus()
  }

  handleKeydown = (event) => {
    // Ignore IME composition
    if (
      !this.menu ||
      event.isComposing ||
      event.keyCode === 229
    ) {
      return
    }

    const menuItems = this.menu.querySelectorAll('.context-menu-item')

    switch (event.keyCode) {
      case 13: // Enter
        event.preventDefault()
        menuItems[this.focusedItemIndex].click()
        break

      case 27: // Escape
        event.preventDefault()
        this.cleanup()
        break

      case 38: // ArrowUp
        event.preventDefault()
        this.focusedItemIndex = (this.focusedItemIndex - 1 + menuItems.length) % menuItems.length
        this.updateFocusedItem(menuItems, this.focusedItemIndex)
        break

      case 40: // ArrowDown
        event.preventDefault()
        this.focusedItemIndex = (this.focusedItemIndex + 1) % menuItems.length
        this.updateFocusedItem(menuItems, this.focusedItemIndex)
        break
    }
  }
}
