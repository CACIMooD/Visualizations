import * as joint from 'jointjs'
import * as Ports from './element-port-names'
import * as Types from './element-types'
import { OrientedDimensions, OrientedCoords } from './oriented'

let ActorShape
let SwimlaneShape
let StartShape
let ProcessStepShape
let SubProcessShape
let ProcessShape
let DecisionShape
let VerticalLabelShape
let PhaseExtentShape
let ExternalDataShape
let DatabaseShape
let DocumentShape
let DataShape
let OtherShape
let OffPageOutputShape
let OffPageInputShape
let StepGroupShape
//
// BPMN Shapes
//
let BPMNStartEventShape
let BPMNStartEventMessageShape
let BPMNIntermediateEventShape
let BPMNIntermediateEventMessageShape
let BPMNEndEventShape
let BPMNEndEventMessageShape
let BPMNExclusiveGatewayShape
let BPMNParallelGatewayShape
let BPMNInclusiveGatewayShape

export function defineShapes (gridSize, elementSizes, renderSwimlaneWatermarks, verticalSwimlanes) {
  ActorShape = defineActor(renderSwimlaneWatermarks, verticalSwimlanes)
  SwimlaneShape = defineSwimlane()
  StartShape = defineStart(verticalSwimlanes)
  ProcessStepShape = defineProcessStep(gridSize, elementSizes[Types.processStep], verticalSwimlanes)
  SubProcessShape = defineSubProcess(gridSize, elementSizes[Types.subProcess], verticalSwimlanes)
  ProcessShape = defineProcess()
  DecisionShape = defineDecision(verticalSwimlanes)
  VerticalLabelShape = defineVerticalLabel(verticalSwimlanes)
  PhaseExtentShape = definePhaseExtent(verticalSwimlanes)
  ExternalDataShape = defineExternalData()
  DatabaseShape = defineDatabase()
  DocumentShape = defineDocument()
  DataShape = defineData()
  OtherShape = defineOther()
  OffPageOutputShape = defineOffPageOutput()
  OffPageInputShape = defineOffPageInput()
  StepGroupShape = defineStepGroup()
  //
  // BPMN Shapes
  //
  BPMNStartEventShape = defineBPMNStartEvent(gridSize, elementSizes, verticalSwimlanes)
  BPMNStartEventMessageShape = defineBPMNStartEventMessage(gridSize, elementSizes, verticalSwimlanes)
  BPMNIntermediateEventShape = defineBPMNIntermediateEvent(gridSize, elementSizes, verticalSwimlanes)
  BPMNIntermediateEventMessageShape = defineBPMNIntermediateEventMessage(gridSize, elementSizes, verticalSwimlanes)
  BPMNEndEventShape = defineBPMNEndEvent(gridSize, elementSizes, verticalSwimlanes)
  BPMNEndEventMessageShape = defineBPMNEndEventMessage(gridSize, elementSizes, verticalSwimlanes)
  BPMNExclusiveGatewayShape = defineBPMNExclusiveGateway(verticalSwimlanes)
  BPMNParallelGatewayShape = defineBPMNParallelGateway(verticalSwimlanes)
  BPMNInclusiveGatewayShape = defineBPMNInclusiveGateway(verticalSwimlanes)
}

export function createActor (id) {
  return new ActorShape(id)
}

export function createSwimlane (id) {
  return new SwimlaneShape(id)
}

export function createStart (id) {
  return new StartShape(id)
}

export function createProcessStep (id) {
  return new ProcessStepShape(id)
}

export function createSubProcess (id) {
  return new SubProcessShape(id)
}

export function createProcess (id) {
  return new ProcessShape(id)
}

export function createDecision (id) {
  return new DecisionShape(id)
}

export function createVerticalLabel (id) {
  return new VerticalLabelShape(id)
}

export function createPhaseExtent (id) {
  return new PhaseExtentShape(id)
}

export function createExternalData (id) {
  return new ExternalDataShape(id)
}

export function createDatabase (id) {
  return new DatabaseShape(id)
}

export function createDocument (id) {
  return new DocumentShape(id)
}

