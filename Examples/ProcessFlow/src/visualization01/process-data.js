import * as Types from './element-types'
import * as ActivityGroup from './group-label'
import * as Sides from './jointjs-side-types'

export const partitionLeft = 'left'
export const partitionRight = 'right'
export const partitionCentre = 'centre'

const validStepTypes = [
  Types.start,
  Types.processStep,
  Types.decision,
  Types.decisionLarge,
  Types.subProcess,
  Types.end,
  Types.BPMNStartEvent,
  Types.BPMNStartEventMessage,
  Types.BPMNStartEventTimer,
  Types.BPMNStartEventError,
  Types.BPMNIntermediateEvent,
  Types.BPMNIntermediateEventMessage,
  Types.BPMNIntermediateEventTimer,
  Types.BPMNIntermediateEventError,
  Types.BPMNEndEvent,
  Types.BPMNEndEventMessage,
  Types.BPMNEndEventTimer,
  Types.BPMNEndEventError,
  Types.BPMNExclusiveGateway,
  Types.BPMNParallelGateway,
  Types.BPMNInclusiveGateway,
  Types.BPMNDataObject,
  Types.BPMNDataObjectInput,
  Types.BPMNDataObjectOutput,
  Types.BPMNDataStorage
]

const validInfoTypes = [
  Types.data,
  Types.database,
  Types.document,
  Types.externalData,
  Types.other,
  Types.process
]

const decisionStepTypes = [
  Types.decision,
  Types.decisionLarge,
  Types.BPMNExclusiveGateway,
  Types.BPMNParallelGateway,
  Types.BPMNInclusiveGateway
]

export class Process {
  constructor (data, disableIOSwimlanes) {
    if (!data.process) {
      throw new Error('Process data is missing')
    }
    const name = data.process.name
    const version = data.process.version
    const testNavigation = data.process.testNavigation
    const actors = new ActorSet(data.actors)
    const swimlanes = new SwimlaneSet(actors)
    const phases = new PhaseSet(data.phases)
    const steps = new StepSet(data.steps, actors, phases, swimlanes, disableIOSwimlanes)
    const stepGroups = new StepGroupSet(data.stepGroups)
    const infoSet = new InformationSet()
    const links = new LinkSet(steps, swimlanes, infoSet, disableIOSwimlanes)
    stepGroups.setSteps(data.stepGroupSteps, steps)
    links.setFlows(data.stepFlows)
    if (!disableIOSwimlanes) {
      links.setInputs(data.stepInputs)
      links.setOutputs(data.stepOutputs)
    }

    this.name = () => name
    this.version = () => version
    this.testNavigation = () => testNavigation
    this.getActorSet = () => actors
    this.getSwimlaneSet = () => swimlanes
    this.getPhaseSet = () => phases
    this.getStepSet = () => steps
    this.getStepGroupSet = () => stepGroups
    this.getInformationSet = () => infoSet
    this.getLinkSet = () => links
  }
}

export class BasicElement {
  constructor (elementParam) {
    const basicElement = {
      id: elementParam.id,
      name: elementParam.name,
      fullName: elementParam.fullName,
      navigable: null
    }

    this.id = () => basicElement.id
    // The original (MooD GUID) id for the element, e.g. I/O element copies displayed on the diagram
    this.originalId = () => basicElement.id
    this.name = () => basicElement.name
    this.fullName = () => basicElement.fullName
    this.navigable = () => basicElement.navigable
    this.setNavigable = function (isNavigable) {
      basicElement.navigable = isNavigable
    }
    this.graphElement = () => basicElement.graphElement
    this.setGraphElement = function (graphElement) {
      basicElement.graphElement = graphElement
    }
  }
}

export class Element extends BasicElement {
  constructor (elementParam) {
    super(elementParam)
    const element = {
      type: elementParam.type,
      links: []
    }

    this.type = () => element.type
    this.size = () => element.size.dimensions()
    this.acrossLaneLength = () => element.size.acrossLaneLength()
    this.alongLaneLength = () => element.size.alongLaneLength()
    this.position = () => element.position.coords()
    this.alongLanePosition = () => element.position.alongLanePosition()
    this.centre = function () {
      return {
        x: Math.floor(element.position.x() + element.size.width() / 2),
        y: Math.floor(element.position.y() + element.size.height() / 2)
      }
    }
    this.alongLaneCentre = function () {
      return Math.floor(this.alongLanePosition() + this.alongLaneLength() / 2)
    }
    /**
     * Set the dimensions of the element
     * @param {OrientedDimensions} size
     */
    this.setSize = function (size) {
      element.size = size
    }
    /**
     * Set the position (top left corner) of the element
     * @param {OrientedCoords} position
     */
    this.setPosition = function (position) {
      element.position = position
    }
    this.links = () => element.links
    /**
     * Add link to element
     * @param {Link} link
     */
    this.addLink = function (link) {
      element.links.push(link)
    }
  }
}

export class Swimlane extends BasicElement {
  constructor (actorLaneIndex, index, actor) {
    super({
      id: actor.id() + '-' + actorLaneIndex,
      name: actor.name() + '-' + actorLaneIndex,
      fullName: actor.fullName() + '-' + actorLaneIndex,
      navigable: actor.navigable()
    })
    const swimlane = {
      actorLaneIndex,
      index,
      actor
    }

    this.index = () => swimlane.index
    this.actorLaneIndex = () => swimlane.actorLaneIndex
    this.actor = () => swimlane.actor
    this.originalId = () => swimlane.actor.id()
    this.navigable = () => swimlane.actor.navigable()

    this.setIndex = function (index) {
      swimlane.index = index
    }
  }
}

