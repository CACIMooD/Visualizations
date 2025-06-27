//
// This connector avoids unwanted jumpovers at the intersections of links with the same target anchor point
//
// This is a copy of JointJS connectors/jumpover.mjs version 4.1.3
// Sections of code that have been altered from the original are marked with
// // *** Start
// and
// // *** End
//
// The code has also been altered for imports; these changes have not been marked

import * as joint from '@joint/core'
// import * as util from '../util/index.mjs';
// import * as g from '../g/index.mjs';

// default size of jump if not specified in options
const JUMP_SIZE = 5

// available jump types
// first one taken as default
const JUMP_TYPES = ['arc', 'gap', 'cubic']

// default radius
const RADIUS = 0

// takes care of math. error for case when jump is too close to end of line
const CLOSE_PROXIMITY_PADDING = 1

// list of connector types not to jump over.
const IGNORED_CONNECTORS = ['smooth']

// internal constants for round segment
const _13 = 1 / 3
const _23 = 2 / 3

function sortPointsAscending (p1, p2) {
  let { x: x1, y: y1 } = p1
  let { x: x2, y: y2 } = p2

  if (x1 > x2) {
    let swap = x1
    x1 = x2
    x2 = swap

    swap = y1
    y1 = y2
    y2 = swap
  }

  if (y1 > y2) {
    let swap = x1
    x1 = x2
    x2 = swap

    swap = y1
    y1 = y2
    y2 = swap
  }

  return [new joint.g.Point(x1, y1), new joint.g.Point(x2, y2)]
}

function overlapExists (line1, line2) {
  const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = sortPointsAscending(line1.start, line1.end)
  const [{ x: x3, y: y3 }, { x: x4, y: y4 }] = sortPointsAscending(line2.start, line2.end)

  const xMatch = x1 <= x4 && x3 <= x2
  const yMatch = y1 <= y4 && y3 <= y2

  return xMatch && yMatch
}

/**
 * Transform start/end and route into series of lines
 * @param {joint.g.point} sourcePoint start point
 * @param {joint.g.point} targetPoint end point
 * @param {joint.g.point[]} route optional list of route
 * @return {joint.g.line[]} [description]
 */
function createLines (sourcePoint, targetPoint, route) {
  // make a flattened array of all points
  const points = [].concat(sourcePoint, route, targetPoint)
  return points.reduce(function (resultLines, point, idx) {
    // if there is a next point, make a line with it
    const nextPoint = points[idx + 1]
    if (nextPoint != null) {
      resultLines[idx] = joint.g.line(point, nextPoint)
    }
    return resultLines
  }, [])
}

function setupUpdating (jumpOverLinkView) {
  const paper = jumpOverLinkView.paper
  let updateList = paper._jumpOverUpdateList

  // first time setup for this paper
  if (updateList == null) {
    updateList = paper._jumpOverUpdateList = []
    const graph = paper.model
    graph.on('batch:stop', function () {
      if (this.hasActiveBatch()) return
      updateJumpOver(paper)
    })
    graph.on('reset', function () {
      updateList = paper._jumpOverUpdateList = []
    })
  }

  // add this link to a list so it can be updated when some other link is updated
  if (updateList.indexOf(jumpOverLinkView) < 0) {
    updateList.push(jumpOverLinkView)

    // watch for change of connector type or removal of link itself
    // to remove the link from a list of jump over connectors
    jumpOverLinkView.listenToOnce(jumpOverLinkView.model, 'change:connector remove', function () {
      updateList.splice(updateList.indexOf(jumpOverLinkView), 1)
    })
  }
}

/**
 * Handler for a batch:stop event to force
 * update of all registered links with jump over connector
 * @param {object} batchEvent optional object with info about batch
 */
function updateJumpOver (paper) {
  const updateList = paper._jumpOverUpdateList
  for (let i = 0; i < updateList.length; i++) {
    const linkView = updateList[i]
    const updateFlag = linkView.getFlag(linkView.constructor.Flags.CONNECTOR)
    linkView.requestUpdate(updateFlag)
  }
}

/**
 * Utility function to collect all intersection points of a single
 * line against group of other lines.
 * @param {joint.g.line} line where to find points
 * @param {joint.g.line[]} crossCheckLines lines to cross
 * @return {joint.g.point[]} list of intersection points
 */
