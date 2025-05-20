import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { setVisualizationTheme, setTextWrapping } from '../../themes/TabulatorThemes.js'
import { getFormat, formatDate } from '../../formatters/TabulatorFormatters.js'
import { getEditorType } from '../../formatters/TabulatorEditors.js'
import { BsCaretRightFill, BsCaretDownFill, BsSortDown, BsSortUp } from 'react-icons/bs'
import { FaFilter } from 'react-icons/fa6'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ColumnTracker } from './columnTracker'
import { ContextMenuManager } from './contextMenuManager.js'
import { transformJson } from '../utils/transformJson.js'

const UI_CONFIG = {
  tableSettings: {
    maxWidth: 800 // Max width for demo table
  },
  columnSettings: {
    defaultWidth: 200 // Default column width
  }
}

const NO_COLUMN_DATA = [
  // Placeholder when no column data is available
  {
    title: 'NO DATA',
    field: 'noData',
    width: UI_CONFIG.columnSettings.defaultWidth,
    headerSort: false
  }
]

// Store collapsed column groups
const CollapsedGroups = {}

// Validate text alignment inputs
const validateAlignment = (alignment) => {
  return ['center', 'right'].includes(alignment) ? alignment : 'left'
}

// Formats data extracted from the table via the clipboard.
const formatAccessor = (value, _data, _type, _params, column) => {
  const formatter = column.getDefinition()?.formatter
  if (typeof formatter === 'function') {
    try {
      return formatter(value)
    } catch (error) {
      console.warn('Formatter error:', error)
    }
  }
  return value
}

const handleTableWidth = (tabulatorDivRef, customWidth, tableElement) => {
  if (!tabulatorDivRef.current || !tableElement) return

  const pxToNumber = (pxString) => {
    if (typeof pxString === 'number') return pxString
    return parseInt(pxString.replace('px', '')) || 0
  }

  const totalColumnsWidth = tableElement
    .getColumns()
    .reduce((sum, col) => sum + (col.getWidth() || 100), 0)
  const finalWidth =
    (customWidth && pxToNumber(customWidth)) ||
    Math.min(totalColumnsWidth, UI_CONFIG.tableSettings.maxWidth)

  tabulatorDivRef.current.style.width = `${finalWidth - 2}px` // Reduced by 2px to avoid overflow cutting off borders
}

const getRowGroupHeader = (data) => {
  return data.groupBy || 'Other'
}

const removeBreakElements = (tabulatorElement) => {
  // Remove <br> elements from the tables header contents to prevent gaps from appearing
  const headerContents = tabulatorElement.querySelector(
    '.tabulator-header-contents'
  )
  const breakTag = headerContents.querySelectorAll('br')
  breakTag.forEach((tag) => {
    tag.remove()
  })
}

const createFilters = (data, tabulatorElement, table) => {
  removeBreakElements(tabulatorElement)
  if (!data.headerFiltering) return

  const headers = tabulatorElement.querySelector('.tabulator-headers')
  if (!headers) return

  const tabulatorFilters = document.createElement('div')
  tabulatorFilters.className = 'tabulator-filters'
  tabulatorFilters.style.height = '38px'

  headers.insertAdjacentElement('afterend', tabulatorFilters)

  const columns = table.getColumns()
  columns.forEach((column) => {
    const columnDef = column.getDefinition()
    const field = columnDef.field
    const width = column.getWidth()

    const filterCell = document.createElement('div')
    filterCell.id = 'filter-' + field
    filterCell.className = 'tabulator-col'
    filterCell.role = 'columnheader'
    filterCell.style.width = width + 'px'

    const filterCellContent = document.createElement('div')
    filterCellContent.className = 'tabulator-col-content'
    filterCell.appendChild(filterCellContent)

    const filterHolder = document.createElement('div')
    filterHolder.className = 'tabulator-col-filter-holder'
    filterCellContent.appendChild(filterHolder)

    if (columnDef.filteringEnabled) {
      const filterCellFilter = document.createElement('div')
      filterCellFilter.className = 'tabulator-col-filter'
      filterHolder.appendChild(filterCellFilter)

      if (field) {
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'tabulator-col-filter-input'

        input.addEventListener('keyup', (e) => {
          if (e.target.value === '') {
            table.clearFilter()
            return
          }
          table.setFilter(field, 'like', e.target.value)
        })

        filterCellFilter.appendChild(input)
      }

      const container = document.createElement('div')
      container.className = 'tabulator-col-filter-icon'
      const root = createRoot(container)
      root.render(<FaFilter />)
      filterHolder.appendChild(container)
    }

    tabulatorFilters.appendChild(filterCell)

    let columnToResize = null
    let columnResizing = false
    function trackColumnWidth () {
      if (columnResizing && columnToResize) {
        const liveWidth = columnToResize.getElement().offsetWidth
        filterCell.style.width = liveWidth + 'px'
      }
    }

    // Update column filters widths live when resizing a columns width
    table.on('columnResizing', function (resizedColumn) {
      if (resizedColumn.getField() !== field) return
      columnResizing = true
      columnToResize = resizedColumn

      document.addEventListener('mousemove', trackColumnWidth)
    })

    // Update column filters width when column width is resized
    table.on('columnResized', function (resizedColumn) {
      if (resizedColumn.getField() !== field) return
      columnResizing = false
      columnToResize = null
      document.removeEventListener('mousemove', trackColumnWidth)

      const newWidth = resizedColumn.getWidth()
      filterCell.style.width = newWidth + 'px'
    })
  })
}