export class SwimlaneSet {
  constructor (actorSet) {
    const swimlaneDictionary = {}
    const swimlaneArray = []
    let index = 0
    actorSet.actors().forEach(function (actor) {
      for (let i = 0; i < actor.numSwimlanes(); i++) {
        swimlaneArray[index] = new Swimlane(
          i,
          index,
          actor)
        swimlaneDictionary[actor.id() + '-' + i] = swimlaneArray[index++]
      }
    }
    )

    this.getSwimlane = (id) => swimlaneDictionary[id]
    this.getActorSwimlane = (actor, actorLaneIndex) => swimlaneDictionary[actor.id() + '-' + actorLaneIndex]
    this.swimlanes = () => swimlaneArray
    this.length = () => swimlaneArray.length
    this.sort = function () {
      swimlaneArray.sort((a, b) => a.actor().index() - b.actor().index() !== 0 ? a.actor().index() - b.actor().index() : a.actorLaneIndex() - b.actorLaneIndex())
      swimlaneArray.forEach(function (swimlane, index) {
        swimlane.setIndex(index)
      })
    }
  }
}

export class Actor extends BasicElement {
  constructor (actorParam, index, backgroundColour, textColour, numSwimlanes) {
    super(actorParam)
    const actor = {
      index,
      backgroundColour,
      textColour,
      numSwimlanes: numSwimlanes || 1
    }

    this.index = () => actor.index
    this.backgroundColour = () => actor.backgroundColour
    this.textColour = () => actor.textColour
    this.numSwimlanes = () => actor.numSwimlanes

    this.setIndex = function (index) {
      actor.index = index
    }
  }
}

export class ActorSet {
  constructor (actors) {
    const actorDictionary = {}
    const actorArray = []
    let index = 0
    if (!Array.isArray(actors)) {
      throw new Error('Actors data is not an array')
    }
    actors.forEach(function (actor) {
      if (actorDictionary[actor.target.id] === undefined) {
        //
        // Remove duplicate actors
        //
        // Actor swimlane and watermark text colour are defined by the following priority order:
        //   Colour defined on the relationship from process to actor
        //   Colour defined on the actor element (self coloured)
        //   Colour defined on an element related to the actor
        const backgroundColour = actor.backgroundColour
          ? actor.backgroundColour
          : (actor.target.backgroundColour
              ? actor.target.backgroundColour
              : (actor.target.relatedColourDefinition && actor.target.relatedColourDefinition.backgroundColour
                  ? actor.target.relatedColourDefinition.backgroundColour
                  : undefined))
        const textColour = actor.textColour
          ? actor.textColour
          : (actor.target.textColour
              ? actor.target.textColour
              : (actor.target.relatedColourDefinition && actor.target.relatedColourDefinition.textColour
                  ? actor.target.relatedColourDefinition.textColour
                  : undefined))
        // console.log('Actor: ' + actor.target.name + ', index: ' + index + ', background: ' + backgroundColour + ', text: ' + textColour)
        // console.log('Actor: ' + JSON.stringify(actor))
        actorArray[index] = new Actor(
          actor.target,
          index,
          backgroundColour,
          textColour,
          actor.swimlanes)
        actorDictionary[actor.target.id] = actorArray[index++]
      }
    })

    this.getActor = (id) => actorDictionary[id]
    this.actors = () => actorArray
    this.length = () => actorArray.length
    this.numSwimlanes = () =>
      actorArray.reduce((accumulator, actor) => accumulator + actor.numSwimlanes(),
        0)
    this.sort = function () {
      actorArray.sort((a, b) => a.index() - b.index())
      // actorArray.forEach(function(actor) {
      //     console.log('Actor: ' + actor.name() + ', index: ' + actor.index())
      // }
    }
  }
}

export class Information extends Element {
  /**
   * Information constructor. This is only intended to be used via InformationSet.createInformation
   * @param {*} information
   * @param {*} originalId
   */
  constructor (information, originalId) {
    super(information)
    const info = {
      originalId,
      isInput: this.id() === originalId ? undefined : information.isInput // isInput only applicable to copies
    }

    this.originalId = () => info.originalId
    this.isInput = () => info.isInput
    this.laneIndex = () => info.laneIndex
    this.setLaneIndex = function (laneIndex) {
      info.laneIndex = laneIndex
    }
  }
}

export class InformationSet {
  constructor () {
    const informationDictionary = {}
    const informationCopyDictionary = {}
    const informationArray = []

    this.createInformation = (infoParam) => {
      let infoLibrary = informationDictionary[infoParam.id]

      if (!infoLibrary) {
        const info = new Information(infoParam, infoParam.id)
        infoLibrary = informationDictionary[infoParam.id] = {
          original: info,
          copies: []
        }
        informationArray.push(infoLibrary)
      }

      const infoCopy = createCopy(infoParam, infoLibrary)
      informationCopyDictionary[infoCopy.id()] = infoCopy

      return infoCopy
    }

    function createCopy (infoParam, infoLibrary) {
      const copyNumber = infoLibrary.copies.length + 1
      const copyId = infoLibrary.original.id() + '-copy' + copyNumber
      const info = {
        ...infoParam
      }
      const elementId = info.id
      info.id = copyId
      const copy = new Information(info, elementId)
      infoLibrary.copies.push(copy)

      return copy
    }

    this.getInformationCopy = (copyId) => informationCopyDictionary[copyId]
    this.getInformation = (id) => informationDictionary[id]
    this.informationArray = () => informationArray
  }
}

export class Phase extends BasicElement {
  constructor (phaseParam) { // eslint-disable-line no-useless-constructor
    super(phaseParam)
  }
}

