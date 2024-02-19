# What is this template?

This template is a very simple one. You are advised to open it in Visual Studio Code via ```Visualization.code-workspace```.

It doesn't use Node / NPM and requires a few manual steps as you code for it.

Initially:

- Edit ```package.json``` to include a new GUID for the package (from e.g. <https://guidgenerator.com/>).
- Edit ```code\visualization.config.json``` to include a different GUID for the visualization.
- Choose an icon by changing ```code\visualization.png```.

Each build:

- Edit ```code\visualization.config.json``` to increment the version.
- Run ```build.bat``` to produce the ```visualizations.zip``` file which can be added to Business Architect.

## Testing the visualization

You can open ```test-page.htm``` to test your visualization and change the data using ```test-data.js```.
