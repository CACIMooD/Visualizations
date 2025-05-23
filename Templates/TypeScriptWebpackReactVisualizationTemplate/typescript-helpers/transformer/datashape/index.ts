import { dirname, join } from "path";
import { readVisualizationFiles } from "../../read-visualization-files";
import { writeFile } from "../write-file";
import { convertFieldLine } from "./field";
import { convertTypeLine } from "./type";
import { convertUnionLine } from "./union";

const removeAtSymbolRegex = /@.*$/;
const replaceWhitespacesRegex = /\s+/g;

const testLineIsNotEmptyRegex = /\S/;

const testLineIsTypeRegex = /^type/;
const testLineIsUnionRegex = /^union/;
const testLineIsScalarRegex = /^scalar/;

readVisualizationFiles("*.datashape.gql", (path, data): void => {
  const output: string[] = [];

  data
    .toString()
    .split("\n")
    .forEach((line: string) => {
      if (!testLineIsNotEmptyRegex.test(line)) {
        return;
      }

      /**
       * GraphQL lines may have extra data after an @ that Mood intereacts with,
       *  we can remove anything past an @ because it doesn't matter for TypeScript
       *
       * Then we can trim the line and replace any duplicate/tab whitespaces into single spaces
       */
      const lineTrimmed = line
        .trim()
        .replace(removeAtSymbolRegex, "")
        .trim()
        .replace(replaceWhitespacesRegex, " ");

      // If the line is blank or a datatype ending, we can return early
      if (lineTrimmed === "}" || lineTrimmed === "{") {
        return output.push(lineTrimmed);
      }

      // If we have not parsed the initial data yet, we should assume the next line is data
      if (output.length === 0) {
        if (!testLineIsTypeRegex.test(lineTrimmed)) {
          throw new Error(
            "Datashape transformer expected 'type data {' on the first line."
          );
        }

        if (lineTrimmed.includes("{")) {
          return output.push("interface Data {");
        }

        return output.push("interface Data");
      }

      if (testLineIsTypeRegex.test(lineTrimmed)) {
        return output.push(convertTypeLine(lineTrimmed));
      }

      if (testLineIsUnionRegex.test(lineTrimmed)) {
        return output.push(convertUnionLine(lineTrimmed));
      }

      // Scalars are GraphQL custom data types, so we can use them directly as 'any'
      if (testLineIsScalarRegex.test(lineTrimmed)) {
        return output.push(`Type Vis${lineTrimmed.split(" ")[1]} = any`);
      }

      // By default we treat a line as a field
      return output.push(convertFieldLine(lineTrimmed));
    });

  writeFile(
    `declare namespace Vis {${output
      .splice(0, output.findIndex((line) => line.includes("}")) + 1)
      .join("\n")}}; declare namespace Vis.Data {${output.join("\n")}}`,
    join(dirname(path), "src/types"),
    "data.d.ts"
  );
});
