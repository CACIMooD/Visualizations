const glob = require("glob");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const indenting = "  ";

/**
 * Compile all GraphQL datashapes into an automatically generated typescript type file
 * This will only work with MooD due to it being a very simple transpiler and MooD has simple logic
 */
glob("src/**/*.datashape.gql", function (er, files) {
  files.forEach(function (file) {
    let reader = readline.createInterface({
      input: fs.createReadStream(file),
    });

    let outputFileLines = [];
    let initialDataConversion = [];
    let initialDataParsed = false;

    reader
      .on("line", function (line) {
        //remove all spaces from the beginning of the line and remove multiple spaces inbetween the line before continuing
        line = line
          .substring(/(?=[a-z])/gi.exec(line)?.index ?? 0)
          .split(" ")
          .filter((word) => word != "")
          .join(" ");

        if (!initialDataParsed && (line == "}" || line == "")) {
          initialDataParsed = true;
          return initialDataConversion.push(line);
        }

        //Don't need to handle any useless lines so add them directly
        if (line == "}" || line == "") {
          return outputFileLines.push(line);
        } else {
          //Do a quick parse on the line to check that it is in a good format
          let lineBraceParsed = line
            .split(" ")
            .filter((word) => {
              return word != "";
            })
            .join("");

          if (lineBraceParsed.length != 0) {
            //Type declaration handles formatting {} correctly so ignore solo {
            if (lineBraceParsed[0] == "{") {
              if (lineBraceParsed.length == 1) return;
              line = lineBraceParsed.substring(1);
            }

            if (lineBraceParsed[0] == "}") {
              if (lineBraceParsed.length == 1) return;
              line = lineBraceParsed.substring(1);
            }
          }
        }

        //If Data has not been converted yet we need to store that separately
        if (!initialDataParsed && line.substring(0, 4) == "type") {
          console.log("");
          if (line.includes("{")) {
            return initialDataConversion.push("interface Data {");
          }

          return initialDataConversion.push("interface Data");
        }

        //Conversion for types is a little more complicated so extracted to own function
        if (line.substring(0, 4) == "type")
          return outputFileLines.push(handleTypeConversion(line));

        //Conversion for unions is a little more complicated so extracted to own function
        if (line.substring(0, 5) == "union")
          return outputFileLines.push(handleUnionConversion(line));

        //Scalars are just GraphQL custom data types so just convert them to it, they don't come with = type so add it
        if (line.substring(0, 6) == "scalar") {
          let scalarLine = line.split(" ");
          return outputFileLines.push(`Type Vis${scalarLine[1]} = any`);
        }

        //Conversion for data types is a little more complicated so extracted to own function
        if (!initialDataParsed)
          return initialDataConversion.push(
            handleDataTypeConversion(line, initialDataParsed)
          );

        return outputFileLines.push(
          handleDataTypeConversion(line, initialDataParsed)
        );
      })
      .on("close", function () {
        let outputFile = [];
        //Format output file to be on one line if it is empty
        if (
          !initialDataConversion.some((line) => {
            return line != ("type Data {" || "}") && /[a-z0-9]/gi.test(line);
          })
        ) {
          initialDataConversion = ["type Data = {}"];
        }

        //Parse the output file into a custom namespace for the visualization
        outputFile = ["declare namespace Vis {"].concat(
          initialDataConversion.map((line) => {
            return indenting + line;
          }),
          "}",
          "",
          "declare namespace Vis.Data {",
          outputFileLines.map((line) => {
            return indenting + line;
          }),
          "}"
        );

        //Ensure that the folder structure is set up correctly
        if (!fs.existsSync(path.join(path.dirname(files[0]), "src/types"))) {
          fs.mkdirSync(path.join(path.dirname(files[0]), "src/types"), {
            recursive: true,
          });
        }

        fs.writeFileSync(
          path.join(path.dirname(files[0]), "src/types", "data.d.ts"),
          outputFile.join("\n")
        );
      });
  });
});

/**
 * Convert a type from GraphQL to TypeScript
 * @param { String } line
 * @returns Formatted string converted for TypeScript
 */