const getDescendants = (group, ignoreFirstIndex) => {
  // Get all columns within group
  let columns = []

  let isFirstIndexIgnored = ignoreFirstIndex || false

  if (group.columns) {
    group.columns.forEach((column) => {
      if (!isFirstIndexIgnored) {
        isFirstIndexIgnored = true
        return
      }

      columns.push(column.uniqueId)
    })
  }

  if (group.subGroups) {
    group.subGroups.forEach((subGroup) => {
      columns = [...columns, ...getDescendants(subGroup, isFirstIndexIgnored)]
    })
  }

  return columns
}

const HeaderContent = ({ initialValue, group, table }) => {
  const [
    _isCollapsed, // eslint-disable-line no-unused-vars
    setIsCollapsed
  ] = useState({})
  const groupId = group.uniqueId

  const adjustColumns = (targetGroup, isCollapsed, parentCollapsed = false) => {
    const groupColumns = getDescendants(targetGroup)
    if (parentCollapsed) {
      // Keep child columns hidden
      groupColumns.forEach((field) => {
        table.hideColumn(field)

        // Hide columns filter if exists
        const filterContainer = document.getElementById('filter-' + field)
        const filterHolder = filterContainer.getElementsByClassName(
          'tabulator-col-filter-holder'
        )
        const filter = filterHolder[0]
        if (filter) {
          filter.hidden = true
        }
      })
      return
    }

    groupColumns.forEach((field) => {
      const filterContainer = document.getElementById('filter-' + field)
      const filterHolder = filterContainer.getElementsByClassName(
        'tabulator-col-filter-holder'
      )
      const filter = filterHolder[0]

      if (isCollapsed) {
        table.hideColumn(field)
        if (filter) {
          filter.hidden = true
        }
      } else {
        // Only show if parent group is not collapsed
        table.showColumn(field)
        if (filter) {
          filter.hidden = false
        }
      }
    })

    if (targetGroup.subGroups) {
      targetGroup.subGroups.forEach((subGroup) => {
        if (subGroup.columns) {
          const subGroupId = subGroup.uniqueId
          adjustColumns(
            subGroup,
            CollapsedGroups[subGroupId] || false,
            isCollapsed || parentCollapsed
          )
        }
      })
    }
  }

  const toggleGroup = () => {
    const newCollapsedState = !CollapsedGroups[groupId]

    setIsCollapsed(newCollapsedState)
    CollapsedGroups[groupId] = newCollapsedState

    adjustColumns(group, newCollapsedState)
    table.redraw()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleGroup()
    }
  }

  return (
    <span className='flex items-center gap-2'>
      {initialValue}
      <div className='dropdown'>
        <div
          className='menu-icon'
          tabIndex='0'
          role='button'
          aria-label='Manage Column Group'
          onClick={toggleGroup}
          onKeyDown={handleKeyPress}
        >
          {CollapsedGroups[groupId]
            ? (
              <BsCaretRightFill />
              )
            : (
              <BsCaretDownFill />
              )}
        </div>
      </div>
    </span>
  )
}

export class TableManager {
  constructor (config, containerRef) {
    this.config = config
    this.containerRef = containerRef
    this.contextMenu = null
    this.navigable = false
    this.navigateFunc = null
    this.menuItems = []
    this.tableConfig = {}
    this.table = null
  }

