import { FundingLineDictionaryEntry, NodeType, FundingLineType, CalculationType, AggregrationType, ValueFormatType, TemplateFundingLine } from "../../types/TemplateBuilderDefinitions";

export const singleNodeDs: Array<FundingLineDictionaryEntry> = [
    {
        "key": 1,
        "value": {
            "id": "n0",
            "templateLineId": 0,
            "kind": NodeType.FundingLine,
            "type": FundingLineType.Information,
            "name": "Funding Line 0",
            "fundingLineCode": "Code 0",
            "aggregationType": undefined,
            "dsKey": 1,
            "children": []
        }
    }
];

export const singleNodeTemplate: Array<TemplateFundingLine> = [
    {
        "name": "Funding Line 0",
        "fundingLineCode": "Code 0",
        "templateLineId": 0,
        "type": "Information",
        "aggregationType": undefined,
        "fundingLines": [],
        "calculations": []
    }
];

export const withChildFundingLineDs: Array<FundingLineDictionaryEntry> = [
    {
        "key": 1,
        "value": {
            "id": "n1",
            "templateLineId": 0,
            "kind": NodeType.FundingLine,
            "type": FundingLineType.Information,
            "name": "Funding Line 0",
            "fundingLineCode": "Code 0",
            "aggregationType": undefined,
            "dsKey": 1,
            "children": [
                {
                    "id": "n0",
                    "dsKey": 1,
                    "templateLineId": 1,
                    "kind": NodeType.FundingLine,
                    "type": FundingLineType.Information,
                    "name": "Funding Line 1",
                    "fundingLineCode": "Code 1",
                    "aggregationType": undefined,
                    "children": []
                }
            ]
        }
    }
];

export const withChildFundingLineTemplate: Array<TemplateFundingLine> = [
    {
        "name": "Funding Line 0",
        "fundingLineCode": "Code 0",
        "templateLineId": 0,
        "type": "Information",
        "aggregationType": undefined,
        "fundingLines": [{
            "name": "Funding Line 1",
            "fundingLineCode": "Code 1",
            "templateLineId": 1,
            "type": "Information",
            "aggregationType": undefined,
            "fundingLines": [],
            "calculations": []
        }],
        "calculations": []
    }
];

export const withChildFundingLineAndCalculationDs: Array<FundingLineDictionaryEntry> = [
    {
        "key": 1,
        "value": {
            "id": "n3",
            "templateLineId": 0,
            "kind": NodeType.FundingLine,
            "type": FundingLineType.Information,
            "name": "Funding Line 0",
            "fundingLineCode": "Code 0",
            "aggregationType": undefined,
            "dsKey": 1,
            "children": [
                {
                    "id": "n1",
                    "dsKey": 1,
                    "templateLineId": 1,
                    "kind": NodeType.FundingLine,
                    "type": FundingLineType.Information,
                    "name": "Funding Line 1",
                    "fundingLineCode": "Code 1",
                    "aggregationType": undefined,
                    "children": [{
                        "id": "n0",
                        "dsKey": 1,
                        "templateLineId": 2,
                        "kind": NodeType.FundingLine,
                        "type": FundingLineType.Payment,
                        "name": "Funding Line 2",
                        "fundingLineCode": "Code 2",
                        "aggregationType": undefined,
                        "children": []
                    }]
                },
                {
                    "id": "n2",
                    "dsKey": 1,
                    "templateCalculationId": 3,
                    "kind": NodeType.Calculation,
                    "type": CalculationType.PupilNumber,
                    "name": "Calculation 3",
                    "aggregationType": AggregrationType.Sum,
                    "formulaText": "",
                    "valueFormat": ValueFormatType.Currency,
                    "children": []
                }
            ]
        }
    }
];

