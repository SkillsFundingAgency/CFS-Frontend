// @ts-nocheck

import { IFunctionParameter } from "./IFunctionParameter";
import { ILocalFunction } from "./ILocalFunction";
import { ILocalFunctionConstructorParameters } from "./ILocalFunctionConstructorParameters";

export class VisualBasicSub implements ILocalFunction {
  constructor(data?: ILocalFunctionConstructorParameters) {
    if (data) {
      this.label = data.label;
      this.description = data.description;
      this.parameters = data.parameters;
      this.returnType = data.returnType;
      this.friendlyName = data.friendlyName;
      this.isCustom = data.isCustom;
    }
  }

  public label = "";

  public friendlyName = "";

  public description = "";

  public parameters: Array<IFunctionParameter> = [];

  public returnType = "";

  public isCustom = false;

  public getFunctionAndParameterDescription(): string {
    const parameterDescription: Array<string> = [];
    if (this.parameters) {
      for (const p in this.parameters) {
        parameterDescription.push(this.parameters[p].type + " " + this.parameters[p].name);
      }
    }

    return (
      (this.returnType ? this.returnType : "Void") +
      " " +
      this.label +
      "(" +
      parameterDescription.join(", ") +
      ")"
    );
  }
}