  initializeTable () {
    if (!this.containerRef.current) return

    console.log('debug') // Kept to avoid trouble locating this file in Inspect Element Sources

    setVisualizationTheme({
      theme: this.config.style.stylingOptions?.theme,
      tableSpacing: this.config.style.stylingOptions?.tableSpacing,
      initialColumnBorders:
        this.config.style.stylingOptions?.initialColumnBorders === true
    })

    if (this.config.style.stylingOptions?.wrapText === true) {
      setTextWrapping()
    }

    if (this.config.data.navigable) {
      this.navigable = true
      this.menuItems.push({
        text: 'Navigate to Element',
        action: 'navigate'
      })

      this.navigateFunc = (event, cell) => {
        const row = cell.getRow()
        const rowId = row?.getData()?.rowId
        if (rowId) {
          this.config.functions.performAction('Cell Click', rowId, event)
        }
      }
    }

    if (this.config.data.editable) {
      this.menuItems.push({
        text: 'Edit Cell',
        action: 'edit'
      })
    }

    this.contextMenu = new ContextMenuManager(
      this.navigable,
      this.navigateFunc,
      this.menuItems
    )

    this.tableConfig = {
      data: transformJson(this.config.data),
      layout: 'fitDataTable',
      responsiveLayout: false,
      resizableRows: this.config.data.resizable,
      editTriggerEvent: 'dblclick',
      height: this.config.height,

      // Column sorting
      headerSortClickElement: 'icon',
      headerSortElement: function (_column, dir) {
        const container = document.createElement('div')
        const root = createRoot(container)

        switch (dir) {
          case 'asc':
            root.render(
              <div className='sorting-icon' aria-sort='ascending'>
                <span>
                  <BsSortUp />
                </span>
              </div>
            )
            break
          case 'desc':
            root.render(
              <div className='sorting-icon' aria-sort='descending'>
                <span>
                  <BsSortDown />
                </span>
              </div>
            )
            break
          default:
            root.render(
              <div className='sorting-icon' aria-sort='none'>
                <span>
                  <BsSortUp />
                </span>
              </div>
            )
        }

        return container
      },

      // Allow navigation outside of Tabulator
      keybindings: {
        navPrev: 'shit+tab',
        navNext: 'tab'
      },

      // Enable range selection
      selectableRange: 1, // Allow only one range at a time
      selectableRangeColumns: true,
      selectableRangeRows:
        this.config.style.stylingOptions?.initialRow?.enabled,
      selectableRangeClearCells: true, // Allow users to clear the contents of a selected range by pressing backspace or delete

      // Clipboard configuration
      clipboard: true, // Enable clipboard functionality
      clipboardCopyRowRange: 'range', // Include selected range in the clipboard output
      clipboardPasteParser: 'range', // Accept smaller ranges of cells
      clipboardPasteAction: 'range', // Update rows in active range with parsed range data
      clipboardCopyConfig: {
        columnHeaders: false, // Exclude column headers in clipboard output
        columnGroups: false, // Exclude column groups in column headers for printed table
        rowHeaders: false, // Exclude row headers in clipboard output
        rowGroups: false // Exclude row groups in clipboard output
      },

      columns: this.createColumnDefinition(), // Create column headers

      // Row grouping
      // groupClosedShowCalcs: true, // Show column calculations when row group is closed
      ...(this.config.data.rows[0]?.groupRows
        ? {
            groupBy: getRowGroupHeader,
            groupHeader: function (value, count) {
              return value + '<span>(' + count + ' items)</span>'
            }
          }
        : {})
    }

    if (this.config.style.stylingOptions?.initialRow?.enabled) {
      this.tableConfig.rowHeader = {
        title: this.config.style.stylingOptions.initialRow.title ?? 'ID',
        resizable: false,
        frozen: this.config.style.stylingOptions.initialRow.frozen === true,
        width: 40,
        hozAlign: 'center',
        formatter: 'rownum',
        cssClass: 'range-header-col',
        editor: false,
        headerSort: false
      }
    }

    this.table = new Tabulator(this.containerRef.current, this.tableConfig)
    const newHeight = parseInt(this.config.height - 2) // Reducing by 2 pixels to avoid overflow cutting off outer borders when using Tabulator in mood
    this.containerRef.current.style.height = `${newHeight}px`
    handleTableWidth(this.containerRef, this.config.width, this.table)

    const self = this // For Tabulator callbacks to capture the correct 'this' value

    // Create custom header filters
    this.table.on('tableBuilt', function () {
      createFilters(self.config.data, self.containerRef.current, self.table)
    })

    // Re-adjust tables sizing after data has loaded to avoid visual bugs
    this.table.on('dataProcessed', function () {
      setTimeout(() => {
        self.table.redraw()
      }, 100)
    })
  }