export function createData (id) {
  return new DataShape(id)
}

export function createOther (id) {
  return new OtherShape(id)
}

export function createOffPageOutput (id) {
  return new OffPageOutputShape(id)
}

export function createOffPageInput (id) {
  return new OffPageInputShape(id)
}

export function createStepGroup (id) {
  return new StepGroupShape(id)
}
//
// BPMN Shapes
//
export function createBPMNStartEvent (id) {
  return new BPMNStartEventShape(id)
}

export function createBPMNStartEventMessage (id) {
  return new BPMNStartEventMessageShape(id)
}

export function createBPMNIntermediateEvent (id) {
  return new BPMNIntermediateEventShape(id)
}

export function createBPMNIntermediateEventMessage (id) {
  return new BPMNIntermediateEventMessageShape(id)
}

export function createBPMNEndEvent (id) {
  return new BPMNEndEventShape(id)
}

export function createBPMNEndEventMessage (id) {
  return new BPMNEndEventMessageShape(id)
}

export function createBPMNExclusiveGateway (id) {
  return new BPMNExclusiveGatewayShape(id)
}

export function createBPMNParallelGateway (id) {
  return new BPMNParallelGatewayShape(id)
}

export function createBPMNInclusiveGateway (id) {
  return new BPMNInclusiveGatewayShape(id)
}

function defineActor (renderSwimlaneWatermarks, verticalSwimlanes) {
  const attrs = {
    body: {
      refWidth: 1,
      refHeight: 1,
      even: 'false'
    }
  }
  const markup = []
  if (renderSwimlaneWatermarks) {
    attrs.defs = {}
    attrs.pattern = {
      x: 0,
      y: 0,
      width: 1,
      height: 1
    }
    attrs.text = {
      class: 'actor-watermark'
    }
    if (verticalSwimlanes) {
      attrs.text = {
        refX: 0.5,
        y: 2,
        textVerticalAnchor: 'top',
        textAnchor: 'middle'
      }
    } else {
      attrs.text = {
        x: 2,
        y: 10,
        textVerticalAnchor: 'top',
        textAnchor: 'left'
      }
    }
    attrs.watermark = {
      refWidth: 1,
      refHeight: 1,
      fillOpacity: 0
    }
    markup.push({
      tagName: 'defs',
      selector: 'defs',
      children: [{
        tagName: 'pattern',
        selector: 'pattern',
        children: [{
          tagName: 'text',
          selector: 'text'
        }]
      }]
    })
  }
  markup.push({
    tagName: 'rect',
    selector: 'body'
  })
  if (renderSwimlaneWatermarks) {
    markup.push({
      tagName: 'rect',
      selector: 'watermark'
    })
  }
  return joint.dia.Element.define('MooD.Actor', {
    attrs
  }, {
    markup
  })
}

function defineSwimlane () {
  return joint.dia.Element.define('MooD.Swimlane', {
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1,
        fillOpacity: 0
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body'
    }]
  })
}
//
// I/O Ports
//
const ioPortMarkup = '<circle r="1" fill-opacity="0" fill="red" />'
const portInLeft = {
  id: Ports.ioInputPort,
  group: 'inLeft',
  markup: ioPortMarkup
}

const portOutRight = {
  id: Ports.ioOutputPort,
  group: 'outRight',
  markup: ioPortMarkup
}
//
// Process Flow input ports
//
const flowInPortMarkup = '<circle r="1" fill-opacity="0" fill="green" />'
const portFlowInUpperLeft = {
  id: Ports.flowInUpperLeftPort,
  group: 'flowInUpperLeft',
  markup: flowInPortMarkup
}

const portFlowInLowerLeft = {
  id: Ports.flowInLowerLeftPort,
  group: 'flowInLowerLeft',
  markup: flowInPortMarkup
}

const portFlowInTop = {
  id: Ports.flowInTopPort,
  group: 'flowInTop',
  markup: flowInPortMarkup
}

const portFlowInUpperRight = {
  id: Ports.flowInUpperRightPort,
  group: 'flowInUpperRight',
  markup: flowInPortMarkup
}

