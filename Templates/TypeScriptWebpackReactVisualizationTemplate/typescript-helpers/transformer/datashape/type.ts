/**
 * Convert a GraphQL type into it's TypeScript equivilent
 * @param line - The line to convert
 */
export function convertTypeLine(line: string): string {
  // Ensure Types are capitalised
  let lineSplit = line.split(" ");
  lineSplit[1] =
    lineSplit[1].charAt(0).toUpperCase() + lineSplit[1].substring(1);

  //
  lineSplit[0] = "interface";

  // If a datashape type extends another then we need to convert this to extend an interface to work in TypeScript
  const implementsIdx = lineSplit.indexOf("implements");
  if (implementsIdx != -1) {
    lineSplit[implementsIdx] = "extends";
    return lineSplit.join(" ");
  }

  return lineSplit.join(" ");
}
