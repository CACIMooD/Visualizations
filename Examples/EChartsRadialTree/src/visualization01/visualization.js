//
// Refer to the following guide on importing packages to keep the bundle size to a minimum:
// https://apache.github.io/echarts-handbook/en/basics/import#importing-required-charts-and-components-to-have-minimal-bundle
//
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
// Import bar charts, all suffixed with Chart
import { TreeChart } from 'echarts/charts'
// Import the Canvas renderer
// Note that introducing the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers'

import {
  TooltipComponent
} from 'echarts/components'
// Import the tooltip, title, rectangular coordinate system, dataset and transform components
// all suffixed with Component
/*
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
*/
// Features like Universal Transition and Label Layout
// import { LabelLayout, UniversalTransition } from 'echarts/features'

// Register the required components
echarts.use([
  TooltipComponent,
  TreeChart,
  CanvasRenderer
])

//
// Entry function declaration
//

/**
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
  // const inputs = config.inputs
  // const style = config.style
  const seriesData = {}
  const flatData = []
  const superInputChanged = config.functions.inputChanged
  const style = config.style

  let chart
  let option
  try {
    const containerWidth = parseFloat(config.width)
    const containerHeight = parseFloat(config.height)
    const showTooltip = style.series.showTooltip !== undefined
      ? style.series.showTooltip
      : false
    const showLabel = style.series.label
      ? (style.series.label.show !== undefined
          ? style.series.label.show
          : true)
      : true
    const labelFontSize = style.series.label
      ? (style.series.label.fontSize !== undefined
          ? style.series.label.fontSize
          : 12)
      : 12
    const labelRotation = style.series.label
      ? (style.series.label.rotate !== undefined
          ? style.series.label.rotate
          : 0)
      : 0
    const showLeafLabel = style.series.leafLabel
      ? (style.series.leafLabel.show !== undefined
          ? style.series.leafLabel.show
          : true)
      : true
    const leafLabelFontSize = style.series.leafLabel
      ? (style.series.leafLabel.fontSize !== undefined
          ? style.series.leafLabel.fontSize
          : 12)
      : 12
    const emphasisFocus = style.series.emphasis
      ? (style.series.emphasis.focus !== undefined
          ? style.series.emphasis.focus
          : 'relative')
      : 'relative'
    const layout = ['orthogonal', 'radial'].includes(style.series.layout)
      ? style.series.layout
      : 'radial'
    const orientation = ['LR', 'RL', 'TB', 'BT'].includes(style.series.orient)
      ? style.series.orient
      : 'LR'

    config.functions.inputChanged = inputChanged

    buildData(config.data, seriesData, flatData)

    const treeDepth = config.inputs.maxDepth || 2
    console.log('Initial depth = ' + treeDepth)
    expand(flatData, treeDepth)

    const el = document.getElementById(config.element)
    //
    // This based on the ECharts Radial Tree chart - https://echarts.apache.org/examples/en/editor.html?c=tree-radial
    //
    chart = echarts.init(el, null, { renderer: 'canvas', width: containerWidth, height: containerHeight })

    chart.hideLoading()
    option = {
      series: [
        {
          type: 'tree',
          data: [seriesData],
          top: config.style.series.top,
          bottom: config.style.series.bottom,
          layout,
          orient: orientation,
          symbol: config.style.series.symbol,
          symbolSize: config.style.series.symbolSize,
          initialTreeDepth: treeDepth,
          expandAndCollapse: true,
          animationDurationUpdate: 750,
          label: {
            show: showLabel,
            fontSize: labelFontSize,
            rotate: labelRotation
          },
          emphasis: {
            focus: emphasisFocus,
            label: {
              show: true
            }
          },
          leaves: {
            label: {
              show: showLeafLabel,
              fontSize: leafLabelFontSize
            },
            emphasis: {
              label: {
                show: true
              }
            }
          }
        }
      ]
    }
    if (showTooltip) {
      option.tooltip = {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: '{b} {c}'
      }
    }
    chart.setOption(option)
    chart.on('mouseover', function (params) {
      // const labelOn = {
      //   series: [
      //     {
      //       expandAndCollapse: true,
      //       label: {
      //         show: true
      //       }
      //     }
      //   ]
      // }
      // option.series[0].label.show = true
      // chart.setOption(labelOn)
      config.functions.updateOutput('hoverNode', params.data.key)
    })
    // chart.on('mouseout', function (params) {
    //   const resetLabel = {
    //     series: [
    //       {
    //         expandAndCollapse: false,
    //         label: {
    //           show: showLabel
    //         }
    //       }
    //     ]
    //   }
    //   // option.series[0].label.show = showLabel
    //   // chart.setOption(resetLabel)
    // })
  } catch (e) {
    //
    // Write error message to the canvas
    //
    const el = document.getElementById(config.element)
    let errorMessage = e.name + ': ' + e.message
    if ('stack' in e) {
      errorMessage += '\n\nStack:\n' + e.stack
    }
    if ('lineNumber' in e && 'fileName' in e) {
      errorMessage += 'At ' + e.fileName + ':' + e.lineNumber
    }

    const errorEl = document.createElement('text')
    errorEl.style.margin = 'auto'
    errorEl.style.textAlign = 'center'
    errorEl.style.display = 'block'
    errorEl.innerText = errorMessage
    el.appendChild(errorEl)
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }

  /**
   * Handle change to input.
   * Maximum tree depth
   * @param {String} name name of input
   * @param {*} value number
   */
  function inputChanged (name, value) {
    superInputChanged(name, value)
    console.log('name: ' + name + ', value: ' + value)

    let newDepth

    if (name === 'maxDepth') {
      // ensure depth is between 1 and 4
      newDepth = Math.max(Math.min(value, 4), 1)
      expand(flatData, newDepth)
      collapse(flatData, newDepth)
      option.series[0].initialTreeDepth = newDepth
      chart.setOption(option)
    }

    return true
  }
}