const portFlowInLowerRight = {
  id: Ports.flowInLowerRightPort,
  group: 'flowInLowerRight',
  markup: flowInPortMarkup
}
//
// Process Flow output ports
//
const flowOutPortMarkup = '<circle r="1" fill-opacity="0" fill="blue" />'
const portFlowOutUpperLeft = {
  id: Ports.flowOutUpperLeftPort,
  group: 'flowOutUpperLeft',
  markup: flowOutPortMarkup
}

const portFlowOutLowerLeft = {
  id: Ports.flowOutLowerLeftPort,
  group: 'flowOutLowerLeft',
  markup: flowOutPortMarkup
}

const portFlowOutBottom = {
  id: Ports.flowOutBottomPort,
  group: 'flowOutBottom',
  markup: flowOutPortMarkup
}

const portFlowOutUpperRight = {
  id: Ports.flowOutUpperRightPort,
  group: 'flowOutUpperRight',
  markup: flowOutPortMarkup
}

const portFlowOutLowerRight = {
  id: Ports.flowOutLowerRightPort,
  group: 'flowOutLowerRight',
  markup: flowOutPortMarkup
}
//
// Process Flow input/output (shared) ports
//
const flowSharedPortMarkup = '<circle r="1" fill-opacity="0" fill="green" />'

const portFlowCentreLeft = {
  id: Ports.flowCentreLeftPort,
  group: 'flowLeft',
  markup: flowSharedPortMarkup
}

const portFlowCentreRight = {
  id: Ports.flowCentreRightPort,
  group: 'flowRight',
  markup: flowSharedPortMarkup
}

function defineStart (verticalSwimlanes) {
  const position = new OrientedCoords(verticalSwimlanes)
  return joint.dia.Element.define('MooD.Start', {
    ports: {
      groups: {
        flowInTop: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: 0 })
          }
        },
        flowOutBottom: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: '100%' })
          }
        }
      },
      items: [
        portFlowInTop,
        portFlowOutBottom
      ]
    },
    attrs: {
      body: {
        rx: 20,
        refRy: '50%',
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

// Return port group definitions for process type shapes
// Calculate vertical positions of flow in and out ports to
// align with the grid if the shape is tall enough
function processPortGroups (gridSize, elementSize, verticalSwimlanes) {
  const elementDimensions = new OrientedDimensions(verticalSwimlanes)
  elementDimensions.setDimensions(elementSize)
  const position = new OrientedCoords(verticalSwimlanes)
  let offsets
  if (elementDimensions.height() > 2 * gridSize) {
    offsets = {
      upperInY: elementDimensions.height() / 2 - 2 * gridSize,
      upperOutY: elementDimensions.height() / 2 - gridSize,
      lowerInY: elementDimensions.height() / 2 + 2 * gridSize,
      lowerOutY: elementDimensions.height() / 2 + gridSize
    }
  } else {
    offsets = {
      upperInY: Math.floor(elementDimensions.height() * 0.63),
      upperOutY: Math.floor(elementDimensions.height() * 0.38),
      lowerInY: Math.floor(elementDimensions.height() * 0.7),
      lowerOutY: Math.floor(elementDimensions.height() * 0.3)
    }
  }
  const groups = {
    inLeft: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: 0, y: '50%' })
      }
    },
    flowInUpperLeft: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: 0, y: offsets.upperInY })
      }
    },
    flowInLowerLeft: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: 0, y: offsets.lowerInY })
      }
    },
    flowInTop: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: '50%', y: 0 })
      }
    },
    flowInUpperRight: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: '100%', y: offsets.upperInY })
      }
    },
    flowInLowerRight: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: '100%', y: offsets.lowerInY })
      }
    },
    outRight: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: '100%', y: '50%' })
      }
    },
    flowOutUpperLeft: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: 0, y: offsets.upperOutY })
      }
    },
    flowOutLowerLeft: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: 0, y: offsets.lowerOutY })
      }
    },
    flowOutBottom: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: '50%', y: '100%' })
      }
    },
    flowOutUpperRight: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: '100%', y: offsets.upperOutY })
      }
    },
    flowOutLowerRight: {
      position: {
        name: 'absolute',
        args: position.orientedCoords({ x: '100%', y: offsets.lowerOutY })
      }
    }
  }

  return groups
}

