/**
 * Predefined theme settings for Tabulator.
 */
const themePresets = {
  midnight: {
    properties: {
      '--bg-color': 'rgb(18, 18, 18)',
      '--border-color': 'rgb(58, 58, 58)',
      '--header-bg': 'rgb(37, 37, 37)',
      '--header-text': 'rgb(230, 230, 230)',
      '--header-border': 'rgb(58, 58, 58)',
      '--header-separator': 'rgb(58, 58, 58)',
      '--header-hover-bg': 'rgb(50, 50, 50)',
      '--header-hover-text': 'rgb(240, 240, 240)',
      '--header-range-selected-bg': 'rgb(55, 55, 55)',
      '--header-range-selected-text': 'rgb(240, 240, 240)',
      '--header-sort-icon-active': 'rgb(240, 240, 240)',
      '--header-sort-icon-inactive': 'rgb(180, 180, 180)',
      '--header-filter-bg': 'rgb(37, 37, 37)',
      '--header-filter-box': 'rgb(55, 55, 55)',
      '--header-filter-text': 'rgb(230, 230, 230)',
      '--header-filter-icon': 'rgb(188, 188, 188)',
      '--row-bg-even': 'rgb(25, 25, 25)',
      '--row-bg-odd': 'rgb(25, 25, 25)',
      '--row-text-even': 'rgb(230, 230, 230)',
      '--row-text-odd': 'rgb(230, 230, 230)',
      '--row-border': 'rgb(58, 58, 58)',
      '--row-hover-bg': 'rgb(48, 48, 48)',
      '--row-hover-text': 'rgb(255, 255, 255)',
      '--row-selected-bg': 'rgb(89, 96, 112)',
      '--row-selected-text': 'rgb(240, 240, 240)',
      '--row-calc-bg': 'rgb(70, 70, 70)',
      '--row-group-bg': 'rgb(46, 46, 46)',
      '--row-group-text': 'rgb(212, 212, 212)',
      '--row-group-item-count-text': 'rgb(0, 150, 80)',
      '--footer-bg': 'rgb(20, 20, 20)',
      '--footer-text': 'rgb(230, 230, 230)',
      '--edit-box': 'rgb(29, 104, 205)'
    },
    initialColumnBorders: [
      '.tabulator-row .tabulator-cell.tabulator-row-header {border-left: 10px solid #cccccc}'
    ],
    rules: [
      '.tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #383838}',
      '.tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}',
      '.tabulator .tabulator-header {border-bottom: 3px solid var(--header-separator-color);}'
    ]
  },
  basic: {
    properties: {
      '--bg-color': 'rgb(255, 255, 255)',
      '--border-color': 'rgb(200, 200, 200)',
      '--header-bg': 'rgb(255, 255, 255)',
      '--header-text': 'rgb(12, 12, 12)',
      '--header-border': 'rgb(200, 200, 200)',
      '--header-separator': 'rgb(200, 200, 200)',
      '--header-hover-bg': 'rgb(225, 225, 225)',
      '--header-hover-text': 'rgb(0, 0, 0)',
      '--header-range-selected-bg': 'rgb(212, 212, 212)',
      '--header-range-selected-text': 'rgb(0, 0, 0)',
      '--header-sort-icon-active': 'rgb(0, 0, 0)',
      '--header-sort-icon-inactive': 'rgb(66, 66, 66)',
      '--header-filter-bg': 'rgb(255, 255, 255)',
      '--header-filter-box': 'rgb(255, 255, 255)',
      '--header-filter-text': 'rgb(0, 0, 0)',
      '--header-filter-icon': 'rgb(25, 25, 25)',
      '--row-bg-even': 'rgb(255, 255, 255)',
      '--row-bg-odd': 'rgb(255, 255, 255)',
      '--row-text-even': 'rgb(12, 12, 12)',
      '--row-text-odd': 'rgb(12, 12, 12)',
      '--row-border': 'rgb(200, 200, 200)',
      '--row-hover-bg': 'rgb(215, 215, 215)',
      '--row-hover-text': 'rgb(0, 0, 0)',
      '--row-selected-bg': 'rgb(165, 225, 165)',
      '--row-selected-text': 'rgb(0, 0, 0)',
      '--row-calc-bg': 'rgb(235, 235, 235)',
      '--row-group-bg': 'rgb(210, 210, 210)',
      '--row-group-text': 'rgb(0, 0, 0)',
      '--row-group-item-count-text': 'rgb(0, 150, 80)',
      '--footer-bg': 'rgb(255, 255, 255)',
      '--footer-text': 'rgb(0, 0, 0)',
      '--edit-box': 'rgb(29, 104, 205)'
    },
    initialColumnBorders: [
      '.tabulator-row .tabulator-cell.tabulator-row-header {border-left: 10px solid rgb(62, 174, 69)}'
    ],
    rules: [
      '.tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #fff}',
      '.tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}',
      '.tabulator .tabulator-header {border-bottom: 3px solid var(--header-separator-color);}'
    ]
  },
  default: {
    properties: {},
    initialColumnBorders: [
      '.tabulator-row .tabulator-cell.tabulator-row-header {border-left: 10px solid #3759d7}'
      // Predefined themes cannot be overwritten, potential fix could be to:
      // [1] Use CSS variables and if one doesn't exist (commented out?) then use fall back default color
      // [2] Changes to style.css such as commenting variables by default and stating to the user to uncomment what they'd like to change/overwrite?
      // [3] If [2] then properties under the default theme option to be filled with the current default properties from all CSS variables in style.css
      // Will this be suitable? Is there a better approach?
      // Better approach to create a stylesheet and set priority but wouldn't this overwrite or be overwritten by style.css regardless?
    ],
    rules: [
      '.tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #fff}',
      '.tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}',
      '.tabulator .tabulator-header {border-bottom: 3px solid var(--header-separator-color);}'
    ]
  }
}

