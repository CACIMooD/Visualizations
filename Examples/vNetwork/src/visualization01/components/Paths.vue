<script setup lang="ts">
import {
  getVisualizationConfig,
  getVisualizationStyle,
  getVisualizationData,
  getVisualizationOutputs,
} from "@helpers/config";
import { ActionsEnum } from "../src/types/actions";
import { OutputsEnum } from "../src/types/outputs";
import { orderPathEdges } from "../graph";

// import { reactive, ref } from "vue"
import * as vNG from "v-network-graph"
import {
  ForceLayout,
  ForceNodeDatum,
  ForceEdgeDatum,
} from "v-network-graph/lib/force-layout"

interface Config {
  [name: string]: any
}

// Get a reference to the "Node Click" action that we can call
//  but only if the action has been set up in MooD BA
// const [nodeClickStrict, nodeClickStrictHasAction] = useStrictAction(
//   ActionsEnum.Node_Click
// );
// Get a reference to the "Edge Click" action that we can call
//  but only if the action has been set up in MooD BA
// const [edgeClickStrict, edgeClickStrictHasAction] = useStrictAction(
//   ActionsEnum.Edge_Click
// );
const config = getVisualizationConfig();
// setupProductionConfig(config);
const outputs = getVisualizationOutputs();
console.log("Outputs: " + JSON.stringify(outputs))
const eventHandlers: vNG.EventHandlers = {
  "node:click": ({ node, event }) => {
    config.functions.performAction(ActionsEnum.Node_Click, node, event)
    // nodeClickStrict(node, event)
    //           .then(() => {
    //             alert(`${ActionsEnum.Node_Click} has executed successfully`);
    //           })
    //           .catch(() => {
    //             alert(`${ActionsEnum.Node_Click} has failed to execute`);
    //           });
  },
  "edge:click": ({ edge, edges, event, summarized }) => {
    config.functions.performAction(ActionsEnum.Edge_Click, edge ?? "", event)
    // edgeClickStrict(edge ?? "", event)
    //           .then(() => {
    //             alert(`${ActionsEnum.Edge_Click} has executed successfully, edges: ${JSON.stringify(edges)}, summarize: ${summarized}`);
    //           })
    //           .catch(() => {
    //             alert(`${ActionsEnum.Edge_Click} has failed to execute`);
    //           });
  },
  "path:click": ({ path, event }) => {
    config.functions.performAction(ActionsEnum.Path_Click, path, event)
  },
  "node:pointerover": ({ node }) => {
    config.functions.updateOutput(OutputsEnum.hoverNode, node)
  },
  "edge:pointerover": ({ edge }) => {
    config.functions.updateOutput(OutputsEnum.hoverEdge, edge)
  },
  "path:pointerover": ({ path }) => {
    config.functions.updateOutput(OutputsEnum.hoverPath, path)
  },
}

const data = getVisualizationData(false)
const nodes: vNG.Nodes = {};
const edges: vNG.Edges = {};
const layouts: vNG.Layouts = {nodes: {}};
// const unorderedPaths: vNG.Paths = {};
const paths: vNG.Paths = {};
const configs = vNG.defineConfigs(getConfig())


if (data) {
  data.nodes?.forEach((node) => {
    if (node.id) {
      nodes[node.id] = { name: node.name }
      if (node.x !== undefined && node.y !== undefined) {
        // layouts.nodes[node.id] = {x: node.x, y: node.y}
      }
    }
  })

  data.edges?.forEach((edge) => {
    if (edge.id && edge.source?.id && edge.target?.id) {
      edges[edge.id] = {source: edge.source.id, target: edge.target.id}
    }
  })

  data?.paths?.forEach((pathLink) => {
    if (pathLink.path && pathLink?.path.id && pathLink.edge && pathLink.edge.id) {
      if (!paths[pathLink.path.id]) {
        paths[pathLink.path.id] = {edges: []}
      }
      paths[pathLink.path.id].edges.push(pathLink.edge.id)
    }
  })
  try {
    
    const report = orderPathEdges(paths, edges)
    if (report.length > 0) {
      config.functions.errorOccurred(report.join("\n"))
    }
    // console.log('Ordered Paths: ' + JSON.stringify(paths))
  } catch (e) {
      const errorMessage = e.name + ': ' + e.message
      //
      // Report error to MooD BA
      //
      config.functions.errorOccurred(errorMessage)
    }
 
}
// console.log('Nodes: ' + JSON.stringify(nodes))
// console.log('Edges: ' + JSON.stringify(edges))
// console.log('Layouts: ' + JSON.stringify(layouts))
// console.log('Paths: ' + JSON.stringify(paths))

function getConfig(): Config {
  const style = getVisualizationStyle()
  const config: Config = {
    view: {
      // builtInLayerOrder: ["edges", "paths"],
      autoPanAndZoomOnLoad: "center-content", //"fit-content", // false | "center-zero" | "center-content" | 
      // fitContentMargin: 0,
      minZoomLevel: 0.5,
      maxZoomLevel: 5,
        layoutHandler: new ForceLayout({
          positionFixedByDrag: false,
          positionFixedByClickWithAltKey: true,
          createSimulation: (d3, nodes, edges) => {
            // d3-force parameters
            const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
            return d3
              .forceSimulation(nodes)
              .force("edge", forceLink.distance(40).strength(0.5))
              .force("charge", d3.forceManyBody().strength(-800))
              .force("center", d3.forceCenter().strength(0.05))
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
        }),
      },
    node: {
      normal: {
        type: "circle",
        // radius: 20,
        color: "#99ccff",
      },
      hover: {
        color: "#88bbff",
      },
      label: {
        visible: true,
        fontSize: 8,
      },
    },
    edge: {
      gap: 12,
      normal: {
        color: "#6699cc",
        linecap: "round" 
      },
      hover: {
        color: "#6699cc",
        width: 6,
      },
    },
    path: {
      visible: true,
      clickable: true,
      hoverable: true,
      curveInNode: true,
      normal: {
        width: 8,
        // color: "#6699cc"
      },
      hover: {
        width: 10,
      }
    },
  }

  if (style?.showArrows) {
    config.edge.marker = {
      target: {
          type:  "arrow"
        }
    }
  }
  return config
}

</script>

<template>
    <v-network-graph
    :nodes="nodes"
    :edges="edges"
    :paths="paths"
    :layouts="layouts"
    :configs="configs"
    :event-handlers="eventHandlers"
  />
</template>
