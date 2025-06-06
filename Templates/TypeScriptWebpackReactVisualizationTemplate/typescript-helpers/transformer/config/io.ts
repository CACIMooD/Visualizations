/// <reference path="../../types/data-types.d.ts" />

import { conformEnumKey, convertToEnumExport } from "./utils";

type IOSchema = {
  name: string;
  displayName: string;
  type: string;
  default: Any;
};

/**
 * Parse the inputs and outputs out of a JSON file into TS
 * @param json - THe JSON to convert to TS
 * @param interfaceName - The name of the TS interface to put the results under
 */
export function parseIO(
  json: IOSchema[] | undefined,
  interfaceName: string
): string[][] {
  if (json === undefined || json.length == 0) {
    return [
      [
        `export interface ${interfaceName}Types {`,
        "[key: string | number | symbol]: never;",
        "}",
      ],
      [`export enum ${interfaceName}Enum {}`],
    ];
  }

  const enumKeyToName = new Map();

  // Parse the JSON value into an TS Enum key
  const valueEnumKeys: string[] = json.map((value) => {
    const enumKey = conformEnumKey(value.name);

    enumKeyToName.set(enumKey, value.name);

    return enumKey;
  });

  // Convert an IOSchema array into an array of TS Enum values
  return [
    [`export interface ${interfaceName}Types {`].concat(
      json.map(
        (value, index) =>
          handleIOSchemaConversion({
            ...value,
            name: `[${interfaceName}Enum.${valueEnumKeys[index]}]`,
          }) + (index === json.length ? "" : ";")
      ),
      "}"
    ),
    convertToEnumExport(`${interfaceName}Enum`, valueEnumKeys, (key) =>
      enumKeyToName.get(key)
    ),
  ];
}

/**
 * Convert a MooD Input/Output into a TypeScript result
 * @param value - The IO value
 */
function handleIOSchemaConversion(value: IOSchema) {
  // Custom TypeScript types produced from Schema specifically use a Capital at the start
  let valueType = "";

  switch (value.type.toLowerCase()) {
    case "string":
      valueType = "string";
      break;
    case "boolean":
      valueType = "boolean";
      break;
    case "int":
    case "float":
    case "number":
      valueType = "number";
      break;
    case "date":
      valueType = "MooDDate";
      break;
    case "elements":
      valueType = "Elements";
      break;
    case "image":
      valueType = "Image";
      break;
    case "shape":
    case "color":
    case "colour":
      valueType = "SinglePickList | MultiPickList";
      break;
    default:
      valueType =
        value.type.charAt(0).toUpperCase() +
        value.type.toLowerCase().substring(1);
  }

  return `${value.name}: ${valueType}`;
}
