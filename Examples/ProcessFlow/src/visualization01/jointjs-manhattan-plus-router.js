//
// This router avoids overlaying links on top of one another
//
// This is a copy of JointJS routers/manhattan.mjs version 4.1.3
// Sections of code that have been altered from the original are marked with
// // *** Start
// and
// // *** End
//
// The code has also been altered for imports; these changes have not been marked
import * as joint from '@joint/core'

// import * as g from '../g/index.mjs';
// import * as util from '../util/index.mjs';
// import { orthogonal } from './orthogonal.mjs';

const config = {

  // size of the step to find a route (the grid of the manhattan pathfinder)
  step: 10,

  // the number of route finding loops that cause the router to abort
  // returns fallback route instead
  //
  // *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
  // Increase loop limit
  maximumLoops: 3000,

  // the number of decimal places to round floating point coordinates
  precision: 0,
  // *** End of changes from original manhattan router code (JointJS version 4.1.3) ***

  // maximum change of direction
  maxAllowedDirectionChange: 90,

  // should the router use perpendicular linkView option?
  // does not connect anchor of element but rather a point close-by that is orthogonal
  // this looks much better
  perpendicular: true,

  // should the source and/or target not be considered as obstacles?
  excludeEnds: [], // 'source', 'target'

  // should certain types of elements not be considered as obstacles?
  excludeTypes: [],

  // possible starting directions from an element
  startDirections: ['top', 'right', 'bottom', 'left'],

  // possible ending directions to an element
  endDirections: ['top', 'right', 'bottom', 'left'],

  // specify the directions used above and what they mean
  directionMap: {
    top: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    bottom: { x: 0, y: 1 },
    left: { x: -1, y: 0 }
  },

  // cost of an orthogonal step
  cost: function () {
    return this.step
  },

  // an array of directions to find next points on the route
  // different from start/end directions
  directions: function () {
    const step = this.step
    const cost = this.cost()

    return [
      { offsetX: step, offsetY: 0, cost },
      { offsetX: -step, offsetY: 0, cost },
      { offsetX: 0, offsetY: step, cost },
      { offsetX: 0, offsetY: -step, cost }
    ]
  },

  // a penalty received for direction change
  penalties: function () {
    return {
      0: 0,
      45: this.step / 2,
      90: this.step / 2
    }
  },

  // padding applied on the element bounding boxes
  paddingBox: function () {
    const step = this.step

    return {
      x: -step,
      y: -step,
      width: 2 * step,
      height: 2 * step
    }
  },

  // A function that determines whether a given point is an obstacle or not.
  // If used, the `padding`, `excludeEnds`and `excludeTypes` options are ignored.
  // (point: dia.Point) => boolean;
  isPointObstacle: null,

  // a router to use when the manhattan router fails
  // (one of the partial routes returns null)
  fallbackRouter: function (vertices, opt, linkView) {
    if (!joint.util.isFunction(joint.routers.orthogonal)) {
      throw new Error('Manhattan requires the orthogonal router as default fallback.')
    }

    return joint.routers.orthogonal(vertices, joint.util.assign({}, config, opt), linkView)
  },

  /* Deprecated */
  // a simple route used in situations when main routing method fails
  // (exceed max number of loop iterations, inaccessible)
  // *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
  // avoid unused variable lint error
  fallbackRoute: function (from, to, opt) { // eslint-disable-line no-unused-vars
  // *** End of changes from original manhattan router code (JointJS version 4.1.3) ***
    return null // null result will trigger the fallbackRouter

    // left for reference:
    /* // Find an orthogonal route ignoring obstacles.

        var point = ((opt.previousDirAngle || 0) % 180 === 0)
                ? new g.Point(from.x, to.y)
                : new g.Point(to.x, from.y);

        return [point]; */
  },

  // if a function is provided, it's used to route the link while dragging an end
  // i.e. function(from, to, opt) { return []; }
  draggingRoute: null
}

// HELPER CLASSES //

//
// *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
// avoid routing lines on top of one another
//
// list of connector types not to jump over.
const IGNORED_CONNECTORS = ['smooth']
/**
 * Transform route into series of lines
 * @param {joint.g.Point[]} route optional list of route
 * @return {joint.g.Line[]} [description]
 */
function createLines (view) {
  // make a flattened array of all points
  return [view.sourcePoint].concat(view.route).concat([view.targetPoint])
    .reduce(function (resultLines, point, idx, points) {
    // if there is a next point, make a line with it
      const nextPoint = points[idx + 1]
      if (nextPoint != null) {
        resultLines[idx] = joint.g.Line(point, nextPoint)
      }
      return resultLines
    }, [])
}

/**
 * Test if line segment is coincident (within tolerance) with another line segment
 * @param {joint.g.Line} line1
 * @param {joint.g.Line} line2
 * @param {number} tolerance
 * @returns true if lines are coincident, false otherwise
 */
