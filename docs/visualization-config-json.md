# Contents of visualization.config.json

The configuration of a visualization.

[README Visualization Package Contents](../README.md#visualization-package-contents)

[README](../README.md)

* __Property__: id
  * This is the globally unique identifier (GUID) for this visualization.  It enables the use of the same name of a visualization without causing conflicts and uniquely identifies a visualization for use when upgrading or trying to find where it has been used within the MooD application
  * The visualization template includes a script to generate a GUID for your visualization
* __Property__: name
  * The name for this specific visualization. If not specified, the package.json name will be used
* __Property__: description
  * The description for this specific visualization. If not specified, the package.json description will be used
  * The description is displayed in the information section of the flip-side of the visualization
* __Property__: version
  * The version of this specific visualization, if not specified, the package.json version should be used
* __Property__: dependencies
  * A list of dependencies that this visualization requires or contains. Dependencies listed in the package json file are automatically added to this list.
  * It is possible to include dependencies that are shipped with MooD. Dependencies listed by version will be checked against MooD dependencies and included if available. Available dependencies include Apache ECharts, jQuery and jQueryUI.
  * __Note__ - built in MooD dependencies are subject to change in future versions of MooD

    ```JavaScript
    dependencies: { 
        jQuery: "2.2.3",
        common: "../common.js" 
    }
    ```

* __Property__: supportedVersions
  * This optional property tells the MooD application what previous versions of this visualization supports (upgrades from).  It would only support previous versions if it could take the configuration and data in the shape provided and transform it (within itself) into the right shape for the newer version
  * The property specifies a root version and all versions from that root are suitable for upgrading. For instance "1.1" means all versions "1.1.0", "1.1.1" etc can be upgraded
  * An example where a new version cannot be upgraded is where a new field is added to the data shape that can't be calculated by the new version
  * Thus, for a non-breaking change, older "supported" versions of the visualization are updated to the new version. Older non-supported versions remain as they were, so you can end up with multiple versions of the visualization in the MooD repository
  * When MooD BA upgrades older supported versions to a new version that involves a change to the data shape, some of the wiring ("pins") may be lost. Thus, when importing a new version you should check existing uses of the visualisation in case they need to be re-pinned
  * This entry being blank or not existing means that there are no previous supported versions and no upgrades will take place. However, if there is a value defined for the supportedVersions property in `package.json`, then that will be used instead

    ```JavaScript
    supportedVersions: "0.1"
    ```

* __Property__: moodVersion
  * This would be the MooD version that this package was built against and would be an indication of the version of MooD Business Architect that this visualization was created for.  This is useful for users of the visualization to know what the minimum version of MooD is that this visualization supports (even though the visualization would likely be supported in previous versions)
<a id="dynamic-data"></a> <!-- markdownlint-disable-line MD033 -->
* __Property__: dynamicData
  * Indicates if the visualization supports data being posted to it to update itself or does it need to be completely re-rendered. The value is either true or false and if true data after the initial load will be passed to the visualization using the dataChanged(data) function. See [JavaScript Configuration Object -> Functions Object](visualization-configuration-object.md#functions-object)
<a id="can-overflow"></a> <!-- markdownlint-disable-line MD033 -->
* __Property__: canOverflow (Introduced in Customer Release 6)
  * Indicates that when rendered, the visualization may exceed the bounds of the panel and wishes to increase the size of the panel and page to fully accommodate it. The visualization needs to call [updateSize function](visualization-configuration-object.md#update-size) to effect the resizing. The value is either true or false.
* __Property__: entry - Object
  * Defines the location of the visualization entry function within the package
  * __Field__: file
    * This is the Uri of the file containing the entry function and is the file that will be included in the rendered ASPX page
  * __Field__: function
    * The name of the function to call to instantiate and return the visualization class
* __Property__: style - Object
  * This optional property requires an object which should contain one or more of the following sub-properties (both are optional)
  * __Field__: JSON
    * A JSON object that is modelled by the visualization developer and contains default values for all style values. The values can be edited in Business Architect
  * __Field__: URL
    * A relative path to a location within the package to a template CSS document injected into the page when rendering. The CSS document can be edited in Business Architect. It is the responsibility of the visualization developer to provide a specificity for these styles to ensure that they only affect this visualization
  * Example

```JavaScript
    style: { 
        URL: "visualization01/visualization.css", 
        JSON: { 
            XAxis: { 
                label: "X Axis",
                minimum: 0, 
                maximum: 100 
            }, 
            YAxis { 
                label: "Y Axis", 
                minimum: 0, 
                maximum: 100 
            } 
        } 
    }
```

* __Property__: actions
  * This is a mapped object where each sub-property is an action.  Each action can have one or more of the following sub-properties:
  * description: This is optional and is a brief but useful description of where this action may be triggered and by what user action
  * title: This is optional and is the title of the action to be displayed on the menu (if a menu is required) when the user interacts with the visualization in some way
  * info: This is some more information to be displayed on the menu under the title
  * Example

    ```JavaScript
    actions: { 
        "Line clicked": { 
            description: "A line in the graph representing a row of data has been clicked", 
            title: "Line", 
            info: "The plot line" 
        }, 
        "Legend clicked": { 
            description: "A segment in the legend representing a row of data has been clicked", 
            title: "Legend",
        }, 
        "Background clicked": null 
    } 
    ```

<!-- Not implemented
 * __Property__: state
    * Initial state object that can be edited in Business Architect
    * The state should simply be a JSON schema structure such as
    ```
    state: { 
        selected: <number>, 
        rowsPerPage: <number> 
        } 
    ```  
    * It is important that the property names are descriptive as comments are not allowed in valid JSON files.
-->

* __Property__: supportedBrowsers
  * This is an optional property that would specify the browsers that this visualization supports and is displayed to the user when they select this visualization in Business Architect so that they are aware what browsers this visualization will work in.
* __Property__: inputs
  * This is the name for the fields that can be provided in the configuration as additional input fields that can be populated by other components, that is panels like Text Editors, or visualizations like a Network Graph on a MooD Model.
* __Property__: outputs
  * This is the name for the fields that can be used when connecting to other components and can be set within the visualization code itself when the user clicks on an area of the visualization for example. This is defined in the same way as the inputs property.
* __Inputs and Outputs Structure__
  * The inputs and outputs are arrays of objects where each object defines an input or output, the object definition is:

    ```JSON
    [{ 
        "name": "<input or output name>", 
        "displayName": "<optional display name in the UI if different from the name>", 
        "type": "String | Boolean | Date | Number | Elements | Colour | Image | Shape", 
         "default": "<Optional default value of appropriate type>"
    }] 
    ```

  * Values for the "elements" type may be a single element unique id string, a comma separated list of unique ids or an array of unique ids representing the element instances, for example:
    * "11-786A4991EA7B11D1B4840020AFC894E9"
    * "11-786A4991EA7B11D1B4840020AFC894E9,11-61584573965A40098FB32458E02736DF" or
    * ["11-786A4991EA7B11D1B4840020AFC894E9", "11-61584573965A40098FB32458E02736DF"]
  * For colour and shape types the value is determined using a pick selected by the user when configuring the visualization, that is if the visualization outputs a colour it will be mapped to a pick item from the pick type with that colour and the pick item will be used as the output in MooD, and vice versa a pick input variable will be given for any colour or shape defined input
  * For image types an input to the visualization of this type will be given a URL to the image, and vice versa for an image output MooD expects the URL as the value
  * Example - replace `"inputs"` with `"outputs"` if required as they share the same structure:

    ```JSON
    {
    ...
    "inputs": [ 
        { 
            "name": "xaxisminimum", 
            "displayName": "X Axis Minimum", 
            "type": "Number", 
            "default": 0 
        }, 
        { 
            "name": "xaxismaximum", 
            "displayName": "X Axis Maximum",
            "type": "Number",
            "default": 100 
        } 
    ]
    ... 
    }
    ```

* __Property__: state - string or Object (Introduced in Customer Release 6)
  * This is the name for the content passed to the visualization and which if set to editable the visualization can update and save back to the repository. The intention of state is to allow a visualization to store user configured changes to layout, appearance or behaviour from the web to be persisted if the solution builder using the visualization has allowed it to do so.

[README Visualization Package Contents](../README.md#visualization-package-contents)

[README](../README.md)
