declare namespace Vis {
  interface State {
    [key: string | number | symbol]: JSONValue | undefined;
    ExampleState: boolean;
    eeeExampleState: boolean;
    hello: Hello;
  }
  interface Hello {
    test: boolean;
  }
}
