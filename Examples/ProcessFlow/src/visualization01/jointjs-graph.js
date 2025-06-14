// See https://resources.jointjs.com/tutorial/elements
import * as joint from '@joint/core'
import { mergeJumpover } from './jointjs-merge-jumpover'
import { manhattanPlus } from './jointjs-manhattan-plus-router'
import * as Shapes from './jointjs-shapes'
import * as Types from './element-types'
import * as ActivityGroup from './group-label'
import * as JointGroup from './jointjs-group-label'
import { OrientedDimensions, OrientedSides } from './oriented'
// import * as Data from './process-data'

const elementTypeActorLane = 0
const elementTypeStep = 1
const elementTypeIO = 2
const elementTypeGroup = 3
const elementTypeLabel = 4
const elementTypePhaseExtent = 5
const elementTypeSwimlane = 6

const classNameStep = 'mood-graph-step'
const classNameStepLabel = classNameStep + '-label'
const classNameIO = 'mood-graph-io'
const classNameIOLabel = classNameIO + '-label'

const propertyGraphElement = 'graphElement'
const propertyLane = 'lane'
const propertyDataElement = 'dataElement'

const primaryHighlightClass = 'highlight-primary'
const secondaryHighlightClass = 'highlight-secondary'

export class GraphCell {
  /**
   *
   * @param {joint.dia.Cell} cell
   * @param {joint.dia.Graph} graph
   * @param {joint.dia.Paper} paper
   */
  constructor (cell, graph, paper) {
    const element = cell
    element.set(propertyGraphElement, this)

    this.element = () => element
    this.size = () => element.size()
    this.position = () => element.position()
    this.getView = function () {
      let view = paper.findViewByModel(element)
      if (view === undefined) {
        // element may not be rendered yet following bulk addition of graph cells
        // so force it to be rendered now
        view = paper.renderView(element)
      }
      return view
    }
    this.draw = function () {
      element.addTo(graph)
    }
    this.remove = function () {
      element.remove()
    }
    this.restore = function () {
      element.addTo(graph)
    }
    function highlightClassName (isPrimary) {
      return isPrimary ? primaryHighlightClass : secondaryHighlightClass
    }

    /**
     * Return a highlighter object for use in cellView highlight and unhighlight calls
     * @param {boolean} isPrimary true if to highlight as a primary (direct) node rather than secondary (indirect)
     */
    function highlighter (isPrimary) {
      const className = highlightClassName(isPrimary)
      return {
        name: 'addClass',
        options: {
          className
        }
      }
    }

    this.highlight = function (isPrimary) {
      this.getView().highlight(null/* defaults to cellView.el */, {
        highlighter: highlighter(isPrimary)
      })
    }

    this.unhighlight = function (isPrimary) {
      this.getView().unhighlight(null/* defaults to cellView.el */, {
        highlighter: highlighter(isPrimary)
      })
    }

    this.isHighlighted = function () {
      const cellView = this.getView()
      const htmlElement = document.getElementById(cellView.id)
      return htmlElement.classList.contains(primaryHighlightClass) ||
             htmlElement.classList.contains(secondaryHighlightClass)
    }
  }
}

export class GraphElement extends GraphCell {
  constructor (graphElement, elementType, graph, paper) {
    super(graphElement, graph, paper)
    const type = elementType
    let parent = null

    this.parent = () => parent
    this.type = () => type
    this.nameTruncated = function () {
      const view = this.getView()
      const renderedText = view.$('text').text()
      const hEllipsis = '\u2026'
      return renderedText.substring(renderedText.length - 1) === hEllipsis
    }
    this.addTooltip = function (text) {
      this.element().attr('title/text', text)
    }
    this.getPortId = function (portGroupName, portIndex) {
      const groupPorts = this.element().getGroupPorts(portGroupName)
      let portId
      if (groupPorts.length > portIndex) {
        portId = groupPorts[portIndex].id
      }
      return portId
    }
    this.getPortsPositions = function (portGroupName) {
      return this.element().getPortsPositions(portGroupName)
    }
    this.getPortPosition = function (portId) {
      const port = this.element().getPort(portId)
      let position
      if (port) {
        position = this.getPortsPositions(port.group)[portId]
      }
      return position
    }

    /**
         * Add a graph element as a child
         * @param {GraphElement} child
         */
    this.addChild = function (child) {
      this.element().embed(child.element())
      child.setParent(this)
    }
    /**
         * Set parent of element
         * @param {GraphElement} parentElement
         */
    this.setParent = function (parentElement) {
      parent = parentElement
    }
  }
}

