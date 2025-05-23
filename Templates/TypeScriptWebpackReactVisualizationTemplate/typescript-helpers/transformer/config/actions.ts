/// <reference path="../../types/config-types.d.ts" />

import { conformEnumKey, convertToEnumExport } from "./utils";

type ActionSchema = {
  description: string;
  title: string;
};

/**
 * Parse the actions out of a JSON file into TS
 * @param actions - The JSON to convert into TS
 */
export function parseActions(
  actions: Record<string, ActionSchema> | undefined
) {
  if (actions === undefined || Object.keys(actions).length === 0) {
    return [
      [
        "interface ActionsTypes {",
        `[key: string | number | symbol]: never;`,
        "}",
      ],
      ["export enum ActionsEnum {}"],
    ];
  }

  const enumKeyToName = new Map();
  const actionEnumKeys = Object.entries(actions).map(([key, value]) => {
    const enumKey = conformEnumKey(key);

    enumKeyToName.set(enumKey, key);

    return enumKey;
  });

  return [
    ["export interface ActionsTypes {"].concat(
      actionEnumKeys.map((key) => `[ActionsEnum.${key}]: MooDAction,`),
      "}"
    ),
    convertToEnumExport("ActionsEnum", actionEnumKeys, (key) =>
      enumKeyToName.get(key)
    ),
  ];
}