function coincident (line1, line2, tolerance) {
  const pt1Dir = new joint.g.Point(line1.end.x - line1.start.x, line1.end.y - line1.start.y)
  const pt2Dir = new joint.g.Point(line2.end.x - line2.start.x, line2.end.y - line2.start.y)
  const denominator = (pt1Dir.x * pt2Dir.y) - (pt1Dir.y * pt2Dir.x)
  const line1StartX = Math.min(line1.start.x, line1.end.x)
  const line1EndX = Math.max(line1.start.x, line1.end.x)
  const line1StartY = Math.min(line1.start.y, line1.end.y)
  const line1EndY = Math.max(line1.start.y, line1.end.y)
  const line2StartX = Math.min(line2.start.x, line2.end.x)
  const line2EndX = Math.max(line2.start.x, line2.end.x)
  const line2StartY = Math.min(line2.start.y, line2.end.y)
  const line2EndY = Math.max(line2.start.y, line2.end.y)
  const isHorizontal = line1StartY === line1EndY
  // Set tolerances to guarantee inclusion of equality in the tests below
  const verticalTolerance = tolerance + (isHorizontal ? 1 : 0)
  const horizontalTolerance = tolerance + (isHorizontal ? 0 : 1)
  if (denominator === 0 && // lines are parallel
      ((line1StartX > line2StartX - horizontalTolerance && line1StartX < line2EndX + horizontalTolerance) || // Line 1 start x within Line 2
      (line2StartX > line1StartX - horizontalTolerance && line2StartX < line1EndX + horizontalTolerance)) && // Line 2 start x within Line 1
      ((line1StartY > line2StartY - verticalTolerance && line1StartY < line2EndY + verticalTolerance) || // Line 1 start y within Line 2
      (line2StartY > line1StartY - verticalTolerance && line2StartY < line1EndY + verticalTolerance)) // Line 2 start y within Line 1
  ) {
    return true
  }

  return false
}

function LineMap (opt) {
  this.map = {}
  this.options = opt
  // tells how to divide the paper when creating the elements map
  this.mapGridSize = 100
  this.tolerance = opt.coincidentLineSpace
  this.targetTolerance = opt.targetTolerance
}
/**
 * Build a map of existing routed line segments. For each line segment record the ultimate target
 * @param {*} paper Paper for diagram
 * @param {*} linkModel Model of link that is currently being routed
 * @returns this (LineMap)
 */
LineMap.prototype.build = function (paper, linkModel) {
  const defaultConnector = paper.options.defaultConnector || {}
  const ignoreConnectors = joint.util.toArray(this.options.ignoreConnectors || IGNORED_CONNECTORS)
  const graph = paper.model

  // Get all links (model)
  const allLinks = graph.getLinks()
  // Remove all links after the current link being routed
  // This is done to ensure the routing is not changed when redrawn after highlighting
  const thisIndex = allLinks.indexOf(linkModel)
  if (thisIndex >= 0) {
    allLinks.splice(thisIndex)
  }
  // Ignore links with connector type listed in `ignored connectors`
  const links = allLinks.filter(function (link) {
    const connector = link.get('connector') || defaultConnector

    // ignore links with connector type listed in `ignored connectors`.
    if (ignoreConnectors.includes(connector.name)) {
      return false
    }
    return true
  })

  // find the views for the links that have been routed so far
  // Note:
  //   the routes do not include the source or target points.
  //   We do not need to avoid the lines meeting the source or target points
  const routedViews = links.map(link => paper.findViewByModel(link))
    .filter(view => view.route)

  // create lines for routed links
  const routes = routedViews.map(function (view) {
    return {
      lines: createLines(view),
      source: view.sourcePoint,
      target: view.targetPoint
    }
  })

  // Builds a map of all route lines for quicker queries (i.e. is a line following
  // an existing route line?) (a simplified grid search).
  // The paper is divided into smaller cells, where each holds information about which
  // lines belong to it. When we query whether a line follows and existing route line we
  // don't need to go through all route lines, we check only those in a particular cell.
  const mapGridSize = this.mapGridSize

  routes.reduce(function (map, route) {
    route.lines.forEach(function (line, index, array) {
      const roundedLine = line.clone().round()
      const clone = line.clone()
      const start = clone.start.snapToGrid(mapGridSize)
      const end = clone.end.snapToGrid(mapGridSize)
      const xStart = Math.min(start.x, end.x)
      const xEnd = Math.max(start.x, end.x)
      const yStart = Math.min(start.y, end.y)
      const yEnd = Math.max(start.y, end.y)
      const isEndLine = !!(index === 0 || index === array.length - 1)
      const isLastLine = index === array.length - 1
      const isFirstLine = index === 0

      for (let x = xStart; x <= xEnd; x += mapGridSize) {
        for (let y = yStart; y <= yEnd; y += mapGridSize) {
          const gridKey = x + '@' + y
          map[gridKey] = map[gridKey] || []
          map[gridKey].push({
            line: roundedLine,
            isEndLine,
            isFirstLine,
            isLastLine,
            source: route.source,
            target: route.target,
            route,
            rawLine: line
          })
        }
      }
    })

    return map
  }, this.map)

  // console.log('Map: ' + JSON.stringify(this.map))
  return this
}

