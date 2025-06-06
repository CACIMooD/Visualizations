const JsonToTS = require("json-to-ts");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const indenting = "  ";

/**
 * Compile all config.json.ejs into an automatically generated typescript type file
 */
glob("src/**/no-guid.visualization.config.json.ejs", function (er, files) {
  files.forEach(function (file) {
    //Swap file out for visualization.config.json.ejs if it exists as that is most up to date for config
    if (fs.existsSync(file.replace("no-guid.", "")))
      file = file.replace("no-guid.", "");

    //Parse the config.json.ejs file into JSON
    let jsonResult = JSON.parse(
      fs
        .readFileSync(path.join(__dirname, "../", file))
        .toString()
        //Remove any webpack version plugin functions as it breaks JSON parsing
        .replace(/(<%= package.version %>)|(<%= uuid.v4(); %>)/gi, "0")
    );

    //Parse all of the required config values
    let styleConfig = parseToNamespace(
      parseStyle(jsonResult?.style?.JSON),
      "Style",
      false
    );

    //Parse the JSON actions into TS and make the initial type statically named
    let actionsParsed = parseActions(jsonResult?.actions);
    let actionsConfig = actionsParsed[1].concat(
      "",
      actionsParsed[0],
      "",
      parseToGlobal(
        parseToNamespace(
          ["", indenting + "[key in ActionsEnum]: ActionsTypes[key];", "}"],
          "Actions",
          true
        )
      )
    );

    //Parse the JSON inputs into TS and make the initial type statically named
    let inputParsedConfig = parseIO(jsonResult?.inputs, "Inputs");
    let inputConfig = inputParsedConfig[1].concat(
      "",
      inputParsedConfig[0],
      "",
      parseToGlobal(
        parseToNamespace(
          ["", indenting + "[key in InputsEnum]: InputsTypes[key];", "}"],
          "Inputs",
          true
        )
      )
    );

    //Parse the JSON outputs into TS and make the initial type statically named
    let outputParsedConfig = parseIO(jsonResult?.outputs, "Outputs");
    let outputConfig = outputParsedConfig[1].concat(
      "",
      outputParsedConfig[0],
      "",
      parseToGlobal(
        parseToNamespace(
          ["", indenting + "[key in OutputsEnum]: OutputsTypes[key];", "}"],
          "Outputs",
          true
        )
      )
    );

    //Parse the JSON state into TS and make the initial type statically named
    let stateConfig = parseToNamespace(
      parseState(jsonResult?.state),
      "State",
      false
    );

    writeTypesToFiles(
      path.dirname(file),
      styleConfig,
      actionsConfig,
      inputConfig,
      outputConfig,
      stateConfig
    );
  });
});

/**
 * Write all of the parsed values to file
 * @param {string[]} styleConfig The parsed style
 * @param {string[]} actionsConfig The parsed actions
 * @param {string[]} inputsConfig The parsed inputs
 * @param {string[]} outputsConfig The parse outputs
 * @param {string[]} stateConfig The parse state
 */
function writeTypesToFiles(
  visDir,
  styleConfig,
  actionsConfig,
  inputsConfig,
  outputsConfig,
  stateConfig
) {
  //Ensure that the folder structure is set up correctly
  if (!fs.existsSync(path.join(visDir, "src/types"))) {
    fs.mkdirSync(path.join(visDir, "src/types"), {
      recursive: true,
    });
  }

  //Write all of the translated files to the types folder
  fs.writeFileSync(
    path.join(visDir, "src/types", "style.d.ts"),
    styleConfig.join("\n")
  );

  fs.writeFileSync(
    path.join(visDir, "src/types", "actions.ts"),
    actionsConfig.join("\n")
  );

  fs.writeFileSync(
    path.join(visDir, "src/types", "inputs.ts"),
    inputsConfig.join("\n")
  );

  fs.writeFileSync(
    path.join(visDir, "src/types", "outputs.ts"),
    outputsConfig.join("\n")
  );

  fs.writeFileSync(
    path.join(visDir, "src/types", "state.d.ts"),
    stateConfig.join("\n")
  );
}

/**
 * Parse any converted TypeScript into a global scope
 * @param {string[]} parsedInput The parsed TypeScript that needs to be converted to a namespace
 */
function parseToGlobal(parsedInput) {
  let ret = ["declare global {"];
  if (parsedInput == null) return ret.concat("}");

  //Split any parsedInputs that arent in an array format
  parsedInput = parsedInput.map((line) => {
    let lineSplit = line.split("\n");
    if (lineSplit.length == 1) return lineSplit[0];
    return lineSplit;
  });

  //Add an indent to every line to make it inline with global addition and remove any declares
  ret = ret.concat(indentTS(parsedInput, true));

  ret.push("}");
  return ret;
}