/**
 * Extract the data passed in to the visualization and transform into tree series data
 * @param {*} moodData Data from MooD
 * @param {*} seriesData The object to be populated with data for the tree chart
 * @param {*} flatData An array that will be populated with all the nodes in the chart
 * @return {*} tree series data
 */
function buildData (moodData, seriesData, flatData) {
  const nodeDictionary = {}
  function flatNode (nodeParam, levelParam) {
    return {
      node: nodeParam,
      level: levelParam
    }
  }

  function hierarchicalNode (link) {
    const node = { key: link.target.key, name: link.target.name }
    if (link.target.value) {
      node.value = link.target.value
    }
    return node
  }

  function processLink (link, level) {
    const seriesNode = hierarchicalNode(link)
    nodeDictionary[link.target.key] = seriesNode
    const parentNode = nodeDictionary[link.source.key]
    if (!parentNode) {
      throw new Error('The parent of Node: "' + link.target.name + '" is not known')
    }
    if (parentNode.children === undefined) {
      parentNode.children = []
    }
    parentNode.children.push(seriesNode)
    flatData.push(flatNode(seriesNode, level))
  }

  seriesData.key = moodData.rootNode.key
  seriesData.name = moodData.rootNode.name
  seriesData.children = []

  nodeDictionary[moodData.rootNode.key] = seriesData
  flatData.push(flatNode(seriesData, 0, false))

  //
  // Process array data in data properties level<N>Relationship
  //
  let key
  const linkLevelPropertyPrefix = 'level'
  for (key in moodData) {
    if (Object.prototype.hasOwnProperty.call(moodData, key) &&
       key.startsWith(linkLevelPropertyPrefix)) {
      const level = parseInt(key.substring(5))
      if (Array.isArray(moodData[key])) {
        moodData[key].forEach(link => processLink(link, level))
      } else {
        throw new Error('Data for ' + key + ' is not an array')
      }
    }
  }

  return seriesData
}

function collapse (flatData, maxLevel) {
  flatData.filter(node => node.level >= maxLevel).forEach(function (node) { node.node.collapsed = true })
}

function expand (flatData, maxLevel) {
  flatData.filter(node => node.level < maxLevel).forEach(function (node) { node.node.collapsed = false })
}
