declare namespace Vis {
  interface Style {
    [key: string | number | symbol]: JSONValue | undefined;
    DevelopmentMode: boolean;
  }
}