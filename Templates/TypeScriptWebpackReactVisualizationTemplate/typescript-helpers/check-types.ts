import { dirname } from "path";
import ts from "typescript";
import { readVisualizationFiles } from "./read-visualization-files";

/**
 * Parse every tsconfig inside visualizations and ensure their types are correct
 * @see https://github.com/microsoft/TypeScript/issues/6387#issuecomment-169739615
 */
readVisualizationFiles("*tsconfig*.json", (path, data) => {
  // Parse JSON, after removing comments. Just fancier JSON.parse
  const config = ts.parseConfigFileTextToJson(path, data.toString());
  const configObject = config.config;
  if (!configObject) {
    if (config.error) {
      reportDiagnostics([config.error]);
    }
    process.exit(1);
  }

  // Extract config infromation
  const configParseResult = ts.parseJsonConfigFileContent(
    configObject,
    ts.sys,
    dirname(path)
  );

  if (configParseResult.errors.length > 0) {
    reportDiagnostics(configParseResult.errors);
    process.exit(1);
  }

  // Compile
  const program = ts.createProgram(
    configParseResult.fileNames,
    configParseResult.options
  );
  const emitResult = program.emit();

  const errors = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  if (errors.length === 0) {
    console.log("No errors found during type checking.");
    process.exit(0);
  }

  // Report errors
  reportDiagnostics(errors);
});

function reportDiagnostics(diagnostics: ts.Diagnostic[]): void {
  diagnostics.forEach((diagnostic) => {
    let message = "Error";
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start ?? 0
      );
      message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
    }
    message +=
      ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.log(message);
  });
}
