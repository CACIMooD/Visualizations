declare namespace Vis {
  interface State {
    [key: string | number | symbol]: JSONValue | undefined;
    ExampleState: boolean;
  }
}