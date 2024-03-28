import { MooDConfig } from "@moodtypes/index";

/**
 * Ensure that any development undefined variables have default usable values
 * @param config - The config to set up
 * @returns - The config
 */
export const setupDevelopmentConfig = (config: MooDConfig): MooDConfig => {
  // This is only useful during web testing, MooD should populate these
  if (config.functions != null) return config;

  // Setup the default config to have generic values
  config.version = config.version ?? "0.0.0";
  config.animation = config.animation ?? false;
  config.element = config.element ?? "";
  config.elementIconURL = config.elementIconURL ?? "";
  config.elementURL = config.elementURL ?? "";
  config.height = config.height ?? "800px";
  config.width = config.width ?? "800px";
  config.iconURL = config.iconURL ?? "";
  config.id = config.id ?? "";
  config.masterId = config.masterId ?? "";
  config.overflowX = config.overflowX ?? true;
  config.overflowY = config.overflowY ?? true;

  config.functionNames = config.functionNames ?? [
    "errorOccurred",
    "navigate",
    "dataChanged",
    "inputChanged",
    "updateOutput",
    "updateSize",
    "updateState",
    "hasAction",
    "performAction",
  ];

  config.functions = config.functions ?? {
    errorOccurred: () => null,
    navigate: () => null,
    inputChanged: () => null,
    dataChanged: () => null,
    updateOutput: () => null,
    updateSize: () => null,
    updateState: () => null,
    performAction: () => null,
    hasAction: (
      name: keyof Vis.Actions,
      id: string | string[],
      callback: (result: boolean, id: string) => void
    ) =>
      Array.isArray(id)
        ? id.map((id) => callback(true, id))
        : callback(true, id),
  };

  config.style = config.style ?? ({} as Vis.Style);
  config.inputs = config.inputs ?? ({} as Vis.Inputs);
  config.outputs = config.outputs ?? ({} as Vis.Outputs);

  // Sometimes it's easier to pass state as an object rather than stringifying it in development
  //  so we need to parse it to a string to make sure it continues to work like normal
  if (config.state?.editable != null) {
    if (typeof config.state.value != "string")
      config.state.value = JSON.stringify(config.state.value);
  } else {
    config.state = {
      available: config?.state?.available ?? [],
      id: config?.state?.id ?? "",
      editable: config?.state?.editable ?? true,
      scope: config?.state?.scope ?? "",
      value: config?.state?.value ?? "",
    };
  }

  return config;
};
