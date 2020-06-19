export enum TemplateBuilderActionTypes {
    ADD_FUNDING_LINE = 'ADD_FUNDING_LINE',
    ADD_CALCULATION = 'ADD_CALCULATION',
}

export interface AddFundingLine {
    type: TemplateBuilderActionTypes.ADD_FUNDING_LINE
}

export interface AddCalculation {
    type: TemplateBuilderActionTypes.ADD_CALCULATION
}

export type TemplateBuilderAction = AddFundingLine | AddCalculation;