export class PhaseSet {
  constructor (phases) {
    const phaseDictionary = {}
    if (!Array.isArray(phases)) {
      throw new Error('Phases data is not an array')
    }
    const phaseArray = phases.map((phase) =>
      new Phase(phase)
    )

    phaseArray.forEach(phase => {
      phaseDictionary[phase.id()] = phase
    })

    this.getPhase = (id) => phaseDictionary[id]
    this.phases = () => phaseArray
    this.length = () => phaseArray.length
    this.noPhases = () => phaseArray.length === 0
  }
}

export class Link extends BasicElement {
  constructor (linkData, source, target) {
    super(linkData)
    const link = {
      source,
      target,
      type: linkData.type
    }

    this.source = () => link.source
    this.target = () => link.target
    this.otherEnd = (end) => link.source === end ? link.target : (link.target === end ? link.source : undefined)
    this.type = () => link.type
  }
}

export class Flow extends Link {
  constructor (flowData, sourceStep, targetStep) {
    super(flowData, sourceStep, targetStep)
    const flow = {
      offPageConnection: flowData.offPageConnection,
      offPageOutputLabel: flowData.offPageOutputLabel,
      offPageInputLabel: flowData.offPageInputLabel,
      labelPosition: flowData.labelPosition,
      sequence: flowData.sequence,
      sourcePort: flowData.sourcePort,
      targetPort: flowData.targetPort
    }

    this.isInputFlow = (step) => this.target() === step
    this.isOutputFlow = (step) => this.source() === step
    this.isOffPageConnection = () => flow.offPageConnection
    this.labelPosition = () => flow.labelPosition
    this.offPageOutputLabel = () => flow.offPageOutputLabel
    this.offPageInputLabel = () => flow.offPageInputLabel
    this.sourcePort = () => flow.sourcePort
    this.targetPort = () => flow.targetPort
    this.setOutputConnector = (step) => {
      flow.outputConnector = step
    }
    this.setInputConnector = (step) => {
      flow.inputConnector = step
    }
    this.outputConnector = () => flow.outputConnector
    this.inputConnector = () => flow.inputConnector
    this.sequence = () => flow.sequence
    this.setSequence = (sequence) => {
      flow.sequence = sequence
    }
  }
}

export class OffPageFlow extends Flow {
  constructor (flowData, sourceStep, targetStep, originalId) {
    super(flowData, sourceStep, targetStep)
    const offPageFlow = {
      originalId
    }

    this.originalId = () => offPageFlow.originalId
  }
}

export class IOLink extends Link {
  constructor (ioLinkData, info, step) {
    ioLinkData.type = ioLinkData.isFlow ? Types.sequenceFlow : Types.ioFlow
    if (info.isInput()) {
      super(ioLinkData, info, step)
    } else {
      super(ioLinkData, step, info)
    }
    const ioLink = {
      info,
      step,
      isFlow: ioLinkData.isFlow
    }

    this.information = () => ioLink.info
    this.step = () => ioLink.step
    this.isFlow = () => ioLink.isFlow
  }
}

