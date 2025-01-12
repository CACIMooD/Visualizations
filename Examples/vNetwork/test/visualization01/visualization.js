import { visualization } from "../../src/visualization01/visualization";
// import { MooDConfig } from "@moodtypes/index";
// "../../types/typescript-transformer/moodtypes/index";

import MooDConfiguration from "./MooDConfig.json";
// import dataConfig from "./data.json";
import dataConfig from "./data-no-source-one-sink.json";
// import dataConfig from "./data-no-source-no-sink-2-loops.json";
// import dataConfig from "./data-two-source-node-path.json";
// import dataConfig from "./data-two-sink-node-path.json";
// import dataConfig from "./data-no-source-or-sink-node-path.json"
// import dataConfig from "./data-disjointed-path.json"
// import dataConfig from "./data-nodes-with-styles.json"

import styleConfig from "./style.json";
import inputsConfig from "./inputs.json";
import stateConfig from "./state.json";
import { getOutputs } from "./outputs";
// import { setupDevelopmentConfig } from "@helpers/development"

// const config: MooDConfig = setupDevelopmentConfig({});
const config = {};
let key;
let css;

config.outputs = getOutputs();
// console.log("Outputs: " + JSON.stringify(config.outputs));

for (key in MooDConfiguration) {
  if (MooDConfiguration.hasOwnProperty(key)) {
    config[key] = MooDConfiguration[key];
  }
}

for (key in stateConfig) {
  if (stateConfig.hasOwnProperty(key)) {
    config[key] = stateConfig[key];
  }
}

for (key in dataConfig) {
  if (dataConfig.hasOwnProperty(key)) {
    config[key] = dataConfig[key];
  }
}

if (styleConfig.URL !== undefined) {
  css = styleConfig.URL;
}

for (key in styleConfig) {
  if (styleConfig.hasOwnProperty(key) && key !== "URL") {
    config[key] = styleConfig[key];
  }
}

for (key in inputsConfig) {
  if (inputsConfig.hasOwnProperty(key)) {
    config[key] = inputsConfig[key];
  }
}

//    console.log(JSON.stringify(config));
addCSSFile(css);
//
// Define updateOutput function to log to console changes to output
//
var errorOccurred = function(error) {
  console.error(error)
}
//
// Define empty dataChanged function that the visualisation extends
//
var dataChanged = function(config)
{

}
//
// Define inputChanged function
//
var inputChanged = function (name, value) {
  console.log('Inputs Changed: name = ' + name + ', value: ' + JSON.stringify(value))
}
//
// Define updateOutput function to log to console changes to output
//
var updateOutput = function(name, value) {
    console.log('Output changed: name = ' + name + ', value = ' + value.toString())
}
//
// Define performAction function to log to console actions triggered by visualisation
//
var performAction = function(name, id, event) {
    console.log('Perform Action: name = ' + name + ', id = ' + id + ', event: ' + JSON.stringify(event))
}
   config.functions = {
       dataChanged: dataChanged,
       updateOutput: updateOutput,
       errorOccurred: errorOccurred,
       performAction: performAction,
       inputChanged: inputChanged
  };

var el = document.getElementById(config.element);
if (el) {
  el.style.height = config.height;
  el.style.width = config.width;
  visualization(config);
}

function addCSSFile(cssURL) {
  if (cssURL !== undefined && cssURL !== null) {
    var link = document.createElement("link");
    link.href = cssURL;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";

    document.getElementsByTagName("head")[0].appendChild(link);
  }
}
