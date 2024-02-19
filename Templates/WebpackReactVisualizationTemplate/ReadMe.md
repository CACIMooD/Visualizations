# How to use this template

Note that the repository top level [README](../../README.md) has a much more detailed explanation of how to use the templates.

First you'll need to set up Visual Studio Code and Node, see [Development Environment](../../README.md#development-environment)

Next open this file: ```WebpackReactVisualizationTemplate.code-workspace```

Remember to run: ```npm install``` before doing anything else, this will install the relevant node modules.

## The folder structure

- root
  - Files which are used by Node
  - The final visualizations.zip file
  - package.json (containing a list of commands you can use with ```npm run```)
- src
  - visualization01
    - This is where you can edit your custom visualization code
- test
  - A folder where you can add your automated test scaffolding (run using ```npm run test```)
- dist
  - An automatically generated output folder
- node_modules
  - Another automatically generated output folder

## Getting started

Look in the following files for visualization names / descriptions. I'm going to assume you want a single Custom Visualization inside this package.

- src\package.json.no-guid.ejs
- src\visualization01\package.json.no-guid.ejs

> The purpose of these files is to automatically generate a unique ID for the package/visualization.

Now run this command: ```npm run generate-guids```

Which will produce these 2 files:

- src\package.json.ejs
- src\visualization01\package.json.ejs

> The purpose of these files is to automatically increment the version number every time you build

Now you can run: ```npm run build```

Which will produce:

- src\package.json
- src\visualization01\package.json
- visualizations.zip

> These are automatically generated files which you shouldn't manually edit.

You should also choose a preview image by changing ```visualization.png```.

## Editing your custom visualization

You can run: ```npm run start```

This will open your browser showing test-page.html. You can now start modifying the visualization code.
Interesting files:

- visualization.js: This is where your main code lives.
- test-page.js: Hooks the test page in to the main visualization code.
- data.json: This file passes test data in to your test visualization page.