export class LinkSet {
  /**
   * LinkSet constructor
   * @param {StepSet} stepSet
   * @param {SwimlaneSet} swimlaneSet
   * @param {InformationSet} infoSet
   * @param {boolean} disableIOSwimlanes
   */
  constructor (stepSet, swimlaneSet, infoSet, disableIOSwimlanes) {
    const linkDictionary = {}
    const flowDictionary = {}
    const inputDictionary = {}
    const outputDictionary = {}
    const flowArray = []
    const inputArray = []
    const outputArray = []
    /**
     * Link steps into a flow
     * @param {*} flows step flow data (stepFlows from config data)
     */
    this.setFlows = (flows) => {
      if (!Array.isArray(flows)) {
        throw new Error('Step Flow data is not an array')
      }
      flows.forEach((flow) => {
        const flowType = flow.type !== undefined ? flow.type : Types.sequenceFlow
        const flowData = {
          id: flow.id,
          name: flow.label,
          navigable: false,
          labelPosition: flow.labelPosition,
          offPageConnection: flow.offPageConnection,
          offPageOutputLabel: flow.offPageOutputLabel,
          offPageInputLabel: flow.offPageInputLabel,
          sequence: flow.sequence,
          sourcePort: flow.sourcePort,
          targetPort: flow.targetPort,
          type: flowType
        }
        const sourceStep = stepSet.getStep(flow.source.id)
        const targetStep = stepSet.getStep(flow.target.id)

        if (sourceStep === undefined) {
          throw new Error('Step flow source "' + flow.source.name + '" not defined')
        }
        if (targetStep === undefined) {
          throw new Error('Step "' + flow.source.name + '" flow target "' + flow.target.name + '" not defined')
        }
        if (targetStep === sourceStep) {
          throw new Error('Flow from step "' + flow.source.name + '" to itself is not permitted')
        }
        if (targetStep.type() === Types.start) {
          throw new Error('Flow from step "' + flow.source.name + '" to "' + flow.target.name + '" is not permitted')
        }
        if (sourceStep.type() === Types.end) {
          throw new Error('Flow from step "' + flow.source.name + '" to "' + flow.target.name + '" is not permitted')
        }
        if (flow.offPageConnection && !flow.offPageOutputLabel) {
          throw new Error('Missing label for Off Page flow output between step "' + sourceStep.name() + '" and "' + targetStep.name() + '"')
        }
        if (flow.offPageConnection && !flow.offPageInputLabel) {
          if (flows.filter(f => f.target.id === flow.target.id && f.offPageConnection && f.offPageInputLabel).length !== 1) {
            throw new Error('All or exactly one labeled Off Page flow must be specified to step "' + targetStep.name() + '"')
          }
        }
        if (flow.sourcePort && Sides.validSideTypes.filter(type => type === flow.sourcePort).length === 0) {
          throw new Error('Flow from "' + sourceStep.name() + '" to "' + targetStep.name() + '" has an invalid output port reservation "' + flow.sourcePort + '"')
        }
        if (flow.targetPort && Sides.validSideTypes.filter(type => type === flow.targetPort).length === 0) {
          throw new Error('Flow from "' + sourceStep.name() + '" to "' + targetStep.name() + '" has an invalid input port reservation "' + flow.targetPort + '"')
        }

        const flowObject = new Flow(flowData, sourceStep, targetStep)
        sourceStep.addFlow(flowObject)
        targetStep.addFlow(flowObject)

        flowArray.push(flowObject)
        flowDictionary[flowObject.id()] = flowObject
        linkDictionary[flowObject.id()] = flowObject
        //
        // Add off page connector steps
        //
        if (flowObject.isOffPageConnection()) {
          //
          // 1. Define off page connection output and input steps data
          //
          const outputStepData = {
            id: flowObject.id() + '-out-connector',
            name: flow.offPageOutputLabel,
            navigable: false,
            type: Types.offPageOutput,
            preventSharingRow: false
          }
          const inputStepData = {
            id: flowObject.id() + '-in-connector',
            name: flow.offPageInputLabel,
            navigable: false,
            type: Types.offPageInput,
            preventSharingRow: false
          }
          //
          // 2. Identify swimlane (actor) to add output connector to
          //
          const outputStep = new OffPageConnector(outputStepData, 0, sourceStep.swimlanes(), sourceStep.phase(), sourceStep.group(), flowObject.id(), stepSet.laneIndexOffset())
          flowObject.setOutputConnector(outputStep)
          //
          // 3. Create flows between source step and off page output connector
          //
          const outFlowData = {
            id: flowObject.id() + '-out-flow',
            name: flowObject.name(),
            navigable: false,
            offPageConnection: false,
            offPageOutputLabel: null,
            offPageInputLabel: null,
            sourcePort: flowObject.sourcePort(),
            type: flowObject.type()
          }
          const outFlowObject = new OffPageFlow(outFlowData, sourceStep, outputStep, flowObject.id())
          outputStep.addFlow(outFlowObject)
          //
          // 4. Identify swimlane to add input connector to if label provided for connector
          //
          if (flow.offPageInputLabel) {
            const stepLaneRange = targetStep.swimlaneRange()
            let connectorLaneIndex
            if (stepLaneRange.max < swimlaneSet.length() - 1) {
              // Choose lane to right of step
              connectorLaneIndex = stepLaneRange.max + 1
            } else if (stepLaneRange.min > 0) {
              // Choose lane to left of step
              connectorLaneIndex = stepLaneRange.min - 1
            } else {
              // no lanes either side of step
              connectorLaneIndex = targetStep.centralLaneIndex()
            }
            const inputConnectorActor = [swimlaneSet.swimlanes()[connectorLaneIndex]]
            const inputStep = new OffPageConnector(inputStepData, 0, inputConnectorActor, targetStep.phase(), targetStep.group(), flowObject.id(), stepSet.laneIndexOffset())
            flowObject.setInputConnector(inputStep)
            //
            // 5. Create flows between off page input connector and target step
            //
            const inFlowData = {
              id: flowObject.id() + '-in-flow',
              name: null,
              navigable: false,
              offPageConnection: false,
              offPageOutputLabel: null,
              offPageInputLabel: null,
              targetPort: flowObject.targetPort(),
              type: flowObject.type()
            }
            const inFlowObject = new OffPageFlow(inFlowData, inputStep, targetStep, flowObject.id())
            inputStep.addFlow(inFlowObject)
          }
        }
        //
        // Add information carried in flows as inputs and outputs
        //
        if (flow.informationCarried && !disableIOSwimlanes) {
          if (!Array.isArray(flow.informationCarried)) {
            // Ignore carried information when no relationship has been mapped:
            //  single element with id equal to id of flow relationship
            // Throw error if carried information is mapped but not an array
            if (!flow.informationCarried.id || flow.informationCarried.id !== flow.id) {
              throw new Error('Information Carried in flow from step "' + sourceStep.name() + '" to step "' + targetStep.name() + '" is not an array')
            }
          } else {
            flow.informationCarried.forEach(link => {
              //
              // Add information as output from source step of flow
              // Don't add as output from Start step
              //
              if (sourceStep.type() !== Types.start) {
                addOutput(
                  link.id + '-out',
                  link.label,
                  sourceStep.id(),
                  sourceStep.name(),
                  link.target.id,
                  link.target.name,
                  link.target.shortName,
                  link.target.type,
                  link.target.navigable,
                  false)
              }
              //
              // Add information as input to target step of flow
              // Don't add as input to End step
              //
              if (sourceStep.type() !== Types.end) {
                addInput(
                  link.id + '-in',
                  link.label,
                  targetStep.id(),
                  targetStep.name(),
                  link.target.id,
                  link.target.name,
                  link.target.shortName,
                  link.target.type,
                  link.target.navigable,
                  false)
              }
            })
          }
        }
      })
      this.orderFlows()
      stepSet.steps().forEach(step => {
        step.orderFlows()
      })
    }

    this.getLink = (id) => linkDictionary[id]
    this.inputs = () => inputArray
    this.outputs = () => outputArray
    this.getFlow = (id) => flowDictionary[id]
    this.flows = () => flowArray
    this.orderFlows = () => {
      flowArray.sort((a, b) =>
        a.source().index() === b.source().index() ? a.target().index() - b.target().index() : a.source().index() - b.source().index())
    }
    /**
     * Validate data for a step input/output
     * @param {Information} info Input for step
     * @param {Step} step Step object
     * @param {String} stepName Name of step
     * @param {Boolean} isInput Flag indicating if information
     */
    function validateStepInfo (info, step, stepName, isInput) {
      const ioType = isInput ? 'input' : 'output'
      if (validInfoTypes.filter(type => type === info.type()).length === 0) {
        throw new Error('Invalid element type "' + info.type() + '" for ' + ioType + ' "' + info.name() + '" in step "' + stepName + '"')
      }

      if (step === undefined) {
        throw new Error('Step "' + stepName + '" with ' + ioType + ' "' + info.name() + '" not defined')
      }
      if (step.type() === Types.start || step.type() === Types.end) {
        if (isInput) {
          throw new Error('Input from "' + info.name() + '" to step "' + step.name() + '" is not permitted')
        } else {
          throw new Error('Output from step "' + step.name() + '" to "' + info.name() + '" is not permitted')
        }
      }
    }
    /**
     * Add an input for a step
     * @param {String} linkId Identity of link between step and input
     * @param {String} linkLabel
     * @param {String} stepId Identity of step
     * @param {String} stepName Name of step
     * @param {String} infoId Identity of input information
     * @param {String} infoName Name of input information
     * @param {String} infoShortName Short name, if provided, of input information
     * @param {String} infoType Type of input information
     * @param {Boolean} isNavigable
     * @param {Boolean} isFlow
     */
    function addInput (linkId, linkLabel, stepId, stepName, infoId, infoName, infoShortName, infoType, isNavigable, isFlow) {
      const step = stepSet.getStep(stepId)
      if (step.inputs().filter(link => link.information().originalId() === infoId).length === 0) {
        // Add input information if not already an input to the step
        const info = infoSet.createInformation({
          id: infoId,
          name: infoShortName === null ? infoName : infoShortName,
          fullName: infoShortName === null ? null : infoName,
          type: infoType,
          navigable: isNavigable,
          isInput: true
        })
        validateStepInfo(info, step, stepName, true)
        const ioLinkData = {
          id: linkId,
          name: linkLabel || null,
          navigable: false,
          isFlow
        }
        const infoLink = new IOLink(ioLinkData, info, step)
        step.addInput(infoLink)
        info.addLink(infoLink)

        inputArray.push(infoLink)
        inputDictionary[infoLink.id()] = infoLink
        linkDictionary[infoLink.id()] = infoLink
      }
    }
    /**
     * Relate inputs to steps
     * @param {*} stepInputs input data (stepInputs from config data)
     */
    this.setInputs = (stepInputs) => {
      if (!Array.isArray(stepInputs)) {
        throw new Error('Step Inputs data is not an array')
      }
      stepInputs.forEach(link => {
        addInput(
          link.id,
          link.label,
          link.target.id,
          link.target.name,
          link.source.id,
          link.source.name,
          link.source.shortName,
          link.source.type,
          link.source.navigable,
          false)
      })
    }
    /**
     * Add an output for a step
     * @param {String} linkId Identity of link between step and output
     * @param {String} linkLabel
     * @param {String} stepId Identity of step
     * @param {String} stepName Name of step
     * @param {String} infoId Identity of output information
     * @param {String} infoName Name of output information
     * @param {String} infoShortName Short name, if provided, of output information
     * @param {String} infoType Type of output information
     * @param {Boolean} isNavigable
     * @param {Boolean} isFlow
     */
    function addOutput (linkId, linkLabel, stepId, stepName, infoId, infoName, infoShortName, infoType, isNavigable, isFlow) {
      const step = stepSet.getStep(stepId)
      if (step.outputs().filter(link => link.information().originalId() === infoId).length === 0) {
        // Add output information if not already an output from the step
        const info = infoSet.createInformation({
          id: infoId,
          name: infoShortName === null ? infoName : infoShortName,
          fullName: infoShortName === null ? null : infoName,
          type: infoType,
          navigable: isNavigable,
          isInput: false
        })
        validateStepInfo(info, step, stepName, false)
        const ioLinkData = {
          id: linkId,
          name: linkLabel,
          navigable: false,
          isFlow
        }
        const infoLink = new IOLink(ioLinkData, info, step)
        step.addOutput(infoLink)
        info.addLink(infoLink)

        outputArray.push(infoLink)
        outputDictionary[infoLink.id()] = infoLink
        linkDictionary[infoLink.id()] = infoLink
      }
    }
    /**
     * Relate steps to outputs
     * @param {*} stepOutputs output data (stepOutputs from config data)
     */
    this.setOutputs = function (stepOutputs) {
      if (!Array.isArray(stepOutputs)) {
        throw new Error('Step Outputs data is not an array')
      }
      stepOutputs.forEach(link => {
        addOutput(
          link.id,
          link.label,
          link.source.id,
          link.source.name,
          link.target.id,
          link.target.name,
          link.target.shortName,
          link.target.type,
          link.target.navigable,
          link.flow)
      })
    }
  }
}