//
// *** Start of changes from original jumpover connector code (JointJS version 4.1.3) ***
// avoid jumping over links where the intersection is at the end of either of the intersecting lines
// limit jumps to be all on horizontal lines or all on vertical lines
//
function findLineIntersections (line, crossCheckLines, jumpOverOnHorizontalLines) {
  return joint.util.toArray(crossCheckLines).reduce(function (res, crossCheckLine) {
    const intersection = line.intersection(crossCheckLine)
    const isHorizontal = line.start.x !== line.end.x
    if (isHorizontal === jumpOverOnHorizontalLines &&
       intersection &&
       !intersection.round().equals(line.start.round()) &&
       !intersection.round().equals(line.end.round()) &&
       !intersection.round().equals(crossCheckLine.start.round()) &&
       !intersection.round().equals(crossCheckLine.end.round())) {
    // *** End of changes from original jumpover connector code (JointJS version 4.1.3) ***
      res.push(intersection)
    }
    return res
  }, [])
}

/**
 * Sorting function for list of points by their distance.
 * @param {joint.g.Point} p1 first point
 * @param {joint.g.Point} p2 second point
 * @return {number} squared distance between points
 */
function sortPoints (p1, p2) {
  return joint.g.line(p1, p2).squaredLength()
}

/**
 * Split input line into multiple based on intersection points.
 * @param {joint.g.line} line input line to split
 * @param {joint.g.Point[]} intersections points where to split the line
 * @param {number} jumpSize the size of jump arc (length empty spot on a line)
 * @return {joint.g.line[]} list of lines being split
 */
function createJumps (line, intersections, jumpSize) {
  return intersections.reduce(function (resultLines, point, idx) {
    // skipping points that were merged with the previous line
    // to make bigger arc over multiple lines that are close to each other
    if (point.skip === true) {
      return resultLines
    }

    // always grab the last line from buffer and modify it
    const lastLine = resultLines.pop() || line

    // calculate start and end of jump by moving by a given size of jump
    const jumpStart = joint.g.point(point).move(lastLine.start, -(jumpSize))
    let jumpEnd = joint.g.point(point).move(lastLine.start, +(jumpSize))

    //
    // *** Start of changes from original jumpover connector code (JointJS version 4.1.3) ***
    // handle jumping over more than 2 parallel lines
    //
    // now try to look at the next intersection points
    let moreIntersections = false
    let tooFar = false
    for (let i = idx + 1; !tooFar && intersections.length > i && intersections[i] !== null; i++) {
      moreIntersections = true
      const nextPoint = intersections[i]
      if (nextPoint.equals(intersections[i - 1])) {
        // Handle lines on top of each other
        nextPoint.skip = true
      } else {
        const distance = jumpEnd.distance(nextPoint)
        if (distance <= jumpSize) {
          // next point is close enough, move the jump end by this
          // difference and mark the next point to be skipped
          jumpEnd = nextPoint.move(jumpEnd, distance)
          nextPoint.skip = true
        } else {
          tooFar = true
        }
      }
    }
    if (!moreIntersections) {
      // *** End of changes from original jumpover connector code (JointJS version 4.1.3) ***
      // this block is inside of `if` as an optimization so the distance is
      // not calculated when we know there are no other intersection points
      const endDistance = jumpStart.distance(lastLine.end)
      // if the end is too close to possible jump, draw remaining line instead of a jump
      if (endDistance < jumpSize * 2 + CLOSE_PROXIMITY_PADDING) {
        resultLines.push(lastLine)
        return resultLines
      }
    }

    const startDistance = jumpEnd.distance(lastLine.start)
    if (startDistance < jumpSize * 2 + CLOSE_PROXIMITY_PADDING) {
      // if the start of line is too close to jump, draw that line instead of a jump
      resultLines.push(lastLine)
      return resultLines
    }

    // finally create a jump line
    const jumpLine = joint.g.line(jumpStart, jumpEnd)
    // it's just simple line but with a `isJump` property
    jumpLine.isJump = true

    resultLines.push(
      joint.g.line(lastLine.start, jumpStart),
      jumpLine,
      joint.g.line(jumpEnd, lastLine.end)
    )
    return resultLines
  }, [])
}

/**
 * Assemble `D` attribute of a SVG path by iterating given lines.
 * @param {joint.g.line[]} lines source lines to use
 * @param {number} jumpSize the size of jump arc (length empty spot on a line)
 * @param {number} radius the radius
 * @return {string}
 */
