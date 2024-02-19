# React Template Customisation Guide

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#webpackcommonjs)

## webpack.common.js

* Babel loader configuration, including supported browsers and Babel plug-ins for chosen React chart library

  For example

```JavaScript
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    useBuiltIns: 'entry',
                                    corejs: '3.19',
                                    targets: {
                                        chrome: 34,
                                        ie: 11,
                                        edge: 20,
                                        firefox: 30,
                                    },
                                    modules: false
                                }
                            ],
                            '@babel/preset-react',
                        ],
                        plugins: [
                            'recharts'
                        ],
                    }
                }
            },
        ]
    },
```

* Chunk configuration for chosen React chart library

  You will need to update the dependencies in `src/package.json.ejs` (see below) for any chunks you add

  For example

```JavaScript
    optimization: {
        splitChunks: {
            cacheGroups: {
                "react" : {
                    test: /[\\/]node_modules[\\/](react.*)[\\/]/,
                    name: 'react',
                    chunks: 'all',
                    priority: -5,
                    enforce: true
                },
                "recharts" : {
                    test: /[\\/]node_modules[\\/](recharts.*)[\\/]/,
                    name: 'recharts',
                    chunks: 'all',
                    priority: -6,
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
    },
```

* VersionFile plugins for any additional visualizations

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#webpackcommonjs)

## src/visualization01/visualization.js

__Note__: This file and the [datashape](./template-customisation-guide.md#srcvisualization01visualizationdatashapegql) are interdependent and should be updated alongside each other.

* Add import statements for chosen React chart library

  For example

```JavaScript
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import React from 'react';
import ReactDOM from 'react-dom';
```

* Add chart code to visualization function

    Add the chart code at the TODO comment

```JSX
  //
  // TODO: Add chart code here
  //
  const renderLineChart = (
    <LineChart width={width} height={height} data={data} margin={margin}>
      <Line type={lineStyle.type} dataKey="value" stroke={lineStyle.strokeColour} />
      <CartesianGrid stroke={gridStyle.stroke} strokeDasharray={gridStyle.strokeDasharray} />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </LineChart>
  );
  ReactDOM.render(renderLineChart, document.getElementById(config.element));
}
```

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#srcvisualization01visualizationjs)

## src/package.json.ejs

Embedded JavaScript Template for visualization package.json.ejs template.

[See instructions](./template-customisation-guide.md#generate-guids) on how to generate package.json.ejs containing a GUID before customising this file.

* Do not alter the id or version properties
* Update visualization package properties

    For example

```JSON
{
  "id": "<Generated GUID>",
  "name": "Line Chart",
  "description": "Example line chart",
  "version": "<%= package.version %>",
```

* Update dependencies - e.g. chart library

  For example

```JSON
{
  "dependencies": {
    "recharts": "./recharts/visualization.js",
    "react": "./react/visualization.js",
    "other": "./other/visualization.js"
  }
}
```

[README](../README.md)

[Template Customisation Guide](./template-customisation-guide.md#srcpackagejsonejs)