export class Step extends Element {
  constructor (stepParam, index, swimlanes, phase, laneIndexOffset) {
    super(stepParam)
    const step = {
      index,
      swimlanes,
      width: undefined,
      group: undefined,
      flows: [],
      phase,
      inputs: [],
      outputs: [],
      inputPorts: {},
      outputPorts: {},
      preventSharingRow: stepParam.preventSharingRow,
      laneIndexOffset
    }

    this.index = () => step.index
    this.setIndex = (index) => { step.index = index }
    this.swimlanes = () => step.swimlanes
    this.group = () => step.group
    this.phase = () => step.phase
    this.flows = () => step.flows
    this.inFlows = () => step.flows.filter(flow => flow.target() === this)
    this.outFlows = () => step.flows.filter(flow => flow.source() === this)
    this.inputs = () => step.inputs
    this.outputs = () => step.outputs
    this.inputPort = (inputPortId) => step.inputPorts[inputPortId] !== undefined
    this.outputPort = (outputPortId) => step.outputPorts[outputPortId]
    this.outputPortInUse = (outputPortId) => !!((step.outputPorts[outputPortId] &&
                                              step.outputPorts[outputPortId].groups().length > 0))
    this.inputsHeight = () => step.inputsHeight
    this.outputsHeight = () => step.outputsHeight
    this.rowIndex = () => step.rowIndex
    this.leftLaneIndex = () => step.swimlanes[0].index() + step.laneIndexOffset
    this.rightLaneIndex = () => step.swimlanes[step.swimlanes.length - 1].index() + step.laneIndexOffset
    this.preventSharingRow = () => step.preventSharingRow

    this.width = function () {
      if (step.width === undefined) {
        step.width = this.swimlaneRange()
        this.outFlows().forEach((flow) => {
          const flowRange = flow.target().swimlaneRange()
          if (flowRange.min < step.width.min) { step.width.min = flowRange.min }
          if (flowRange.max > step.width.max) { step.width.max = flowRange.max }
        })
      }
      return step.width
    }

    this.setGroup = (group) => {
      step.group = group
    }

    this.setInputsHeight = function (inputsHeight) {
      step.inputsHeight = inputsHeight
    }
    this.setOutputsHeight = function (outputsHeight) {
      step.outputsHeight = outputsHeight
    }
    this.addInput = function (input) {
      step.inputs.push(input)
      this.addLink(input)
    }

    this.addOutput = function (output) {
      step.outputs.push(output)
      this.addLink(output)
    }

    this.addInputPort = function (inputPortId) {
      step.inputPorts[inputPortId] = true
    }

    this.getInputPorts = function () {
      const ports = []
      for (const port in step.inputPorts) {
        ports.push(port)
      }
      return ports
    }

    /**
     * Set the output ports to an object with properties for each output port id
     * @param {*} ports
     */
    this.setOutputPorts = function (ports) {
      step.outputPorts = ports
    }
    this.getOutputPorts = () => step.outputPorts

    this.setRowIndex = function (rowIndex) {
      step.rowIndex = rowIndex
    }

    this.swimlaneRange = function () {
      return { min: this.swimlanes()[0].index(), max: this.swimlanes()[this.swimlanes().length - 1].index() }
    }

    this.fullLaneRange = function () {
      const minLaneIndex = this.inputs().length > 0 ? -Infinity : this.swimlanes()[0].index()
      const maxLaneIndex = this.outputs().length > 0 ? Infinity : this.swimlanes()[this.swimlanes().length - 1].index()

      return { min: minLaneIndex, max: maxLaneIndex }
    }

    this.centralLaneIndex = function () {
      return Math.floor(this.swimlanes()[0].index() + this.swimlanes().length / 2)
    }

    this.addFlow = function (flow) {
      step.flows.push(flow)
      this.addLink(flow)
    }

    this.orderFlows = function () {
      step.flows.sort((a, b) => a.target().index() - b.target().index())
    }
    /**
     *
     * @returns true if step type is a decision
     */
    this.isDecision = () => decisionStepTypes.includes(this.type())
  }
}

