//
//    Entry function declaration
//    Based on D3 Force Directed Graph https://observablehq.com/@d3/force-directed-graph/2
//
import * as d3 from 'd3'
/**
 *
 * @param {object} config MooD visualisation config object
 */
export function createForceLayout (config) {
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
  const showNodeLabelSeparation = config.style['Show Label Node Separation'] || 100
  //
  // Handle inputs and changes to inputs
  //
  const superInputChanged = config.functions.inputChanged
  config.functions.inputChanged = inputChanged
  // input: Show node labels
  const showNodeLabelsNone = 1
  const showNodeLabelsAll = 2
  const showNodeLabelsNear = 3
  let showNodeLabelsCode = config.inputs.showLabels || showNodeLabelsNone // default to don't show any labels
  let showAllNodeLabels = showLabels(showNodeLabelsCode)
  const nodeLabelClass = 'node-label'
  const showLabelTextClass = 'show'
  const hideLabelTextClass = 'hide'
  const labelVisibilityClass = {
    true: showLabelTextClass,
    false: hideLabelTextClass
  }
  // input: Force between nodes
  let linkedStrength = -config.inputs.nodeForce || -40
  // input: Strength of Gravity
  let linkedRepositionStrength = (config.inputs.gravityStrength || 5) / 100
  // input: Elastic strength of links
  let linkStrength = (config.inputs.linkStrength || 50) / 100
  // input: Length of links
  let linkDistance = config.inputs.linkLength || 30

  let title
  let simulation
  let nodes
  let links
  //
  // Node styling
  //
  const nodeStrokeWidth = 0
  const nodeStroke = '#aaa'
  const minRadius = style['Node Minimum Radius'] || 5
  const maxRadius = style['Node Maximum Radius'] || 500
  //
  // Link styling
  //
  const linkStrokeOpacity = 0.6
  const useMarker = style['Link Arrow'] === undefined ? false : style['Link Arrow']
  const defaultLinkColour = style['Link Colour']
  const ignoreUnknownNodes = style['Ignore Unknown Nodes']
  //
  // Forces
  //
  const unlinkedStrength = -style['Unlinked Node Force Strength']
  const unlinkedRepositionStrength = style['Unlinked Node Cluster Repositioning Strength']
  const unlinkedNodeClusterXPos = style['Unlinked Node Cluster x']
  //
  // Arrow markers for target end of links
  //
  const markerSize = 5
  const markerName = 'arrow'
  const markerOffset = useMarker ? markerSize - 0 : 0
  //
  // Pan and Zoom settings
  //
  const disablePanandZoom = style['Disable Pan and Zoom'] || false
  const zoomMinScale = style['Zoom Minimum'] || 0.5
  const zoomMaxScale = style['Zoom Maximum'] || 5
  const panExtentFactor = style['Pan Extent'] || 1.0

  const curvedLinks = style['Curved Links'] === undefined ? false : style['Curved Links']

  try {
    //
    // Build a lookup for Nodes
    //
    const nodeMap = {}
    data.nodes.forEach(node => {
      nodeMap[node.id] = createNode(node.id, node.name, node.colour, node.size)
    })
    if (!ignoreUnknownNodes) {
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
    //
    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    // Ignore links from and to the same node. If this needs to change, update ticked() function to handle such links
    //
    links = data.links
      .filter(link => nodeMap[link.source.id] && nodeMap[link.target.id] && link.source.id !== link.target.id)
      .map(link => createLink(
        nodeMap[link.source.id],
        nodeMap[link.target.id],
        Math.sqrt(link.value),
        linkColour(link)))
    nodes = data.nodes.map(d => nodeMap[d.id])
    // Add indicator for node is linked
    links.forEach(link => {
      link.source.linkCount++
      link.target.linkCount++
    })
    //
    // Pan and Zoom handling
    //
    const zoom = d3.zoom()
      .on('zoom', handleZoom)
      .scaleExtent([zoomMinScale, zoomMaxScale])
      .translateExtent([[-panExtentFactor * width, -panExtentFactor * height], [(1.0 + panExtentFactor) * width, (1.0 + panExtentFactor) * height]])

    function handleZoom (e) {
      d3.selectAll('svg g')
        .attr('transform', e.transform)
    }

    function initZoom () {
      d3.select('svg')
        .call(zoom)
    }
    //
    // Adjust length of links between busy nodes
    //
    // links.forEach(link => {
    //   if (link.source.linkCount > busyNodeLinkThreshold && link.target.linkCount > busyNodeLinkThreshold) {
    //     link.distance = busyNodeLinkDistanceMultiplier * link.distance
    //   }
    // })
    // console.log('Nodes: ' + JSON.stringify(nodes))
    // console.log('Links: ' + JSON.stringify(links))
    // console.log('Style: ' + JSON.stringify(style))

    // Create a simulation with several forces.
    simulation = d3.forceSimulation(nodes)
      // .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(d => nodeCharge(d)))
      .force('collision', d3.forceCollide().radius(function (d) { return d.radius }))
      .force('x', d3.forceX().x(d => nodeForceCentreX(d)).strength(d => nodeRepositionStrength(d)))
      .force('y', d3.forceY().y(height / 2).strength(d => nodeRepositionStrength(d)))
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.distance))
      .on('tick', ticked)
    // simulation.force('link').strength(d => linkStrength / Math.min(d.source.linkCount, d.target.linkCount) )
    simulation.force('link').strength(linkStrength)

    const el = d3.select('#' + config.element)
    // Create the SVG container.
    const svg = el
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')

    if (useMarker) {
      addArrowHeads(svg, links)
    }

    // Add a line for each link
    const link = svg.append('g')
      .attr('stroke-opacity', linkStrokeOpacity)
      .selectAll('path')
      .data(simulation.force('link').links())
      .enter().append('svg:path')
      .attr('stroke', d => d.colour)
      .attr('fill', 'none')
      .attr('stroke-width', d => d.strokeWidth)
      .style('marker-end', function (d) {
        return useMarker
          ? 'url(#' + linkMarkerId(d) + ')'
          : null
      })

    // Add a circle for each node.
    const node = svg.append('g')
      .attr('stroke', nodeStroke)
      .attr('stroke-width', nodeStrokeWidth)
      .selectAll()
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.colour)
      .on('mouseover', nodeMouseover)
      .on('mouseout', nodeMouseout)
      .on('click', nodeClick)

    // Add a title for each node.
    title = svg.append('g')
      .selectAll()
      .data(nodes)
      .enter()
      .append('text')
      .classed(nodeLabelClass, true)
      .classed(labelVisibilityClass[showAllNodeLabels], true)
      .text(d => d.name)

    // Add a drag behavior.
    node.call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))

    // Initialise Zoom
    if (!disablePanandZoom) {
      initZoom()
    }

    // Determine colour for link
    function linkColour (link) {
      return link.linkColour || link.source.linkColour || link.target.linkColour || defaultLinkColour
    }

    // Create a node data object
    /**
     * Create a node data object
     * @param {*} id
     * @param {*} name
     * @param {*} colour
     * @param {*} size
     * @returns Node object
     */
    function createNode (id, name, colour, size) {
      return {
        id,
        originalId: id,
        name,
        colour,
        strokeWidth: nodeStrokeWidth,
        stroke: nodeStroke,
        radius: circleRadius(size),
        linkCount: 0
      }
    }
    //
    /**
     *
     * @param {Object} source
     * @param {Object} target
     * @param {integer} strokeWidth
     * @param {*} colour
     * @returns
     */
    function createLink (source, target, strokeWidth, colour) {
      return {
        id: source.id + target.id,
        source,
        target,
        strokeWidth,
        colour,
        distance: linkLength(source, target)
      }
    }
    // Determine radius of circle
    function circleRadius (size) {
      return size ? Math.min(Math.max(size, minRadius), maxRadius) : minRadius
    }

    // Force centre X coordinate for node depending on whether the node is linked
    // Linked nodes are positioned in the centred
    function nodeForceCentreX (node) {
      return node.linkCount ? style.width / 2 : unlinkedNodeClusterXPos || (unlinkedNodeClusterXPos === 0 ? 0 : 100)
    }

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked () {
      // console.log('Tick, alpha: ' + simulation.alpha())
      link.attr('d', function (d) {
        const dx = d.target.x - d.source.x
        const dy = d.target.y - d.source.y
        const pathLength = Math.sqrt(dx * dx + dy * dy)

        // x and y distances from center to outside edge of target circle
        // Also move back to start of marker to avoid thick lines appearing underneath point of arrow
        const effectiveRadius = d.target.radius + markerOffset * d.strokeWidth + nodeStrokeWidth / 2
        const offsetX = (Math.abs((dx / pathLength) * effectiveRadius) - 0.5) * Math.sign(dx)
        const offsetY = (Math.abs((dy / pathLength) * effectiveRadius) - 0.5) * Math.sign(dy)

        // Path from centre of source circle to edge of target circle
        if (curvedLinks) {
          const curveRadius = pathLength * (effectiveRadius / d.target.radius)
          return 'M' + d.source.x + ',' + d.source.y +
           'A' + curveRadius + ',' + curveRadius + ' 0 0 1,' + (d.target.x - offsetX) + ',' + (d.target.y - offsetY)
        } else {
          return 'M' + d.source.x + ',' + d.source.y + 'A0,0 0 0 1,' + (d.target.x - offsetX) + ',' + (d.target.y - offsetY)
        }
      })

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      title
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    }

    function separation (centreX, centreY, x, y) {
      const dx = centreX - x
      const dy = centreY - y
      return Math.sqrt(dx * dx + dy * dy)
    }

    function nodeMouseover (event, hoverNode) {
      if (showNodeLabelsCode === showNodeLabelsNear) {
      //
      // If show label mode is to show labels near current node
      // make nearby node labels visible
      //
        title
          .filter(d => separation(hoverNode.x, hoverNode.y, d.x, d.y) < showNodeLabelSeparation)
          .classed(labelVisibilityClass.false, false)
          .classed(labelVisibilityClass.true, true)
      }
      if (showNodeLabelsCode === showNodeLabelsNone) {
      //
      // If show label mode is to hide all labels
      // then add a tooltip for the current node
      //
        node
          .filter(d => d.id === hoverNode.id)
          .append('title')
          .text(d => d.name)
      }
      config.functions.updateOutput('hoverNode', hoverNode.originalId)
    }

    function nodeMouseout (event, hoverNode) {
      if (showNodeLabelsCode === showNodeLabelsNear) {
      //
      // If show label mode is to show labels near current node
      // make all node labels invisible
      // current node may have been dragged so previously nearby nodes
      // may not be nearby any more
      //
        title
          .classed(labelVisibilityClass.true, false)
          .classed(labelVisibilityClass.false, true)
      }
      if (showNodeLabelsCode === showNodeLabelsNone) {
      //
      // If show label mode is to hide all labels
      // then remove tooltip from the current node
      //
        node
          .filter(d => d.id === hoverNode.id)
          .selectChild()
          .remove()
      }
    }

    function nodeClick (event, d) {
      config.functions.performAction('Node Click', d.originalId, event)
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted (event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    // Update the subject (dragged node) position during drag.
    function dragged (event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended (event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }
  } catch (e) {
    const errorMessage = e.name + ': ' + e.message
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }
  /**
   *
   * @param {*} svg The SVG element to append the marker definitions to
   * @param {*} links The array of links containing colour definition
   * @returns
   */
  function addArrowHeads (svg, links) {
    const markerPathName = markerName + 'Path'
    const defs = svg.append('svg:defs')
    defs.append('svg:path')
      .attr('id', markerPathName)
      .attr('d', 'M0,-' + markerSize / 2 + 'L' + markerSize + ',0L0,' + markerSize / 2)
    const markerTemplate = defs
      .append('svg:marker')
      .attr('id', markerName)
      .attr('viewBox', '0 -' + markerSize / 2 + ' ' + markerSize + ' ' + markerSize)
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('markerWidth', markerSize)
      .attr('markerHeight', markerSize)
      .attr('markerUnits', 'strokeWidth')
      .attr('orient', 'auto')
      .attr('opacity', linkStrokeOpacity)
    markerTemplate
      .append('svg:use')
      .attr('href', '#' + markerPathName)
    const colouredMarkers = {}
    links.forEach(link => {
      const markerId = linkMarkerId(link)
      if (!colouredMarkers[markerId]) {
        const cloneMarker = markerTemplate.node().cloneNode(true)
        cloneMarker.id = markerId
        cloneMarker.setAttribute('fill', link.colour)
        defs.node().appendChild(cloneMarker)
        colouredMarkers[markerId] = cloneMarker
      }
    })

    return defs
  }

  /**
   * Return the identity of the marker definition for the link
   * @param {*} link Definition of link
   * @returns the identity of the marker definition for the link
   */
  function linkMarkerId (link) {
    return markerName + '_' + link.colour.toString()
  }
  /**
   * Handle change to input.
   * Show / hide node labels
   * @param {String} name name of input
   * @param {*} value number
   */
  function inputChanged (name, value) {
    try {
      let restart = false
      if (superInputChanged !== inputChanged) {
        superInputChanged(name, value)
      }
      console.log('Input Changed - name: ' + name + ', value: ' + value)

      if (name === 'showLabels') {
        const code = value
        showAllNodeLabels = showLabels(code)
        showNodeLabelsCode = code
        title
          .classed(labelVisibilityClass[!showAllNodeLabels], false)
          .classed(labelVisibilityClass[showAllNodeLabels], true)
      }

      if (name === 'nodeForce') {
        linkedStrength = -value
        simulation.force('charge').strength(d => nodeCharge(d))
        restart = true
      }

      if (name === 'gravityStrength') {
        linkedRepositionStrength = value / 100
        simulation.force('x').strength(d => nodeRepositionStrength(d))
        simulation.force('y').strength(d => nodeRepositionStrength(d))
        restart = true
      }

      if (name === 'linkStrength') {
        linkStrength = value / 100
        simulation.force('link').strength(linkStrength)
        restart = true
      }

      if (name === 'linkLength') {
        linkDistance = value
        links.forEach(link => {
          link.distance = linkLength(link.source, link.target)
        })
        simulation.force('link').distance(d => d.distance)
        restart = true
      }

      if (restart) {
        simulation.alpha(0.3).velocityDecay(0.3).restart()
      }
    } catch (e) {
      const errorMessage = e.name + ': ' + e.message
      //
      // Report error to MooD BA
      //
      config.functions.errorOccurred(errorMessage)
    }
  }

  /**
   * Converts numeric input value into Boolean to workaround
   * bug in MooD that will not change an input back to its initial value.
   * Thus for Boolean with only two values, after changing once it
   * will not change it back
   * @param {integer} inputValue Value input to visualisation
   * @returns Whether to show labels (true) or not (false)
   */
  function showLabels (inputValue) {
    return inputValue === showNodeLabelsAll
  }

  function linkLength (source, target) {
    const retVal = linkDistance + source.radius + target.radius
    return retVal
  }
  //
  // Repositioning strength of node depending on whether the node is linked
  //
  // The strength determines how much to increment the node’s x-velocity: (x - node.x) × strength.
  // For example, a value of 0.1 indicates that the node should move a tenth of the way from its current x-position
  // to the target x-position with each application.
  // Higher values moves nodes more quickly to the target position, often at the expense of other forces or constraints.
  // A value outside the range [0,1] is not recommended.
  // See https://github.com/d3/d3-force#positioning
  //
  // Linked nodes have a zero strength so rely on other forces alone
  //
  function nodeRepositionStrength (node) {
    return node.linkCount
      ? linkedRepositionStrength || (linkedRepositionStrength === 0 ? 0 : 0.1)
      : unlinkedRepositionStrength || (unlinkedRepositionStrength === 0 ? 0 : 0.1)
  }
  // The charge for all nodes depending on whether the node is linked
  function nodeCharge (node) {
    return node.linkCount
      ? Math.sqrt(node.linkCount) * (linkedStrength || (linkedStrength === 0 ? 0 : -40))
      : unlinkedStrength || (unlinkedStrength === 0 ? 0 : 1)
  }
}
