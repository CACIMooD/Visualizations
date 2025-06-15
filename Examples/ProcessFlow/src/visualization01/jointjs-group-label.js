import * as ActivityGroup from './group-label'
//
// Configuration of JointJS Activity (Step) Group Label position
//
export const elementAttributes = {
  [ActivityGroup.labelPositionNW]: {
    textVerticalAnchor: 'top',
    textAnchor: 'start',
    transform: 'translate(5, 5)'
  },
  [ActivityGroup.labelPositionN]: {
    textVerticalAnchor: 'top',
    textAnchor: 'middle',
    transform: 'translate(calc(0.5*w), 5)'
  },
  [ActivityGroup.labelPositionNE]: {
    textVerticalAnchor: 'top',
    textAnchor: 'end',
    transform: 'translate(calc(w - 5), 5)'
  },
  [ActivityGroup.labelPositionW]: {
    textVerticalAnchor: 'middle',
    textAnchor: 'start',
    transform: 'translate(5, calc(0.5 * h))'
  },
  [ActivityGroup.labelPositionZero]: {
    textVerticalAnchor: 'middle',
    textAnchor: 'middle',
    transform: 'translate(calc(0.5 * w), calc(0.5 * h))'
  },
  [ActivityGroup.labelPositionE]: {
    textVerticalAnchor: 'middle',
    textAnchor: 'end',
    transform: 'translate(calc(w - 5), calc(0.5*h))'
  },
  [ActivityGroup.labelPositionSW]: {
    textVerticalAnchor: 'bottom',
    textAnchor: 'start',
    transform: 'translate(5, calc(h - 5))'
  },
  [ActivityGroup.labelPositionS]: {
    textVerticalAnchor: 'bottom',
    textAnchor: 'middle',
    transform: 'translate(calc(0.5 * w), calc(h - 5))'
  },
  [ActivityGroup.labelPositionSE]: {
    textVerticalAnchor: 'bottom',
    textAnchor: 'end',
    transform: 'translate(calc(w - 5), calc(h - 5))'
  },
  [ActivityGroup.labelPositionDefault]: {
    textVerticalAnchor: 'bottom',
    textAnchor: 'start',
    transform: 'translate(0, 0)'
  },
  [ActivityGroup.labelPositionLeft]: {
    textVerticalAnchor: 'top',
    textAnchor: 'end',
    transform: 'translate(-5, 5)'
  },
  [ActivityGroup.labelPositionRight]: {
    textVerticalAnchor: 'top',
    textAnchor: 'start',
    transform: 'translate(calc(w + 5), 5)'
  }
}
