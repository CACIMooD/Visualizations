import { dirname, join } from "path";
import { readVisualizationFiles } from "../../read-visualization-files";
import { writeFile } from "../write-file";
import { parseActions } from "./actions";
import { parseIO } from "./io";
import {
  convertJSONToTSInterface,
  convertToGlobal,
  convertToNamespace,
} from "./utils";

/**
 * Compile all config.json.ejs into an automatically generated typescript type file
 */
readVisualizationFiles(
  "no-guid.visualization.config.json.ejs",
  (path: string, data: Buffer) => {
    const jsonResult = JSON.parse(data.toString());

    // Parse the style config into TS
    const styleConfig = convertToNamespace(
      convertJSONToTSInterface(jsonResult?.style?.JSON, "Style")
    );

    // Parse the JSON actions into TS and make the initial type statically named
    const actionsParsed = parseActions(jsonResult?.actions);
    const actionsConfig = actionsParsed[1].concat(
      "",
      actionsParsed[0],
      "",
      convertToGlobal(
        convertToNamespace(
          ["", "[key in ActionsEnum]: ActionsTypes[key];", "}"],
          "Actions",
          true
        )
      )
    );

    // Parse the JSON inputs into TS and make the initial type statically named
    const inputParsedConfig = parseIO(jsonResult?.inputs, "Inputs");
    const inputConfig = inputParsedConfig[1].concat(
      "",
      inputParsedConfig[0],
      "",
      convertToGlobal(
        convertToNamespace(
          ["", "[key in InputsEnum]: InputsTypes[key];", "}"],
          "Inputs",
          true
        )
      )
    );

    // Parse the JSON outputs into TS and make the initial type statically named
    const outputParsedConfig = parseIO(jsonResult?.outputs, "Outputs");
    const outputConfig = outputParsedConfig[1].concat(
      "",
      outputParsedConfig[0],
      "",
      convertToGlobal(
        convertToNamespace(
          ["", "[key in OutputsEnum]: OutputsTypes[key];", "}"],
          "Outputs",
          true
        )
      )
    );

    // Parse the JSON state into TS and make the initial type statically named
    const stateConfig = convertToNamespace(
      convertJSONToTSInterface(jsonResult?.state, "State")
    );

    const typeDir = join(dirname(path), "src/types");
    writeFile(actionsConfig.join("\n"), typeDir, "actions.ts");
    writeFile(inputConfig.join("\n"), typeDir, "inputs.ts");
    writeFile(outputConfig.join("\n"), typeDir, "outputs.ts");
    writeFile(stateConfig.join("\n"), typeDir, "state.d.ts");
    writeFile(styleConfig.join("\n"), typeDir, "style.d.ts");
  }
);