const ACTION_STOP = 0
const ACTION_CONTINUE = 1
const ACTION_MERGE = 2
/**
 * Determine the next action to take:
 *    If a line segment is not accessible, i.e. is coincident (within tolerance) with existing routed line then stop
 *    If the line intersects with an existing routed line that has the same target then merge into the existing route
 *    Otherwise, continue
 * Ignore coincident flows that are heading for the same target
 * @param {joint.g.Point} startPoint Start point of line segment to test
 * @param {joint.g.Point} endPoint End point of line segment to test
 * @param {joint.g.Point} sourcePoint source of current route
 * @param {joint.g.Point} targetPoint target of current route
 * @returns object containing action code and if applicable the route to merge with
 */
LineMap.prototype.action = function (startPoint, endPoint, sourcePoint, targetPoint) {
  const tolerance = this.tolerance
  const targetTolerance = this.targetTolerance
  const mapGridSize = this.mapGridSize
  const line = new joint.g.Line(startPoint, endPoint)
  const clone = line.clone()
  const start = clone.start.snapToGrid(mapGridSize)
  const end = clone.end.snapToGrid(mapGridSize)
  const xStart = Math.min(start.x, end.x)
  const xEnd = Math.max(start.x, end.x)
  const yStart = Math.min(start.y, end.y)
  const yEnd = Math.max(start.y, end.y)

  const returnValue = { code: ACTION_CONTINUE, intersection: null, route: null, existingLine: null }
  let actionUnconfirmed = true
  let intersection

  for (let x = xStart; x <= xEnd && actionUnconfirmed; x += mapGridSize) {
    for (let y = yStart; y <= yEnd && actionUnconfirmed; y += mapGridSize) {
      const gridKey = x + '@' + y
      const checkLines = this.map[gridKey] || []
      checkLines.forEach(routeLine => {
        const sourceInTolerance = Math.abs(sourcePoint.x - routeLine.source.x) <= targetTolerance &&
            Math.abs(sourcePoint.y - routeLine.source.y) <= targetTolerance
        const targetInTolerance = Math.abs(targetPoint.x - routeLine.target.x) <= targetTolerance &&
            Math.abs(targetPoint.y - routeLine.target.y) <= targetTolerance
        if (targetInTolerance) {
          intersection = line.intersect(routeLine.line)
          if (intersection && !routeLine.isLastLine &&
            // Not at end of existing line
            !intersection.equals(routeLine.line.end)
          ) {
            returnValue.code = ACTION_MERGE
            returnValue.intersection = intersection
            returnValue.route = routeLine.route
            returnValue.existingLine = routeLine.rawLine
            actionUnconfirmed = false
            // console.log('Last Line: ' + JSON.stringify(routeLine.isLastLine))
            // console.log('Current Line: ' + JSON.stringify(line))
            // console.log('Existing Line: ' + JSON.stringify(routeLine.line))
            // console.log('Intersection at ' + JSON.stringify(intersection))
            // console.log('Route: ' + JSON.stringify(routeLine.route))
          }
        } else if (!((targetInTolerance && routeLine.isLastLine) ||
                      sourceInTolerance) &&
                  coincident(line, routeLine.line, (sourceInTolerance || targetInTolerance) ? 0 : tolerance)) {
          returnValue.code = ACTION_STOP
          actionUnconfirmed = false
          // console.log('Current Line: ' + JSON.stringify(line))
          // console.log('Current Source: ' + JSON.stringify(sourcePoint) + ', Current target: ' + JSON.stringify(targetPoint))
          // console.log('Existing Line: ' + JSON.stringify(routeLine.line))
          // console.log('Route: ' + JSON.stringify(routeLine.route))
        }
      })
    }
  }
  return returnValue
}

// *** End of changes from original manhattan router code (JointJS version 4.1.3) ***

// Map of obstacles
// Helper structure to identify whether a point lies inside an obstacle.
function ObstacleMap (opt) {
  this.map = {}
  this.options = opt
  // tells how to divide the paper when creating the elements map
  this.mapGridSize = 100
}

