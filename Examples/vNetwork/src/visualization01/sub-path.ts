import { Edge } from './edge'

export class SubPath {
  protected orderedEdges: Edge[]
  public isLoop: boolean

  constructor () {
    this.orderedEdges = []
    this.isLoop = false
  }

  /**
   * Add a sub-path at the end of this sub-path
   * @param subPath Sub-path to add at the end
   */
  public addSubPath (subPath: SubPath): void {
    this.orderedEdges = this.orderedEdges.concat(subPath.orderedEdges)
  }

  /**
   * Add an edge to the end of the sub-path
   * @param edge Edge to add to the sub-path
   */
  public addEdge (edge: Edge): void {
    this.orderedEdges.push(edge)
  }

  /**
   *
   * @returns the ordered list of edge ids
   */
  public orderedEdgeIds (): string[] {
    return this.orderedEdges.map(edge => edge.id)
  }

  /**
   * Returns the id of the last node in the sub-path
   */
  public lastNodeId (): string {
    return this.orderedEdges.slice(-1)[0].target
  }

  /**
   *
   * @returns The number of edges in the sub-path
   */
  public length (): number {
    return this.orderedEdges.length
  }
}
