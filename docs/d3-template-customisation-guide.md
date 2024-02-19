# D3 Template Customisation Guide

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#webpackcommonjs)

## webpack.common.js

* Babel loader configuration, including supported browsers
* visualization entry point(s)
* Possible SplitChunks for any additional D3 chart libraries

  You will need to update the dependencies in `src/package.json.ejs` (see below) for any chunks you add

  For example

```JavaScript

   optimization: {
        splitChunks: {
            cacheGroups: {
                "d3" : {
                    test: /[\\/]node_modules[\\/](d3.*)[\\/]/,
                    name: 'd3',
                    chunks: 'all',
                    priority: -3,
                    enforce: true
                },
                "other" : {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'other',
                    chunks: 'all',
                    priority: -10,
                    enforce: true
                }
            }
        }
   }
```

 or update test property for "d3"

  For example

```JavaScript
                "d3" : {
                    test: /[\\/]node_modules[\\/](d3-hexbin.*)[\\/]/,
```

* VersionFile plugins for any additional visualizations

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#webpackcommonjs)

## src/visualization01/visualization.js

__Note__: This file and the [datashape](./template-customisation-guide.md#srcvisualization01visualizationdatashapegql) are interdependent and should be updated alongside each other.

* Add import statements for any additional D3 chart libraries

    Add import any additional import statements after the d3 import

```JavaScript
//
//    Entry function declaration
//
import * as d3 from "d3";
import * as d3Hex from "d3-hexbin";
```

* Add chart code to visualization function

    Add the chart code at the TODO comment

```JavaScript
  //
  // TODO: Add D3 visualization code here, referencing configuration above
  //
  //
  //    append the svg to the element in MooD config
  //
  // set the dimensions and margins of the graph
  // append the svg object to the body of the page
  var svg = d3.select("#" + config.element)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
...
```

* Pay attention to the domains within scaleLinear functions

```JavaScript
    // Add X axis
    var x = d3.scaleLinear()
      .domain([xMin, xMax])
```

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#srcvisualization01visualizationjs)

## src/package.json.ejs

Embedded JavaScript Template for visualization package.json.

[See instructions](./template-customisation-guide.md#generate-guids) on how to generate package.json.ejs containing a GUID before customising this file.

* Do not alter the id or version properties
* Update visualization package properties

    For example

```JSON
{
  "id": "<Generated GUID>",
  "name": "Scatter Plot",
  "description": "Example scatter plot diagram",
  "version": "<%= package.version %>",
```

* Update dependencies - e.g. chart library

  Add dependencies for any chunks added by changes to `webpack.common.js` above

  For example

```JSON
{
  "dependencies": {
    "d3": "./d3/visualization.js",
    "other": "./other/visualization.js"
  }
}
```

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#srcpackagejsonejs)
