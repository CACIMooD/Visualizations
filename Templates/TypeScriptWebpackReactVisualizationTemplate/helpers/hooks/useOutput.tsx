import { useContext, useEffect, useState } from "react";
import { ConfigContext } from "@helpers/context/configContext";
import { getVisualizationOutputs } from "@helpers/config";

// The following import may fail if a user has not
//  built the custom visualization at least once so we ignore it
//@ts-ignore
import visualizationConfig from "@core/visualization.config.json";

export const updateOutputEventKey = "mood-update-output";
export type updateOutputEvent = CustomEvent<{
  key: keyof Vis.Outputs;
}>;

/**
 * Because we are creating a new custom event for useOutput we need to update TS's
 *  accepted event types to allow us to execute/listen-to the new event
 */
declare global {
  interface WindowEventMap {
    [updateOutputEventKey]: updateOutputEvent;
  }
}

export function useOutput<TOutput extends keyof Vis.Outputs>(
  output: TOutput
): [
  setOutput: (value: MooDOutputRawType<Vis.Outputs, TOutput>) => void,
  value: Vis.Outputs[TOutput] extends SinglePickList | MultiPickList | Elements
    ? Readonly<string[]>
    : undefined | Readonly<Vis.Outputs[TOutput]>
] {
  const config = useContext(ConfigContext);
  const [value, setValue] = useState<Vis.Outputs[TOutput] | undefined>(
    getVisualizationOutputs()?.[output]
  );

  useEffect(() => {
    const updateSetValue = (event: updateOutputEvent) => {
      if (event.detail.key != output) return;
      setValue(getVisualizationOutputs()?.[event.detail.key]);
    };
    document.addEventListener(updateOutputEventKey, updateSetValue);
    return () => {
      document.removeEventListener(updateOutputEventKey, updateSetValue);
    };
  }, [config]);

  function updateOutput(value: MooDOutputRawType<Vis.Outputs, TOutput>) {
    config.functions.updateOutput(output, value);
  }

  const outputConfigType =
    visualizationConfig.outputs.length == 0
      ? ""
      : (
          visualizationConfig.outputs as {
            name: keyof Vis.Outputs;
            type: string;
          }[]
        )
          .find((outputConfig) => outputConfig.name == output)
          ?.type.toLowerCase() ?? "";

  // If the input type is one of a potential array then we convert it to always be an array
  if (
    outputConfigType === "colour" ||
    outputConfigType === "color" ||
    outputConfigType === "shape" ||
    outputConfigType === "elements"
  ) {
    // elements can be provided as an array by default so we don't need to convert it
    if (Array.isArray(value)) return [updateOutput, value as any];
    return [
      updateOutput,
      Object.freeze(
        ((value as string) ?? "")
          .split(",")
          .filter((val: string) => val != "") as any
      ),
    ];
  }

  return [updateOutput, value as any];
}
