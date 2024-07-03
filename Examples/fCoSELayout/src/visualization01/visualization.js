//
// From https://ivis-at-bilkent.github.io/cytoscape.js-fcose/
//
// H. Balci and U. Dogrusoz, “fCoSE: A Fast Compound Graph Layout Algorithm with Constraint Support,” in IEEE Transactions on Visualization and Computer Graphics, 28(12), pp. 4582-4593, 2022.
// U. Dogrusoz, E. Giral, A. Cetintas, A. Civril and E. Demir, “A Layout Algorithm For Undirected Compound Graphs”, Information Sciences, 179, pp. 980-994, 2009.
//
//
// Entry function declaration
//
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import layoutUtilities from 'cytoscape-layout-utilities'

/**
 *
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
  //
  // Retrieve graph configuration
  //
  // const inputs = config.inputs
  const style = config.style
  const width = parseFloat(config.width)
  const height = parseFloat(config.height)
  style.width = width
  style.height = height
  // const animation = config.animation
  const data = config.data
  //
  // Retrieve configuration
  //

  // const inputs = config.inputs
  // const style = config.style
  // const width = parseFloat(config.width)
  // const height = parseFloat(config.height)
  const superInputChanged = config.functions.inputChanged
  config.functions.inputChanged = inputChanged

  const edgeHoverClass = 'edge-hover'
  const nodeHoverClass = 'node-hover'
  const parentHoverClass = 'parent-hover'

  /**
 * Handle change to input.
 * There is only a single input which controls which nodes are highlighted
 * @param {String} name name of input
 * @param {*} value GUID(s) (string or array)
 */
  function inputChanged (name, value) {
    try {
      if (superInputChanged !== inputChanged) {
        superInputChanged(name, value)
      }
      console.log('Input Changed - name: ' + name + ', value: ' + value)

      // if (name === 'showLabels') {
      //   const code = value
      // }
    } catch (e) {
      const errorMessage = e.name + ': ' + e.message
      //
      // Report error to MooD BA
      //
      config.functions.errorOccurred(errorMessage)
    }
  }

  if (!config.animation) {
    // Sometimes you need to draw differently when inside Business Architect. For example without animations.
  }

  try {
    const el = document.getElementById(config.element)

    const styleSheet = getStylesheet(style)
    const idealEdgeLength = style.idealEdgeLength || 150
    const edgeElasticity = style.edgeElasticity || 0.99
    const zoomSensitivity = style.zoomSensitivity || 0.3
    const nodeSeparation = style.nodeSeparation || 75
    const nodeRepulsion = style.nodeRepulsion || 4500
    const busyNodeRepulsion = style.busyNodeRepulsion !== undefined ? style.busyNodeRepulsion : 1000
    const gravity = style.gravity || 0.25
    const gravityCompound = style.gravityCompound || 1.0
    const samplingType = style.samplingType !== undefined ? style.samplingType : true
    const nodeDimensionsIncludeLabels = style.nodeDimensionsIncludeLabels !== undefined ? style.nodeDimensionsIncludeLabels : true
    const layerGap = style.layerGap !== undefined ? style.layerGap : 150
    // console.log(JSON.stringify(styleSheet))

    const parentMap = {}
    const childMap = {}
    if (Array.isArray(data.parents)) {
      data.parents.forEach(mapping => {
        parentMap[mapping.child.id] = mapping.parent.id
        childMap[mapping.parent.id] = mapping.child.id
      })
    }

    if (!Array.isArray(data.nodes)) {
      throw new Error('Node data is not an array')
    }
    const nodeMap = {}
    data.nodes.forEach(node => {
      nodeMap[node.id] = node
    })
    const unnamedNodes = data.nodes.filter(node => !node.name).map(node => node.id)
    if (unnamedNodes.length > 0) {
      throw new Error('Node(s) ' + JSON.stringify(unnamedNodes) + ' is/are unnamed')
    }
    const nodes = data.nodes
      .map(node => {
        const retVal = { data: node }
        if (parentMap[node.id]) {
          retVal.data.parent = parentMap[node.id]
        }
        return retVal
      })
    // console.log(JSON.stringify(nodes))

    if (!Array.isArray(data.links)) {
      throw new Error('Edge data is not an array')
    }
    if (!style.ignoreUnknownNodes) {
      //
      // Check all the links for a missing node
      //
      data.links.forEach(link => {
        if (!nodeMap[link.source.id]) {
          throw new Error('Source node for link between "' + link.source.name + '" and "' + link.target.name + '" is not in Nodes data')
        }
        if (!nodeMap[link.target.id]) {
          throw new Error('Target node for link between "' + link.source.name + '" and "' + link.target.name + '" is not in Nodes data')
        }
      })
    }
    const edges = data.links
      .filter(link => nodeMap[link.source.id] && nodeMap[link.target.id])
      .map(edge => ({
        data: {
          id: edge.id,
          source: edge.source.id,
          target: edge.target.id,
          width: edge.width,
          colour: edge.linkColour || edge.source.linkColour || edge.target.linkColour,
          linkType: edge.linkType,
          linkDashPattern: edge.linkDashPattern
        }
      }))
    // console.log(JSON.stringify(edges))

    const constraints = getConstraints(data.nodes, layerGap, childMap)

    const highlightEdges = (node) => {
      node.connectedEdges().forEach(edge => {
        if ((edge.source().id() === node.id() && style.nodeHighlightOutEdges) ||
            (edge.target().id() === node.id() && style.nodeHighlightInEdges)) {
          edge.addClass(edgeHoverClass)
        }
      })
    }

    const unhighlightEdges = (node) => {
      node.connectedEdges().forEach(edge => {
        edge.removeClass(edgeHoverClass)
      })
    }

    cytoscape.use(layoutUtilities)
    cytoscape.use(fcose)
    const cy = cytoscape({
      container: el,
      ready: function () {
        const layoutOptions = {
          name: 'fcose',
          step: 'all',
          animationEasing: 'ease-out',
          nodeSeparation,
          quality: 'proof',
          // Node repulsion (non overlapping) multiplier
          nodeRepulsion: node => nodeRepulsion + node.connectedEdges().length * busyNodeRepulsion,
          // Ideal edge (non nested) length
          idealEdgeLength: edge => idealEdgeLength,
          // Divisor to compute edge forces
          edgeElasticity: edge => edgeElasticity,
          gravity,
          gravityCompound,
          // nestingFactor: 1.0,
          samplingType,
          nodeDimensionsIncludeLabels,
          fixedNodeConstraint: constraints.fixedNodeConstraint,
          alignmentConstraint: constraints.alignmentConstraint,
          relativePlacementConstraint: constraints.relativePlacementConstraint
        }
        const initialLayout = this.layout(layoutOptions)
        initialLayout.run()
      },
      layout: { name: 'preset' },
      style: styleSheet,
      elements: {
        nodes,
        edges
      },
      // pixelRatio: 1.0
      wheelSensitivity: zoomSensitivity
    })

    // cy.layoutUtilities("get").setOption("randomize", finalOptions.randomize);

    cy.on('tap', 'node', function (event) {
      const node = event.target
      config.functions.performAction('Node Click', node.id(), {})
    })

    cy.on('mouseover', 'node', function (event) {
      const node = event.target
      node.addClass(nodeHoverClass)
      highlightEdges(node)
      config.functions.updateOutput('hoverNode', node.id())
    })

    cy.on('mouseout', 'node', function (event) {
      const node = event.target
      node.removeClass(nodeHoverClass)
      unhighlightEdges(node)
    })

    cy.on('mouseover', 'node:parent', function (event) {
      const node = event.target
      node.addClass(parentHoverClass)
      highlightEdges(node)
      config.functions.updateOutput('hoverNode', node.id())
    })

    cy.on('mouseout', 'node:parent', function (event) {
      const node = event.target
      node.removeClass(parentHoverClass)
      unhighlightEdges(node)
    })

    cy.on('mouseover', 'edge', function (event) {
      const edge = event.target
      edge.addClass(edgeHoverClass)
      config.functions.updateOutput('hoverLink', edge.id())
    })

    cy.on('mouseout', 'edge', function (event) {
      const edge = event.target
      edge.removeClass(edgeHoverClass)
    })

    cy.on('tap', 'edge', function (event) {
      const edge = event.target
      config.functions.performAction('Link Click', edge.id(), {})
    })
  } catch (e) {
    const errorMessage = e.name + ': ' + e.message
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }

  function getConstraints (nodes, layerGap, childMap) {
    const constraints = {
      fixedNodeConstraint: [],
      alignmentConstraint: {
        horizontal: [],
        vertical: []
      },
      relativePlacementConstraint: []
    }
    const orderedNodes = nodes
      .filter(node => (node.hGrouping || node.hGrouping === 0) && !childMap[node.id])
      .sort((a, b) => a.hGrouping - b.hGrouping)

    let groupId
    let previousNodeId
    let currentGroup
    const hConstraint = constraints.alignmentConstraint.horizontal
    orderedNodes.forEach((node) => {
      if (node.hGrouping !== groupId) {
        groupId = node.hGrouping
        currentGroup = []
        // start a new horizontal group
        hConstraint.push(currentGroup)
        // create vertical relative alignment constraint with previous layer
        if (previousNodeId) {
          const relConstraint = {
            top: previousNodeId,
            bottom: node.id,
            gap: layerGap
          }
          constraints.relativePlacementConstraint.push(relConstraint)
        }
      }
      currentGroup.push(node.id)
      previousNodeId = node.id
    })
    if (orderedNodes.length > 0) {
      console.log('Constraints: ' + JSON.stringify(constraints))
    }
    // const sample4Constraints = {
    //   fixedNodeConstraint: [
    //     {
    //       nodeId: 'f1-id',
    //       position: {
    //         x: -100,
    //         y: 0
    //       }
    //     },
    //     {
    //       nodeId: 'f2-id',
    //       position: {
    //         x: 300,
    //         y: 0
    //       }
    //     }
    //   ],
    //   alignmentConstraint: {
    //     horizontal: [
    //       [
    //         'h1-id',
    //         'h2-id',
    //         'h3-id',
    //         'h4r-id'
    //       ]
    //     ],
    //     vertical: [
    //       [
    //         'v1-id',
    //         'v2-id',
    //         'v3-id',
    //         'v4-id'
    //       ]
    //     ]
    //   },
    //   relativePlacementConstraint: [
    //     {
    //       top: 'r1-id',
    //       bottom: 'r2-id',
    //       gap: 150
    //     },
    //     {
    //       left: 'r3-id',
    //       right: 'h4r-id',
    //       gap: 150
    //     }
    //   ]
    // }

    return constraints // sample4Constraints
  }

  function getStylesheet (style) {
    const nodeLabel = (node) => node.attr().name || node.id
    const nodeShape = (node) => node.attr().shape || 'ellipse'
    const nodeSize = (node) => node.attr().size || 40
    const nodeColour = (node) => node.attr().colour || '#bdd3ff'
    const nodezIndex = (node) => node.attr().zIndex || 1
    const edgeColour = (edge) => edge.attr().colour || '#ffd3d4'
    const edgeWidth = (edge) => edge.attr().width || 1
    const edgeType = (edge) => edge.attr().linkType || 'solid'
    const dashPattern = (edge) => edge.attr().linkDashPattern || '5 5'
    const nodeLabelFontSize = style.nodeLabelSize || 12
    const nodeLabelFontWeight = style.nodeLabelWeight || 'normal'
    const nodeLabelFontStyle = style.nodeLabelStyle || 'normal'
    const nodeLabelFontFamily = style.nodeLabelFamily || 'Sans-Serif'
    const nodeLabelPos = style.nodeLabelPos || 'center'
    const nodeLabelMarginX = style.nodeLabelMarginX || 0
    const nodeLabelMarginY = style.nodeLabelMarginY || 0
    const nodeOpacity = style.nodeOpacity || 0.5
    const nodeHighlightOpacity = style.nodeHighlightOpacity || 1.0
    const nodeHighlightColour = style.nodeHighlightColour
    const parentLabelFontSize = style.parentLabelSize || 14
    const parentLabelFontWeight = style.nodeLabelWeight || 'normal'
    const parentLabelFontStyle = style.nodeLabelStyle || 'normal'
    const parentLabelFontFamily = style.nodeLabelFamily || 'Sans-Serif'
    const parentLabelMarginX = style.parentLabelMarginX || 0
    const parentLabelMarginY = style.parentLabelMarginY || 0
    const parentLabelPos = style.parentLabelPos || 'bottom'
    const parentOpacity = style.parentOpacity || 0.5
    const parentHighlightOpacity = style.parentHighlightOpacity || 1.0
    const parentHighlightColour = style.parentHighlightColour
    const edgeOpacity = style.edgeOpacity || 0.5
    const edgeHighlightOpacity = style.edgeHighlightOpacity || 1.0
    const edgeHighlightColour = style.edgeHighlightColour
    const edgeCurveStyle = style.edgeCurveStyle || 'unbundled-bezier'
    const edgeArrowShape = style.edgeArrowShape || 'triangle'
    // define default stylesheet
    const defaultStylesheet = [
      {
        selector: 'node',
        style: {
          'background-color': nodeColour,
          width: nodeSize,
          height: nodeSize,
          shape: nodeShape,
          label: nodeLabel,
          'z-index': nodezIndex,
          'font-family': nodeLabelFontFamily,
          'font-size': nodeLabelFontSize,
          'font-weight': nodeLabelFontWeight,
          'font-style': nodeLabelFontStyle,
          'text-margin-x': nodeLabelMarginX,
          'text-margin-y': nodeLabelMarginY,
          'text-valign': nodeLabelPos,
          'background-opacity': nodeOpacity
        }
      },

      {
        selector: ':parent',
        style: {
          // 'background-color': '#e8ffe8',
          'border-color': '#DADADA',
          //      'border-width': 3,
          'font-family': parentLabelFontFamily,
          'font-size': parentLabelFontSize,
          'font-weight': parentLabelFontWeight,
          'font-style': parentLabelFontStyle,
          'text-margin-x': parentLabelMarginX,
          'text-margin-y': parentLabelMarginY,
          'text-valign': parentLabelPos,
          'background-opacity': parentOpacity
        }
      },

      {
        selector: 'edge',
        style: {
          'curve-style': edgeCurveStyle,
          'target-arrow-shape': edgeArrowShape,
          'line-color': edgeColour,
          'target-arrow-color': edgeColour,
          width: edgeWidth,
          'line-style': edgeType,
          'line-dash-pattern': dashPattern,
          'line-opacity': edgeOpacity
        }
      }
    ]

    const nodeHoverStyle =
      {
        selector: '.' + nodeHoverClass,
        style: {
          'background-opacity': nodeHighlightOpacity
        }
      }

    if (nodeHighlightColour) {
      nodeHoverStyle.style['background-color'] = nodeHighlightColour
    }

    defaultStylesheet.push(nodeHoverStyle)

    const parentHoverStyle =
      {
        selector: '.' + parentHoverClass,
        style: {
          'background-opacity': parentHighlightOpacity
        }
      }

    if (parentHighlightColour) {
      parentHoverStyle.style['background-color'] = parentHighlightColour
    }

    defaultStylesheet.push(parentHoverStyle)

    const edgeHoverStyle =
      {
        selector: '.' + edgeHoverClass,
        style: {
          'line-opacity': edgeHighlightOpacity
        }
      }

    if (edgeHighlightColour) {
      edgeHoverStyle.style['line-color'] = edgeHighlightColour
      edgeHoverStyle.style['target-arrow-color'] = edgeHighlightColour
    }

    defaultStylesheet.push(edgeHoverStyle)
    // {
    //   selector: 'node:selected',
    //   style: {
    //     'background-color': '#33ff00',
    //     'border-color': '#22ee00'
    //   }
    // },

    // {
    //   selector: 'edge:selected',
    //   style: {
    //     'line-color': '#33ff00',
    //     'target-arrow-color': '#33ff00',
    //     'line-opacity': 0.9
    //   }
    // },

    return defaultStylesheet
  }
}
