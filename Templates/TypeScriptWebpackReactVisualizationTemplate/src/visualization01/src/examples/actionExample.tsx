import { useAction } from "@helpers/hooks/useAction";
import { useHasAction } from "@helpers/hooks/useHasAction";
import { useStrictAction } from "@helpers/hooks/useStrictAction";
import React from "react";
import { ActionsEnum } from "../types/actions";
import { useData } from "@helpers/hooks/useData";

export const ActionExample = () => {
  // Get a reference to the "Example Click" action that we can call
  const exampleClick = useAction(ActionsEnum.Example_Click);

  // Get a reference to the "Example Click" action that we can call
  //  but only if the action has been set up in MooD BA
  const [exampleClickStrict, exampleClickStrictHasAction] = useStrictAction(
    ActionsEnum.Example_Click
  );

  // Get a reference to the hasAction for "Example Click"
  //  that we can call to check if it exists
  const hasExampleClick = useHasAction(ActionsEnum.Example_Click);

  // Get the first valid data for the third ExampleVariable if it has a value
  const [exampleVariable3] = useData(
    (data: Vis.Data): Vis.Data.Query | void => {
      for (let i = 0; i < data.ExampleVariable3?.length; i++) {
        if (data.ExampleVariable3[i].Value != null)
          return data.ExampleVariable3[i];
      }
    }
  );

  return (
    <>
      <div>
        This button will execute {ActionsEnum.Example_Click} and provide the id
        from ExampleVariable3: {exampleVariable3?.key ?? "undefined"}
        <div />
        <button
          type="button"
          onClick={(event) => {
            exampleClick(exampleVariable3?.key ?? "", event);
          }}
        >
          Click to execute action
        </button>
      </div>
      <br />
      <div>
        This button will execute {ActionsEnum.Example_Click} and provide the id
        <div />
        from ExampleVariable3: {exampleVariable3?.key ?? "undefined"}
        <div />
        only if {ActionsEnum.Example_Click} has been set up in MooD BA
        <div />
        <button
          type="button"
          onClick={(event) => {
            exampleClickStrict(exampleVariable3?.key ?? "", event)
              .then(() => {
                alert(`${ActionsEnum.Example_Click} has executed successfully`);
              })
              .catch(() => {
                alert(`${ActionsEnum.Example_Click} has failed to execute`);
              });
          }}
        >
          Click to execute strict action
        </button>
      </div>
      <br />
      <div>
        This button will execute a check on {ActionsEnum.Example_Click}
        <div />
        with the Id: {exampleVariable3?.key ?? "undefined"}
        <div />
        and return if {ActionsEnum.Example_Click} has been set up in MooD BA:
        <div />
        <button
          type="button"
          onClick={() => {
            hasExampleClick(exampleVariable3?.key ?? "").then((res) => {
              if (res.result) {
                alert(`${ActionsEnum.Example_Click} has been set up`);
              } else {
                alert(`${ActionsEnum.Example_Click} has not been set up yet`);
              }
            });
          }}
        >
          Click to execute hasAction
        </button>
      </div>
    </>
  );
};
