import { Edge } from './edge'

export class SubPath {
  readonly endOfCurrentLoopNodeId: string
  protected orderedEdges: Edge[]

  /**
   * Construct a SubPath object
   * @param endOfCurrentLoopNodeId The id of the node at the end of the current loop
   */
  constructor (endOfCurrentLoopNodeId: string) {
    this.endOfCurrentLoopNodeId = endOfCurrentLoopNodeId
    this.orderedEdges = []
  }

  /**
   * Test if the path is a loop
   * @returns true if the path is a loop
   */
  public isLoop (): boolean {
    let retVal: boolean = false
    if (this.length() > 0) {
      retVal = this.lastNodeId() === this.orderedEdges[0].source
    }
    return retVal
  }

  /**
   * Test if the path ends completes the current loop
   * @returns true if path completes the current loop
   */
  public isEndCurrentLoop (): boolean {
    let retVal: boolean = false
    if (this.length() > 0) {
      retVal = this.lastNodeId() === this.endOfCurrentLoopNodeId
    }
    return retVal
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
