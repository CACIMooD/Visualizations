const dateFormats = ['datetime', 'date', 'time']

export const getEditorType = (format) => {
  if (!format) {
    return
  }

  if (format === 'star') {
    return true
  }

  if (format === 'money') {
    return 'number'
  }

  if (format.includes('%')) {
    return 'date'
  }

  if (dateFormats.includes(format)) {
    return 'date'
  }

  return 'input'
}