function buildPath (lines, jumpSize, jumpType, radius) {
  const path = new joint.g.Path()
  let segment

  // first move to the start of a first line
  segment = joint.g.Path.createSegment('M', lines[0].start)
  path.appendSegment(segment)

  // make a paths from lines
  joint.util.toArray(lines).forEach(function (line, index) {
    if (line.isJump) {
      let angle, diff

      let control1, control2

      if (jumpType === 'arc') { // approximates semicircle with 2 curves
        angle = -90
        // determine rotation of arc based on difference between points
        diff = line.start.difference(line.end)
        // make sure the arc always points up (or right)
        const xAxisRotate = Number((diff.x < 0) || (diff.x === 0 && diff.y < 0))
        if (xAxisRotate) angle += 180

        const midpoint = line.midpoint()
        const centerLine = new joint.g.Line(midpoint, line.end).rotate(midpoint, angle)

        let halfLine

        // first half
        halfLine = new joint.g.Line(line.start, midpoint)

        control1 = halfLine.pointAt(2 / 3).rotate(line.start, angle)
        control2 = centerLine.pointAt(1 / 3).rotate(centerLine.end, -angle)

        segment = joint.g.Path.createSegment('C', control1, control2, centerLine.end)
        path.appendSegment(segment)

        // second half
        halfLine = new joint.g.Line(midpoint, line.end)

        control1 = centerLine.pointAt(1 / 3).rotate(centerLine.end, angle)
        control2 = halfLine.pointAt(1 / 3).rotate(line.end, -angle)

        segment = joint.g.Path.createSegment('C', control1, control2, line.end)
        path.appendSegment(segment)
      } else if (jumpType === 'gap') {
        segment = joint.g.Path.createSegment('M', line.end)
        path.appendSegment(segment)
      } else if (jumpType === 'cubic') { // approximates semicircle with 1 curve
        angle = line.start.theta(line.end)

        const xOffset = jumpSize * 0.6
        let yOffset = jumpSize * 1.35

        // determine rotation of arc based on difference between points
        diff = line.start.difference(line.end)
        // make sure the arc always points up (or right)
        const xAxisRotate = Number((diff.x < 0) || (diff.x === 0 && diff.y < 0))
        if (xAxisRotate) yOffset *= -1

        control1 = joint.g.Point(line.start.x + xOffset, line.start.y + yOffset).rotate(line.start, angle)
        control2 = joint.g.Point(line.end.x - xOffset, line.end.y + yOffset).rotate(line.end, angle)

        segment = joint.g.Path.createSegment('C', control1, control2, line.end)
        path.appendSegment(segment)
      }
    } else {
      const nextLine = lines[index + 1]
      if (radius === 0 || !nextLine || nextLine.isJump) {
        segment = joint.g.Path.createSegment('L', line.end)
        path.appendSegment(segment)
      } else {
        buildRoundedSegment(radius, path, line.end, line.start, nextLine.end)
      }
    }
  })

  return path
}

function buildRoundedSegment (offset, path, curr, prev, next) {
  const prevDistance = curr.distance(prev) / 2
  const nextDistance = curr.distance(next) / 2

  const startMove = -Math.min(offset, prevDistance)
  const endMove = -Math.min(offset, nextDistance)

  const roundedStart = curr.clone().move(prev, startMove).round()
  const roundedEnd = curr.clone().move(next, endMove).round()

  const control1 = new joint.g.Point((_13 * roundedStart.x) + (_23 * curr.x), (_23 * curr.y) + (_13 * roundedStart.y))
  const control2 = new joint.g.Point((_13 * roundedEnd.x) + (_23 * curr.x), (_23 * curr.y) + (_13 * roundedEnd.y))

  let segment
  segment = joint.g.Path.createSegment('L', roundedStart)
  path.appendSegment(segment)

  segment = joint.g.Path.createSegment('C', control1, control2, roundedEnd)
  path.appendSegment(segment)
}

/**
 * Actual connector function that will be run on every update.
 * @param {joint.g.point} sourcePoint start point of this link
 * @param {joint.g.point} targetPoint end point of this link
 * @param {joint.g.point[]} route of this link
 * @param {object} opt options
 * @property {number} size optional size of a jump arc
 * @return {string} created `D` attribute of SVG path
 */