  createColumnDefinition () {
    const columnTracker = new ColumnTracker()
    const columns = []

    const firstRow = this.config.data.rows?.[0]
    firstRow?.columns?.forEach((col) => {
      const uniqueField = columnTracker.getUniqueTitle(col.title)
      col.uniqueId = uniqueField
      columns.push({
        title: col.title,
        field: uniqueField,
        width: col.width || UI_CONFIG.columnSettings.defaultWidth,
        headerHozAlign: validateAlignment(col.alignment),
        hozAlign: validateAlignment(col.alignment),
        frozen: col.frozen || false,
        headerSort:
          (this.config.data.columnSorting && col.columnSorter) || false,
        resizable: (this.config.data.resizable && col.resizable) || false,
        editor:
          this.config.data.editable && col.editable
            ? getEditorType(col.format) || true
            : false,
        formatter:
          getFormat[col.format] ||
          (col.format && col.format.includes('%')
            ? (cell) => formatDate(cell, col.format)
            : col.format),
        contextMenu: this.contextMenu.createMenu,
        accessorClipboard: formatAccessor,
        filteringEnabled: col.headerFilter,
        topCalc: this.config.data.topRowCalculations ? col.topCalc : null
      })
    })

    firstRow?.groups?.forEach((group) => {
      const groupColumns = []
      const uniqueTitle = columnTracker.getUniqueGroupTitle(group.title)
      group.uniqueId = uniqueTitle

      group.columns?.forEach((col) => {
        const uniqueField = columnTracker.getUniqueTitle(col.title)
        const displayTitle =
          this.config.style.stylingOptions?.showDetailedTitles &&
          `${uniqueTitle}: ${col.title}`
        col.uniqueId = uniqueField

        groupColumns.push({
          title: displayTitle || col.title,
          field: uniqueField,
          width: col.width || UI_CONFIG.columnSettings.defaultWidth,
          headerHozAlign: validateAlignment(col.alignment),
          hozAlign: validateAlignment(col.alignment),
          frozen: col.frozen || false,
          headerSort:
            (this.config.data.columnSorting && col.columnSorter) || false,
          resizable: (this.config.data.resizable && col.resizable) || false,
          editor:
            this.config.data.editable && col.editable
              ? getEditorType(col.format) || true
              : false,
          formatter:
            getFormat[col.format] ||
            (col.format && col.format.includes('%')
              ? (cell) => formatDate(cell, col.format)
              : col.format),
          contextMenu: this.contextMenu.createMenu,
          accessorClipboard: formatAccessor,
          filteringEnabled: col.headerFilter,
          topCalc: this.config.data.topRowCalculations ? col.topCalc : null
        })
      })

      group?.subGroups?.forEach((subGroup) => {
        const subGroupColumns = []
        const uniqueTitle = columnTracker.getUniqueGroupTitle(subGroup.title)
        subGroup.uniqueId = uniqueTitle

        subGroup.columns?.forEach((col) => {
          const uniqueField = columnTracker.getUniqueTitle(col.title)
          const displayTitle =
            this.config.style.stylingOptions?.showDetailedTitles &&
            `${uniqueTitle.title}: ${col.title}`
          col.uniqueId = uniqueField

          subGroupColumns.push({
            title: displayTitle || col.title,
            field: uniqueField,
            width: col.width || UI_CONFIG.columnSettings.defaultWidth,
            headerHozAlign: validateAlignment(col.alignment),
            hozAlign: validateAlignment(col.alignment),
            frozen: col.frozen || false,
            headerSort:
              (this.config.data.columnSorting && col.columnSorter) || false,
            resizable: (this.config.data.resizable && col.resizable) || false,
            editor:
              this.config.data.editable && col.editable
                ? getEditorType(col.format) || true
                : false,
            formatter:
              getFormat[col.format] ||
              (col.format && col.format.includes('%')
                ? (cell) => formatDate(cell, col.format)
                : col.format),
            contextMenu: this.contextMenu.createMenu,
            accessorClipboard: formatAccessor,
            filteringEnabled: col.headerFilter,
            topCalc: this.config.data.topRowCalculations ? col.topCalc : null
          })
        })

        groupColumns.push({
          title: uniqueTitle,
          columns:
            (subGroupColumns?.length <= 0 && NO_COLUMN_DATA) || subGroupColumns,
          titleFormatter: function (cell) {
            if (subGroupColumns?.length <= 1) {
              return uniqueTitle
            }

            const container = document.createElement('div')
            const root = createRoot(container)
            root.render(
              <HeaderContent
                initialValue={cell.getValue()}
                group={subGroup}
                table={this.table}
              />
            )

            return container
          }
        })
      })

      columns.push({
        title: uniqueTitle,
        columns: (groupColumns.length <= 0 && NO_COLUMN_DATA) || groupColumns,
        titleFormatter: function (cell) {
          if (groupColumns?.length <= 1) {
            return uniqueTitle
          }

          const container = document.createElement('div')
          const root = createRoot(container)
          root.render(
            <HeaderContent
              initialValue={cell.getValue()}
              group={group}
              table={this.table}
            />
          )

          return container
        }
      })
    })

    return columns
  }
}
