const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]
const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthsOfYear = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
const monthsOfYearShort = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const isDateValid = (dateStr) => {
  return !isNaN(Date.parse(dateStr))
}

export const formatDate = (cell, format) => {
  const cellValue = cell?.getValue?.() || cell

  if (!isDateValid(cellValue)) {
    return ''
  }

  const dateObj = new Date(cellValue)

  const yearFull = dateObj.getFullYear().toString()
  const yearTwoDigit = yearFull.slice(-2)
  const monthIndex = dateObj.getMonth()
  const dayIndex = dateObj.getDay()

  const monthFullName = monthsOfYear[monthIndex]
  const monthShortName = monthsOfYearShort[monthIndex]
  const monthNumeric = (monthIndex + 1).toString().padStart('2', 0)

  const dayFullName = daysOfWeek[dayIndex]
  const dayShortName = daysOfWeekShort[dayIndex]
  const dayOfMonth = dateObj.getDate().toString().padStart('2', 0)

  const hoursPadded = dateObj.getHours().toString().padStart('2', 0) // Two-digit hour
  const hours = dateObj.getHours().toString() // Single-digit hour
  const minutes = dateObj.getMinutes().toString().padStart('2', 0)
  const seconds = dateObj.getSeconds().toString().padStart('2', 0)
  const milliseconds = dateObj.getMilliseconds().toString()
  const terrestrialTime = hours >= 12 ? 'PM' : 'AM'

  return `${format
    .replace('%ms', milliseconds)
    .replace('%ss', seconds)
    .replace('%mm', minutes)
    .replace('%HH', hoursPadded)
    .replace('%hh', hoursPadded)
    .replace('%H', hours)
    .replace('%h', hours)
    .replace('%dddd', dayFullName)
    .replace('%ddd', dayShortName)
    .replace('%dd', dayOfMonth)
    .replace('%MMMM', monthFullName)
    .replace('%MMM', monthShortName)
    .replace('%MM', monthNumeric)
    .replace('%yyyy', yearFull)
    .replace('%yy', yearTwoDigit)
    .replace('%tt', terrestrialTime)}`
}

export const getFormat = {
  datetime (cell) {
    const cellValue = cell?.getValue?.() || cell
    if (isDateValid(cellValue)) {
      const dateObj = new Date(cellValue)
      return `${dateObj.toDateString()}, ${dateObj.toLocaleTimeString()}`
    }
    return ''
  },

  date (cell) {
    const cellValue = cell?.getValue?.() || cell
    if (isDateValid(cellValue)) {
      const dateObj = new Date(cellValue)
      return `${dateObj.toLocaleDateString()}`
    }
    return ''
  },

  time (cell) {
    const cellValue = cell?.getValue?.() || cell
    if (isDateValid(cellValue)) {
      const dateObj = new Date(cellValue)
      return `${dateObj.toLocaleTimeString()}`
    }
    return ''
  }
}
