import { getVisualizationConfig } from "@helpers/config";
import { ConfigContext } from "@helpers/context/configContext";
import { useContext, useState, useEffect } from "react";

export enum WindowNavigationType {
  SAME_WINDOW = "",
  NEW_BROWSER = "<new window>",
  NEW_TAB = "<new tab>",
}

/**
 * Function that sends an navigation request to MooD
 * @param navigationType - The type of navigation to perform
 * @param elementIds - The element to navigate to, will select the first if array
 * @param modelMaster - An optional model master Id to apply
 */
export type NavigatFunctionType = (
  navigationType: WindowNavigationType | string,
  elementIds: string | string[],
  modelMaster?: string
) => void;

/**
 * Hook that sends an navigation request to MooD
 * @returns - A method that will send an navigation request to MooD
 */
export function useNavigate(): NavigatFunctionType;

/**
 * Function that sends an navigation request to MooD
 * @param navigationType - The type of navigation to perform
 * @param elementIds - The element to navigate to, will select the first if array
 * @param modelMaster - An optional model master Id to apply
 */
export function useNavigate(
  navigationType: WindowNavigationType,
  elementIds: string | string[],
  modelMaster?: string
): void;

/**
 * Hook that sends an navigation request to MooD
 * @param navigationType - The unique id to use for the window
 * @param elementIds - The element to navigate to, will select the first if array
 * @param modelMaster - An optional model master Id to apply
 */
export function useNavigate(
  navigationType: string,
  elementIds: string | string[],
  modelMaster?: string
): void;

/**
 * Hook that sends an navigation request to MooD
 */
export function useNavigate(
  navigationType?: WindowNavigationType | string,
  elementIds?: string | string[],
  modelMaster?: string
): any {
  // If we provide the parameters with useNavigate then we can just skip straight to calling navigate
  if (elementIds != null) {
    getVisualizationConfig().functions.navigate(
      navigationType ?? "",
      elementIds,
      {
        method: "navigate",
        name: "",
        title: "",
        master: modelMaster,
      }
    );
    return;
  }

  const config = useContext(ConfigContext);
  const [navigationFunction, setNavigationFunction] =
    useState<NavigatFunctionType>(
      () =>
        (
          navigationType: WindowNavigationType,
          elementIds: string | string[],
          modelMaster?: string
        ) =>
          config.functions.navigate(navigationType, elementIds, {
            method: "navigate",
            name: "",
            title: "",
            master: modelMaster,
          })
    );

  useEffect(() => {
    setNavigationFunction(
      () =>
        (
          navigationType: WindowNavigationType,
          elementIds: string | string[],
          modelMaster?: string
        ) =>
          config.functions.navigate(navigationType, elementIds, {
            method: "navigate",
            name: "",
            title: "",
            master: modelMaster,
          })
    );
  }, [config]);

  return navigationFunction;
}
