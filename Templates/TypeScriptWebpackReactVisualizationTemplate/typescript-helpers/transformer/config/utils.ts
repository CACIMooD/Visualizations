import JsonToTS from "json-to-ts";

/**
 * Conforms a string to a valid Enum key
 * @param key - The key to conform
 */
export function conformEnumKey(key: string) {
  return key.replace(/[^a-zA-Z0-9]/g, "_").replace(/_(?=_+| )/g, "");
}

/**
 * Parse an object into a key = value enum and return each line in a string array
 * @param enumName - The name to give the enum
 * @param keysToConvert - The Object containing all the key/name pairs
 * @param accessor - (Optional) Callback to return the string value of the enum value
 */
export function convertToEnumExport(
  enumName: string,
  keysToConvert: string[],
  accessor: (value: string) => string
): string[] {
  return [`export enum ${enumName} {`].concat(
    keysToConvert.map((key) => {
      return `${key} = "${accessor(key)}",`;
    }),
    "}"
  );
}

export function convertJSONToTSInterface(
  json: JSON,
  interfaceName: string
): string[] {
  let ts: string[];

  try {
    ts = JsonToTS(json);

    if (ts.length === 0) {
      throw new Error(`${interfaceName} parsed to nothing, returning default`);
    }

    if (ts[0] == "interface RootObject {\n}") {
      throw new Error(
        `${interfaceName} parsed to empty RootObject, returning default`
      );
    }
  } catch {
    // Catch any errors with the styling not existing or being incorrectly formatted
    return [
      `interface ${interfaceName} {`,
      "[key: string | number | symbol]: JSONValue | undefined;",
      "}",
    ];
  }

  // JsonToTS converts any recursive objects into their own interface and returns that as a new single string, so we need to split
  ts = ts.flatMap((i) => i.split("\n"));

  // Overwrite the RootObject interface that JsonToTS produces with our requested interface
  ts[0] = `interface ${interfaceName} {`;

  // As these TS interfaces are used allowed to store any valid value, we need to add that in here
  ts.splice(1, 0, "[key: string | number | symbol]: JSONValue | undefined;");

  return ts;
}

/**
 * Convert any TypeScript into a custom namespace for the visualization
 * @param input - The TypeScript that needs to be converted to a namespace
 * @param namespace - The namespace to be converted to
 * @param namespaceIsType - Controls if "type" or "interface" is used within the namespace
 */
export function convertToNamespace(
  input: string[] | undefined,
  namespace?: string,
  namespaceIsType: boolean = false
): string[] {
  if (namespace !== undefined) {
    return [
      `declare namespace Vis {`,
      `${namespaceIsType ? "type" : "interface"} ${namespace} ${
        namespaceIsType ? "= " : ""
      }{`,
    ].concat(...(input ?? []), "}");
  }

  return [`declare namespace Vis {`].concat(...(input ?? []), "}");
}

/**
 * Convert any TypeScript into a global scope
 * @param input - The parsed TypeScript that needs to be converted to a namespace
 */
export function convertToGlobal(input: string[] | undefined): string[] {
  const inputWithoutDeclare =
    input?.map((line) => {
      return line.replace(/^\s*?declare/gi, "");
    }) ?? [];

  return [`declare global {`].concat(...inputWithoutDeclare, "}");
}
