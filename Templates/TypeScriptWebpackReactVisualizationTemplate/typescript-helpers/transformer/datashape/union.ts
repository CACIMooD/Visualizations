const baseTypeCheckRegex = /String|Boolean|Number/gi;
const unionRegex = /union/;

/**
 * Convert a GraphQL union into it's TypeScript equivilent
 * @param line - The line to convert
 */
export function convertUnionLine(line: string): string {
  // Split the line from where the types of the union would be and ensure it's valid
  const unionSplit = line.split("=");
  if (unionSplit.length != 2) {
    throw new Error(
      `Datashape conversion expected a union but recieved ${line}`
    );
  }

  // Convert the union type into the TypeScript equivilent
  const outputUnion = unionSplit[1].split("|").map((unionType) => {
    // If the datashape type is a String/Boolean/Number then conver to the lowecase version
    baseTypeCheckRegex.lastIndex = -1;
    if (baseTypeCheckRegex.test(unionType)) {
      return unionType.toLowerCase();
    }

    // MooD Date and JS Date share same type name so convert it if found
    return unionType.trim().replace(/Date/gi, "MooDDate");
  });

  return `${unionSplit[0].replace(unionRegex, "type")} = ${outputUnion.join(" | ")}`;
}