function handleTypeConversion(line) {
  //Ensure Types are capitalised
  let lineSplit = line.split(" ");
  lineSplit[1] =
    lineSplit[1].charAt(0).toUpperCase() + lineSplit[1].substring(1);

  //Convert type to interface
  lineSplit[0] = "interface";

  //Conversion of types that implement interfaces need to be modified to extend interfaces for TypeScript
  let implementsIndex = lineSplit.indexOf("implements");
  if (implementsIndex != -1) {
    lineSplit[implementsIndex] = "extends";
    return lineSplit.join(" ");
  }

  if (lineSplit[lineSplit.length - 1].search(/{/) != -1)
    return lineSplit
      .filter((line) => {
        return line != "";
      })
      .join(" ");

  return (
    lineSplit
      .filter((line) => {
        return line != "";
      })
      .join(" ") + " {"
  );
}

/**
 * Convert a data type from GraphQL to TypeScript
 * @param { String } line
 * @returns Formatted string converted for TypeScript
 */
function handleDataTypeConversion(line) {
  //Check if the line contains a GraphQL directive, remove it if it does
  if (line.split("@UI").length > 1) line = line.split("@UI")[0];

  //Split the line from where a data field would be and ensure it's valid
  let lineSplit = line.split(":");
  if (lineSplit.length != 2) return line;

  if (
    lineSplit[0].replace(/[^a-zA-Z0-9]/g, "_").replace(/_(?=_+| )/g, "") !=
    lineSplit[0]
  )
    throw `Unable to parse datashape data ${lineSplit[0]} invalid name, contains bad characters`;

  //Ensure : comes after the variable name and with no spaces inbetween
  let variableSplit = lineSplit[0]
    .split(/[ \t]/gi)
    .filter((word) => word != "")
    .join(" ");
  lineSplit[0] =
    variableSplit.charAt(variableSplit.length - 1) == " "
      ? variableSplit.substring(0, variableSplit.length - 2)
      : variableSplit;

  //Check if field is optional, array and set up final output based on those
  lineSplit[1] = lineSplit[1].replace(/ /gi, "");
  let isOptional = lineSplit[1].charAt(lineSplit[1].length - 1) != "!";
  let isArray = lineSplit[1].indexOf("[") != -1;

  //Multiple arrays are ignored by either GraphQL or MooD so concat into one array
  let finalDataType = lineSplit[1].replace(/\[|\]|\!/g, "");

  //Regex to check if the data type isn't one of the built in types
  finalDataType = finalDataType
    .split("|")
    .map((data) => {
      //Ensure types conform to lowercase base types, but not Any because that is a custom type
      let dataType = data.replace(/ /gi, "");
      let dataTypeLower = dataType.toLowerCase();

      switch (dataTypeLower) {
        case "string":
          return "string";
        case "boolean":
          return "boolean";
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
          return dataType[0].toUpperCase() + dataType.substring(1);
        default:
          return "Vis.Data." + dataType;
      }
    })
    .join("|");

  return `  ${lineSplit[0]}${isOptional ? "?:" : ":"} ${
    isArray ? "Array<" + finalDataType + ">" : finalDataType
  },`;
}

/**
 * Convert unions from GraphQL to TypeScript
 * @param { String } line
 * @returns Formatted string converted for TypeScript
 */
function handleUnionConversion(line) {
  //Split the line from where the types of the union would be and ensure it's valid
  let lineSplit = line.split("=");
  if (lineSplit.length != 2) return line;

  //Regex to check if the union's data type isn't one of the built in types
  finalDataType = lineSplit[1]
    .split(/ *\|/gi)
    .map((data) => {
      //Ensure types conform to lowercase base types, but not Any because that is a custom type
      let dataType = data;
      if (/String|Boolean|Number/gi.test(dataType))
        dataType = dataType.charAt(0).toLowerCase() + dataType.substring(1);

      //MooD Date and JS Date share same type name so convert it if found
      return dataType.replace(/ /gi, "").replace(/Date/gi, "MooDDate");
    })
    .join(" | ");

  return `${lineSplit[0]
    .replace(/ /gi, "")
    .replace(/(?<![a-z0-9])union/, "type")} = ${finalDataType};`;
}