export class GraphLink extends GraphCell {
  constructor (graphLink, graph, paper) {
    super(graphLink, graph, paper)

    this.complexity = function () {
      return this.getView().getConnectionSubdivisions().length
    }
  }
}

export class Graph {
  constructor (htmlElement, diagramSize, gridSize, elementSizes, events, renderSwimlaneWatermarks, verticalSwimlanes) {
    const clickEvent = events.handleClickEvent
    const otherOffPageConnector = events.otherOffPageConnector

    // Define shapes dynamically allowing flow ports to be aligned to the grid
    Shapes.defineShapes(gridSize, elementSizes, renderSwimlaneWatermarks, verticalSwimlanes)

    let cells = []
    const drawingReport = {}
    const graph = new joint.dia.Graph()
    //
    // Define directions for the router
    // For horizontal swimlanes adjust costs to prefer vertical
    //
    const directionDown = { offsetX: 0, offsetY: 10, cost: 10 }
    const directionUp = { offsetX: 0, offsetY: -10, cost: 10 }
    const directionRight = { offsetX: 10, offsetY: 0, cost: 10 }
    const directionLeft = { offsetX: -10, offsetY: 0, cost: 10 }
    const directions = []
    if (verticalSwimlanes) {
      directions.push(directionRight)
      directions.push(directionLeft)
      directions.push(directionDown)
      directions.push(directionUp)
    } else {
      directionDown.cost = 5
      directionUp.cost = 5
      directions.push(directionDown)
      directions.push(directionUp)
      directions.push(directionRight)
      directions.push(directionLeft)
    }

    const paper = new joint.dia.Paper({
      el: htmlElement,
      model: graph,
      width: diagramSize.width,
      height: diagramSize.height,
      gridSize,
      // validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
      //     // Only permit linking from output ports.
      //     if (magnetS && magnetS.getAttribute('port-group').substring(0, 2) !== 'out') {
      //         return false;
      //     }
      //     // // Prevent linking from output ports to input ports within one element.
      //     // if (cellViewS === cellViewT) return false;
      //     // Only permit linking to output ports.
      //     return magnetT && magnetT.getAttribute('port-group').substring(0, 2) === 'out';
      // },
      restrictTranslate: function (el) { // eslint-disable-line no-unused-vars
        let area = {}
        // const data = el.model.get(propertyGraphElement)
        // if (data !== undefined && data.swimlane() !== null) {
        //     area = {
        //         x: data.swimlane().position().x,
        //         y: 0,
        //         width: data.swimlane().size().width,
        //         height: diagramSize.height
        //     }
        // } else {
        area = {
          x: 0,
          y: 0,
          width: diagramSize.width,
          height: diagramSize.height
        }
        // }
        return area
      },
      interactive: false // {elementMove: false, addLinkFromMagnet: false}
      // function(cellView, method) {
      //   console.log('Interaction: ' + method)
      //   return cellView instanceof joint.dia.LinkView // Only allow interaction with joint.dia.LinkView instances.
      // }
    })
    const sizeConfig = determineSizes(renderSwimlaneWatermarks)

    function determineSizes (renderSwimlaneWatermarks) {
      const sizes = {}
      let element = Shapes.createProcessStep()
      element.attr({
        label: {
          class: classNameStepLabel
        }
      })
      element.addTo(graph)
      // Determine Step element label font size
      let elementView = paper.findViewByModel(element)
      let textElement = elementView.el.getElementsByTagName('text')[0]
      let computedStyle = window.getComputedStyle(textElement, null)
      sizes.step = {
        fontSize: computedStyle.getPropertyValue('font-size'),
        fontFamily: computedStyle.getPropertyValue('font-family'),
        fontWeight: computedStyle.getPropertyValue('font-weight')
      }
      // console.log('Step font size: ' + sizes.stepFontSize + ', time:' + Date.now())
      element.remove()
      // Determine IO element label font size
      element = Shapes.createData()
      element.attr({
        label: {
          class: classNameIOLabel
        }
      })
      element.addTo(graph)
      elementView = paper.findViewByModel(element)
      textElement = elementView.el.getElementsByTagName('text')[0]
      computedStyle = window.getComputedStyle(textElement, null)
      sizes.io = {
        fontSize: computedStyle.getPropertyValue('font-size'),
        fontFamily: computedStyle.getPropertyValue('font-family'),
        fontWeight: computedStyle.getPropertyValue('font-weight')
      }
      // console.log('IO font size: ' + sizes.ioFontSize + ', time:' + Date.now())
      element.remove()
      if (renderSwimlaneWatermarks) {
        // Determine Swimlane watermark font size
        element = Shapes.createActor()
        element.addTo(graph)
        elementView = paper.findViewByModel(element)
        textElement = elementView.el.getElementsByTagName('text')[0]
        computedStyle = window.getComputedStyle(textElement, null)
        sizes.swimlane = {
          fontSize: computedStyle.getPropertyValue('font-size'),
          fontFamily: computedStyle.getPropertyValue('font-family'),
          fontWeight: computedStyle.getPropertyValue('font-weight')
        }
        element.remove()
      }
      // Determine Phase label font size
      element = Shapes.createVerticalLabel()
      element.addTo(graph)
      elementView = paper.findViewByModel(element)
      textElement = elementView.el.getElementsByTagName('text')[0]
      computedStyle = window.getComputedStyle(textElement, null)
      sizes.phase = {
        fontSize: computedStyle.getPropertyValue('font-size'),
        fontFamily: computedStyle.getPropertyValue('font-family'),
        fontWeight: computedStyle.getPropertyValue('font-weight')
      }
      element.remove()

      return sizes
    }

    //
    // Set default connection point to be the boundary of the shape
    // instead of the default which is the edge of the bounding box
    //
    paper.options.defaultConnectionPoint = {
      name: 'boundary',
      args: {
        sticky: true
      }
    }

    paper.on('cell:pointerclick', function (cellView, evt) {
      evt.stopPropagation() // stop any further actions with the element view (e.g. dragging)

      const model = cellView.model
      console.log('pointerclick: ' + model.get(propertyLane))

      const element = model.get(propertyDataElement)
      const graphCell = model.get(propertyGraphElement)

      let otherConnector = otherOffPageConnector(element)
      if (otherConnector) {
        let view = paper.findViewByModel(otherConnector.element.element())
        if (view === undefined) {
          // element may not be rendered yet following bulk addition of graph cells
          // so force it to be rendered now
          view = paper.renderView(otherConnector.element.element())
        }
        const htmlElement = document.getElementById(view.id)
        try {
          htmlElement.scrollIntoView(otherConnector.input)
        } catch (error) {
          console.log('scrollIntoView() function not supported')
          // Revert to standard highlighting behaviour
          otherConnector = null
        }
      }

      if (element && (!otherConnector || (graphCell && !graphCell.isHighlighted()))) {
        clickEvent({ element, event: evt.originalEvent.originalEvent })
      }
      // events.handleHighlighting.call(events.handleHighlighting, [model.id]);

      //     rect.findView(paper)
      //       .$el.find('.Settings') // access underlying Backbone
      //       .on('click', function() {
      //         console.log('Click')
      //       })
      /*
          if (model.attr('body/visibility') === 'visible') {
              model.attr('body/visibility', 'hidden');
              model.attr('label/visibility', 'hidden');
      //        model.attr('buttonLabel/text', '＋'); // fullwidth plus

          } else {
              model.attr('body/visibility', 'visible');
              model.attr('label/visibility', 'visible');
      //        model.attr('buttonLabel/text', '＿'); // fullwidth underscore
          }
      */
    })

    paper.on('cell:mouseover', function (cellView, evt) {
      evt.stopPropagation() // stop any further actions with the element view (e.g. dragging)

    //   const model = cellView.model
      //      console.log('mouseover: ' + JSON.stringify(model))
    })

    paper.on('cell:mouseout', function (cellView, evt) {
      evt.stopPropagation() // stop any further actions with the element view (e.g. dragging)

    //   const model = cellView.model
      //    console.log('mouseout: ' + model.get('group'))
    })

    /**
     * Draw all the graph elements that have been created
     */
    this.draw = function () {
      drawingReport.failedLinks = []
      graph.resetCells(cells)
      //
      // Force all links to be redrawn so that any missing line jumps on lines drawn earlier appear
      //
      const graphCells = graph.getLinks()
      if (graphCells.length > 0) {
        const cell = graphCells[graphCells.length - 1]
        cell.toFront()
        graphCells[0].toFront()
      }

      cells = []
      return drawingReport
    }

    this.startBatch = function (name) {
      graph.startBatch(name)
    }
    this.stopBatch = function (name) {
      graph.stopBatch(name)
    }

    /**
     * Break the label text to fit in the space available for the label
     * @param {Shapes.*} jointElement
     * @param {*} args
     */
    function elementLabel (jointElement, args) {
      let labelTextHeight
      let labelTextWidth
      //
      // Adjust width allowed for text label if the label element
      // has a width defined
      //
      const labelWidth = jointElement.attr('label/width')
      const labelRefWidth = jointElement.attr('label/refWidth')
      if (labelWidth !== undefined) {
        labelTextWidth = labelWidth
      } else if (labelRefWidth !== undefined) {
        labelTextWidth = args.size.width * labelRefWidth
      } else {
        labelTextWidth = args.size.width
      }
      //
      // Adjust height allowed for text label if the label element
      // has a height defined
      //
      const labelHeight = jointElement.attr('label/height')
      const labelRefHeight = jointElement.attr('label/refHeight')
      if (labelWidth !== undefined) {
        labelTextHeight = labelHeight
      } else if (labelRefHeight !== undefined) {
        labelTextHeight = args.size.height * labelRefHeight
      } else {
        labelTextHeight = args.size.height
      }

      return joint.util.breakText(
        args.label,
        {
          width: labelTextWidth,
          height: labelTextHeight
        }, {
          'font-size': args.font.fontSize,
          'font-family': args.font.fontFamily,
          'font-weight': args.font.fontWeight
        }, {
          ellipsis: args.ellipsis
        })
    }

    /**
     * Add a class to a selected element in the joint model
     * @param {joint} jointElement The model element to add the class to
     * @param {String} selector Selector for tag in model element. Does not include '/class' suffix
     * @param {String} className Name of class(es) to add
     */
    function addClass (jointElement, selector, className) {
      let existingClasses = jointElement.attr(selector + '/class') || ''
      existingClasses += existingClasses !== '' ? ' ' : ''
      jointElement.attr(selector + '/class', existingClasses + className)
    }
    /**
         * Create a new JointJS diagram shape element
         * @param {Data.Element} element
         * @param {int} laneIndex
         */
    this.createElement = function (element, laneIndex) {
      let jointElement
      let type
      let font
      // let fontSize
      const size = {
        width: element.size().width,
        height: element.size().height
      }
      const position = {
        x: element.position().x,
        y: element.position().y
      }
      const id = { id: element.id() }
      switch (element.type()) {
        case Types.process:
          jointElement = Shapes.createProcess(id)
          type = elementTypeIO
          break
        case Types.subProcess:
          jointElement = Shapes.createSubProcess(id)
          type = elementTypeStep
          break
        case Types.processStep:
          jointElement = Shapes.createProcessStep(id)
          type = elementTypeStep
          break
        case Types.start:
        case Types.end:
          jointElement = Shapes.createStart(id)
          type = elementTypeStep
          break
        case Types.decision:
        case Types.decisionLarge:
          jointElement = Shapes.createDecision(id)
          type = elementTypeStep
          break
        case Types.offPageOutput:
          jointElement = Shapes.createOffPageOutput(id)
          type = elementTypeStep
          break
        case Types.offPageInput:
          jointElement = Shapes.createOffPageInput(id)
          type = elementTypeStep
          break
        case Types.externalData:
          jointElement = Shapes.createExternalData(id)
          type = elementTypeIO
          break
        case Types.database:
          jointElement = Shapes.createDatabase(id)
          type = elementTypeIO
          break
        case Types.document:
          jointElement = Shapes.createDocument(id)
          type = elementTypeIO
          break
        case Types.data:
          jointElement = Shapes.createData(id)
          type = elementTypeIO
          break
        case Types.other:
          jointElement = Shapes.createOther(id)
          type = elementTypeIO
          break
        case Types.BPMNStartEvent:
          jointElement = Shapes.createBPMNStartEvent(id)
          type = elementTypeStep
          break
        case Types.BPMNStartEventMessage:
          jointElement = Shapes.createBPMNStartEventMessage(id)
          type = elementTypeStep
          break
        case Types.BPMNStartEventTimer:
          jointElement = Shapes.createBPMNStartEventTimer(id)
          type = elementTypeStep
          break
        case Types.BPMNStartEventError:
          jointElement = Shapes.createBPMNStartEventError(id)
          type = elementTypeStep
          break
        case Types.BPMNIntermediateEvent:
          jointElement = Shapes.createBPMNIntermediateEvent(id)
          type = elementTypeStep
          break
        case Types.BPMNIntermediateEventMessage:
          jointElement = Shapes.createBPMNIntermediateEventMessage(id)
          type = elementTypeStep
          break
        case Types.BPMNIntermediateEventTimer:
          jointElement = Shapes.createBPMNIntermediateEventTimer(id)
          type = elementTypeStep
          break
        case Types.BPMNIntermediateEventError:
          jointElement = Shapes.createBPMNIntermediateEventError(id)
          type = elementTypeStep
          break
        case Types.BPMNEndEvent:
          jointElement = Shapes.createBPMNEndEvent(id)
          type = elementTypeStep
          break
        case Types.BPMNEndEventMessage:
          jointElement = Shapes.createBPMNEndEventMessage(id)
          type = elementTypeStep
          break
        case Types.BPMNEndEventTimer:
          jointElement = Shapes.createBPMNEndEventTimer(id)
          type = elementTypeStep
          break
        case Types.BPMNEndEventError:
          jointElement = Shapes.createBPMNEndEventError(id)
          type = elementTypeStep
          break
        case Types.BPMNExclusiveGateway:
          jointElement = Shapes.createBPMNExclusiveGateway(id)
          type = elementTypeStep
          break
        case Types.BPMNParallelGateway:
          jointElement = Shapes.createBPMNParallelGateway(id)
          type = elementTypeStep
          break
        case Types.BPMNInclusiveGateway:
          jointElement = Shapes.createBPMNInclusiveGateway(id)
          type = elementTypeStep
          break
        case Types.BPMNDataObject:
          jointElement = Shapes.createBPMNDataObject(id)
          type = elementTypeStep
          break
        case Types.BPMNDataObjectInput:
          jointElement = Shapes.createBPMNDataObjectInput(id)
          type = elementTypeStep
          break
        case Types.BPMNDataObjectOutput:
          jointElement = Shapes.createBPMNDataObjectOutput(id)
          type = elementTypeStep
          break
        case Types.BPMNDataStorage:
          jointElement = Shapes.createBPMNDataStorage(id)
          type = elementTypeStep
          break
        default:
          jointElement = Shapes.createProcessStep(id)
          type = elementTypeIO
          break
      }
      jointElement.set(propertyLane, laneIndex)
      jointElement.set(propertyDataElement, element)
      jointElement.position(position.x, position.y)
      jointElement.resize(size.width, size.height)
      //
      // Set class for body and text elements according to element type
      //
      switch (type) {
        case elementTypeIO:
          font = sizeConfig.io
          break
        case elementTypeStep:
          font = sizeConfig.step
          break
      }

      const labelText = elementLabel(
        jointElement,
        {
          label: element.name(),
          size,
          font,
          ellipsis: true
        })

      jointElement.attr({
        label: {
          text: labelText
        }
      })
      // jointElement.addTo(graph)
      cells.push(jointElement)

      const gElement = new GraphElement(jointElement, type, graph, paper)
      if (gElement.nameTruncated() || element.fullName()) {
        gElement.addTooltip(element.fullName() || element.name())
      }

      return gElement
    }

    this.createLabel = function (phase, width, height, position) {
      const id = { id: phase.id() }
      const labelSize = new OrientedDimensions(verticalSwimlanes)
      labelSize.setDimensions({ width, height })
      const size = {
        width: labelSize.height(),
        height: labelSize.width()
      }
      const label = Shapes.createVerticalLabel(id)
      label.resize(width, height)
      const labelText = elementLabel(
        label,
        {
          label: phase.name(),
          size,
          font: sizeConfig.phase,
          ellipsis: true
        })

      label.attr({
        label: {
          text: labelText
        }
      })
      if (!phase.navigable()) {
        addClass(label, 'body', 'no-interaction')
        addClass(label, 'label', 'no-interaction')
      }
      label.set(propertyDataElement, phase)
      label.position(position.x, position.y)

      // label.addTo(graph)
      cells.push(label)
      const gElement = new GraphElement(label, elementTypeLabel, graph, paper)
      gElement.addTooltip(phase.name())

      return gElement
    }

    /**
     * Create a shape to mark the extent a phase
     * @param {Data.Phase} phase
     * @param {int} width width of swimlane section of diagram
     * @param {int} height height of phase
     * @param {*} position position of end of phase
     */
    this.createPhaseMarker = function (phase, width, height, position) {
      const line = Shapes.createPhaseExtent()
      line.resize(width, height)
      line.position(position.x, position.y)
      addClass(line, 'body', 'no-interaction')

      // line.addTo(graph)
      cells.push(line)
      return new GraphElement(line, elementTypePhaseExtent)
    }

    /**
     * Create a rectangle to identify a grouping of process steps
     * @param {Data.StepGroup} stepGroup
     */
    this.createStepGroup = function (stepGroup) {
      const id = { id: stepGroup.id() }
      const group = Shapes.createStepGroup(id)
      group.resize(stepGroup.size().width, stepGroup.size().height)
      group.position(stepGroup.position().x, stepGroup.position().y)
      const labelConfig = JointGroup.elementAttributes[stepGroup.labelPosition()] || JointGroup.elementAttributes[ActivityGroup.labelPositionDefault]
      group.attr({
        label: {
          text: stepGroup.name(),
          textVerticalAnchor: labelConfig.textVerticalAnchor,
          textAnchor: labelConfig.textAnchor,
          transform: labelConfig.transform
        }
      })
      group.attr('label/text', stepGroup.name())

      cells.push(group)
      group.set(propertyDataElement, stepGroup)

      return new GraphElement(group, elementTypeGroup, graph, paper)
    }

    this.createActorLane = function (actor, label, width, height, index, position, repeatSpacing) {
      const laneId = actor ? { id: actor.id() } : undefined
      const laneColour = actor ? actor.backgroundColour() : undefined
      const watermarkTextColour = actor ? actor.textColour() : undefined
      const actorLane = Shapes.createActor(laneId)
      const even = index % 2 === 0 ? 'true' : 'false'
      actorLane.resize(width, height)
      const attributes = {
        body: {
          even
        }
      }
      //
      // Add label as watermark
      //
      if (repeatSpacing > 0) {
        const actorSize = new OrientedDimensions(verticalSwimlanes)
        actorSize.setDimensions({ width, height })
        const repeatCount = actorSize.height() / repeatSpacing
        const repeatRatio = 1 / repeatCount
        const textId = (actor ? actor.id() : label) + '-swimlane-text'
        const watermarkSize = new OrientedDimensions(verticalSwimlanes)
        watermarkSize.setDimensions({ width: actorSize.width(), height: repeatSpacing })
        const watermarkText = elementLabel(
          actorLane,
          {
            label,
            size: watermarkSize.dimensions(),
            font: sizeConfig.swimlane,
            ellipsis: true
          })
        attributes.pattern = {
          id: textId
        }
        if (verticalSwimlanes) {
          attributes.pattern.height = repeatRatio
        } else {
          attributes.pattern.width = repeatRatio
        }
        attributes.watermark = {
          fill: 'url(#' + textId + ')'
        }
        attributes.text = {
          text: watermarkText,
          even
        }
        if (watermarkTextColour) {
          attributes.text.style = {
            fill: watermarkTextColour
          }
        }
      }
      if (laneColour) {
        attributes.body.style = {
          fill: laneColour
        }
      }
      actorLane.attr(attributes)
      if (!actor) {
        addClass(actorLane, 'watermark', 'no-interaction')
        addClass(actorLane, 'text', 'io')
        addClass(actorLane, 'body', 'io')
      }
      actorLane.set(propertyLane, index)
      actorLane.set(propertyDataElement, actor)
      actorLane.position(position.x, position.y)

      // swimlane.addTo(graph)
      cells.push(actorLane)
      return new GraphElement(actorLane, elementTypeActorLane, graph, paper)
    }

    this.createSwimlane = function (swimlane, width, height, index, position) {
      const laneId = swimlane ? { id: swimlane.id() } : undefined
      const swimlaneElement = Shapes.createSwimlane(laneId)
      swimlaneElement.resize(width, height)
      if (!swimlane) {
        addClass(swimlaneElement, 'body', 'no-interaction')
      }
      swimlaneElement.set(propertyLane, index)
      swimlaneElement.set(propertyDataElement, swimlane)
      swimlaneElement.position(position.x, position.y)

      // swimlane.addTo(graph)
      cells.push(swimlaneElement)
      return new GraphElement(swimlaneElement, elementTypeSwimlane, graph, paper)
    }

    /**
         * Define a custom connector for links from inputs and to outputs. This is based on the jumpover connector
         * but does not jump over other IO links
         * @param {*} sourcePoint
         * @param {*} targetPoint
         * @param {*} vertices
         * @param {*} args
         */

    joint.connectors.ioConnector = function (sourcePoint, targetPoint, vertices, args) {
      return joint.connectors.mergeJumpoverConnector.call(this, sourcePoint, targetPoint, vertices, args)
    }
    /**
     * Define a custom connector for that merges links that have the same target point.
     * The "merge" is achieved by not jumping over links with the same target point.
     * This is based on the jumpover connector
     * @param {g.Point} sourcePoint
     * @param {g.Point} targetPoint
     * @param {Array<g.Point>} vertices
     * @param {object} args
     */
    joint.connectors.mergeJumpoverConnector = function (sourcePoint, targetPoint, vertices, args) {
      return mergeJumpover.call(this, sourcePoint, targetPoint, vertices, args)
    }

    /**
     * Define a custom router that avoids overlaying links on top of one another
     * This is based on the manhattan router
     * @param {*} vertices
     * @param {*} opt
     * @param {*} linkView
     */
    joint.routers.manhattanPlus = function (vertices, opt, linkView) {
      opt.failedLinks = drawingReport.failedLinks
      const ret = manhattanPlus.call(this, vertices, opt, linkView)
      return ret
    }

    /**
     * return the end (source or target) object for a link
     * Where the end has a port specified, the object is the position of the port
     * otherwise the object is the JointJS graph element (model)
     * @param {Data.Element} element
     * @param {String} portId
     * @param {int} offset offset from start / end point for link line to start or end
     */
    function linkEnd (element, portId, offset) {
      let end
      if (portId) {
        const portPos = element.graphElement().getPortPosition(portId)
        end = { id: element.id(), port: portId }
        if (portPos && offset !== 0) {
          //
          // Add offset if port exists on element
          // If the port doesn't exist then the anchor will be the centre
          // of the element and adding an offset would force the line to
          // start within the element rather than on the edge
          //
          end.connectionPoint = {
            name: 'anchor',
            args: {
              offset
            }
          }
        }

        // }

        // const elementPos = element.position()
        // if (portPos) {
        //     end = {
        //         x: elementPos.x + portPos.x,
        //         y: elementPos.y + portPos.y
        //     }
        //   }
      } else {
        end = element.graphElement().element()
      }

      return end
    }

    function createLink (link, routerOptions, labelOptions) {
      const connectorName = routerOptions.connectorName === undefined ? 'jumpover' : routerOptions.connectorName
      const jumpOverOnHorizontalLines = routerOptions.jumpOverOnHorizontalLines !== undefined ? routerOptions.jumpOverOnHorizontalLines : true
      const connectorOptions = { size: 5, jump: 'arc', radius: 0, jumpOverOnHorizontalLines }
      const routerName = routerOptions.routerName
      const vertices = routerOptions.vertices === undefined ? [] : routerOptions.vertices
      const id = { id: link.id() }
      let jointLink
      switch (link.type()) {
        case Types.sequenceFlow:
          jointLink = Shapes.createSequenceFlow(id)
          break
        case Types.ioFlow:
          jointLink = Shapes.createIOFlow(id)
          break
        case Types.messageFlow:
          jointLink = Shapes.createMessageFlow(id)
          break
        case Types.association:
          jointLink = Shapes.createAssociation(id)
          break
      }
      const sides = new OrientedSides(verticalSwimlanes)
      jointLink.source(linkEnd(link.source(), routerOptions.sourcePortId, jointLink.sourceOffset))
      jointLink.target(linkEnd(link.target(), routerOptions.targetPortId, jointLink.targetOffset))
      if (routerName !== undefined) {
        const options = {
          step: gridSize,
          excludeTypes: ['MooD.Swimlane', 'MooD.PhaseExtent', 'MooD.StepGroup', 'MooD.Actor'],
          perpendicular: false,
          padding: routerOptions.stepStandoff, // Math.min(routerOptions.stepStandoff, gridSize * 2 - 1), // gridSize / 2,
          coincidentLineSpace: routerOptions.coincidentLineSpace,
          targetTolerance: routerOptions.targetTolerance,
          directions
        }
        if (routerOptions.startDirections) {
          options.startDirections = routerOptions.startDirections.map(side => sides.orientedSide(side))
        }
        if (routerOptions.endDirections) {
          options.endDirections = routerOptions.endDirections.map(side => sides.orientedSide(side))
        }
        jointLink.router(routerName, options)
      }
      jointLink.connector(connectorName, connectorOptions)
      if (labelOptions.text !== null) {
        const labelText = elementLabel(
          jointLink,
          {
            label: labelOptions.text,
            size: labelOptions.labelMaxSize,
            font: sizeConfig.step,
            ellipsis: true
          })

        jointLink.appendLabel({
          attrs: {
            text: {
              text: labelText
            }
          },
          position: {
            distance: labelOptions.labelStandoff
          }
        })
      }
      jointLink.vertices(vertices)
      jointLink.set(propertyDataElement, link)
      // link.addTo(graph)
      cells.push(jointLink)

      return new GraphLink(jointLink, graph, paper)
    }

    /**
     * Add a link between two JointJS diagram process step elements
     * @param {Data.Flow} flow
     * @param {*} options
     */
    this.createFlow = function (flow, options) {
      const vertices = options.vertices === undefined ? [] : options.vertices
      // let startDirections = [options.startDirection]
      // let endDirections = [options.endDirection]

      return createLink(
        flow,
        {
          sourcePortId: options.sourcePortId,
          targetPortId: options.targetPortId,
          connectorName: 'mergeJumpoverConnector',
          startDirections: options.startDirections,
          endDirections: options.endDirections,
          stepStandoff: options.stepStandoff,
          routerName: 'manhattanPlus', // 'manhattan',
          coincidentLineSpace: options.coincidentLineSpace,
          targetTolerance: options.targetTolerance,
          jumpOverOnHorizontalLines: options.jumpOverOnHorizontalLines,
          vertices
        },
        {
          text: options.labelText,
          labelStandoff: options.labelStandoff === undefined ? 0.3 : options.labelStandoff,
          labelMaxSize: options.labelMaxSize
        })
    }

    /**
     * Add a link between an input/output and a step
     * @param {Data.Element} source
     * @param {Data.Element} target
     * @param {string} label the text for the label on the link, or null for no label
     * @param {*} options
     */
    this.createIOLink = function (ioLink, options) {
      return createLink(
        ioLink,
        {
          connectorName: 'ioConnector',
          startDirections: options.startDirections,
          sourcePortId: options.sourcePortId,
          endDirections: options.endDirections,
          targetPortId: options.targetPortId,
          coincidentLineSpace: options.coincidentLineSpace,
          targetTolerance: options.targetTolerance,
          jumpOverOnHorizontalLines: options.jumpOverOnHorizontalLines,
          vertices: options.vertices
        },
        {
          text: ioLink.name(),
          labelStandoff: 0.3,
          labelMaxSize: options.labelMaxSize
        })
    }
  }
}
