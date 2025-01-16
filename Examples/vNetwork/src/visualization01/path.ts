import * as vNG from 'v-network-graph'
import { Edge } from './edge'
import { Node } from './node'
import { SubPath } from './sub-path'

interface NodeMap {
  [name: string]: Node
}
/*
 * Notes:
 *   1 - A valid path can have either zero or two unbalanced nodes in it.
 *   2 - A valid path with zero unbalanced nodes is a single loop, but may have lobes, i.e.
 *       loops that start and finish at the same node within the loop. Lobes can themselves
 *       have sub-lobes ad infinitum.
 *   3 - A valid node can only have unbalanced nodes where there is a difference of only one
 *       between the number of edges flowing in and flowing out.
 *   4 - A node in a loop will have an edge flowing out and an edge (the same edge for single edge loop)
 *       flowing in in order to balance the node.
 *   5 - A node can be in more than one loop, but all, or all but one of the loops must start and end at
 *       such a node.
 *   6 - A valid path can have any number of loops where the path enters the loop and exits the loop at
 *       the same node. All nodes within such loops are balanced nodes
 * There are following cases of unbalanced nodes in a valid path:
 *   1 - Source node with no edges flowing in. For a valid path there can only be one edge flowing
 *       out of a Source node as there is no way to return to the node to traverse other edges out of it
 *   2 - Sink node with no edges flowing out. For a valid path there can only be one edge flowing
 *       into a Sink node.
 *   3 - Final Loop entry node, i.e. where the path enters the loop. There is one more edge flowing into
 *       the node than flowing out. The path will terminate at this node after traversing the loop
 *   4 - Initial Loop exit node, i.e. where the path exits the loop. There is one more edge flowing out
 *       of the node than flowing in. This node is the start of the path, which traverses the loop prior
 *       to exiting the loop at this node.
 */

export class Path {
  readonly id: string
  readonly nodes: NodeMap
  protected readonly edges: vNG.Edges = {}
  readonly originalEdgeOrder: string[]
  protected startNode: Node | undefined
  protected initialLoopEndNodeId: string | undefined
  protected readonly vNGpath: vNG.Path

  constructor (pathId: string, path: vNG.Path, edges: vNG.Edges) {
    this.id = pathId
    this.vNGpath = path
    this.nodes = {}
    this.originalEdgeOrder = path.edges.map(edgeId => edgeId)
    path.edges.forEach(edgeId => {
      if (this.edges[edgeId] !== undefined) {
        throw new DOMException('Edge ' + edgeId + ' appears in path ' + this.id + ' more than once')
      }
      if (edges[edgeId] === undefined) {
        throw new DOMException('Path ' + this.id + ' has unknown edge ' + edgeId)
      }
      this.edges[edgeId] = edges[edgeId]
      const newEdge = new Edge(edgeId, edges[edgeId])
      this.getNode(newEdge.source).addEdge(newEdge)
      this.getNode(newEdge.target).addEdge(newEdge)
    })
  }

  protected getNode (nodeId: string): Node {
    if (this.nodes[nodeId] === undefined) {
      this.nodes[nodeId] = new Node(nodeId)
    }
    return this.nodes[nodeId]
  }

  /**
   * Get the node object with a specific node id
   * @param nodeId Identity of node
   * @returns the node
   */
  public node (nodeId: string): Node {
    if (this.nodes[nodeId] === undefined) {
      throw new DOMException('Unknown node ' + nodeId + ' on path ' + this.id)
    }
    return this.nodes[nodeId]
  }

  /**
   * Test if the path has a valid source node. A path consisting of a loop will have no specific
   * single source node.
   * Raises an exception if there are is than one source node as it is not possible to build a path
   * that can start at more than one sink node.
   * @returns Source node if the path has a valid (single) source node or undefined otherwise
   */
  protected validSourceNode (): Node | undefined {
    let returnNode: Node | undefined
    const sourceNodes = Object.values(this.nodes)
      .filter(node => node.isValidPathSource())
    if (sourceNodes.length === 1) {
      returnNode = sourceNodes[0]
    } else if (sourceNodes.length > 1) {
      throw new DOMException('Path ' + this.id + ' has ' + sourceNodes.length.toString() + ' source nodes')
    }
    return returnNode
  }

  /**
   * Test if the path has a valid sink node. A path consisting of a loop will have no specific
   * single sink node.
   * Raises an exception if there is more than one sink node as it is not possible to build a path
   * that can visit more than one sink node.
   * @returns Sink node if the path has a valid (single) sink node or undefined otherwise
   */
  protected validSinkNode (): Node | undefined {
    let returnNode: Node | undefined
    const sinkNodes = Object.values(this.nodes)
      .filter(node => node.isValidPathSink())
    if (sinkNodes.length === 1) {
      returnNode = sinkNodes[0]
    } else if (sinkNodes.length > 1) {
      throw new DOMException('Path ' + this.id + ' has ' + sinkNodes.length.toString() + ' sink nodes')
    }
    return returnNode
  }

