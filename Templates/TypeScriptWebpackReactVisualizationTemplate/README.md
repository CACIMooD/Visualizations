# How to use this template

Note that the repository top level [README](../../README.md) has a much more detailed explanation of how to use the templates.

First you'll need to set up Visual Studio Code and Node, see [Development Environment](../../README.md#development-environment)

Next open this file: ```TypeScriptWebpackReactVisualizationTemplate.code-workspace```

Remember to run: ```npm install``` before doing anything else, this will install the relevant node modules.

## The folder structure

- root
  - Files which are used by Node
  - The final visualizations.zip file
  - package.json (containing a list of commands you can use with ```npm run```)
- helpers
  - Files that are already set up to be passed to each visualization
    - Context stores React context files that can be useful anywhere
    - Hooks stores Reacts hooks files that allow reading/writing data to/from MooD
- typescript-transformer
  - Files that are used in the process of transforming the configuration files into TypeScript
- src
  - visualization01
    - This is where you can edit your custom visualization code
    - \_\_tests__
      - A folder where you can add your automated test scaffolding (run using ```npm run test```)
    - src
      - This is where you can add any code to not clutter your root visualization01 level
      - types
        - An automatically generated folder that contains all of the parsed types from your visualization
- test
  - A folder where you can add your test data to run the visuailzation in development mode in a browser (run using ```npm run start```)
- dist
  - An automatically generated output folder
- node_modules
  - Another automatically generated output folder

## Getting started

Look in the following files for visualization names / descriptions. I'm going to assume you want a single Custom Visualization inside this package.

- src\package.json.no-guid.ejs
- src\visualization01\no-guid.visualization.config.json.ejs

> The purpose of these files is to automatically generate a unique ID for the package/visualization.

Now run this command: ```npm run generate-guids```

Which will produce these 2 files:

- src\package.json.ejs
- src\visualization01\visualization.config.json.ejs

> The purpose of these files is to automatically increment the version number every time you build

Next run this command: ```npm run generate-types```

Which will produce these 6 files under each visualization

- src\types\actions.ts
- src\types\data.d.ts
- src\types\inputs.ts
- src\types\outputs.ts
- src\types\state.d.ts
- src\types\style.d.ts

> The purpose of these files is to automatically add TypeScript types to your configurations

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

- app.tsx: This is where your main code lives.
- test-page.js: Hooks the test page in to the main visualization code.
- data.json: This file passes test data in to your test visualization page.
