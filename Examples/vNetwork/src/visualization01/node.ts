import { Edge } from './edge'

interface EdgeMap {
  [name: string]: Edge
}

export class Node {
  readonly id: string
  protected outEdges: Edge[] = []
  protected inEdges: Edge[] = []
  protected edgeMap: EdgeMap = {}

  constructor (id: string) {
    this.id = id
  }

  public addEdge (edge: Edge): void {
    if (edge.source !== this.id && edge.target !== this.id) {
      throw new DOMException('Edge ' + edge.id + ' is not a valid edge to add to node ' + this.id)
    }
    if (this.edgeMap[edge.id] === undefined) {
      this.edgeMap[edge.id] = edge
      if (edge.source === this.id) {
        this.outEdges.push(edge)
      }
      if (edge.target === this.id) {
        this.inEdges.push(edge)
      }
    }
  }

  /**
   * Indicates if the node has an unbalanced number of edges, i.e. not the same number flowing in as
   * flowing out.
   * @returns Returns true if the number of edges flowing into the node is not the same as flowing out
   */
  public isUnbalanced (): boolean {
    return this.outEdges.length !== this.inEdges.length
  }

  /**
   *
   * @returns the difference between the number of edges flowing into the node and the number flowing out
   */
  public flowMismatch (): number {
    return this.outEdges.length - this.inEdges.length
  }

  public edges (): Edge[] {
    return this.outEdges
  }

  public untraversedEdges (): Edge[] {
    return this.outEdges.filter(edge => !edge.isTraversed())
  }

  public isValidPathSource (): boolean {
    return this.inEdges.length === 0 &&
     this.outEdges.length === 1
  }

  public isValidPathSink (): boolean {
    return this.outEdges.length === 0 &&
     this.inEdges.length === 1
  }

  /**
   * Tests if the node has a valid balance of edges flowing in and out.
   * If the difference between the number of edges flowing in and out
   * is more than one it is not possible to include all the edges in a path
   * @returns Returns true if the node has a valid balance of edges
   */
  public isValidPathNode (): boolean {
    return Math.abs(this.flowMismatch()) <= 1
  }
}
