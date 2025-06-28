import {createStretchedChord} from '../../src/visualization01/visualization';
import MooDConfig from './MooDConfig.json';
// import dataConfig from './data.json';
import dataConfig from './DemandSignalData.json';
import styleConfig from './style.json';
import inputsConfig from './inputs.json';

const config = {};
const pkg = require('../../package.json')
config.version = pkg.version
let key;

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

for (key in styleConfig) {
    if(styleConfig.hasOwnProperty(key)) {
        config[key] = styleConfig[key];
    }
}

for (key in inputsConfig) {
    if(inputsConfig.hasOwnProperty(key)) {
        config[key] = inputsConfig[key];
    }
}

//
// Define empty dataChanged function that the visualisation extends
//
var dataChanged = function(config)
{

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
       performAction: performAction
   };
   //console.log(JSON.stringify(config));
   createStretchedChord(config);
