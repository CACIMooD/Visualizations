const replaceNonAsciiRegex = /[^a-z0-9]/gi;
const replaceDuplicateUnderscoresRegex = /_(?=_+| )/g;
const replaceControlSymbolsRegex = /[[\]!]/g;

/**
 * Convert a Mood GraphQL type to the TypeScript alternative
 * @param datatype - The type to convert
 */
function convertDatatype(datatype: string): string {
  const datatypeLower = datatype.trim().toLowerCase();
  switch (datatypeLower) {
    case "string":
    case "boolean":
      return datatypeLower;
    case "int":
    case "float":
    case "number":
      return "number";
    case "date":
      return "MooDDate";
    case "id":
      return "ID";
    case "shape":
    case "image":
    case "color":
    case "colour":
    case "any":
      return datatypeLower.charAt(0).toUpperCase() + datatypeLower.substring(1);
    default:
      return "Vis.Data." + datatype;
  }
}

/**
 * Convert a GraphQL datatype into it's TypeScript equivilent
 * @param line - The line to convert
 */
export function convertFieldLine(line: string): string {
  // Split the line from where a data field would be and ensure it's valid
  const datatypeSplit = line.split(":").map((part) => part.trim());
  if (datatypeSplit.length != 2) {
    throw new Error(
      `Datashape conversion expected a valid 'property:type' but recieved ${line}`
    );
  }

  // Ensure that the key name in TypeScript complies with the Enum naming scheme
  datatypeSplit[0] = datatypeSplit[0]
    .replace(replaceNonAsciiRegex, "_")
    .replace(replaceDuplicateUnderscoresRegex, "");

  const isRequired = datatypeSplit[1].includes("!");
  const isArray = datatypeSplit[1].includes("[");

  // We have determined if the type is an array or optional above so we can remove those control symbols
  datatypeSplit[1] = datatypeSplit[1].replace(replaceControlSymbolsRegex, "");

  if (!isArray) {
    return `${datatypeSplit[0]}${isRequired ? ":" : "?:"} ${convertDatatype(datatypeSplit[1])}`;
  }

  datatypeSplit[1] = datatypeSplit[1]
    .split("|")
    .map(convertDatatype)
    .join(" | ");

  return `${datatypeSplit[0]}${isRequired ? "?: Array<" : ": Array<"} ${datatypeSplit[1]}>`;
}
