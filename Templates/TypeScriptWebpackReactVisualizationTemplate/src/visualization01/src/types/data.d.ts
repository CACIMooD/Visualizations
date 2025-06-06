declare namespace Vis {
  interface Data {
    ExampleVariable1: string,
    ExampleVariable2: boolean,
    ExampleVariable3: Array<Vis.Data.Query>,
  }
}

declare namespace Vis.Data {
  
  interface Query extends MooDElement {
    key: ID,
    Name: string,
    Value: Any,
  }
}