import {IMethodInformationResponse, ITypeInformationResponse} from "../../../types/Calculations/CodeContext";

export function CreateInformationTestData(){

    let data: Array<ITypeInformationResponse>;
    data = [
        {
            name: "Scenario",
            description: "Scenario",
            methods: [],
            properties: [
                {
                    name: "periodid",
                    friendlyName: "",
                    description: "",
                    type: "Int32",
                    isAggregable: false,
                    children: []
                }
            ],
            "type": "Scenario",
            "enumValues": []
        }
    ];

    return data;
}