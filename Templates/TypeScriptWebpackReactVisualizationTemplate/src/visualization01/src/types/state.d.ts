declare namespace Vis {
  interface State {
    [key: string | number | symbol]: JSONValue | undefined;
    ExampleState1: boolean;
    ExampleState2: ExampleState2;
  }
  interface ExampleState2 {
    StateBoolean: boolean;
  }
}
