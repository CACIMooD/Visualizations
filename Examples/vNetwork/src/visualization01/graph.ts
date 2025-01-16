import * as vNG from 'v-network-graph'
import { Path } from './path'
import { ForceEdgeDatum, ForceLayout, ForceNodeDatum } from 'v-network-graph/lib/force-layout'
import { LayoutHandler } from 'v-network-graph'

/**
 * Place the edges within each path in the correct order
 * Each path is validated to ensure that there is a realisable path over
 * all of the edges in it. Invalid paths are left unaltered
 * @param paths the set of paths to process. Edges are reordered in place
 * @param edges the edges for the graph
 * @returns an array of reports, one element for each invalid path
 */
export function orderPathEdges (paths: vNG.Paths, edges: vNG.Edges): string[] {
  const report: string[] = []

  for (const pathId in paths) {
    try {
      const vNGpath = paths[pathId]
      const path = new Path(pathId, vNGpath, edges)
      let errorReport = path.validate()
      if (errorReport === undefined) {
        errorReport = path.orderEdges()
      }

      if (errorReport !== undefined) {
        report.push(errorReport)
      }
    } catch (e) {
      report.push((e.name as string) + ': ' + (e.message as string))
    }
  }

  return report
}

/**
 * Create the force determined layout handler
 * @returns The ForceLayout object to attach to the view config
 */
export function createForceLayoutHandler (): LayoutHandler {
  return new ForceLayout({
    positionFixedByDrag: false,
    positionFixedByClickWithAltKey: true,
    createSimulation: (d3, nodes, edges) => {
      // d3-force parameters
      const forceLink = d3
        .forceLink<ForceNodeDatum, ForceEdgeDatum>(edges)
        .id((d) => d.id)
      return d3
        .forceSimulation(nodes)
        .force('edge', forceLink.distance(40).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-800))
        .force('center', d3.forceCenter().strength(0.05))
        // .force('edge', forceLink.distance(40).strength(0.1))
        // .force('charge', d3.forceManyBody().strength(-100))
        // .force('center', d3.forceCenter().strength(1.8))
        .alphaMin(0.001)

      // * The following are the default parameters for the simulation.
      // const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
      // return d3
      //   .forceSimulation(nodes)
      //   .force("edge", forceLink.distance(100))
      //   .force("charge", d3.forceManyBody())
      //   .force("collide", d3.forceCollide(50).strength(0.2))
      //   .force("center", d3.forceCenter().strength(0.05))
      //   .alphaMin(0.001)
    }
  })
}