export class OffPageConnector extends Step {
  constructor (stepParam, index, swimlanes, phase, group, originalId, laneIndexOffset) {
    super(stepParam, index, swimlanes, phase, laneIndexOffset)
    const offPageConnector = {
      originalId
    }
    this.setGroup(group)
    // console.log('Connector: ' + this.name() + ', group: ' + (this.group() ? this.group().name() : 'N/A'))

    this.originalId = () => offPageConnector.originalId
  }
}

export class StepSet {
  constructor (stepsParam, actorSet, phaseSet, swimlaneSet, disableIOSwimlanes) {
    const stepDictionary = {}
    const laneIndexOffset = disableIOSwimlanes ? 0 : 1
    let swimlanes
    if (!Array.isArray(stepsParam)) {
      throw new Error('Step data is not an array')
    }
    const steps = stepsParam.map(function (step, index) {
      if (step.type === null) {
        throw new Error('No element type for step "' + step.name + '" defined')
      }
      if (validStepTypes.filter(type => type === step.type).length === 0) {
        throw new Error('Invalid element type "' + step.type + '" for step "' + step.name + '"')
      }
      if (!step.swimlanes || step.swimlanes.length === 0) {
        throw new Error('No swimlanes for step "' + step.name + '" defined')
      } else {
        if (!Array.isArray(step.swimlanes)) {
          throw new Error('Swimlane data for step "' + step.name + '"is not an array')
        }
        //
        // Build array of swimlanes, possibly spanning multiple actors
        //
        swimlanes = step.swimlanes.reduce(function (accumulator, laneData) {
          if (!laneData.actor || !laneData.actor.id) {
            throw new Error('Actor for step "' + step.name + '" is undefined')
          }
          const actor = actorSet.getActor(laneData.actor.id)
          if (actor === undefined) {
            throw new Error('Actor "' + laneData.actor.name + '" for step "' + step.name + '" is undefined')
          }
          const minLaneIndex = laneData.minIndex ? laneData.minIndex : 1
          const maxLaneIndex = laneData.maxIndex ? laneData.maxIndex : minLaneIndex
          if (minLaneIndex < 1 || minLaneIndex > actor.numSwimlanes() || maxLaneIndex < 1 || maxLaneIndex > actor.numSwimlanes()) {
            throw new Error('Invalid swimlane range for Actor "' + actor.name() + '" for step "' + step.name + '"')
          }
          for (let i = minLaneIndex - 1; i < maxLaneIndex; i++) {
            const swimlane = swimlaneSet.getActorSwimlane(actor, i)
            if (!swimlane) {
              throw new Error('Internal error: swimlane not found for Actor "' + actor.name() + '" for step "' + step.name + '"')
            }
            accumulator.push(swimlane)
          }
          return accumulator
        },
        [])
      }
      let phase
      if (phaseSet.noPhases()) {
        phase = null
      } else {
        if (step.phase === null) {
          throw new Error('Phase for step "' + step.name + '" is null')
        } else {
          phase = phaseSet.getPhase(step.phase.id)
          if (phase === undefined) {
            throw new Error('Phase "' + step.phase.name + '" for step "' + step.name + '" is undefined')
          }
        }
      }
      if (step.preventSharingRow === null || step.preventSharingRow === undefined) {
        step.preventSharingRow = false // default
      }
      return new Step(step, index, swimlanes, phase, laneIndexOffset)
    })
    //
    // Sort swimlanes in swim-lane (index) order for all steps
    //
    steps.forEach(function (step) {
      step.swimlanes().sort((a, b) => a.index() - b.index())
    })
    //
    // Check that the swimlanes for all multi-swimlane steps are contiguous
    //
    const misorderedSteps = steps.filter(step => !step.swimlanes()
      .every((swimlane, index, swimlanes) => index < swimlanes.length - 1 ? swimlane.index() === swimlanes[index + 1].index() - 1 : true))
    //
    // Report any steps with non-contiguous swim-lanes
    //
    if (misorderedSteps.length > 0) {
      throw new Error('Non-contiguous swim-lanes for step(s) ' + JSON.stringify(misorderedSteps.map(step => step.name())))
    }

    steps.forEach(step => {
      stepDictionary[step.id()] = step
    })
    //
    // Get step element given its id
    //
    this.getStep = (id) => stepDictionary[id]
    this.steps = () => steps
    this.laneIndexOffset = () => laneIndexOffset
    /**
     * Returns the number of steps between the source and target, excluding source and target steps (unless IncludeEndRow is true), that lie within parts of the diagram
     * @param {Data.Step} source
     * @param {Data.Step} target
     * @param {*} partition a vertical partition (swimlanes) of the diagram: left (swimlanes to left of source), right, centre (same swimlane as source)
     * @param {boolean} includeEndRow include steps on lower end row
     */
    this.numInterveningSteps = function (source, target, partition, includeEndRow) {
      const sourceLaneMinIndex = source.swimlaneRange().min
      const sourceLaneMaxIndex = source.swimlaneRange().max
      let startStepIndex = Math.min(source.index(), target.index())
      const startRowIndex = steps[startStepIndex].rowIndex()
      // Exclude steps on same row as upper end step
      do {
        startStepIndex++
      } while (startStepIndex < steps.length && steps[startStepIndex].rowIndex() === startRowIndex)
      let endStepIndex = Math.max(source.index(), target.index())
      const endRowIndex = steps[endStepIndex].rowIndex()
      if (includeEndRow) {
        // Include steps on same row as lower end step
        while (endStepIndex < steps.length - 1 && steps[endStepIndex + 1].rowIndex() === endRowIndex) {
          endStepIndex++
        }
      } else {
        // Exclude steps on same row as lower end step
        do {
          endStepIndex--
        } while (endStepIndex >= startStepIndex && steps[endStepIndex].rowIndex() === endRowIndex)
        // console.log('startStepIndex: ' + startStepIndex + ', End step index: ' + endStepIndex + ', end step row: ' + steps[endStepIndex].rowIndex() + ', target step row: ' + endRowIndex)
      }
      let minLaneIndex
      let maxLaneIndex
      const minTargetLaneIndex = target.swimlaneRange().min
      const maxTargetLaneIndex = target.swimlaneRange().max
      let targetLaneSteps = 0
      let count = 0
      let offPageConnectors = 0
      switch (partition) {
        case partitionLeft:
          minLaneIndex = 0
          maxLaneIndex = sourceLaneMinIndex - 1
          break
        case partitionRight:
          minLaneIndex = sourceLaneMaxIndex + 1
          maxLaneIndex = swimlaneSet.length() - 1
          break
        default: // centre
          minLaneIndex = sourceLaneMinIndex
          maxLaneIndex = sourceLaneMaxIndex
          // Record number of off page connectors
          // to be added to other intervening steps
          offPageConnectors = source.outFlows().filter(flow => flow.isOffPageConnection()).length
          // Force test on steps in target step swim-lanes(s) to be ignored
          targetLaneSteps = 1
          break
      }

      for (let i = startStepIndex; i <= endStepIndex; i++) {
        if (maxLaneIndex >= steps[i].swimlaneRange().min && minLaneIndex <= steps[i].swimlaneRange().max &&
            steps[i] !== target) {
          count++
        }
        if (maxTargetLaneIndex >= steps[i].swimlaneRange().min && minTargetLaneIndex <= steps[i].swimlaneRange().max &&
            steps[i] !== target) {
          targetLaneSteps++
        }
      }

      return (targetLaneSteps > 0 ? count : 0) + offPageConnectors
    }
  }
}

