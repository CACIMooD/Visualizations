# Visualization Configuration Object Parameter

MooD Active Enterprise (MAE) will invoke the JavaScript Visualization entry function and pass it a configuration object containing all the information the visualization should need to render and interact with the rest of Active Enterprise.

[README MooD Active Enterprise (MAE)](../README.md#mood-active-enterprise-mae)

[README](../README.md)

The configuration object contains the following fields:

### element - String 
* The identifier of the HTML element that MAE has created to contain the visualization
### width - String
* The width in pixels, e.g. "800px", allowed for the element created by MAE to contain the visualization
### height - String 
* The height in pixels, e.g. "600px", allowed for the element created by MAE to contain the visualization
### animation - Boolean
* Is the visualization to perform any animation, usually specified as false when a screenshot of the visualization is being made and true when being shown in the web
### data - Object 
   * The data, conforming to the data shape defined by the visualization, for the visualization to render
### style - Object 
* This object conforms to the structure of the `style.JSON` property defined in the `visualization.config.json` file, or will be null if no style is defined in JSON. The default values defined in the visualization configuration can be amended within MooD Business Architect and it is these values that will be passed to the entry function
### inputs - Object 
* This object conforms to the structure of the `inputs` property defined in the `visualization.config.json` file. The content is populated by MooD Business Architect. 
<!-- Not implemented
### state - Object 
   * TODO: Explain
-->
### functions - Object 
* The functions object holds functions used to interact between Active Enterprise and the Visualization and vice versa. The Visualization is expected to override (assign) new functions to those that it wants to react to, all functions have an implementation which should not raise exceptions. 
   ```
   errorOccurred(error: Error): void; 
   dataChanged(data: object): void;  
   inputChanged(name: string; value: any): void; 
   updateOutput(name: string, value: any): void; 
   performAction(name: string, id: string, event: object): void; 
   ```
   * errorOccurred 
      * __Parameter__: the error object
         * Called by Active Enterprise as and when a problem occurs with the visualization, it can also be called by the visualization when it has errors or problems. Can be overridden if the visualization has a particular way of displaying problems
   * dataChanged 
      * __Parameter__: the new data object
         * Called by Active Enterprise if the visualization supports dynamic data (specified in the visualization config) when new data is available. The visualization accepts the data and re-renders itself to represent the new data, though it can do what it likes with the new set of data
         * The visualization must be configured such that it accepts this method of data update for this function to be called, see [dynamicData property](visualization-config-json.md#dynamic-data) 
   * inputChanged 
      * __Parameters__: the name of the input and the value
         * Called by Active Enterprise when an input changes, the visualization is expected to do something with the input which may mean re-rendering or not depending on what the input is for
   * updateOutput
      * __Parameters__: the name of the output and the value
         * Called by the visualization when an output changes passing the name of the output and the value. Active Enterprise will then post this back to the server and inform any panels that affected by the visualization
   * performAction 
      * __Parameters__: the name of the event being responded to, the id of the element and the event that triggered it if available
         * Called by the visualization when a user interacts with it and visualization has defined an action in the visualization.config.json actions property that corresponds with that. The visualization passes the name of the action as defined in its configuration, the id of the row or element that this action is associated with and the event that triggered it, the event is used if the solution builder has configured more than one thing for the web user to choose from for this action so it can position the menu of choices appropriately using the pageX and pageY properties of the event.   
 
[README MooD Active Enterprise (MAE)](../README.md#mood-active-enterprise-mae)

[README](../README.md)