export const withChildFundingLineAndCalculationTemplate: Array<TemplateFundingLine> = [
    {
        "name": "Funding Line 0",
        "fundingLineCode": "Code 0",
        "templateLineId": 0,
        "type": "Information",
        "aggregationType": undefined,
        "fundingLines": [{
            "name": "Funding Line 1",
            "fundingLineCode": "Code 1",
            "templateLineId": 1,
            "type": "Information",
            "aggregationType": undefined,
            "fundingLines": [
                {
                    "name": "Funding Line 2",
                    "fundingLineCode": "Code 2",
                    "templateLineId": 2,
                    "type": "Payment",
                    "aggregationType": undefined,
                    "fundingLines": [],
                    "calculations": []
                }
            ],
            "calculations": []
        }],
        "calculations": [{
            "templateCalculationId": 3,
            "name": "Calculation 3",
            "type": "PupilNumber",
            "aggregationType": "Sum",
            "formulaText": "",
            "valueFormat": "Currency",
            "calculations": []
        }]
    }
];

export const multipleFundingLinesDs: Array<FundingLineDictionaryEntry> = [
    {
        "key": 1,
        "value": {
            "id": "n0",
            "templateLineId": 0,
            "kind": NodeType.FundingLine,
            "type": FundingLineType.Information,
            "name": "Funding Line 0",
            "fundingLineCode": "Code 0",
            "aggregationType": undefined,
            "dsKey": 1,
            "children": []
        }
    },
    {
        "key": 2,
        "value": {
            "id": "n3",
            "templateLineId": 1,
            "kind": NodeType.FundingLine,
            "type": FundingLineType.Information,
            "name": "Funding Line 1",
            "fundingLineCode": "Code 1",
            "aggregationType": undefined,
            "dsKey": 2,
            "children": [
                {
                    "id": "n1",
                    "templateLineId": 3,
                    "kind": NodeType.FundingLine,
                    "type": FundingLineType.Information,
                    "name": "Funding Line 3",
                    "fundingLineCode": "Code 3",
                    "aggregationType": undefined,
                    "dsKey": 2,
                    "children": []
                },
                {
                    "id": "n2",
                    "templateCalculationId": 4,
                    "kind": NodeType.Calculation,
                    "type": CalculationType.Cash,
                    "name": "Calculation 4",
                    "aggregationType": AggregrationType.Sum,
                    "formulaText": "",
                    "valueFormat": ValueFormatType.Number,
                    "dsKey": 2,
                    "children": []
                }
            ]
        }
    },
    {
        "key": 3,
        "value": {
            "id": "n4",
            "templateLineId": 2,
            "kind": NodeType.FundingLine,
            "type": FundingLineType.Payment,
            "name": "Funding Line 2",
            "fundingLineCode": "Code 2",
            "aggregationType": undefined,
            "dsKey": 3,
            "children": []
        }
    }
];

export const multipleFundingLinesTemplate: Array<TemplateFundingLine> = [
    {
        "name": "Funding Line 0",
        "fundingLineCode": "Code 0",
        "templateLineId": 0,
        "aggregationType": undefined,
        "type": "Information",
        "fundingLines": [],
        "calculations": []
    },
    {
        "name": "Funding Line 1",
        "fundingLineCode": "Code 1",
        "templateLineId": 1,
        "type": "Information",
        "aggregationType": undefined,
        "fundingLines": [
            {
                "name": "Funding Line 3",
                "aggregationType": undefined,
                "fundingLineCode": "Code 3",
                "templateLineId": 3,
                "type": "Information",
                "fundingLines": [],
                "calculations": []
            }
        ],
        "calculations": [
            {
                "name": "Calculation 4",
                "templateCalculationId": 4,
                "type": "Cash",
                "valueFormat": "Number",
                "formulaText": "",
                "aggregationType": "Sum",
                "calculations": []
            }
        ]
    },
    {
        "name": "Funding Line 2",
        "fundingLineCode": "Code 2",
        "templateLineId": 2,
        "aggregationType": undefined,
        "type": "Payment",
        "fundingLines": [],
        "calculations": []
    }
];