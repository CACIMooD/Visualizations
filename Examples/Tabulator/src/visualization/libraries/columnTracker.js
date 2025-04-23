const RESERVED_COLUMN_NAMES = ['noData', 'groupBy', 'uniqueId', 'rowId']

// Class to handle column naming conflicts
export class ColumnTracker {
  constructor () {
    this.columns = new Map()
    this.groupTitles = new Map()
  }

  getUniqueTitle (title) {
    const count = this.columns.get(title) || 0
    this.columns.set(title, count + 1)

    if (RESERVED_COLUMN_NAMES.includes(title) || count > 0) {
      console.warn(`Title '${title}' is reserved/duplicate. Renaming to '${title}_${count}'`)
      return `${title}_${count}`
    }
    return title
  }

  getUniqueGroupTitle (title) {
    const count = this.groupTitles.get(title) || 0
    this.groupTitles.set(title, count + 1)

    if (count > 0) {
      console.warn(`Title '${title}' is a duplicate group title. Renaming to '${title}_${count}'`)
      return `${title}_${count}`
    }
    return title
  }

  clearMapping () {
    this.columns.clear()
  }
}