/**
 * Table spacing presets.
 */
const tableSpacingValues = {
  small: '6px 4px',
  medium: '10px 6px',
  large: '14px 8px'
}

/**
 * Inserts a CSS rule into the first available stylesheet.
 * @param {CSSStyleSheet} stylesheet - The stylesheet to insert into.
 * @param {string} rule - The CSS rule to add.
 */
const insertRule = (stylesheet, rule) => {
  if (stylesheet?.insertRule) {
    stylesheet.insertRule(rule, stylesheet.cssRules.length)
  }
}

/**
 * Applies a set of CSS variables to the root element.
 * @param {Object} properties - Key-value pairs of CSS variables.
 */
const applyCSSVariables = (properties) => {
  const root = document.documentElement
  Object.entries(properties).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * Sets an individual CSS variable.
 * @param {string} variableName - The CSS variable name.
 * @param {string} value - The value to assign.
 */
const setCSSVariable = (variableName, value) => {
  const root = document.documentElement
  root.style.setProperty(variableName, value)
}

/**
 * Applies a visualization theme with optional table spacing.
 * @param {Object} options - Theme configuration options.
 * @param {string} options.theme - Name of the theme.
 * @param {string} options.tableSpacing - Spacing size.
 * @param {string} options.initialColumnBorders - Whether to apply column borders at the start of each row.
 */
export const setVisualizationTheme = ({ theme, tableSpacing, initialColumnBorders }) => {
  const stylesheet = document.styleSheets[0]
  if (!stylesheet) return console.warn('No stylesheets found.')

  const selectedTheme = themePresets[theme?.toLowerCase()] || themePresets.default

  applyCSSVariables(selectedTheme.properties)
  setCSSVariable('--table-spacing', tableSpacingValues[tableSpacing] || tableSpacingValues.small)

  selectedTheme.rules.forEach((rule) => insertRule(stylesheet, rule))

  if (initialColumnBorders && selectedTheme.initialColumnBorders) {
    Object.values(selectedTheme.initialColumnBorders).forEach((rule) => insertRule(stylesheet, rule))
  }
}

/**
 * Enables text wrapping for table cells and headers.
 */
export const setTextWrapping = () => {
  const stylesheet = document.styleSheets[0]
  if (!stylesheet) return console.warn('No stylesheets found.')
  const wrappingRules = [
    '.tabulator-row .tabulator-cell {white-space: normal !important; word-break: break-word}',
    '.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title {white-space: normal !important; word-break: break-word}'
  ]

  wrappingRules.forEach((rule) => insertRule(stylesheet, rule))
}
