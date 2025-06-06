export enum InputsEnum {
  Example_Input = "Example Input",
  Example_Input_2 = "Example Input 2",
}

export interface InputsTypes {
  [InputsEnum.Example_Input]: SinglePickList | MultiPickList,
  [InputsEnum.Example_Input_2]: string
}

declare global {
  namespace Vis {
    type Inputs = {
      [key in InputsEnum]: InputsTypes[key];
    }
  }
}