ObstacleMap.prototype.build = function (graph, link) {
  const opt = this.options

  // source or target element could be excluded from set of obstacles
  const excludedEnds = joint.util.toArray(opt.excludeEnds).reduce(function (res, item) {
    const end = link.get(item)
    if (end) {
      const cell = graph.getCell(end.id)
      if (cell) {
        res.push(cell)
      }
    }

    return res
  }, [])

  // Exclude any embedded elements from the source and the target element.
  let excludedAncestors = []

  const source = graph.getCell(link.get('source').id)
  if (source) {
    excludedAncestors = joint.util.union(excludedAncestors, source.getAncestors().map(function (cell) {
      return cell.id
    }))
  }

  const target = graph.getCell(link.get('target').id)
  if (target) {
    excludedAncestors = joint.util.union(excludedAncestors, target.getAncestors().map(function (cell) {
      return cell.id
    }))
  }

  // Builds a map of all elements for quicker obstacle queries (i.e. is a point contained
  // in any obstacle?) (a simplified grid search).
  // The paper is divided into smaller cells, where each holds information about which
  // elements belong to it. When we query whether a point lies inside an obstacle we
  // don't need to go through all obstacles, we check only those in a particular cell.
  const mapGridSize = this.mapGridSize

  graph.getElements().reduce(function (map, element) {
    const isExcludedType = joint.util.toArray(opt.excludeTypes).includes(element.get('type'))
    const isExcludedEnd = excludedEnds.find(function (excluded) {
      return excluded.id === element.id
    })
    const isExcludedAncestor = excludedAncestors.includes(element.id)

    const isExcluded = isExcludedType || isExcludedEnd || isExcludedAncestor
    if (!isExcluded) {
      const bbox = element.getBBox().moveAndExpand(opt.paddingBox)

      const origin = bbox.origin().snapToGrid(mapGridSize)
      const corner = bbox.corner().snapToGrid(mapGridSize)

      for (let x = origin.x; x <= corner.x; x += mapGridSize) {
        for (let y = origin.y; y <= corner.y; y += mapGridSize) {
          const gridKey = x + '@' + y
          map[gridKey] = map[gridKey] || []
          map[gridKey].push(bbox)
        }
      }
    }

    return map
  }, this.map)

  return this
}

ObstacleMap.prototype.isPointAccessible = function (point) {
  const mapKey = point.clone().snapToGrid(this.mapGridSize).toString()

  return joint.util.toArray(this.map[mapKey]).every(function (obstacle) {
    return !obstacle.containsPoint(point)
  })
}

// Sorted Set
// Set of items sorted by given value.
function SortedSet () {
  this.items = []
  this.hash = {}
  this.values = {}
  this.OPEN = 1
  this.CLOSE = 2
}

SortedSet.prototype.add = function (item, value) {
  if (this.hash[item]) {
    // item removal
    this.items.splice(this.items.indexOf(item), 1)
  } else {
    this.hash[item] = this.OPEN
  }

  this.values[item] = value

  const index = joint.util.sortedIndex(this.items, item, function (i) {
    return this.values[i]
  }.bind(this))

  this.items.splice(index, 0, item)
}

SortedSet.prototype.remove = function (item) {
  this.hash[item] = this.CLOSE
}

SortedSet.prototype.isOpen = function (item) {
  return this.hash[item] === this.OPEN
}

SortedSet.prototype.isClose = function (item) {
  return this.hash[item] === this.CLOSE
}

SortedSet.prototype.isEmpty = function () {
  return this.items.length === 0
}

SortedSet.prototype.pop = function () {
  const item = this.items.shift()
  this.remove(item)
  return item
}

// HELPERS //

// return source bbox
function getSourceBBox (linkView, opt) {
  // expand by padding box
  if (opt && opt.paddingBox) return linkView.sourceBBox.clone().moveAndExpand(opt.paddingBox)

  return linkView.sourceBBox.clone()
}

// return target bbox
function getTargetBBox (linkView, opt) {
  // expand by padding box
  if (opt && opt.paddingBox) return linkView.targetBBox.clone().moveAndExpand(opt.paddingBox)

  return linkView.targetBBox.clone()
}

// return source anchor
function getSourceAnchor (linkView, opt) {
  if (linkView.sourceAnchor) return linkView.sourceAnchor

  // fallback: center of bbox
  const sourceBBox = getSourceBBox(linkView, opt)
  return sourceBBox.center()
}

// return target anchor
function getTargetAnchor (linkView, opt) {
  if (linkView.targetAnchor) return linkView.targetAnchor

  // fallback: center of bbox
  const targetBBox = getTargetBBox(linkView, opt)
  return targetBBox.center() // default
}

// returns a direction index from start point to end point
// corrects for grid deformation between start and end
function getDirectionAngle (start, end, numDirections, grid, opt) {
  const quadrant = 360 / numDirections
  const angleTheta = start.theta(fixAngleEnd(start, end, grid, opt))
  const normalizedAngle = joint.g.normalizeAngle(angleTheta + (quadrant / 2))
  return quadrant * Math.floor(normalizedAngle / quadrant)
}

// helper function for getDirectionAngle()
// corrects for grid deformation
// (if a point is one grid steps away from another in both dimensions,
// it is considered to be 45 degrees away, even if the real angle is different)
// this causes visible angle discrepancies if `opt.step` is much larger than `paper.gridSize`
function fixAngleEnd (start, end, grid, opt) {
  const step = opt.step

  const diffX = end.x - start.x
  const diffY = end.y - start.y

  const gridStepsX = diffX / grid.x
  const gridStepsY = diffY / grid.y

  const distanceX = gridStepsX * step
  const distanceY = gridStepsY * step

  return new joint.g.Point(start.x + distanceX, start.y + distanceY)
}

// return the change in direction between two direction angles
function getDirectionChange (angle1, angle2) {
  const directionChange = Math.abs(angle1 - angle2)
  return (directionChange > 180) ? (360 - directionChange) : directionChange
}

