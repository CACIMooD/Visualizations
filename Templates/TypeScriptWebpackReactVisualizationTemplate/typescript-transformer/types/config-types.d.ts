//If this file is failing because of global variables you need to
// run generate-types at least once and ensure there are the generic type files
//The global variable may still say they are erroring, if this is the case
// open the vistualization.ts of your project and it should resolve the issues

/**
 * This file contains all of the global types used within MooDConfig but inside
 *  a .d.ts file as we don't need to use any TS utility-types on these which requires .ts
 */

/**
 * Convert an input/output to their base types without any branding
 */
type MooDOutputRawType<
  TIOType,
  TIOKey extends keyof TIOType
> = TIOType[TIOKey] extends SinglePickList | MultiPickList
  ? string | undefined
  : TIOType[TIOKey] extends Elements
  ? string | string[] | undefined
  : TIOType[TIOKey] | undefined;

/**
 * All valid types inside a JSON value
 */
type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>
  | {}; //This is due to template poor handling of JsonToTS conversion;

/**
 * The MooD config state variable
 *
 * @member value - a JSON formatted string
 */
type MooDState = {
  available: string[];
  id: string;

  editable: boolean;
  scope: string;

  value: string;
};

/**
 * The MooD config actions variable
 */
type MooDAction = {
  title: string;
  description: boolean;
  actions: (
    | MooDNavigateAction
    | MooDInputChangedAction
    | MoodOutputChangedAction
  )[];
};

/**
 * An interface for the base of all MooD actions
 */
interface MooDActionBase {
  method: string;
  title: string;
  name: string;
  iconImage?: string;
}

/**
 * An interface for the any MooD navigation actions
 */
interface MooDNavigateAction extends MooDActionBase {
  master: string;
}

/**
 * An interface for the any actions that listen to an input being changed
 */
interface MooDInputChangedAction extends MooDActionBase {}

/**
 * An interface for the any actions that update MooD with a new output
 */
interface MoodOutputChangedAction extends MooDActionBase {}

/**
 * The functions object holds functions used to interact between Active Enterprise and the Visualization and vice versa.
 *
 * The Visualization is expected to override (assign) new functions to those that it wants to react to, all functions have an implementation which should not raise exceptions.
 */
type MooDFunctions = {
  errorOccurred: (error: String) => void;

  navigate: (
    windowId: string,
    elementIds: string | string[],
    action: {
      method: "navigate";
      name: string;
      title: string;
      master?: string;
    }
  ) => void;

  dataChanged: (data: Vis.Data) => void;

  inputChanged: <TInputKey extends keyof Vis.Inputs>(
    name: TInputKey,
    value: Vis.Inputs[TInputKey] | undefined
  ) => void;

  updateOutput: <TOutputKey extends keyof Vis.Outputs>(
    name: TOutputKey,
    value: MooDOutputRawType<Vis.Outputs, TOutputKey>
  ) => void;

  updateSize: (width: number, height: number) => void;

  updateState: (state: string) => void;

  performAction: (
    name: keyof Vis.Actions,
    elementIds: string,
    event: object
  ) => void;

  hasAction: (
    name: keyof Vis.Actions,
    elementIds: string | string[],
    callback: (result: boolean, id: string) => void
  ) => void;
};
