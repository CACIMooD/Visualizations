import {visualization} from '../../src/visualization01/visualization';
import MooDConfig from './MooDConfig.json';
import dataConfig from './data.json';
import styleConfig from './style.json';
import inputsConfig from './inputs.json';

const config = {};
const pkg = require('../../package.json')
config.version = pkg.version
let key;
let css;

for (key in MooDConfig) {
    if(MooDConfig.hasOwnProperty(key)) {
        config[key] = MooDConfig[key];
    }
}

for (key in dataConfig) {
    if(dataConfig.hasOwnProperty(key)) {
        config[key] = dataConfig[key];
    }
}

if (styleConfig.URL !== undefined) {
    css = styleConfig.URL
}

for (key in styleConfig) {
    if (styleConfig.hasOwnProperty(key) && key !== 'URL') {
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
    console.Error(error)
}
//
// Define updateOutput function to log to console changes to output
//
var updateOutput = function(name, value) {
    console.log('Output changed: name = ' + name + ', value = ' + value.toString())
}
//
// Define inputChanged function
//
var inputChanged = function (name, value) {
    console.log('Inputs Changed: name = ' + name + ', value: ' + JSON.stringify(value))
}
//
// Define button click functions to alter the inputs
//
function incMax() {
    config.inputs.maxDepth = Math.min(5, config.inputs.maxDepth + 1)
    config.functions.inputChanged('maxDepth', config.inputs.maxDepth)
}

function decMax() {
    config.inputs.maxDepth = Math.max(1, config.inputs.maxDepth - 1)
    config.functions.inputChanged('maxDepth', config.inputs.maxDepth)
}

document.getElementById("inc-max-depth").addEventListener('click', () => incMax())
document.getElementById("dec-max-depth").addEventListener('click', () => decMax())

var el = document.getElementById(config.element)
el.style.height = config.height
el.style.width = config.width
config.functions = {
    errorOccurred: errorOccurred,
    inputChanged: inputChanged,
    updateOutput: updateOutput,
};
config.animation = true;
visualization(config);

function addCSSFile(cssURL) {
    if (cssURL !== undefined && cssURL !== null) {
        var link = document.createElement("link");
        link.href = cssURL
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";

        document.getElementsByTagName("head")[0].appendChild(link);
    }
}
