import * as d3 from 'd3'

const normalLinkOpacity = 0.8
const highlightLinkOpacity = 1.0
const lowlightLinkOpacity = 0.2

export function setUpEnvironment (config) {
  d3.select('#' + config.element).append('svg').attr('width', parseFloat(config.width)).attr('height', parseFloat(config.height))
  Array.from(arguments).slice(1).forEach(d => d3.select(d.parent).append('g').attr('id', d.id).attr('transform', d.transform))
}

export function drawDiagram (stretchedChord) {
  d3.select('#links').selectAll('*').remove()
  d3.select('#LHS').selectAll('*').remove()
  d3.select('#RHS').selectAll('*').remove()
  d3.select('#L').selectAll('*').remove()
  d3.select('#R').selectAll('*').remove()

  const innerRadius = stretchedChord.innerRadius()
  const outerRadius = stretchedChord.outerRadius()

  drawLinks()
  drawNodes('L', stretchedChord.lhsNodes())
  drawNodes('R', stretchedChord.rhsNodes())
  addLabels('L')
  addLabels('R')

  function drawLinks () {
    d3.select('#links').selectAll().data(stretchedChord.links()).enter().append('path')
      .attr('id', d => 'l_' + d.id)
      .attr('d', d => linkPath(d))
      .style('fill', d => 'url(#' + (d.sourceNode.lhs ? 'r' : 'l') + d.colour.slice(1) + ')')
      .style('opacity', normalLinkOpacity)
  }

  function drawNodes (side, data) {
    d3.select('#' + side + 'HS').selectAll().data(data).enter().append('path')
      .attr('id', d => side + 'n_' + d.id)
      .attr('name', d => d.name)
      .attr('d', d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      .style('fill', d => d.colour)
      .style('stroke', d => d.stroke)
      .style('stroke-width', '2px')
      .style('opacity', 1)
      .style('cursor', 'pointer')
  }

  function linkPath (link) {
    const srcStart = link.source.startPos
    const srcEnd = link.source.endPos
    const tgtEnd = link.target.endPos
    const tgtStart = link.target.startPos

    return 'M' + srcStart.join(' ') + // Start at link starting angle on source node
    'A' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + srcEnd.join(' ') + // draw arc following inside of source node to link end angle
    'Q 0 ' + (srcEnd[1] + tgtEnd[1]) / 4 + ' ' + tgtEnd.join(' ') + // draw quadratic Bezier curve to end angle of link on target node
    'A' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + tgtStart.join(' ') + // draw arc following inside of target node to link start angle
    'Q 0 ' + (srcStart[1] + tgtStart[1]) / 4 + ' ' + srcStart.join(' ') // draw quadratic Bezier curve to start angle of link on source node
  }

  function addLabels (side) {
    const nodeTag = '#' + side + 'HS'
    const labelTag = '#' + side
    d3.select(nodeTag).selectAll('path').each(function (d) { addLabel(d, d3.select(this)) })

    function addLabel (node, path) {
      const offset = getOffset()
      const xTrans = offset[0] +
       Math.sign(offset[0]) * stretchedChord.labelOffset() +
       stretchedChord.arcThickness() / 2 / Math.sin((node.endAngle + node.startAngle) / 2)

      const formattedLabel = getLabelFormatted(
        node.name,
        stretchedChord.labelMargin() + (outerRadius - Math.abs(xTrans)),
        stretchedChord.labelFontFamily(),
        stretchedChord.labelFontSize())

      const yTrans = offset[1] - (stretchedChord.labelFontSize() * (formattedLabel.length - 0.5))

      const label = d3.select(labelTag)
        .append('text')
        .style('alignment-baseline', 'left')
        .style('text-anchor', side === 'L' ? 'end' : 'start')
        .style('font-family', stretchedChord.labelFontFamily())
        .style('font-size', stretchedChord.labelFontSize() + 'px')

      if (!(isNaN(xTrans) || isNaN(yTrans))) {
        label.attr('transform', 'translate(' + xTrans + ',' + yTrans + ')')
      }

      formattedLabel.forEach(d => label.append('tspan').text(d).attr('x', 0).attr('dy', stretchedChord.labelFontSize() + 'px'))

      function getOffset () {
        const center = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).centroid(path.datum())

        return [center[0], center[1]]
      }
    }
  }
}