// fix direction offsets according to current grid
function getGridOffsets (directions, grid, opt) {
  const step = opt.step

  joint.util.toArray(opt.directions).forEach(function (direction) {
    direction.gridOffsetX = (direction.offsetX / step) * grid.x
    direction.gridOffsetY = (direction.offsetY / step) * grid.y
  })
}

// get grid size in x and y dimensions, adapted to source and target positions
function getGrid (step, source, target) {
  return {
    source: source.clone(),
    x: getGridDimension(target.x - source.x, step),
    y: getGridDimension(target.y - source.y, step)
  }
}

// helper function for getGrid()
function getGridDimension (diff, step) {
  // return step if diff = 0
  if (!diff) return step

  const absDiff = Math.abs(diff)
  const numSteps = Math.round(absDiff / step)

  // return absDiff if less than one step apart
  if (!numSteps) return absDiff

  // otherwise, return corrected step
  const roundedDiff = numSteps * step
  const remainder = absDiff - roundedDiff
  const stepCorrection = remainder / numSteps

  return step + stepCorrection
}

// return a clone of point snapped to grid
function snapToGrid (point, grid) {
  const source = grid.source

  const snappedX = joint.g.snapToGrid(point.x - source.x, grid.x) + source.x
  const snappedY = joint.g.snapToGrid(point.y - source.y, grid.y) + source.y

  return new joint.g.Point(snappedX, snappedY)
}

// round the point to opt.precision
function round (point, precision) {
  return point.round(precision)
}

// snap to grid and then round the point
function align (point, grid, precision) {
  return round(snapToGrid(point.clone(), grid), precision)
}

// return a string representing the point
// string is rounded in both dimensions
function getKey (point) {
  return point.clone().toString()
}

// return a normalized vector from given point
// used to determine the direction of a difference of two points
function normalizePoint (point) {
  return new joint.g.Point(
    point.x === 0 ? 0 : Math.abs(point.x) / point.x,
    point.y === 0 ? 0 : Math.abs(point.y) / point.y
  )
}

// PATHFINDING //

// reconstructs a route by concatenating points with their parents
// *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
// avoid unused variable lint error
function reconstructRoute (parents, points, tailPoint, from, to, grid, opt) { // eslint-disable-line no-unused-vars
  // *** End of changes from original manhattan router code (JointJS version 4.1.3) ***
  const route = []

  let prevDiff = normalizePoint(to.difference(tailPoint))

  // tailPoint is assumed to be aligned already
  let currentKey = getKey(tailPoint)
  let parent = parents[currentKey]

  let point
  while (parent) {
    // point is assumed to be aligned already
    point = points[currentKey]

    const diff = normalizePoint(point.difference(parent))
    if (!diff.equals(prevDiff)) {
      route.unshift(point)
      prevDiff = diff
    }

    //
    // *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
    // avoid infinite loops
    //
    if (currentKey === getKey(parent)) {
      console.log('Infinite loop in Points:' + JSON.stringify(points))
      console.log('and parents:' + JSON.stringify(parents))
      console.log('and parent:' + JSON.stringify(parent))
      return null
    }
    // *** End of changes from original manhattan router code (JointJS version 4.1.3) ***
    // parent is assumed to be aligned already
    currentKey = getKey(parent)
    parent = parents[currentKey]
  }

  // leadPoint is assumed to be aligned already
  const leadPoint = points[currentKey]

  const fromDiff = normalizePoint(leadPoint.difference(from))
  if (!fromDiff.equals(prevDiff)) {
    route.unshift(leadPoint)
  }

  return route
}

// heuristic method to determine the distance between two points
function estimateCost (from, endPoints) {
  let min = Infinity

  for (let i = 0, len = endPoints.length; i < len; i++) {
    const cost = from.manhattanDistance(endPoints[i])
    if (cost < min) min = cost
  }

  return min
}

// find points around the bbox taking given directions into account
// lines are drawn from anchor in given directions, intersections recorded
// if anchor is outside bbox, only those directions that intersect get a rect point
// the anchor itself is returned as rect point (representing some directions)
// (since those directions are unobstructed by the bbox)
function getRectPoints (anchor, bbox, directionList, grid, opt) {
  const precision = opt.precision
  const directionMap = opt.directionMap

  const anchorCenterVector = anchor.difference(bbox.center())

  const keys = joint.util.isObject(directionMap) ? Object.keys(directionMap) : []
  const dirList = joint.util.toArray(directionList)
  const rectPoints = keys.reduce(function (res, key) {
    if (dirList.includes(key)) {
      const direction = directionMap[key]

      // create a line that is guaranteed to intersect the bbox if bbox is in the direction
      // even if anchor lies outside of bbox
      const endpoint = new joint.g.Point(
        anchor.x + direction.x * (Math.abs(anchorCenterVector.x) + bbox.width),
        anchor.y + direction.y * (Math.abs(anchorCenterVector.y) + bbox.height)
      )
      const intersectionLine = new joint.g.Line(anchor, endpoint)

      // get the farther intersection, in case there are two
      // (that happens if anchor lies next to bbox)
      const intersections = intersectionLine.intersect(bbox) || []
      const numIntersections = intersections.length
      let farthestIntersectionDistance
      let farthestIntersection = null
      for (let i = 0; i < numIntersections; i++) {
        const currentIntersection = intersections[i]
        const distance = anchor.squaredDistance(currentIntersection)
        if ((farthestIntersectionDistance === undefined) || (distance > farthestIntersectionDistance)) {
          farthestIntersectionDistance = distance
          farthestIntersection = currentIntersection
        }
      }

      // if an intersection was found in this direction, it is our rectPoint
      if (farthestIntersection) {
        let point = align(farthestIntersection, grid, precision)

        // if the rectPoint lies inside the bbox, offset it by one more step
        if (bbox.containsPoint(point)) {
          point = align(point.offset(direction.x * grid.x, direction.y * grid.y), grid, precision)
        }

        // then add the point to the result array
        // aligned
        res.push(point)
      }
    }

    return res
  }, [])

  // if anchor lies outside of bbox, add it to the array of points
  if (!bbox.containsPoint(anchor)) {
    // aligned
    rectPoints.push(align(anchor, grid, precision))
  }

  return rectPoints
}