  /**
   * Check to see if the path is valid, i.e. there is a route starting at a node
   * that can traverse each of the edges once and only once to reach a node at the
   * end of the path. Validation is performed using a set of rules without traversing
   * the path. Sets the startNode property to the node to start the path at
   * @returns an undefined value if valid or a string describing the fault if invalid
   */
  public validate (): string | undefined {
    let report: string | undefined
    try {
      const sourceNode = this.validSourceNode()
      const sinkNode = this.validSinkNode()
      const unbalancedNodes = Object.values(this.nodes)
        .filter(node => node.isUnbalanced())
      if ((sourceNode !== undefined) && (sinkNode !== undefined)) { // both sink and source nodes
        if (unbalancedNodes.length === 2 &&
          unbalancedNodes[0].flowMismatch() + unbalancedNodes[1].flowMismatch() === 0) {
          // start path at source node
          this.startNode = sourceNode
        } else {
          throw new DOMException('Path ' + this.id + ' has invalid branches in it')
        }
      } else if (sourceNode !== undefined) { // source but no sink
        if (unbalancedNodes.length === 2 &&
          unbalancedNodes[0].flowMismatch() + unbalancedNodes[1].flowMismatch() === 0) {
          // start path at source node
          this.startNode = sourceNode
        } else {
          throw new DOMException('Path ' + this.id + ' has invalid branches in it')
        }
      } else if (sinkNode !== undefined) { // sink but no source
        if (unbalancedNodes.length === 2 &&
          unbalancedNodes[0].flowMismatch() + unbalancedNodes[1].flowMismatch() === 0) {
          // the path is a loop with a branch out towards the sink node
          // start path at node in loop where the path branches out to the sink
          this.startNode = unbalancedNodes[0].id === sinkNode.id ? unbalancedNodes[1] : unbalancedNodes[0]
          // record the id of the node at the end of the initial loop so that a sub-path can terminate there
          this.initialLoopEndNodeId = this.startNode.id
        } else {
          throw new DOMException('Path ' + this.id + ' has invalid branches in it')
        }
      } else { // no source nor sink nodes
        if (unbalancedNodes.length === 0) {
          // with no source nor sink nodes the path is a single loop, with possible lobes off it
          // start path at arbitrary node
          this.startNode = Object.values(this.nodes)[0]
        } else if (unbalancedNodes.length === 2 &&
          unbalancedNodes[0].flowMismatch() + unbalancedNodes[1].flowMismatch() === 0) {
          // with no source nor sink nodes the path starts in a loop, with possible lobes off it
          // and ends in a different loop
          // start path at node in loop where the path branches out to the other loop
          this.startNode = unbalancedNodes[0].flowMismatch() < 0 ? unbalancedNodes[1] : unbalancedNodes[0]
        } else {
          throw new DOMException('Path ' + this.id + ' has invalid branches in it')
        }
        // record the id of the node at the end of the initial loop so that a sub-path can terminate there
        this.initialLoopEndNodeId = this.startNode.id
      }
    } catch (e) {
      report = (e.name as string) + ': ' + (e.message as string)
    }

    return report
  }

  /**
   * Attempt to order the edges of the path and report reason if unsuccessful
   * @returns report if unsuccessful or undefined otherwise
   */
  public orderEdges (): string | undefined {
    let report: string | undefined
    if (this.startNode == null) {
      throw new DOMException('Path ' + this.id + ': orderEdges called on invalid or unvalidated path')
    }
    const orderedPath = this.findPath(this.startNode)
    if (orderedPath.length !== this.originalEdgeOrder.length) {
      report = 'Path ' + this.id + ' is not contiguous'
    } else {
      this.vNGpath.edges = orderedPath
    }

    return report
  }

  /**
   * Mark the edge as traversed, add the edge to the path and return the target node
   * @param edge The edge to traverse
   * @param path The path to add the edge to
   * @returns target node of edge
   */
  protected traverseEdge (edge: Edge, path: SubPath): Node {
    edge.traverse()
    path.addEdge(edge)
    return this.node(edge.target)
  }

  /**
   * Find the complete path from the start node
   * @param startNode where to start the path
   * @returns the list of ids of the ordered edges in the path
   */
  protected findPath (startNode: Node): string[] {
    return this.findPathFromNode(startNode).orderedEdgeIds()
  }

  /**
   * Find the sub-path from a node
   * @param startNode where to start the path
   * @returns A sub-path containing ordered edges and an indicator if the sub-path is part of a loop
   */
  protected findPathFromNode (startNode: Node): SubPath {
    const path = new SubPath(this.initialLoopEndNodeId)
    let finalSection = new SubPath(this.initialLoopEndNodeId)
    let endInitialLoop = new SubPath(this.initialLoopEndNodeId)

    startNode.untraversedEdges().forEach(edge => {
      const subPath = this.findPathFromEdge(edge)
      // Need to traverse loops before heading for final node in sub-path
      //
      if (subPath.isLoop()) {
        path.addSubPath(subPath)
      } else if (subPath.isEndInitialLoop()) {
        // Save the sub-path to the end of initial loop to add later
        endInitialLoop = subPath
      } else {
        // Save the sub-path to the final node to add at the end
        finalSection = subPath
      }
    })

    path.addSubPath(endInitialLoop)
    path.addSubPath(finalSection)

    return path
  }

  /**
   * Find the sub-path from an edge
   * @param startEdge where to start the path
   * @returns A sub-path containing ordered edges and an indicator if the sub-path is part of a loop
   */
  protected findPathFromEdge (startEdge: Edge): SubPath {
    const path = new SubPath(this.initialLoopEndNodeId)
    if (!startEdge.isTraversed()) {
      let currentNode = this.traverseEdge(startEdge, path)

      while (currentNode.untraversedEdges().length > 0 &&
            !path.isEndInitialLoop() &&
            !path.isLoop()) {
        const untraversedEdges = currentNode.untraversedEdges()

        if (untraversedEdges.length === 1) {
          currentNode = this.traverseEdge(untraversedEdges[0], path)
        } else {
          // Branch in the path, traverse all edges out of this node as far
          // as end of initial loop or the sink node
          const subPath = this.findPathFromNode(currentNode)

          path.addSubPath(subPath)
        }
      }
    }

    return path
  }
}
