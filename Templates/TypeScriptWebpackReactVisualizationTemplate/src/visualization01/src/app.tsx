import React from "react";
import { StateExample } from "./examples/stateExample";
import { SizeExample } from "./examples/sizeExample";
import { ConfigExample } from "./examples/configExample";
import { ErrorExample } from "./examples/errorExample";
import { DataExample } from "./examples/dataExample";
import { InputExample } from "src/examples/inputExample";
import { OutputExample } from "./examples/outputExample";
import { ActionExample } from "./examples/actionExample";
import { StyleExample } from "./examples/styleExample";
import { BaseExample } from "./examples/baseExample";
import { ExternalMessageExample } from "./examples/externalMessageExample";
import { JSONExample } from "./examples/jsonExample";
import { NavigateExample } from "./examples/navigateExample";

export type AppProps = {};

/**
 * App is the main React entry point for this Template's custom visualization
 */
export const App: React.FC<AppProps> = () => {
  return (
    <div>
      <BaseExample title='Config Example:'>
        <ConfigExample />
      </BaseExample>

      <BaseExample title='Error Example:'>
        <ErrorExample />
      </BaseExample>

      <BaseExample title='Size Example:'>
        <SizeExample />
      </BaseExample>

      <BaseExample title='State Example:'>
        <StateExample />
      </BaseExample>

      <BaseExample title='Style Example:'>
        <StyleExample />
      </BaseExample>

      <BaseExample title='Data Example:'>
        <DataExample />
      </BaseExample>

      <BaseExample title='Input Example:'>
        <InputExample />
      </BaseExample>

      <BaseExample title='Output Example:'>
        <OutputExample />
      </BaseExample>

      <BaseExample title='Action Example:'>
        <ActionExample />
      </BaseExample>

      <BaseExample title='Navigate Example:'>
        <NavigateExample />
      </BaseExample>

      <BaseExample title='External Message Example:'>
        <ExternalMessageExample />
      </BaseExample>

      <BaseExample title='JSON Example (Read-Only):'>
        <JSONExample />
      </BaseExample>
    </div>
  );
};