/**
 * Parse any converted TypeScript into a custom namespace for the visualization
 * @param {string[]} parsedInput The parsed TypeScript that needs to be converted to a namespace
 * @param {string} namespace The namespace to add to the parsed input
 * @param {boolean} namespaceIsType Controls if type or interface is used within the namespace
 */
function parseToNamespace(parsedInput, namespace, namespaceIsType) {
  let ret = [`declare namespace Vis {`];
  if (parsedInput == null) return ret.concat("}");

  //Split any parsedInputs that arent in an array format
  parsedInput = parsedInput.map((line) => {
    let lineSplit = line.split("\n");
    if (lineSplit.length == 1) return lineSplit[0];
    return lineSplit;
  });

  //Determines if type or interface should be used for the namespace
  if (namespaceIsType == true) {
    if (Array.isArray(parsedInput[0])) {
      parsedInput[0][0] =
        parsedInput[0].length > 1
          ? `type ${namespace} = {`
          : `type ${namespace} = {}`;
    } else {
      parsedInput[0] =
        parsedInput.length > 1
          ? `type ${namespace} = {`
          : `type ${namespace} = {}`;
    }
  } else {
    if (Array.isArray(parsedInput[0])) {
      parsedInput[0][0] =
        parsedInput[0].length > 1
          ? `interface ${namespace} {`
          : `interface ${namespace} {}`;
    } else {
      parsedInput[0] =
        parsedInput.length > 1
          ? `interface ${namespace} {`
          : `interface ${namespace} {}`;
    }
  }

  //Add an indent to every line to make it inline with namespace addition and remove any declares
  ret = ret.concat(indentTS(parsedInput, true));

  ret.push("}");
  return ret;
}

/**
 * Parse an object into a key = value enum and return each line in a string array
 * @param {String} enumName - The name to give the enum
 * @param {Object} object - The Object containing all the key/name pairs
 * @param {Function} accessor - (Optional) Callback to return the string value of the enum value
 */
function parseToEnumExport(enumName, object, accessor) {
  return [`export enum ${enumName} {`].concat(
    Object.keys(object).map((output, index) => {
      return `${indenting}${object[index]} = "${
        accessor == null ? object[index] : accessor(object[index])
      }",`;
    }),
    "}"
  );
}

/**
 * Adds an indent to the begining of all the lines of a parsed TypeScript
 * @param {string[]} parsedTypeScript The parsed TypeScript that needs to be indented
 * @param {boolean} removeDeclare Controls if any declares should be removed from the indent lines
 * @returns
 */
function indentTS(parsedTypeScript, removeDeclare) {
  return parsedTypeScript.map((line, index) => {
    //If line is an array then it's actually a JSON to TS string
    if (Array.isArray(line)) {
      return (
        line
          .map((subLine) => {
            return (
              indenting +
              (removeDeclare == true
                ? subLine
                : subLine.replace(/(?<=^\s*)declare /gi, ""))
            );
          })
          .join("\n") + (index == parsedTypeScript.length - 1 ? "" : "\n")
      );
    }

    if (line == "") {
      return "";
    } else {
      return (
        indenting +
        (line == true ? line : line.replace(/(?<=^\s*)declare /gi, ""))
      );
    }
  });
}

/**
 * Parse the style out of a JSON file into TS
 * @param {JSON} styleJSON The JSON to convert into TS
 */
function parseStyle(styleJSON) {
  if (styleJSON == null) return ["interface Style {}"];
  try {
    //Try to parse the json style into TS if available
    let styleConfig = JsonToTS(styleJSON);
    if (styleConfig.length > 0) {
      //Format the style onto one line if it is empty
      if (styleConfig[0] == "interface RootObject {\n}") {
        return [
          "interface Style {",
          indenting + "[key: string | number | symbol]: JSONValue | undefined;",
          "}",
        ];
      } else {
        styleConfig[0] = styleConfig[0].replace(
          "RootObject {",
          "Style { \n" +
            indenting +
            "[key: string | number | symbol]: JSONValue | undefined;"
        );
      }
      return styleConfig;
    } else {
      return [
        "interface Style {",
        indenting + "[key: string | number | symbol]: JSONValue | undefined;",
        "}",
      ];
    }
  } catch {
    //Catch any errors with the styling not existing or being incorrectly formatted
    return [
      "interface Style {",
      indenting + "[key: string | number | symbol]: JSONValue | undefined;",
      "}",
    ];
  }
}

/**
 * Parse the action out of a JSON file into TS
 * @param {JSON} actionsJSON The JSON to convert into TS
 */