function processPortItems () {
  const items = [
    portInLeft,
    portFlowInUpperLeft,
    portFlowInLowerLeft,
    portFlowInTop,
    portFlowInUpperRight,
    portFlowInLowerRight,
    portOutRight,
    portFlowOutUpperLeft,
    portFlowOutLowerLeft,
    portFlowOutBottom,
    portFlowOutUpperRight,
    portFlowOutLowerRight
  ]

  return items
}

function defineSubProcess (gridSize, elementSize, verticalSwimlanes) {
  const portGroups = processPortGroups(gridSize, elementSize, verticalSwimlanes)
  const portItems = processPortItems()
  // Add groups for side flow ports

  return joint.dia.Element.define('MooD.SubProcess', {
    ports: {
      groups: portGroups,
      items: portItems
    },
    attrs: {
      body: {
        refX: 0,
        refWidth: 1,
        refHeight: 1
      },
      inner: {
        refX: 0.1,
        refWidth: 0.8,
        refHeight: 1
      },
      label: {
        refWidth: 0.8,
        refHeight: 1,
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'rect',
      selector: 'inner',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineProcess () {
  // Add groups for side flow ports

  return joint.dia.Element.define('MooD.Process', {
    attrs: {
      body: {
        refX: 0,
        refWidth: 1,
        refHeight: 1
      },
      inner: {
        refX: 0.1,
        refWidth: 0.8,
        refHeight: 1
      },
      label: {
        refWidth: 0.8,
        refHeight: 1,
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'rect',
      selector: 'inner',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineProcessStep (gridSize, elementSize, verticalSwimlanes) {
  const portGroups = processPortGroups(gridSize, elementSize, verticalSwimlanes)
  const portItems = processPortItems()
  // Add groups for side flow ports

  return joint.dia.Element.define('MooD.ProcessStep', {
    ports: {
      groups: portGroups,
      items: portItems
    },
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5,
        fontSize: ''
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineDecision (verticalSwimlanes) {
  const position = new OrientedCoords(verticalSwimlanes)
  return joint.dia.Element.define('MooD.Decision', {
    ports: {
      groups: {
        inLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '10%', y: '40%' })
          }
        },
        flowLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: 0, y: '50%' })
          }
        },
        flowInTop: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: 0 })
          }
        },
        flowRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '100%', y: '50%' })
          }
        },
        outRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '90%', y: '40%' })
          }
        },
        flowOutBottom: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: '100%' })
          }
        }
      },
      items: [
        portInLeft,
        portFlowCentreLeft,
        portFlowInTop,
        portFlowCentreRight,
        portOutRight,
        portFlowOutBottom
      ]
    },
    attrs: {
      path: {
        refDResetOffset:
                  'M 50 0 L 100 50 ' +
                  'L 50 100 ' +
                  'L 0 50 z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refWidth: 0.95,
        refHeight: 0.95,
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineVerticalLabel (verticalSwimlanes) {
  const labelDefaults = {
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }
  const labelProtoProps = {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup'
    }, {
      tagName: 'text',
      selector: 'label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  }
  if (verticalSwimlanes) {
    labelDefaults.attrs.label.transform = 'rotate(-90)'
  }
  return joint.dia.Element.define('MooD.VLabel', labelDefaults, labelProtoProps)
}

function definePhaseExtent (verticalSwimlanes) {
  let path
  if (verticalSwimlanes) {
    path = 'L 100 0'
  } else {
    path = 'L 0 100'
  }
  return joint.dia.Element.define('MooD.PhaseExtent', {
    attrs: {
      path: {
        refDResetOffset:
                  path
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup'
    }]
  })
}

function defineExternalData () {
  return joint.dia.Element.define('MooD.ExternalData', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 20 0 L 100 0 ' +
                  'A 20 20 0 0 0 100 40 ' +
                  'L 20 40 ' +
                  'A 20 20 0 0 1 20 0'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.4,
        refY: 0.5,
        refWidth: 0.8
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineDatabase () {
  return joint.dia.Element.define('MooD.Database', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 20 0 L 100 0 ' +
                  'A 20 20 0 0 0 100 40 ' +
                  'A 20 20 0 0 0 100 0 ' +
                  'A 20 20 0 0 0 100 40 ' +
                  'L 20 40 ' +
                  'A 20 20 0 0 1 20 0'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.35,
        refY: 0.5,
        refWidth: 0.8
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineDocument () {
  return joint.dia.Element.define('MooD.Document', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 0 0 L 100 0 ' +
                  'L 100 35 ' +
                  'C 95 30 75 30 65 37 ' +
                  'C 40 55 0 40 0 35 ' +
                  'L 0 0'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.4,
        refWidth: 1.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineData () {
  return joint.dia.Element.define('MooD.Data', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 20 0 L 100 0 ' +
                  'L 80 40 ' +
                  'L 0 40 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5,
        refWidth: 1.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineOther () {
  return joint.dia.Element.define('MooD.Other', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 0 10 L 100 0 ' +
                  'L 100 40 ' +
                  'L 0 40 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.6,
        refWidth: 1.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineOffPageOutput () {
  return joint.dia.Element.define('MooD.OffPageOutput', {
    attrs: {
      path: {
        refDResetOffset:
                  'L 100 0 ' +
                  'L 100 30 ' +
                  'L 50 40 ' +
                  'L 0 30 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.33,
        refWidth: 1.0,
        refHeight: 0.75
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineOffPageInput () {
  return joint.dia.Element.define('MooD.OffPageInput', {
    attrs: {
      path: {
        refDResetOffset:
                  'L 100 0 ' +
                  'L 100 40 ' +
                  'L 50 30 ' +
                  'L 0 40 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.33,
        refWidth: 1.0,
        refHeight: 0.75
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineStepGroup () {
  return joint.dia.Element.define('MooD.StepGroup', {
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'bottom',
        textAnchor: 'start',
        refX: '0%',
        refY: '0%',
        refWidth: 1.0
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      className: 'mood-graph-step-group'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-group-label'
    }]
  })
}
//
// BPMN Shapes
//
//
// BPMN event style information
//
const messageName = 'Message'
const messagePath =
  'm 20 -20 v 40 ' + // Draw inner rectangle (envelope) (anti-clockwise)
  'h 60 ' +
  'v -40 z ' +
  'm 60 0 l -30 20 ' + // Draw triangle (envelope flap) (clockwise)
  'l -30 -20'

/**
 * Build a shape for an Event symbol
 * @param {int} gridSize  Size of grid in pixels
 * @param {*} elementSize Size of shape (width, height)
 * @param {boolean} verticalSwimlanes Vertical (true) or Horizontal (false) swimlanes
 * @param {string} eventClass Event class: start, intermediate or end
 * @param {string} eventType Event symbol type name
 * @param {string} symbolPath SVG path for the symbol
 */
function buildBPMNEvent (gridSize, elementSize, verticalSwimlanes, eventClass, eventType, symbolPath) {
  const portGroups = processPortGroups(gridSize, elementSize, verticalSwimlanes)
  const portItems = processPortItems()
  const bodyClass = 'bpmn-' + eventClass + '-event'

  return joint.dia.Element.define('MooD.' + eventType, {
    ports: {
      groups: portGroups,
      items: portItems
    },
    attrs: {
      path: {
        refDResetOffset: symbolPath
      },
      label: {
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.99,
        refWidth: 2.0,
        refHeight: 2.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step ' + bodyClass
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}
/**
 * Build a shape for a Start Event symbol
 * @param {int} gridSize  Size of grid in pixels
 * @param {*} elementSize Size of shape (width, height)
 * @param {boolean} verticalSwimlanes Vertical (true) or Horizontal (false) swimlanes
 * @param {string} styleName Name of style for Start Event, e.g. Message or blank
 * @param {string} stylePath SVG path for the style symbol or blank if N/A
 */
function buildBPMNStartEvent (gridSize, elementSize, verticalSwimlanes, styleName, stylePath) {
  const startEventPath =
      'M 50 100 ' + // Draw circle (clockwise)
      'a 50 50 0 1 0 100 0 ' +
      'a 50 50 0 1 0 -100 0'
  const eventType = 'BPMNStartEvent' + (styleName || '')
  const symbolPath = startEventPath + (stylePath || '')
  return buildBPMNEvent(
    gridSize,
    elementSize,
    verticalSwimlanes,
    'start',
    eventType,
    symbolPath)
}

function defineBPMNStartEvent (gridSize, elementSize, verticalSwimlanes) {
  return buildBPMNStartEvent(gridSize, elementSize, verticalSwimlanes, '', '')
}

function defineBPMNStartEventMessage (gridSize, elementSize, verticalSwimlanes) {
  return buildBPMNStartEvent(gridSize, elementSize, verticalSwimlanes, messageName, messagePath)
}

/**
 * Build a shape for an Intermediate Event symbol
 * @param {int} gridSize  Size of grid in pixels
 * @param {*} elementSize Size of shape (width, height)
 * @param {boolean} verticalSwimlanes Vertical (true) or Horizontal (false) swimlanes
 * @param {string} styleName Name of style for Intermediate Event, e.g. Message or blank
 * @param {string} stylePath SVG path for the style symbol or blank if N/A
 */
function buildBPMNIntermediateEvent (gridSize, elementSize, verticalSwimlanes, styleName, stylePath) {
  const eventPath =
      'M 50 100 ' + // Draw outer circle (clockwise)
      'a 50 50 0 1 0 100 0 ' +
      'a 50 50 0 1 0 -100 0' +
      'M 55 100 ' + // Draw inner circle (clockwise)
      'a 45 45 0 1 0 90 0 ' +
      'a 45 45 0 1 0 -90 0 ' +
      'm -5 0'
  const eventType = 'BPMNIntermediateEvent' + (styleName || '')
  const symbolPath = eventPath + (stylePath || '')
  return buildBPMNEvent(
    gridSize,
    elementSize,
    verticalSwimlanes,
    'intermediate',
    eventType,
    symbolPath)
}

function defineBPMNIntermediateEvent (gridSize, elementSize, verticalSwimlanes) {
  return buildBPMNIntermediateEvent(gridSize, elementSize, verticalSwimlanes, '', '')
}

function defineBPMNIntermediateEventMessage (gridSize, elementSize, verticalSwimlanes) {
  return buildBPMNIntermediateEvent(gridSize, elementSize, verticalSwimlanes, messageName, messagePath)
}

/**
 * Build a shape for an End Event symbol
 * @param {int} gridSize  Size of grid in pixels
 * @param {*} elementSize Size of shape (width, height)
 * @param {boolean} verticalSwimlanes Vertical (true) or Horizontal (false) swimlanes
 * @param {string} styleName Name of style for Intermediate Event, e.g. Message or blank
 * @param {string} stylePath SVG path for the style symbol or blank if N/A
 */
function buildBPMNEndEvent (gridSize, elementSize, verticalSwimlanes, styleName, stylePath) {
  const eventPath =
  'M 50 100 ' + // Draw outer circle (clockwise)
  'a 50 50 0 1 0 100 0 ' +
  'a 50 50 0 1 0 -100 0' +
  'M 51 100 ' + // Draw inner circle (clockwise)
  'a 49 49 0 1 0 98 0 ' +
  'a 49 49 0 1 0 -98 0 ' +
  'M 52 100 ' + // Draw inner circle (clockwise)
  'a 48 48 0 1 0 96 0 ' +
  'a 48 48 0 1 0 -96 0 ' +
  'M 53 100 ' + // Draw inner circle (clockwise)
  'a 47 47 0 1 0 94 0 ' +
  'a 47 47 0 1 0 -94 0 ' +
  'M 54 100 ' + // Draw inner circle (clockwise)
  'a 46 46 0 1 0 92 0 ' +
  'a 46 46 0 1 0 -92 0 ' +
  'm -4 0'
  const eventType = 'BPMNEndEvent' + (styleName || '')
  const symbolPath = eventPath + (stylePath || '')
  return buildBPMNEvent(
    gridSize,
    elementSize,
    verticalSwimlanes,
    'end',
    eventType,
    symbolPath)
}

function defineBPMNEndEvent (gridSize, elementSize, verticalSwimlanes) {
  return buildBPMNEndEvent(gridSize, elementSize, verticalSwimlanes, '', '')
}

function defineBPMNEndEventMessage (gridSize, elementSize, verticalSwimlanes) {
  return buildBPMNEndEvent(gridSize, elementSize, verticalSwimlanes, messageName, messagePath)
}

function defineBPMNExclusiveGateway (verticalSwimlanes) {
  const position = new OrientedCoords(verticalSwimlanes)
  return joint.dia.Element.define('MooD.BPMNExcGateway', {
    ports: {
      groups: {
        inLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '10%', y: '40%' })
          }
        },
        flowLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: 0, y: '50%' })
          }
        },
        flowInTop: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: 0 })
          }
        },
        flowRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '100%', y: '50%' })
          }
        },
        outRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '90%', y: '40%' })
          }
        },
        flowOutBottom: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: '100%' })
          }
        }
      },
      items: [
        portInLeft,
        portFlowCentreLeft,
        portFlowInTop,
        portFlowCentreRight,
        portOutRight,
        portFlowOutBottom
      ]
    },
    attrs: {
      path: {
        refDResetOffset:
                  'M 50 0 L 100 50 ' +
                  'L 50 100 ' +
                  'L 0 50 z' +
                  'M 30 30 L 70 70' +
                  'M 70 30 L 30 70'
      },
      label: {
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.99,
        refWidth: 2.0,
        refHeight: 2.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineBPMNParallelGateway (verticalSwimlanes) {
  const position = new OrientedCoords(verticalSwimlanes)
  return joint.dia.Element.define('MooD.BPMNParGateway', {
    ports: {
      groups: {
        inLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '10%', y: '40%' })
          }
        },
        flowLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: 0, y: '50%' })
          }
        },
        flowInTop: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: 0 })
          }
        },
        flowRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '100%', y: '50%' })
          }
        },
        outRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '90%', y: '40%' })
          }
        },
        flowOutBottom: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: '100%' })
          }
        }
      },
      items: [
        portInLeft,
        portFlowCentreLeft,
        portFlowInTop,
        portFlowCentreRight,
        portOutRight,
        portFlowOutBottom
      ]
    },
    attrs: {
      path: {
        refDResetOffset:
                  'M 50 0 L 100 50 ' +
                  'L 50 100 ' +
                  'L 0 50 z' +
                  'M 50 20 L 50 80' +
                  'M 20 50 L 80 50'
      },
      label: {
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.99,
        refWidth: 2.0,
        refHeight: 2.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

function defineBPMNInclusiveGateway (verticalSwimlanes) {
  const position = new OrientedCoords(verticalSwimlanes)
  return joint.dia.Element.define('MooD.BPMNIncGateway', {
    ports: {
      groups: {
        inLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '10%', y: '40%' })
          }
        },
        flowLeft: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: 0, y: '50%' })
          }
        },
        flowInTop: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: 0 })
          }
        },
        flowRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '100%', y: '50%' })
          }
        },
        outRight: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '90%', y: '40%' })
          }
        },
        flowOutBottom: {
          position: {
            name: 'absolute',
            args: position.orientedCoords({ x: '50%', y: '100%' })
          }
        }
      },
      items: [
        portInLeft,
        portFlowCentreLeft,
        portFlowInTop,
        portFlowCentreRight,
        portOutRight,
        portFlowOutBottom
      ]
    },
    attrs: {
      path: {
        refDResetOffset:
            'M 50 0 l -50 50' + // Draw diamond (anti-clockwise)
            'l 50 50 ' +
            'l 50 -50 z' +
            'M 25 50 ' + // Draw circle (clockwise)
            'a 25 25 0 1 0 50 0 ' +
            'a 25 25 0 1 0 -50 0'
      },
      label: {
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.99,
        refWidth: 2.0,
        refHeight: 2.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}
