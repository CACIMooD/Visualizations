export enum OutputsEnum {
  Example_Output = "Example Output",
  Example_Output_2 = "Example Output 2",
}

export interface OutputsTypes {
  [OutputsEnum.Example_Output]: SinglePickList | MultiPickList,
  [OutputsEnum.Example_Output_2]: number
}

declare global {
  namespace Vis {
    type Outputs = {
      [key in OutputsEnum]: OutputsTypes[key];
    }
  }
}