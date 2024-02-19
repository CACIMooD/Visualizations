# Webpack D3 Example

Basic Scatter plot visualization

[README](../../README.md)

## Table of Contents

* [Purpose](#purpose)
* [Data Summary](#data-summary)
* [Style](#style)
  * [CSS](#css)
  * [Properties (JSON)](#properties-json)
* [Inputs](#inputs)
* [Outputs](#outputs)
* [Actions](#actions)
* [Data Details](#data-details)

## Purpose

This example D3 chart wraps the [basic scatterplot](https://d3-graph-gallery.com/graph/scatter_basic.html) so that it can be used in MooD.

[Table of Contents](#table-of-contents)

## Data Summary

The Scatter Plot visualisation consumes a single data set. The details of the attributes of the data set is provided in the section Data Details section

1. __Rows__
    * A list of coordinates of items to plot

[Table of Contents](#table-of-contents)

## Style

The style of the visualization is controlled by CSS and a collection of properties.

### CSS

A Cascading Style Sheet (CSS) is defined containing selectors for the following HTML elements in the rendered diagram. The CSS is editable within MooD BA, allowing control of the visual styling of the diagram:

* Background colour

[Table of Contents](#table-of-contents)

### Properties (JSON)

The properties are:

* __margin__: defines the size of a margin around the edge of the chart
  * __top__: size of margin across the top in pixels. __Default 20__
  * __bottom__: size of margin across the bottom in pixels. __Default 20__
  * __left__: size of margin across the left-hand side in pixels. __Default 20__
  * __right__: size of margin across the right-hand side in pixels. __Default 20__
* __xAxisLabel__: the label displayed for the X Axis
* __yAxisLabel__: the label displayed for the Y Axis
* __spotRadius__: the radius in pixels of the circles in the scatter plot. __Default 1.5__
* __fillColour__: the colour of the circles in the scatter plot. __Default #69b3a2__

[Table of Contents](#table-of-contents)

## Inputs

The visualization has some inputs to demonstrate using inputs to control or affect the visualization.

1. __xAxisMin__: a numeric value that defines the minimum value in the horizontal domain. __Default 0.0__
1. __xAxisMax__: a numeric value that defines the maximum value in the horizontal domain. __Default 10.0__
1. __yAxisMin__: a numeric value that defines the minimum value in the vertical domain. __Default 0.0__
1. __yAxisMax__: a numeric value that defines the maximum value in the vertical domain. __Default 10.0__

[Table of Contents](#table-of-contents)

## Outputs

The visualization has no outputs.

[Table of Contents](#table-of-contents)

## Actions

The visualization has no actions.

[Table of Contents](#table-of-contents)

## Data Details

1. __Rows__ – zero or more elements
    * __X__: the X coordinate of the point
    * __Y__: the Y coordinate of the point

[Table of Contents](#table-of-contents)

[README](../../README.md)
