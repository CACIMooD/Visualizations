import { useContext, useEffect, useState } from "react";
import { ConfigContext } from "@helpers/context/configContext";
import { getVisualizationInputs } from "@helpers/config";

// The following import may fail if a user has not
//  built the custom visualization at least once so we ignore it
//@ts-ignore
import visualizationConfig from "@core/visualization.config.json";

export const updateInputEventKey = "mood-update-input";
export type updateInputEvent = CustomEvent<{
  key: keyof Vis.Inputs;
}>;

/**
 * Because we are creating a new custom event for useInput we need to update TS's
 *  accepted event types to allow us to execute/listen-to the new event
 */
declare global {
  interface WindowEventMap {
    [updateInputEventKey]: updateInputEvent;
  }
}

/**
 * Hooks into the custom visualization inputs and listens to updates
 * @param input - The key for the input requested
 * @param debounce - How long the input needs to be unchanged before the hook registers the update
 * @returns - The input hook
 */
export function useInput<TInput extends keyof Vis.Inputs>(
  input: TInput,
  debounce?: number
): Vis.Inputs[TInput] extends SinglePickList | MultiPickList | Elements
  ? Readonly<string[]>
  : undefined | Readonly<Partial<Vis.Inputs[TInput]>> {
  const config = useContext(ConfigContext);
  const [value, setValue] = useState<Vis.Inputs[TInput]>(
    getVisualizationInputs()?.[input]
  );

  useEffect(() => {
    let debounceTimeout: number | undefined;
    const updateSetValue = (event: updateInputEvent) => {
      if (event.detail.key != input) return;
      debounceTimeout = setTimeout(() => {
        setValue(getVisualizationInputs()?.[event.detail.key] as any);
      }, debounce);
    };
    document.addEventListener(updateInputEventKey, updateSetValue);
    return () => {
      document.removeEventListener(updateInputEventKey, updateSetValue);
      clearTimeout(debounceTimeout);
    };
  }, [config]);

  const inputConfigType =
    visualizationConfig.inputs.length == 0
      ? ""
      : (
          visualizationConfig.inputs as {
            name: keyof Vis.Inputs;
            type: string;
          }[]
        )
          .find((inputConfig) => inputConfig.name == input)
          ?.type.toLowerCase() ?? "";

  // If the input type is one of a potential array then we convert it to always be an array
  if (
    inputConfigType === "colour" ||
    inputConfigType === "color" ||
    inputConfigType === "shape" ||
    inputConfigType === "elements"
  ) {
    // elements can be provided as an array by default so we don't need to convert it
    if (Array.isArray(value)) return value as any;
    return Object.freeze(
      ((value as string) ?? "")
        .split(",")
        .filter((val: string) => val != "") as any
    );
  }

  return value as any;
}
