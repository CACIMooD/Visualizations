import { NodeDictionary } from './node_dictionary'

export class StretchedChord {
  constructor (config) {
    const StretchedChord = this

    const width = parseFloat(config.width)
    StretchedChord.width = () => width
    const height = parseFloat(config.height)
    StretchedChord.height = () => height
    const arcThickness = config.style.arcThickness
    StretchedChord.arcThickness = () => arcThickness
    const arcCentreSeparation = config.style.arcCentreSeparation
    StretchedChord.arcCentreSeparation = () => arcCentreSeparation
    const labelMargin = config.style.labelMargin
    StretchedChord.labelMargin = () => labelMargin
    const labelOffset = config.style.labelOffset
    StretchedChord.labelOffset = () => labelOffset
    const labelFontSize = config.style.labelFontSize
    StretchedChord.labelFontSize = () => labelFontSize
    const labelFontFamily = config.style.labelFontFamily
    StretchedChord.labelFontFamily = () => labelFontFamily

    const arcHeight = height - config.style.headerHeight - config.style.footerHeight
    const arcWidth = width - arcCentreSeparation - 2 * labelMargin
    const maxDimension = Math.max(arcHeight, arcWidth)
    const minDimension = Math.min(arcHeight, arcWidth)
    //
    // Constrain arc angle by viewing area aspect ratio
    // Only a square view will display a full sem-circle
    //
    const arcStartAngle = 2 * Math.atan(maxDimension / minDimension) - Math.PI / 2
    StretchedChord.arcStartAngle = () => arcStartAngle
    //
    // Calculate the radius of the arc to fit the size of the view area
    //
    const outerRadius = minDimension / 2 /
      (1 - Math.cos(Math.PI / 2 - arcStartAngle)) *
      arcHeight / maxDimension
    StretchedChord.outerRadius = () => outerRadius
    //
    // Calculate the horizontal offset of the LHS arc centre from centre of view area
    // The RHS arc centre offset is -1 * this
    //
    const arcCentreOffset = labelMargin + outerRadius - width / 2
    StretchedChord.arcCentreOffset = () => arcCentreOffset

    const innerRadius = outerRadius - arcThickness
    StretchedChord.innerRadius = () => innerRadius

    const nodeSeparationAngle = config.style.nodeSeparation / innerRadius
    StretchedChord.nodeSeparationAngle = () => nodeSeparationAngle

    const flowPeriod = config.style.flowPeriod
    StretchedChord.flowPeriod = () => flowPeriod
    const flowOpacity = config.style.flowOpacity
    StretchedChord.flowOpacity = () => flowOpacity
    //
    // Calculate offsets from centre of view area to left boundary of label areas
    //
    const lhsLabelOffset = arcCentreOffset
    StretchedChord.lhsLabelOffset = () => lhsLabelOffset
    const rhsLabelOffset = -lhsLabelOffset
    StretchedChord.rhsLabelOffset = () => rhsLabelOffset

    this.dataChanged = function dataChanged () {
      // store nodes in a dictionary for fast lookup
      const nodeDict = new NodeDictionary()

      // Copy RHS nodes from configuration data
      const rhsNodes = config.data.RHSnodes.map((node, index) => ({
        // setup node details and add it to the node dictionary for use with links
        name: node.name,
        id: node.id,
        size: 0,
        sizeIn: 0,
        sizeOut: 0,
        lastLinkEndAngle: 0,
        lhs: false,
        order: index,
        colour: node.colour || config.style.nodeColour,
        stroke: node.borderColour || config.style.nodeBorderColour
      }))
      // add nodes to the node dictionary for use with links
      rhsNodes.forEach(function (node) {
        nodeDict.add(node)
      })
      StretchedChord.rhsNodes = () => rhsNodes

      // Copy LHS nodes from configuration data
      const lhsNodes = config.data.LHSnodes.map((node, index) => ({
        // setup node details and add it to the node dictionary for use with links
        name: node.name,
        id: node.id,
        size: 0,
        sizeIn: 0,
        sizeOut: 0,
        lastLinkEndAngle: 0,
        lhs: true,
        order: index,
        colour: node.colour || config.style.nodeColour,
        stroke: node.borderColour || config.style.nodeBorderColour
      }))
      // add nodes to the node dictionary for use with links
      lhsNodes.forEach(function (node) {
        nodeDict.add(node)
      })
      StretchedChord.lhsNodes = () => lhsNodes

      // Copy links from configuration
      const links = config.data.links.map(link => {
        // lookup source and target nodes
        const sourceNode = nodeDict.find(link.source.id)
        const targetNode = nodeDict.findOnOtherSide(link.source.id, link.target.id)

        return {
          source: { id: link.source.id },
          target: { id: link.target.id },
          id: link.id,
          size: link.size,
          colour: link.colour || sourceNode.colour,
          sourceNode,
          targetNode,
          lhsNode: (sourceNode && sourceNode.lhs) ? sourceNode : targetNode,
          rhsNode: (sourceNode && sourceNode.lhs) ? targetNode : sourceNode
        }
      }).filter(link => (
        link.sourceNode !== undefined &&
          link.targetNode !== undefined &&
          link.sourceNode.lhs !== link.targetNode.lhs))
        .sort(function (a, b) {
        // arrange links based on node position to allow for better connection/less crossing
          let comparison
          if (a.rhsNode.order === b.rhsNode.order) {
            comparison = a.lhsNode.order - b.lhsNode.order
          } else {
            comparison = a.rhsNode.order - b.rhsNode.order
          }
          return comparison
        })

      // Sum link sizes for the source and target nodes
      let totalLinkSize = 0
      links.forEach(function (link) {
        // update total size
        totalLinkSize += link.size

        // add onto node size
        link.sourceNode.size += link.size
        link.sourceNode.sizeOut += link.size
        link.targetNode.size += link.size
        link.targetNode.sizeIn += link.size
      })
      StretchedChord.links = () => links

      function calculateLinkAngles (link, sourceOrTarget) {
        // if first link on node then start at node start
        const node = sourceOrTarget === 'source' ? link.sourceNode : link.targetNode
        const adjustedOffset = node.lhs ? -arcCentreOffset : arcCentreOffset

        if (node.lastLinkEndAngle === 0) {
          link[sourceOrTarget].startAngle = node.startAngle
        } else {
          link[sourceOrTarget].startAngle = node.lastLinkEndAngle
        }

        // calculate link end position and update the last position on Node
        link[sourceOrTarget].endAngle = link[sourceOrTarget].startAngle + ((node.endAngle - node.startAngle) * (link.size / node.size))
        node.lastLinkEndAngle = link[sourceOrTarget].endAngle

        // calculate coordinates of link on node inner arc
        link[sourceOrTarget].startPos = [innerRadius * Math.sin(link[sourceOrTarget].startAngle) - adjustedOffset, -innerRadius * Math.cos(link[sourceOrTarget].startAngle)]
        link[sourceOrTarget].endPos = [innerRadius * Math.sin(link[sourceOrTarget].endAngle) - adjustedOffset, -innerRadius * Math.cos(link[sourceOrTarget].endAngle)]
      }

      function calculateNodeSizing (node, vars) {
        // store current node percentage size for easier typing
        const nodeSizeProportionOfTotal = node.size / totalLinkSize

        // check if node size is less than minimum
        if (nodeSizeProportionOfTotal * vars.minimumProportionAdjustment < vars.minimumSizeProportion) {
          vars.tooSmall++
        } else {
          // add node to size calculations
          vars.sizeUsed += node.size
        }
      }

      function checkSideSizeCalculations (nodes) {
        // store past variables between loops
        const totalAvailableAngle = (Math.PI - 2 * arcStartAngle - (StretchedChord.nodeSeparationAngle() * (nodes.length - 1)))
        const vars = {
          oldTooSmall: 0,
          tooSmall: 0,
          sizeUsed: totalAvailableAngle,
          minimumProportionAdjustment: 1,
          minimumSizeProportion: config.style.minimumNodeSizePercentage / 100
        }

        do {
          if (vars.tooSmall * vars.minimumSizeProportion > 1 || vars.sizeUsed === 0) {
            // Minimum percentage configured is too large for data
            // All nodes will be equal size
            vars.minimumSizeProportion = 1 / vars.tooSmall
          }

          // calculate remaining total size modifier
          vars.minimumProportionAdjustment = 1 - (vars.tooSmall * vars.minimumSizeProportion)

          // update past loop variables
          vars.oldTooSmall = vars.tooSmall
          vars.tooSmall = 0

          // reset variables used during this loop
          vars.sizeUsed = 0

          // check minimum sizes are fine with every node
          nodes.forEach(function (node) { calculateNodeSizing(node, vars) })
        } while (vars.tooSmall !== vars.oldTooSmall)

        return {
          totalAvailableAngle,
          minimumSizeProportion: vars.minimumSizeProportion,
          minimumProportionAdjustment: vars.minimumProportionAdjustment,
          sizeUsed: vars.sizeUsed
        }
      }

      function calculateNodeAngles (node, index, nodeArray, sizeControl) {
        // check if node is on the right or left side
        const offset = node.lhs === true ? -1 : 1
        let nodeSize = 0

        // check if node size is less than minimum
        if (node.size / totalLinkSize * sizeControl.minimumProportionAdjustment < sizeControl.minimumSizeProportion) {
          // set node size to be minimum
          nodeSize = sizeControl.totalAvailableAngle * sizeControl.minimumSizeProportion
        } else {
          // set node size to be modified based on available size
          nodeSize = ((node.size / sizeControl.sizeUsed) * sizeControl.minimumProportionAdjustment) * sizeControl.totalAvailableAngle
        }

        // setup start and end angle
        node.startAngle = index === 0 ? offset * arcStartAngle : (nodeArray[index - 1].endAngle + (offset * StretchedChord.nodeSeparationAngle()))
        node.endAngle = node.startAngle + (offset * nodeSize)
      }

      [lhsNodes, rhsNodes].forEach(nodes => {
        const sizeControl = checkSideSizeCalculations(nodes)
        nodes.forEach(function (node, index, array) { calculateNodeAngles(node, index, array, sizeControl) })
      })

      // calculate start and end angle for links
      links.forEach(function (l) {
        calculateLinkAngles(l, 'source')
        calculateLinkAngles(l, 'target')
      })
    }

    this.sourceChanged = function sourceChanged (value) {
      StretchedChord.dataChanged()
    }

    this.initialise = function initialise () {
      StretchedChord.sourceChanged()
    }
  }
}