export function createGradients (stretchedChord) {
  const config = {
    flowPeriod: stretchedChord.flowPeriod(),
    flowOpacity: stretchedChord.flowOpacity()
  }
  stretchedChord.links().forEach(function (d) {
    const colour = d.colour.slice(1)
    const direction = d.sourceNode.lhs ? 'r' : 'l'
    if (!d3.select('#' + direction + colour).node()) {
      (direction === 'l' ? leftGradient : rightGradient)(
        d,
        d3.select('#defs').append('linearGradient').attr('id', direction + colour),
        config)
    }
  })
}

export function addInteractivity (functions, stretchedChord) {
  d3.select('#LHS').selectAll('path')
    .on('mouseover', nodeMouseover(functions.updateOutput))
    .on('mouseleave', nodeMouseleave)
    .on('click', nodeClick(functions.performAction, 'Source'))

  d3.select('#RHS').selectAll('path')
    .on('mouseover', nodeMouseover(functions.updateOutput))
    .on('mouseleave', nodeMouseleave)
    .on('click', nodeClick(functions.performAction, 'Target'))

  d3.select('#links').selectAll('path')
    .on('mouseover', linkMouseover(stretchedChord, functions.updateOutput))
    .on('mouseleave', linkMouseleave)
    .on('click', linkClick(functions.performAction))
}

function rightGradient (link, grad, config) {
  const flowPeriod = config.flowPeriod
  const flowOpacity = config.flowOpacity
  grad.append('stop').attr('offset', '-50%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '-.5;0').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '-25%').attr('stop-color', link.colour).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '-.25;.25').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '0%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '0;.5').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '25%').attr('stop-color', link.colour).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '0.25;.75').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '50%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '.5;1').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '75%').attr('stop-color', link.colour).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '.75;1.25').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '100%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '1;1.5').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
}

function leftGradient (link, grad, config) {
  const flowPeriod = config.flowPeriod
  const flowOpacity = config.flowOpacity
  grad.append('stop').attr('offset', '0%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '0;-.5').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '25%').attr('stop-color', link.colour).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '.25;-.25').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '50%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '.5;0').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '75%').attr('stop-color', link.colour).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '.75;.25').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '100%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '1;.5').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '125%').attr('stop-color', link.colour).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '1.25;.75').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '150%').attr('stop-color', link.colour).attr('stop-opacity', flowOpacity)
    .append('animate').attr('attributeName', 'offset').attr('values', '1.5;1').attr('dur', flowPeriod).attr('repeatCount', 'indefinite')
}

function getLabelFormatted (label, lineLength, labelFontFamily, labelFontSize) {
  d3.select('svg').append('text').attr('id', 'temp')
    .style('font-family', labelFontFamily)
    .style('font-size', labelFontSize + 'px')

  let line = []; const lines = []
  let labels = label
  if (typeof labels === 'undefined') {
    return
  } else if (typeof labels === 'string') {
    labels = labels.split(' ')
  } else if (Array.isArray(labels) === false) {
    return
  }

  labels.forEach(function (word) {
    if (d3.select('#temp').text([line, word].flat().join(' ')).node().getComputedTextLength() <= lineLength) line.push(word)
    else {
      if (line.length > 0) lines.push(line.join(' '))
      if (d3.select('#temp').text(word).node().getComputedTextLength() > lineLength) {
        word = word.split('').reduce((total, amount) =>
          d3.select('#temp').text(total[total.length - 1] + amount).node().getComputedTextLength() <= lineLength ? total.slice(0, total.length - 1).concat(total[total.length - 1] + amount) : total.concat(amount),
        [''])
        lines.push(...word.slice(0, word.length - 1))
        word = word[word.length - 1]
      }
      line = [word]
    }
  })

  d3.select('#temp').remove()

  return lines.concat(line.join(' '))
}

