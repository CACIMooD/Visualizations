import * as vNG from 'v-network-graph'
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

  public isUnbalanced (): boolean {
    return this.outEdges.length !== this.inEdges.length
  }

  public flowMismatch (): number {
    return this.outEdges.length - this.inEdges.length
  }

  public edges (): Edge[] {
    return this.outEdges
  }

  public untraversedEdges (): Edge[] {
    return this.outEdges.filter(edge => !edge.isTraversed())
  }

  public isSource (): boolean {
    return this.inEdges.length === 0
  }

  public isValidPathSource (): boolean {
    return this.inEdges.length === 0 &&
     this.outEdges.length === 1
  }

  public isSink (): boolean {
    return this.outEdges.length === 0
  }

  public isValidPathSink (): boolean {
    return this.outEdges.length === 0 &&
     this.inEdges.length === 1
  }
}

// Main function to remove objects that are already children of another object
export const removeNodesAlreadyInChildren = (nodes: vNG.Nodes): void => {
  const childKeys = collectChildKeys(nodes);

  removeChildrenFromNodes(nodes, childKeys);
}

// Collect all keys of objects that are already children of any other object
const collectChildKeys = (nodes: vNG.Nodes): Set<string> => {
  const childKeys = new Set<string>();

  for (const id in nodes) {
    const currentNode = nodes[id];

    if (currentNode.children) {
      // Iterate over the keys of the `children` object
      for (const childId in currentNode.children) {
        const childNode = currentNode.children[childId];

        const childIdInNodes = findIdByNode(nodes, childNode);

        if (childIdInNodes) {
          childKeys.add(childIdInNodes);
        }
      }
    }
  }

  return childKeys;
}

// Find the id of a target node in the nodes
const findIdByNode = (nodes: vNG.Nodes, targetNode: vNG.Node): string | undefined => {
  for (const id in nodes) {
    if(id === targetNode.id) {
      return id;
    }
  }

  return undefined;
}

// Remove objects from the group that are already children
const removeChildrenFromNodes = (nodes: vNG.Nodes, childKeys: Set<string>): void => {
  childKeys.forEach(key => {
    delete nodes[key];
  });
}