export const mergeJumpover = function (sourcePoint, targetPoint, route, opt) { // eslint-disable-line max-params
  setupUpdating(this)

  const raw = opt.raw
  const jumpSize = opt.size || JUMP_SIZE
  let jumpType = opt.jump && ('' + opt.jump).toLowerCase()
  const radius = opt.radius || RADIUS
  const ignoreConnectors = opt.ignoreConnectors || IGNORED_CONNECTORS
  //
  // *** Start of changes from original jumpover connector code (JointJS version 4.1.3) ***
  // avoid jumping over links where the intersection is at the end of either of the intersecting lines
  // limit jumps to be all on horizontal lines or all on vertical lines
  //
  const jumpOverOnHorizontalLines = opt.jumpOverOnHorizontalLines
  // *** End of changes from original jumpover connector code (JointJS version 4.1.3) ***

  // grab the first jump type as a default if specified one is invalid
  if (JUMP_TYPES.indexOf(jumpType) === -1) {
    jumpType = JUMP_TYPES[0]
  }

  const paper = this.paper
  const graph = paper.model
  const allLinks = graph.getLinks()

  // there is just one link, draw it directly
  if (allLinks.length === 1) {
    return buildPath(
      createLines(sourcePoint, targetPoint, route),
      jumpSize, jumpType, radius
    )
  }

  const thisModel = this.model
  //
  // *** Start of changes from original jumpover connector code (JointJS version 4.1.3) ***
  // avoid jumping over links where the intersection is at the end of either of the intersecting lines
  // limit jumps to be all on horizontal lines or all on vertical lines
  //
  // const thisIndex = allLinks.indexOf(thisModel)
  // *** End of changes from original jumpover connector code (JointJS version 4.1.3) ***
  const defaultConnector = paper.options.defaultConnector || {}

  // not all links are meant to be jumped over.
  // *** Start of changes from original jumpover connector code (JointJS version 4.1.3) ***
  const links = allLinks.filter(function (link, idx) { // eslint-disable-line no-unused-vars
  // *** End of changes from original jumpover connector code (JointJS version 4.1.3) ***
    const connector = link.get('connector') || defaultConnector

    // avoid jumping over links with connector type listed in `ignored connectors`.
    //
    if (joint.util.toArray(ignoreConnectors).includes(connector.name)) {
      return false
    }
    // *** Start of changes from original jumpover connector code (JointJS version 4.1.3) ***
    // avoid jumping over links where the intersection is at the end of either of the intersecting lines
    // limit jumps to be all on horizontal lines or all on vertical lines
    //
    // filter out links that are above this one
    // otherwise there would double hoops for each intersection
    // if (idx > thisIndex) {
    //   return false //connector.name !== 'mergeJumpoverConnector'
    // }
    // *** End of changes from original jumpover connector code (JointJS version 4.1.3) ***
    return true
  })

  // find views for all links
  const linkViews = links.map(function (link) {
    return paper.findViewByModel(link)
  })

  // create lines for this link
  const thisLines = createLines(
    sourcePoint,
    targetPoint,
    route
  )

  // create lines for all other links
  const linkLines = linkViews.map(function (linkView) {
    if (linkView == null) {
      return []
    }
    if (linkView === this) {
      return thisLines
    }
    return createLines(
      linkView.sourcePoint,
      linkView.targetPoint,
      linkView.route
    )
  }, this)

  // transform lines for this link by splitting with jump lines at
  // points of intersection with other links
  const jumpingLines = thisLines.reduce(function (resultLines, thisLine) {
    // iterate all links and grab the intersections with this line
    // these are then sorted by distance so the line can be split more easily
    const intersections = links.reduce(function (res, link, i) {
      // don't intersection with itself
      if (link !== thisModel) {
        const linkLinesToTest = linkLines[i].slice()
        const overlapIndex = linkLinesToTest.findIndex((line) => overlapExists(thisLine, line))

        // Overlap occurs and the end point of one segment lies on thisLine
        if (overlapIndex > -1 && thisLine.containsPoint(linkLinesToTest[overlapIndex].end)) {
          // Remove the next segment because there will never be a jump
          linkLinesToTest.splice(overlapIndex + 1, 1)
        }
        //
        // *** Start of changes from original jumpover connector code (JointJS version 4.1.3) ***
        // avoid jumping over links where the intersection is at the end of either of the intersecting lines
        // limit jumps to be all on horizontal lines or all on vertical lines
        //
        const lineIntersections = findLineIntersections(thisLine, linkLinesToTest, jumpOverOnHorizontalLines)
        // *** End of changes from original jumpover connector code (JointJS version 4.1.3) ***
        res.push.apply(res, lineIntersections)
      }
      return res
    }, []).sort(function (a, b) {
      return sortPoints(thisLine.start, a) - sortPoints(thisLine.start, b)
    })

    if (intersections.length > 0) {
      // split the line based on found intersection points
      resultLines.push.apply(resultLines, createJumps(thisLine, intersections, jumpSize))
    } else {
      // without any intersection the line goes uninterrupted
      resultLines.push(thisLine)
    }
    return resultLines
  }, [])

  const path = buildPath(jumpingLines, jumpSize, jumpType, radius)
  return (raw) ? path : path.serialize()
}