function linkMouseover (stretchedChord, updateOutput) {
  return function (event, d) {
    // calculate centre y coordinate of the 2 quadratic bezier curves for the link at horizontal mid-point
    function yCentre (start, control, end) {
      // Calculate Bezier curve parameter t for horizontal mid-point in window
      // Note: source and target points are not necessarily equi-distant from mid-point
      // So, solve quadratic equation to find t where x coord = 0
      // at^2 + bt + c = 0
      const a = start[0] - 2 * control[0] + end[0]
      const b = 2 * (control[0] - start[0])
      const c = start[0]
      let t
      if (a === 0) {
        t = 0.5
      } else {
        const t1 = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)
        const t2 = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)
        t = (t1 >= 0 && t1 <= 1) ? t1 : t2
      }
      // Return y coordinate at mid-point
      return (1 - t) ** 2 * start[1] + 2 * t * (1 - t) * control[1] + t ** 2 * end[1]
    }
    const topCentre = yCentre(d.source.endPos, [0, (d.source.endPos[1] + d.target.endPos[1]) / 4], d.target.endPos)
    const bottomCentre = yCentre(d.target.startPos, [0, (d.target.startPos[1] + d.source.startPos[1]) / 4], d.source.startPos)
    const center = (topCentre + bottomCentre) / 2

    d3.select('#labels').append('text').text(d.size)
      .attr('id', 'temp').attr('transform', 'translate(0,' + center + ')')
      .style('alignment-baseline', 'middle').style('text-anchor', 'middle')
      .style('font-family', stretchedChord.labelFontFamily())
      .style('font-size', stretchedChord.labelFontSize() + 'px')

    const node = d3.select('#temp').node().getBBox()
    const width = node.width
    const height = node.height
    d3.select('#temp').remove()
    const boxStroke = 1
    const boxBoundary = boxStroke + 3

    d3.select('#labels').append('text').text(d.size)
      .attr('id', 'size').attr('transform', 'translate(0, ' + center + ')')
      .attr('alignment-baseline', 'middle')
      .style('text-anchor', 'middle')
      .style('font-family', stretchedChord.labelFontFamily())
      .style('font-size', stretchedChord.labelFontSize() + 'px')

    d3.select('#labels').append('rect').attr('transform', 'translate(0, ' + center + ')')
      .attr('x', -(width + 2 * boxBoundary) / 2).attr('y', -(height + 2 * boxBoundary) / 2 - 1).attr('rx', 2 * (boxBoundary - boxStroke))
      .attr('width', width + 2 * boxBoundary).attr('height', height + 2 * boxBoundary)
      .style('fill', '#f2f2f2').style('opacity', 0.9)
      .style('stroke', '#a2a2a2').style('stroke-width', boxStroke + 'px')
      .lower()

    updateOutput('hoverLink', d.id)
  }
}

function linkMouseleave () {
  d3.select('#size').remove()
  d3.select('#labels').select('rect').remove()
}

function linkClick (performAction) {
  return function (event, d) {
    performAction('Chord Click', d.id, event)
  }
}

function nodeMouseover (updateOutput) {
  return function (event, d) {
    d3.select('#links').selectAll('path')
      .style('opacity', l => (l.lhsNode.id === d.id && d.lhs) || (l.rhsNode.id === d.id && !d.lhs) ? highlightLinkOpacity : lowlightLinkOpacity)
    updateOutput('hoverNode', d.id)
  }
}

function nodeMouseleave () {
  d3.select('#links').selectAll('path').style('opacity', normalLinkOpacity)
}

function nodeClick (performAction, from) {
  return function (event, d) {
    performAction(from + ' Click', d.id, event)
  }
}
