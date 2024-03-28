import { WindowNavigationType, useNavigate } from "@helpers/hooks/useNavigate";
import React, { useRef } from "react";

export const NavigateExample = () => {
  const elementId = useRef<HTMLInputElement>(null);

  // Store a function to call navigate later
  const navigate = useNavigate();

  return (
    <>
      <div>
        This is an example navigate which will navigate to an element:
        <br />
        Navigate to element (55-ID_OF_ELEMENT):{" "}
        <input ref={elementId} type='text' />
        <br />
        <button
          onClick={() =>
            navigate(
              WindowNavigationType.NEW_TAB,
              elementId.current?.value ?? ""
            )
          }
        >
          {" "}
          Open In New Tab (overridable)
        </button>
        <br />
        <button
          onClick={() =>
            navigate(
              WindowNavigationType.NEW_BROWSER,
              elementId.current?.value ?? ""
            )
          }
        >
          {" "}
          Open In New Browser (overridable)
        </button>
        <br />
        <button
          onClick={() =>
            navigate(Math.random().toString(), elementId.current?.value ?? "")
          }
        >
          {" "}
          Open In New Tab (unique)
        </button>
        <br />
        <button
          onClick={() =>
            navigate(
              WindowNavigationType.SAME_WINDOW,
              elementId.current?.value ?? ""
            )
          }
        >
          {" "}
          Open In Current Tab
        </button>
      </div>
    </>
  );
};
