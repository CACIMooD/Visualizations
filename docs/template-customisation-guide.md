# Template Customisation Guide

[README](../README.md)

## Table of Contents

* [Install node modules for template](#install-node-modules-for-template)
* [Visualization Template File Customization](#visualization-template-file-customization)
  * [webpack.common.js](#webpackcommonjs)
  * [webpack.prod.js](#webpackprodjs)
  * [package.json](#packagejson)
  * [src/visualization01/visualization.js](#srcvisualization01visualizationjs)
  * [src/visualization01/visualization.datashape.gql](#srcvisualization01visualizationdatashapegql)
  * [src/visualization01/visualization.config.json.ejs](#srcvisualization01visualizationconfigjsonejs)
  * [src/package.json.ejs](#srcpackagejsonejs)
* [Debugging your visualization](#debugging-your-visualization)
  * [test/visualization01/data.json](#testvisualization01datajson)
  * [test/visualization01/inputs.json](#testvisualization01inputsjson)
  * [test/visualization01/MooDConfig.json](#testvisualization01moodconfigjson)
  * [test/visualization01/style.json](#testvisualization01stylejson)
* [Package version numbering](#package-version-numbering)
* [Generate GUIDs](#generate-guids)
* [Multiple visualizations in a package](#multiple-visualizations-in-a-package)

## Install node modules for template

Before customising the template files you will need to install the node modules that the template depends on.

In a Visual Studio Code terminal run the following:

```bash
npm install
```

If you include any additional packages for your visualization, you need to install them individually

```bash
npm install additional-package-name
```

[Table of Contents](#table-of-contents)

## Visualization Template File Customization

__Warning:__ do not change the name of the following files

* `src/visualizationNN/no-guid.visualization.config.json.ejs`
* `src/no-guid.package.json.ejs`

After you have [generated GUIDs](#generate-guids) for the package configuration files, the following configuration files are generated each time you rebuild the package for debugging or production:

* `src/visualizationNN/visualization.config.json` is generated from `src/visualizationNN/visualization.config.json.ejs`
* `src/package.json` is generated from `src/package.json.ejs`

__Warning:__ generated configuration files

If you need to amend configuration only edit the source `.json.ejs` file, not the generated `.json` file. Any edits you make in the `.json` file will be lost the next time you rebuild the package for debugging or production.

### webpack.common.js

See the suggestions for customising the __webpack.common.js__ for your chosen template

* [D3 webpack.common.js](./d3-template-customisation-guide.md#webpackcommonjs)
* [ECharts webpack.common.js](./echarts-template-customisation-guide.md#webpackcommonjs)
* [React webpack.common.js](./react-template-customisation-guide.md#webpackcommonjs)

[Table of Contents](#table-of-contents)

### webpack.prod.js

Editing this file is optional.

The name of the visualization package file generated each time you rebuild the package is controlled by the *ZipFilesPlugin* defined in this file. The package file name is taken from the package name in the `package.json` file and the version number, you can edit this if you want to give the package file a different name.

__Note__: The `.gitignore` file excludes all zip files in the top level folder to prevent the binary files being included in the source repository.

[Table of Contents](#table-of-contents)

### package.json

* Webpack Chart Package properties

  For example

```JSON
{
    "name": "scatter_plot",
    "description": "Example scatter plot chart",
    "version": "1.1.10",
    "license": "MIT",
```

__Note__: There is an accompanying file `package-lock.json` which is maintained by NPM and shouldn't be edited.

[Table of Contents](#table-of-contents)

### src/visualization01/visualization.js

__Note__: This file and the [datashape](#srcvisualization01visualizationdatashapegql) are interdependent and should be updated alongside each other.

See the suggestions for customising the __src/visualization01/visualization.js__ for your chosen template

* [D3 src/visualization01/visualization.js](./d3-template-customisation-guide.md#srcvisualization01visualizationjs)
* [ECharts src/visualization01/visualization.js](./echarts-template-customisation-guide.md#srcvisualization01visualizationjs)
* [React src/visualization01/visualization.js](./react-template-customisation-guide.md#srcvisualization01visualizationjs)

[Table of Contents](#table-of-contents)

### src/visualization01/visualization.datashape.gql

__Note__: This file and the [visualization](#srcvisualization01visualizationjs) are interdependent and should be updated alongside each other.

* Define visualization graph shape

    For example

```GraphQL
type data {
 rows: [row]
}

type row implements MooDElement{
 key: ID!
 x: Number!
 y: Number!
}
```

[Table of Contents](#table-of-contents)

### src/visualization01/visualization.config.json.ejs

Embedded JavaScript Template for visualization.config.json.

__Note__: Ensure that you have generated GUIDs before updating this file. [See below for instructions](#generate-guids) on how to generate visualization.config.json.ejs containing a GUID.

* Do not alter the id or version properties
* Update visualization properties

    For example

```JSON
{
  "id": "<Generated GUID>",
  "name": "Simple Scatter Plot",
  "description": "Example of a scatter plot diagram",
  "version": "<%= package.version %>",
  "supportedVersions": "0.1",
  "moodVersion": "16.0.076",
  "entry": {
    "file": "visualization.js",
    "function": "vis.visualization"
  },
  "supportedBrowsers": "Chrome, Edge, Firefox",
```

* Update visualization default Inputs

    For example

```JSON
{
  "inputs": [
    {
      "name": "xAxisMin",
      "displayName": "X Axis Range Minimum",
      "type": "Number",
      "default": 0.0
    },
    {
      "name": "xAxisMax",
      "displayName": "X Axis Range Maximum",
      "type": "Number",
      "default": 10.0
    },
    {
      "name": "yAxisMin",
      "displayName": "Y Axis Range Minimum",
      "type": "Number",
      "default": 0.0
    },
    {
      "name": "yAxisMax",
      "displayName": "Y Axis Range Maximum",
      "type": "Number",
      "default": 10.0
    }
  ],
}
```

* Update visualization default Styles

    For example

```JSON
{
  "style": {
    "URL": "visualization01/simple.css",
    "JSON": {
      "margin": {
        "top": 20,
        "bottom": 20,
        "left": 20,
        "right": 20
      },
      "xAxisLabel": "X Axis",
      "yAxisLabel": "Y Axis",
      "spotRadius": 1.5,
      "fillColour": "#69b3a2"
    }
  }
}
```

[Table of Contents](#table-of-contents)

### src/package.json.ejs

Embedded JavaScript Template for visualization package.json.

__Note__: Ensure that you have generated GUIDs before updating this file. [See below for instructions](#generate-guids) on how to generate package.json.ejs containing a GUID.
See the suggestions for customising the __src/package.json.ejs__ for your chosen template

* [D3 src/package.json.ejs](./d3-template-customisation-guide.md#srcpackagejsonejs)
* [ECharts src/package.json.ejs](./echarts-template-customisation-guide.md#srcpackagejsonejs)
* [React src/package.json.ejs](./react-template-customisation-guide.md#srcpackagejsonejs)

[Table of Contents](#table-of-contents)

## Debugging your visualization

Populate the following JSON files with sample data matching the structure required by your visualization

### test/visualization01/data.json

  For example

```JSON
{
"data" : {"rows" : [
    {
        "key": "guid-1",
        "x": 1.0,
        "y": 1.0
    },
```

[Table of Contents](#table-of-contents)

### test/visualization01/inputs.json

  For example

```JSON
{
  "inputs" : {
    "xAxisMin": 0.0,
    "xAxisMax": 10.0,
    "yAxisMin": 0.0,
    "yAxisMax": 10.0
  }
}
```

[Table of Contents](#table-of-contents)

### test/visualization01/MooDConfig.json

  For example

```JSON
{
    "width": "800px",
    "height": "600px",
    "element": "visualisation01_element_guid",
    "animation": true
}
```

[Table of Contents](#table-of-contents)

### test/visualization01/style.json

  For example

```JSON
{
  "URL": "visualization01/simple.css",
  "style" : {
    "margin": {
        "left": 20,
        "right": 20,
        "top": 20,
        "bottom": 20
        },
    "spotRadius": 1.5,
    "fillColour": "#69b3a2"
    }
}
```

[Table of Contents](#table-of-contents)

## Package version numbering

MooD requires the visualization package and each visualization within the package to have their own version number.
When changes are made to the visualization, the version number must be updated.
To ensure that you don't forget to update the version number, the template has been configured to update the
patch number in the semantic version number (major.minor.patch) of the webpack visualization package configuration
file `./package.json`. This version is only updated when creating the production package, not when debugging.
To avoid updating the version number, use the `rebuild` script instead of the `build` script.

In a package with multiple visualizations, the version number is updated in all visualizations even if only one visualization is updated. If you need to control version numbers of the individual visualizations separately you can disable the automatic version numbering of visualizations. You then need to manually update the version number (and any other visualization configuration) in the `src/visualizationNN/visualization.config.json` file; the `src/visualizationNN/visualization.config.json.ejs` will no longer be used. To disable automatic version numbering remove or comment out the following code from the `.\webpack.common.js` file:

```JavaScript
//
//  VersionFiles for each visualization configuration
//
    let vcVersionFiles = VisualizationDirectories
        .map(d => Object(new VersionFile({
            packageFile: path.join(__dirname, 'package.json'),
            template: path.join(__dirname, 'src', d.directoryName, 'visualization.config.json.ejs'),
            outputFile: path.join(__dirname, 'src', d.directoryName, 'visualization.config.json')
            })));
```

When running the build script to create the production
package, the newly updated version number is copied from the webpack package configuration file into the following files

* `src/package.json`
* `src/visualizationNN/visualization.config.json`

The files are updated via the corresponding EJS template files

* `src/package.json.ejs`
* `src/visualizationNN/visualization.config.json.ejs`

[Table of Contents](#table-of-contents)

## Generate GUIDs

A GUID is required in the following files

* `src/package.json`
* `src/visualizationNN/visualization.config.json`

To generate the GUIDs in these files, execute `npm run-script generate-guids`.
This uses the following EJS template files

* `src/no-guid.package.json.ejs`
* `src/no-guid.visualizationNN\visualization.config.json.ejs`

The GUIDs are written to the following files, which are the EJS templates for version numbering.

* `src/package.json.ejs`
* `src/visualizationNN\visualization.config.json.ejs`

If you need to amend configuration only edit the source `.json.ejs` files for version numbering, not the generated `.json` file. Any edits you make in the `.json` file will be lost the next time you rebuild the package for debugging or production.

[Table of Contents](#table-of-contents)

## Multiple visualizations in a package

If you want to have multiple visualizations in a package, the following files need to be updated

* create folder for additional visualization and should contain the following:
  * `no-guid.visualization.config.json.ejs`
    * See [Package version numbering](#package-version-numbering) above about manually setting visualization version numbers in a multi-visualization package.
  * `visualization.datashape.gql`
  * JavaScript entry file containing visualization entry function
* Create test folder for additional visualization as a copy of `./test/visualization01`
* Update json files and `visualization.js` in new test folder for the additional visualization

[Table of Contents](#table-of-contents)

[README](../README.md)