// finds the route between two points/rectangles (`from`, `to`) implementing A* algorithm
// rectangles get rect points assigned by getRectPoints()
//
// *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
// avoid routing lines on top of one another
//
function findRoute (from, to, isPointObstacle, lineMap, opt) {
// *** End of changes from original manhattan router code (JointJS version 4.1.3) ***
  const precision = opt.precision

  // Get grid for this route.

  let sourceAnchor, targetAnchor

  if (from instanceof joint.g.Rect) { // `from` is sourceBBox
    sourceAnchor = round(getSourceAnchor(this, opt).clone(), precision)
  } else {
    sourceAnchor = round(from.clone(), precision)
  }

  if (to instanceof joint.g.Rect) { // `to` is targetBBox
    targetAnchor = round(getTargetAnchor(this, opt).clone(), precision)
  } else {
    targetAnchor = round(to.clone(), precision)
  }

  const grid = getGrid(opt.step, sourceAnchor, targetAnchor)

  // Get pathfinding points.

  let start, end // aligned with grid by definition
  let startPoints, endPoints // assumed to be aligned with grid already

  // set of points we start pathfinding from
  if (from instanceof joint.g.Rect) { // `from` is sourceBBox
    start = sourceAnchor
    startPoints = getRectPoints(start, from, opt.startDirections, grid, opt)
  } else {
    start = sourceAnchor
    startPoints = [start]
  }

  // set of points we want the pathfinding to finish at
  if (to instanceof joint.g.Rect) { // `to` is targetBBox
    end = targetAnchor
    endPoints = getRectPoints(targetAnchor, to, opt.endDirections, grid, opt)
  } else {
    end = targetAnchor
    endPoints = [end]
  }

  // take into account only accessible rect points (those not under obstacles)
  startPoints = startPoints.filter(p => !isPointObstacle(p))
  endPoints = endPoints.filter(p => !isPointObstacle(p))

  // Check that there is an accessible route point on both sides.
  // Otherwise, use fallbackRoute().
  if (startPoints.length > 0 && endPoints.length > 0) {
    // The set of tentative points to be evaluated, initially containing the start points.
    // Rounded to nearest integer for simplicity.
    const openSet = new SortedSet()
    // Keeps reference to actual points for given elements of the open set.
    const points = {}
    // Keeps reference to a point that is immediate predecessor of given element.
    const parents = {}
    // Cost from start to a point along best known path.
    const costs = {}

    for (let i = 0, n = startPoints.length; i < n; i++) {
      // startPoint is assumed to be aligned already
      const startPoint = startPoints[i]

      const key = getKey(startPoint)

      openSet.add(key, estimateCost(startPoint, endPoints))
      points[key] = startPoint
      costs[key] = 0
    }

    const previousRouteDirectionAngle = opt.previousDirectionAngle // undefined for first route
    const isPathBeginning = (previousRouteDirectionAngle === undefined)

    // directions
    let direction, directionChange
    const directions = opt.directions
    getGridOffsets(directions, grid, opt)

    const numDirections = directions.length

    const endPointsKeys = joint.util.toArray(endPoints).reduce(function (res, endPoint) {
      // endPoint is assumed to be aligned already

      const key = getKey(endPoint)
      res.push(key)
      return res
    }, [])

    // main route finding loop
    let loopsRemaining = opt.maximumLoops
    while (!openSet.isEmpty() && loopsRemaining > 0) {
      // remove current from the open list
      const currentKey = openSet.pop()
      const currentPoint = points[currentKey]
      const currentParent = parents[currentKey]
      const currentCost = costs[currentKey]

      const isRouteBeginning = (currentParent === undefined) // undefined for route starts
      const isStart = currentPoint.equals(start) // (is source anchor or `from` point) = can leave in any direction

      let previousDirectionAngle
      if (!isRouteBeginning) previousDirectionAngle = getDirectionAngle(currentParent, currentPoint, numDirections, grid, opt) // a vertex on the route
      else if (!isPathBeginning) previousDirectionAngle = previousRouteDirectionAngle // beginning of route on the path
      else if (!isStart) previousDirectionAngle = getDirectionAngle(start, currentPoint, numDirections, grid, opt) // beginning of path, start rect point
      else previousDirectionAngle = null // beginning of path, source anchor or `from` point

      // check if we reached any endpoint
      let samePoints = startPoints.length === endPoints.length
      if (samePoints) {
        for (let j = 0; j < startPoints.length; j++) {
          if (!startPoints[j].equals(endPoints[j])) {
            samePoints = false
            break
          }
        }
      }
      const skipEndCheck = (isRouteBeginning && samePoints)
      if (!skipEndCheck && (endPointsKeys.indexOf(currentKey) >= 0)) {
        opt.previousDirectionAngle = previousDirectionAngle
        return reconstructRoute(parents, points, currentPoint, start, end, grid, opt)
      }

      // go over all possible directions and find neighbors
      for (let i = 0; i < numDirections; i++) {
        direction = directions[i]

        const directionAngle = direction.angle
        directionChange = getDirectionChange(previousDirectionAngle, directionAngle)

        // if the direction changed rapidly, don't use this point
        // any direction is allowed for starting points
        if (!(isPathBeginning && isStart) && directionChange > opt.maxAllowedDirectionChange) continue

        const neighborPoint = align(currentPoint.clone().offset(direction.gridOffsetX, direction.gridOffsetY), grid, precision)
        const neighborKey = getKey(neighborPoint)

        // Closed points from the openSet were already evaluated.
        if (openSet.isClose(neighborKey) || isPointObstacle(neighborPoint)) continue

        //
        // *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
        // avoid routing lines on top of one another
        //
        const action = lineMap.action(currentPoint, neighborPoint, sourceAnchor, targetAnchor)
        if (action.code === ACTION_STOP) continue
        if (action.code === ACTION_MERGE) {
          // console.log('Merge with route to target: ')
          //
          // Add new point (intersection point with existing route) to points
          //
          let prevPoint = currentPoint
          let newPoint = action.intersection
          let pointKey = getKey(newPoint)
          if (!newPoint.equals(prevPoint)) {
            // add new point only if it is different from previous
            // to avoid creating infinite loop
            points[pointKey] = newPoint
            parents[pointKey] = prevPoint
          }
          //
          // Find line in existing route that intersects with route under construction
          //
          let lineIndex = 0
          while (lineIndex < action.route.lines.length &&
                 !action.route.lines[lineIndex].equals(action.existingLine)) {
            lineIndex++
          }
          //
          // If existing line not found, output diagnostic data
          //
          if (lineIndex === action.route.lines.length) {
            console.log('Action route: ' + JSON.stringify(action.route))
            console.log('Action intersection: ' + JSON.stringify(action.intersection))
            console.log('Action existingLine: ' + JSON.stringify(action.existingLine))
            console.log('prevPoint: ' + JSON.stringify(prevPoint))
          }
          //
          // Move on to next line in route if intersection is at end of route line
          //
          if (action.route.lines[lineIndex].end.equals(action.intersection)) {
            lineIndex++
          }
          //
          // Add line end points from remainder of existing route to new route
          // Don't add the last end point as this is the target / end
          //
          while (lineIndex < action.route.lines.length - 1) {
            prevPoint = newPoint
            newPoint = action.route.lines[lineIndex].end
            pointKey = getKey(newPoint)
            points[pointKey] = newPoint
            parents[pointKey] = prevPoint
            lineIndex++
          }

          opt.previousDirectionAngle = previousDirectionAngle
          return reconstructRoute(parents, points, newPoint, start, end, grid, opt)
        }
        // *** End of changes from original manhattan router code (JointJS version 4.1.3) ***

        // We can only enter end points at an acceptable angle.
        if (endPointsKeys.indexOf(neighborKey) >= 0) { // neighbor is an end point
          const isNeighborEnd = neighborPoint.equals(end) // (is target anchor or `to` point) = can be entered in any direction

          if (!isNeighborEnd) {
            const endDirectionAngle = getDirectionAngle(neighborPoint, end, numDirections, grid, opt)
            const endDirectionChange = getDirectionChange(directionAngle, endDirectionAngle)

            if (endDirectionChange > opt.maxAllowedDirectionChange) continue
          }
        }

        // The current direction is ok.

        const neighborCost = direction.cost
        const neighborPenalty = isStart ? 0 : opt.penalties[directionChange] // no penalties for start point
        const costFromStart = currentCost + neighborCost + neighborPenalty

        if (!openSet.isOpen(neighborKey) || (costFromStart < costs[neighborKey])) {
          // neighbor point has not been processed yet
          // or the cost of the path from start is lower than previously calculated

          points[neighborKey] = neighborPoint
          parents[neighborKey] = currentPoint
          costs[neighborKey] = costFromStart
          openSet.add(neighborKey, costFromStart + estimateCost(neighborPoint, endPoints))
        }
      }

      loopsRemaining--
    }
  }

  // no route found (`to` point either wasn't accessible or finding route took
  // way too much calculation)
  return opt.fallbackRoute.call(this, start, end, opt)
}

