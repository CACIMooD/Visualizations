import { DeepPartial, DeepReadonly } from "utility-types";

/**
 * Type utility for DeepReadonly<DeepPartial<T>>
 */
export declare type ReadonlyOptional<T> = DeepReadonly<DeepPartial<T>>;

//If this file is failing because of global variables you need to
// run generate-types at least once and ensure there are the generic type files
//The global variable may still say they are erroring, if this is the case
// open the vistualization.ts of your project and it should resolve the issues

/**
 * The data that is supplied to the visualisation through the config variable
 *
 * This file uses Global Namespaces to allow easier type referencing inside the
 *  the visualization files so types may not look accurate inside this file
 */
export declare type MooDConfig = {
  version: string;
  element: string;

  width: string;
  height: string;
  overflowX: boolean;
  overflowY: boolean;

  animation: boolean;

  actions: DeepPartial<Vis.Actions>;
  data: DeepPartial<Vis.Data>;
  style: DeepPartial<Vis.Style>;
  outputs: DeepPartial<Vis.Outputs>;
  inputs: DeepPartial<Vis.Inputs>;

  state?: MooDState;

  masterId: string;
  elementURL: string;
  elementIconURL: string;
  iconURL: string;
  id: string;

  functionNames: [
    "errorOccurred",
    "navigate",
    "dataChanged",
    "inputChanged",
    "updateOutput",
    "updateSize",
    "updateState",
    "hasAction",
    "performAction"
  ];
  functions: MooDFunctions;
};