export class StepGroup extends BasicElement {
  constructor (groupParam) {
    super(groupParam)
    let labelPosition = groupParam.labelPosition
    const bounds = {
      topLeft: {
        x: Infinity,
        y: Infinity,
        lane: Infinity,
        row: Infinity
      },
      bottomRight: {
        x: -Infinity,
        y: -Infinity,
        lane: -Infinity,
        row: -Infinity
      }
    }
    const occupiedRows = {}
    const steps = []

    this.labelPosition = () => labelPosition
    this.setLabelPosition = (position) => {
      labelPosition = position
    }

    /**
     * Add a step to the group
     * @param {Step} step
     */
    this.addStep = function (step) {
      steps.push(step)
      step.setGroup(this)
    }
    this.steps = () => steps

    /**
     * Calculate the bounds of the rectangle spanning the steps in the group with padding
     * @param {int} padding
     */
    this.calculateBounds = function (padding) {
      steps.forEach(step => {
        const topLeft = step.position()
        const bottomRight = {
          x: topLeft.x + step.size().width,
          y: topLeft.y + step.size().height
        }
        const leftLane = step.leftLaneIndex()
        const rightLane = step.rightLaneIndex()
        const row = step.rowIndex()
        bounds.topLeft.x = Math.min(bounds.topLeft.x, topLeft.x)
        bounds.topLeft.y = Math.min(bounds.topLeft.y, topLeft.y)
        bounds.topLeft.lane = Math.min(bounds.topLeft.lane, leftLane)
        bounds.topLeft.row = Math.min(bounds.topLeft.row, row)
        bounds.bottomRight.x = Math.max(bounds.bottomRight.x, bottomRight.x)
        bounds.bottomRight.y = Math.max(bounds.bottomRight.y, bottomRight.y)
        bounds.bottomRight.lane = Math.max(bounds.bottomRight.lane, rightLane)
        bounds.bottomRight.row = Math.max(bounds.bottomRight.row, row)
        //
        // record occupancy
        //
        if (!occupiedRows[row]) {
          occupiedRows[row] = []
        }
        for (let i = leftLane; i <= rightLane; i++) {
          occupiedRows[row][i] = true
        }
      })
      bounds.topLeft.x -= padding
      bounds.topLeft.y -= padding
      bounds.bottomRight.x += padding
      bounds.bottomRight.y += padding
      bounds.numRows = bounds.bottomRight.row - bounds.topLeft.row + 1
      bounds.numLanes = bounds.bottomRight.lane - bounds.topLeft.lane + 1
    }

    this.position = () => {
      return {
        x: bounds.topLeft.x,
        y: bounds.topLeft.y
      }
    }
    this.size = () => {
      return {
        width: bounds.bottomRight.x - bounds.topLeft.x,
        height: bounds.bottomRight.y - bounds.topLeft.y
      }
    }
    /**
     * Find best position for label
     * @param {boolean} isVerticalSwimlane indicates if swimlanes are drawn vertically or horizontally
     * @returns label position of the free corner with the most space (lanes),
     * or undefined if there are no free corners
     */
    this.freeCorner = function (isVerticalSwimlane) {
      const corners = [{
        cornerPosition: ActivityGroup.labelPositionNW,
        rowIndex: bounds.topLeft.row,
        laneIndex: bounds.topLeft.lane,
        checkStep: 1
      }, {
        cornerPosition: isVerticalSwimlane ? ActivityGroup.labelPositionNE : ActivityGroup.labelPositionSW,
        rowIndex: bounds.topLeft.row,
        laneIndex: bounds.bottomRight.lane,
        checkStep: -1
      }, {
        cornerPosition: ActivityGroup.labelPositionSE,
        rowIndex: bounds.bottomRight.row,
        laneIndex: bounds.bottomRight.lane,
        checkStep: -1
      }, {
        cornerPosition: isVerticalSwimlane ? ActivityGroup.labelPositionSW : ActivityGroup.labelPositionNE,
        rowIndex: bounds.bottomRight.row,
        laneIndex: bounds.topLeft.lane,
        checkStep: 1
      }]
      //
      // Find unoccupied corners
      //
      const free = corners
        .filter(corner => !occupiedRows[corner.rowIndex] || !occupiedRows[corner.rowIndex][corner.laneIndex])
      //
      // Find out how many free contiguous lanes there are at the corner
      //
      free.forEach(corner => {
        let freeLanes = 1
        let checkLaneIndex = corner.laneIndex + corner.checkStep
        while (freeLanes < bounds.numLanes &&
          !occupiedRows[corner.rowIndex][corner.laneIndex + checkLaneIndex]) {
          freeLanes++
          checkLaneIndex += corner.checkStep
        }
        corner.freeLanes = freeLanes
      })
      //
      // Sort corners in descending order of free space
      //
      free.sort((a, b) => b.freeLanes - a.freeLanes)

      if (free.length > 0) {
        return free[0].cornerPosition
      } else {
        return undefined
      }
    }
  }
}

export class StepGroupSet {
  constructor (groups) {
    const groupDictionary = {}
    if (!Array.isArray(groups)) {
      throw new Error('Step Group data is not an array')
    }
    const groupArray = groups.map((group) =>
      new StepGroup(group)
    )

    groupArray.forEach(group => {
      groupDictionary[group.id()] = group
    })

    this.setSteps = (groupSteps, stepSet) => {
      if (!Array.isArray(groupSteps)) {
        throw new Error('Step Group Steps data is not an array')
      }
      groupSteps.forEach(link => {
        const stepGroup = groupDictionary[link.group.id]
        if (stepGroup === undefined) {
          throw new Error('Activity Group "' + link.group.name + '" is undefined')
        }
        const step = stepSet.getStep(link.step.id)
        if (step === undefined) {
          throw new Error('Step "' + link.step.name + '" in Activity Group "' + link.group.name + '" is undefined')
        }
        stepGroup.addStep(step)
      })
    }
    this.getStepGroup = (id) => groupDictionary[id]
    this.stepGroups = () => groupArray
    this.calculateBounds = function (padding) {
      groupArray.forEach(group => {
        group.calculateBounds(padding)
      })
    }
  }
}