// resolve some of the options
function resolveOptions (opt) {
  opt.directions = joint.util.result(opt, 'directions')
  opt.penalties = joint.util.result(opt, 'penalties')
  opt.paddingBox = joint.util.result(opt, 'paddingBox')
  opt.padding = joint.util.result(opt, 'padding')

  if (opt.padding) {
    // if both provided, opt.padding wins over opt.paddingBox
    const sides = joint.util.normalizeSides(opt.padding)
    opt.paddingBox = {
      x: -sides.left,
      y: -sides.top,
      width: sides.left + sides.right,
      height: sides.top + sides.bottom
    }
  }

  joint.util.toArray(opt.directions).forEach(function (direction) {
    const point1 = new joint.g.Point(0, 0)
    const point2 = new joint.g.Point(direction.offsetX, direction.offsetY)

    direction.angle = joint.g.normalizeAngle(point1.theta(point2))
  })
}

// initialization of the route finding
function router (vertices, opt, linkView) {
  resolveOptions(opt)

  // enable/disable linkView perpendicular option
  linkView.options.perpendicular = !!opt.perpendicular

  const sourceBBox = getSourceBBox(linkView, opt)
  const targetBBox = getTargetBBox(linkView, opt)

  const sourceAnchor = getSourceAnchor(linkView, opt)
  // var targetAnchor = getTargetAnchor(linkView, opt);

  // pathfinding
  let isPointObstacle
  if (typeof opt.isPointObstacle === 'function') {
    isPointObstacle = opt.isPointObstacle
  } else {
    const map = new ObstacleMap(opt)
    map.build(linkView.paper.model, linkView.model)
    isPointObstacle = (point) => !map.isPointAccessible(point)
  }

  const oldVertices = joint.util.toArray(vertices).map(joint.g.Point)
  const newVertices = []
  let tailPoint = sourceAnchor // the origin of first route's grid, does not need snapping
  //
  // *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
  // avoid routing lines on top of one another
  //
  const lineMap = (new LineMap(opt)).build(linkView.paper, linkView.model)
  // *** End of changes from original manhattan router code (JointJS version 4.1.3) ***

  // find a route by concatenating all partial routes (routes need to pass through vertices)
  // source -> vertex[1] -> ... -> vertex[n] -> target
  let to, from

  for (let i = 0, len = oldVertices.length; i <= len; i++) {
    let partialRoute = null

    from = to || sourceBBox
    to = oldVertices[i]

    if (!to) {
      // this is the last iteration
      // we ran through all vertices in oldVertices
      // 'to' is not a vertex.

      to = targetBBox

      // If the target is a point (i.e. it's not an element), we
      // should use dragging route instead of main routing method if it has been provided.
      const isEndingAtPoint = !linkView.model.get('source').id || !linkView.model.get('target').id

      if (isEndingAtPoint && joint.util.isFunction(opt.draggingRoute)) {
        // Make sure we are passing points only (not rects).
        const dragFrom = (from === sourceBBox) ? sourceAnchor : from
        const dragTo = to.origin()

        partialRoute = opt.draggingRoute.call(linkView, dragFrom, dragTo, opt)
      }
    }

    // if partial route has not been calculated yet use the main routing method to find one
    //
    // *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
    // avoid routing lines on top of one another
    //
    partialRoute = partialRoute || findRoute.call(linkView, from, to, isPointObstacle, lineMap, opt)

    if (partialRoute === null) { // the partial route cannot be found
      const retRoute = opt.fallbackRouter(vertices, opt, linkView)
      const routeAsCrowFlies = new joint.g.Line(from, to)
      if (retRoute.length > 0 || routeAsCrowFlies.length() > 4 * opt.step) {
        // Record fall back routes where the route isn't just
        // a straight line between source and target with a length
        // no more than 4 * step size
        if (!opt.failedLinks.includes(linkView.model.id)) {
          // Add if not already in the list
          opt.failedLinks.push(linkView.model.id)
        }
      }
      return retRoute
    }
    // *** End of changes from original manhattan router code (JointJS version 4.1.3) ***

    const leadPoint = partialRoute[0]

    // remove the first point if the previous partial route had the same point as last
    if (leadPoint && leadPoint.equals(tailPoint)) partialRoute.shift()

    // save tailPoint for next iteration
    tailPoint = partialRoute[partialRoute.length - 1] || tailPoint

    Array.prototype.push.apply(newVertices, partialRoute)
  }

  return newVertices
}

// public function
// *** Start of changes from original manhattan router code (JointJS version 4.1.3) ***
export const manhattanPlus = function (vertices, opt, linkView) {
  const routePoints = router(vertices, joint.util.assign({}, config, opt), linkView)
  return routePoints
}
// *** End of changes from original manhattan router code (JointJS version 4.1.3) ***
