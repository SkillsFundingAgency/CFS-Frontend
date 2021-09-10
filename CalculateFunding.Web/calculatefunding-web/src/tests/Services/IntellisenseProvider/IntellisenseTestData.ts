import {
  IPropertyInformationResponse,
  ITypeInformationResponse,
} from "../../../types/Calculations/CodeContext";

export function CreateInformationTestData() {
  const prop: IPropertyInformationResponse = {
    isObsolete: false,
    name: "periodid",
    friendlyName: "",
    description: "",
    type: "Int32",
    isAggregable: false,
    children: [],
  };
  const item: ITypeInformationResponse = {
    isObsolete: false,
    name: "Scenario",
    description: "Scenario",
    methods: [],
    properties: [prop],
    type: "Scenario",
    enumValues: [],
  };
  const data: Array<ITypeInformationResponse> = [item];

  return data;
}