function parseActions(actionsJSON) {
  let actionsEnum = [];
  let actionsConfig = [];
  let parsedActionsEnumToOriginal = new Map();
  if (actionsJSON != null) {
    actionsEnum = Object.keys(actionsJSON).map((action) => {
      const actionParsed = action
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_(?=_+| )/g, "");

      parsedActionsEnumToOriginal.set(actionParsed, action);

      return actionParsed;
    });

    actionsConfig = Object.keys(actionsJSON).map((action, index) => {
      return `${indenting}[ActionsEnum.${actionsEnum[index]}]: MooDAction,`;
    });
  }

  //Parse a default value if actions does exist
  if (actionsJSON == null || actionsConfig.length == 0) {
    return [
      [
        "interface ActionsTypes {",
        `${indenting}[key: string | number | symbol]: never;`,
        "}",
      ],
      ["export enum ActionsEnum {}"],
    ];
  }

  return [
    ["export interface ActionsTypes {"].concat(actionsConfig, "}"),
    parseToEnumExport("ActionsEnum", actionsEnum, (actionParsed) =>
      parsedActionsEnumToOriginal.get(actionParsed)
    ),
  ];
}

/**
 * Parse the inputs and outputs out of a JSON file into TS
 * @param {JSON} json - The JSON to convert into TS
 */
function parseIO(json, interfaceName) {
  let ret = [[], []];
  let parsedIOToOriginal = new Map();

  //Parse the JSON outputs into TS and make the initial type statically named
  if (json != null && json.length > 0) {
    let valueEnum = Object.values(json).map((output) => {
      const ioValue = output.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_(?=_+| )/g, "");

      parsedIOToOriginal.set(ioValue, output.name);

      return ioValue;
    });

    //Outputs conversion is more complex so extracted to own function
    ret[0] = [`export interface ${interfaceName}Types {`].concat(
      handleIOConversion(
        Object.values(json).map((value, index) => {
          return {
            name: `[${interfaceName}Enum.${valueEnum[index]}]`,
            displayName: value.displayName,
            type: value.type,
            default: value.default,
          };
        })
      ),
      "}"
    );

    ret[1] = parseToEnumExport(`${interfaceName}Enum`, valueEnum, (ioParsed) =>
      parsedIOToOriginal.get(ioParsed)
    );
  } else {
    ret[0] = [
      `export interface ${interfaceName}Types {`,
      `${indenting}[key: string | number | symbol]: never;`,
      "}",
    ];
    ret[1] = [`export enum ${interfaceName}Enum {}`];
  }

  return ret;
}

/**
 * Parse the state out of a JSON file into TS
 * @param {JSON} stateJSON The JSON to convert into TS
 */
function parseState(stateJSON) {
  if (stateJSON == null)
    return [
      "interface State {",
      indenting + "[key: string | number | symbol]: JSONValue | undefined;",
      "}",
    ];

  try {
    //Try to parse the json state into TS if available
    let stateConfig = JsonToTS(stateJSON);
    if (stateConfig.length > 0) {
      //Format the state onto one line if it is empty
      if (stateConfig[0] == "interface RootObject {\n}") {
        return [
          "interface State {",
          indenting + "[key: string | number | symbol]: JSONValue | undefined;",
          "}",
        ];
      } else {
        stateConfig[0] = stateConfig[0].replace(
          "RootObject {",
          "State { \n" +
            indenting +
            "[key: string | number | symbol]: JSONValue | undefined;"
        );
      }
      return stateConfig;
    } else {
      return [
        "interface State {",
        indenting + "[key: string | number | symbol]: JSONValue | undefined;",
        "}",
      ];
    }
  } catch {
    //Catch any errors with the styling not existing or being incorrectly formatted
    return [
      "interface State {",
      indenting + "[key: string | number | symbol]: JSONValue | undefined;",
      "}",
    ];
  }
}

/**
 * Convert MooD Inputs/Outputs into the TypeScript response
 * @param {{name: string, displayName: string, type: Any, default: Any}[]} values
 */
function handleIOConversion(values) {
  //Loop through every input value and convert it
  return values.map((value, index) => {
    //Custom TypeScript types produced from Schema specifically use a Capital at the start
    let valueType =
      value.type.charAt(0).toUpperCase() +
      value.type.toLowerCase().substring(1);

    switch (valueType.toLowerCase()) {
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
    }

    //MooD accepts Date but JS has it's own Date type so TypeScript Schema is slightly modified
    return `${indenting}${value.name}: ${valueType}${
      index == values.length - 1 ? "" : ","
    }`;
  });
}
