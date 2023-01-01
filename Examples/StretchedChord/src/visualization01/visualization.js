import { setUpEnvironment, drawDiagram, createGradients, addInteractivity } from './d3_handling'
import { StretchedChord } from './stretched_chord'

export function createStretchedChord (config) {
  const chord = new StretchedChord(config)

  const superDataChanged = config.functions.dataChanged
  config.functions.dataChanged = function dataChanged (data) {
    superDataChanged(data)

    config.data = data

    chord.initialise()

    setUpEnvironment(config,
      { parent: 'svg', id: 'all', transform: 'translate(' + (chord.width() / 2) + ',' + (chord.height() / 2) + ')' },
      { parent: '#all', id: 'links' },
      { parent: '#all', id: 'nodes' },
      { parent: '#nodes', id: 'LHS', transform: 'translate(' + chord.arcCentreOffset() + ',0)' },
      { parent: '#nodes', id: 'RHS', transform: 'translate(' + -chord.arcCentreOffset() + ',0)' },
      { parent: '#all', id: 'labels' },
      { parent: '#labels', id: 'L', transform: 'translate(' + chord.lhsLabelOffset() + ',0)' },
      { parent: '#labels', id: 'R', transform: 'translate(' + chord.rhsLabelOffset() + ',0)' },
      { parent: 'svg', id: 'defs' }
    )

    createGradients(chord)
    drawDiagram(chord)
    addInteractivity(config.functions, chord)
  }

  config.functions.dataChanged(config.data)
}
