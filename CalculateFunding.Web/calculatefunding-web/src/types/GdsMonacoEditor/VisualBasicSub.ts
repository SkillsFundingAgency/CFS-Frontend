import {ILocalFunction} from "./ILocalFunction";
import {ILocalFunctionConstructorParameters} from "./ILocalFunctionConstructorParameters";
import {IFunctionParameter} from "./IFunctionParameter";

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

    public label: string = "";

    public friendlyName: string = "";

    public description: string = "";

    public parameters: Array<IFunctionParameter> = [];

    public returnType: string = "";

    public isCustom: boolean = false;

    public getFunctionAndParameterDescription(): string {

        let parameterDescription: Array<string> = [];
        if (this.parameters) {
            for (let p in this.parameters) {
                parameterDescription.push(this.parameters[p].type + " " + this.parameters[p].name);
            }
        }

        return (this.returnType ? this.returnType : "Void") + " " + this.label + "(" + parameterDescription.join(", ") + ")";
    }
}