# Mood - Tabulator Data Grid Component

## Description

A solution for Mood to provide an improved, accessible and user friendly DataGrid component so that anyone can consume and interact with Tabulator data from Mood on the web using keyboard functionality and/or Assistive Technology.

## Tabulator User Guide

For user guidance, see [Tabulator Guide](./UserGuide.md)

## File Structure

- root
  - Files which are used by Node
  - The final `tabulator.zip` file
  - package.json (containing a list of commands you can use with `npm run`)
- src
  - visualization
    - __tests__
      - A folder where you can add automated unit tests
    - visualization.js
      - This is where the tabulator is initialize
    - app.js
      - This is where you can edit your tabulator code
    - style.css
      - You can customize the stylesheet that change how tabulator will look
  - formatters
    - TabulatorEditors.js
      - This is where you can override the column's editor depending on the chosen formatter
    - TabulatorFormatters.js
      - This is where you can add or edit custom pre-built formatters
  - themes
    - TabulatorThemes.js
      - This is where you can add or edit custom pre-built themes for the tabulator
- demo
  - A folder containing a demo of the tabulator using fixed data that you can run on localhost
- dist
  - An automatically generated output folder
- node_modules
  - Another automatically generated output folder

## Installation

### Prerequisites

Node version 20.17.0 or later.

### Suggested Development Tools

VS Code v1.89.1 or later.\
Prettier VS Code Extension v10.4.0 or later.\
ESLint VS Code Extension v2.4.4 or later.

## Getting Started

1. Set up Visual Studio Code and Node, see [Development Environment](../../README.md#development-environment)
2. Open this file: ```WebpackVisualization.code-workspace```
3. Run `npm install` to install the relevant node modules

## How To Use

- src\package.json.ejs
- src\visualizer\package.json.ejs

> The purpose of these files is to automatically increment the version number every time you build

1. Run `npm run build`

Which will produce:

- src\package.json
- src\visualizer\package.json
- tabulator.zip

> These are automatically generated files which you shouldn't manually edit.

You can now import the `tabulator.zip` file in to Mood.

You should also choose a preview image by changing ```visualization.png```.

## Tabulator Demo

Run `npm run start` to run the demo-visualization on [http://localhost:8080/](http://localhost:8080/). This will open your browser showing template.html.

The demo visualization page will reload when you make changes to the main visualization code.

Interesting files:

- TabulatorApp.js: This is where your main code lives.
- TabulatorDemo.js: Hooks the template page in to the main visualization code.
- sample-data.json: This file passes fixed test data in to your tabulator demo page.

## Test Strategy

### Testing that is currently implemented

- Jest for unit testing

### Coding Structure

Tests are grouped in describe blocks based on either functionality that they share or a component they are testing.

### How to run these tests

#### Unit Tests

1. Run `npm run test .` to run all unit tests
2. Run `npm run test -- --coverage .` for the coverage of all tests

### Test Pass Rates

> visualizer, 2/2 tests pass (100% pass rate)

### Average Line Coverage

> visualizer has an average line coverage of 00.00% of all files
