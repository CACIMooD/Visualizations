import React, { ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import Logger from "@helpers/logger";
import { App, AppProps } from "src/app";
import { ConfigContext } from "@helpers/context/configContext";
import {
  getVisualizationConfig,
  getVisualizationState,
  setVisualizationConfig,
} from "@helpers/config";
import "./visualization.css";
import { ErrorBoundary } from "react-error-boundary";
import { MooDConfig } from "@moodtypes/index";

//
//    Entry function declaration
//
export function visualization(config: MooDConfig) {
  Logger.developmentMode = config.style?.DevelopmentMode ?? false;
  Logger.Log("Development mode is enabled, logging will be enabled");

  // Update the global Custom Visualization config object
  setVisualizationConfig(config);

  // Example ways to reference config variables before we enter React
  const width = parseFloat(config.width);
  const height = parseFloat(config.height);
  const animation = config.animation;
  const state = getVisualizationState(true);

  Logger.Log("This is an example of a development log");

  // Create the React root element with the element provided by MooD BA
  const root = createRoot(document.getElementById(config.element)!);

  // We use ErrorBoundary to produce a nicer error message to display to the user
  //  if the custom visualization fails for any reason
  root.render(
    React.createElement(
      ErrorBoundary,
      {
        fallback: React.createElement(
          "div",
          {},
          React.createElement(
            "p",
            {},
            "An unrecoverable error has occurred with the custom visualization..."
          ),
          React.createElement(
            "p",
            {},
            "If the issue persists after a reload please contact support."
          )
        ),
        onError: (error: Error, info: ErrorInfo) => {
          if (Logger.developmentMode) {
            config.functions.errorOccurred(error.name);
            config.functions.errorOccurred(error.message);
            config.functions.errorOccurred(error.stack ?? "");
            config.functions.errorOccurred(info.componentStack);
          } else {
            config.functions.errorOccurred(
              "An unrecoverable error has occurred with the custom visualization" +
                ", please enable development mode for more information"
            );
          }
        },
      },
      //App contains any React content we want to render,
      // we pass the config to these by using a React Context
      React.createElement(
        ConfigContext.Provider,
        { value: getVisualizationConfig() },
        React.createElement<AppProps>(App, {})
      )
    )
  );
}
