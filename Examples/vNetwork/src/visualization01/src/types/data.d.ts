declare namespace Vis {
  interface Data {
    nodes: Vis.Data.Node[]
    edges: Vis.Data.Edge[]
    paths?: Vis.Data.Path[]
  }
}

declare namespace Vis.Data {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Node extends MooDElement {
    id: ID
    name: string
    x?: number
    y?: number
    icon?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Edge extends MooDElement {
    id: ID
    name: string
    source: Vis.Data.EndPoint
    target: Vis.Data.EndPoint
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Path extends MooDElement {
    id: ID
    name: string
    path: Vis.Data.AugmentedEndpoint
    edge: Vis.Data.EndPoint
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface EndPoint extends MooDElement {
    id: ID
    name: string
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AugmentedEndpoint extends MooDElement {
    id: ID
    name: string
    animated?: boolean
  }
}
