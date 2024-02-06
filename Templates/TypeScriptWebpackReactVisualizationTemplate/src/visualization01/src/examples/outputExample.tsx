import { useOutput } from "@helpers/hooks/useOutput";
import React, { useState, useRef } from "react";
import { OutputsEnum } from "../types/outputs";

export const OutputExample = () => {
  // Allow updating the "Example Output" of this custom visualization
  //  MooD BA Output Interactions must use the name of the output as it's action setting I.E:
  //  "Uses the element as the value for the output" = Example Output
  const [setExampleOutput, exampleOutput] = useOutput(
    OutputsEnum.Example_Output
  );
  const [localOutput, setLocalOutput] = useState<string>(null);

  // Allow updating the "Example Output 2" of this custom visualization
  const [setExampleOutput2, exampleOutput2] = useOutput(
    OutputsEnum.Example_Output_2
  );
  const exampleOutput2Ref = useRef<HTMLInputElement>();

  return (
    <>
      <div>
        <div>
          This is an example output:
          <div>Local Output: {localOutput?.toString() ?? "undefined"}</div>
          <div>Exposed Output: {exampleOutput?.toString() ?? "undefined"}</div>
        </div>
        <input
          type="text"
          onChange={(event) => {
            setLocalOutput(event.currentTarget.value);
          }}
        />
        <button
          type="button"
          onClick={() => {
            setExampleOutput(localOutput);
          }}
        >
          Update Exposed Output Id
        </button>
      </div>
      <br />
      <div>
        <div>
          This is an example output 2:
          <div>
            Exposed Output 2: {exampleOutput2?.toString() ?? "undefined"}
          </div>
        </div>
        <input ref={exampleOutput2Ref} type="text" />
        <button
          type="button"
          onClick={() => {
            setExampleOutput2(parseFloat(exampleOutput2Ref?.current?.value));
          }}
        >
          Update Exposed Output 2
        </button>
      </div>
      <br />
    </>
  );
};
