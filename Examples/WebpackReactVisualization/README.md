# Webpack React Example

Line Chart visualization

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

This example React chart wraps the [Recharts library example Line Chart](http://recharts.org/en-US/guide/getting-started) so that it can be used in MooD.

[Table of Contents](#table-of-contents)

## Data Summary

The Line Chart visualisation consumes a single data set. The details of the attributes of the data set is provided in the section Data Details section

1. __Rows__
    * A list of name value pairs to plot

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
* __line__: defines the style of the line
  * __type__: line interpolation type; one of 'basis', 'basisClosed', 'basisOpen', 'linear', 'linearClosed', 'natural', 'monotoneX', 'monotoneY', 'monotone', 'step', 'stepBefore', 'stepAfter'
  * __strokeColour__: colour of the line
* __CartesianGrid__: defines the style of the grid
  * __stroke__: colour of grid lines
  * __strokeDasharray__: defines dash spacing on grid lines

[Table of Contents](#table-of-contents)

## Inputs

The visualization has no inputs.

[Table of Contents](#table-of-contents)

## Outputs

The visualization has no outputs.

[Table of Contents](#table-of-contents)

## Actions

The visualization has no actions.

[Table of Contents](#table-of-contents)

## Data Details

1. __Rows__ – zero or more elements
    * __Name__: the name of a point to draw on the line
    * __Value__: the numeric value (height) of the point to draw on the line

[Table of Contents](#table-of-contents)

[README](../../README.md)
