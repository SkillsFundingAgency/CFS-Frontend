export enum NodeType {
  FundingLine = "FundingLine",
  Calculation = "Calculation"
}

export enum FundingLineType {
  Payment = "Payment",
  Information = "Information"
}

export enum CalculationType {
  Cash = "Cash",
  Rate = "Rate",
  PupilNumber = "PupilNumber",
  Weighting = "Weighting",
  Scope = "Scope",
  Information = "Information",
  Drilldown = "Drilldown",
  PerPupilFunding = "PerPupilFunding",
  LumpSum = "LumpSum",
  ProviderLedFunding = "ProviderLedFunding",
  Number = "Number"
}

export enum AggregrationType {
  None = "None",
  Sum = "Sum",
  Average = "Average"
}

export enum ValueFormatType {
  Number = "Number",
  Percentage = "Percentage",
  Currency = "Currency"
}

export interface FundingLine {
    id: string,
    relationship?: string,
    dsKey?: number,
    templateLineId: number,
    kind: NodeType,
    type: FundingLineType,
    name: string,
    fundingLineCode: string,
    aggregationType?: AggregrationType,
    children?: Array<FundingLineOrCalculation>
  }

  export interface Calculation {
    id: string,
    relationship?: string,
    dsKey?: number,
    templateCalculationId: number,
    kind: NodeType,
    type: CalculationType,
    name: string,
    aggregationType?: AggregrationType,
    formulaText?: string,
    valueFormat?: ValueFormatType,
    children?: Array<FundingLineOrCalculation>
  }

  export interface UpdateModel {
    kind: NodeType
  }

  export interface FundingLineUpdateModel extends UpdateModel {
    id: string,
    type: FundingLineType,
    name: string,
    fundingLineCode: string,
    aggregationType?: AggregrationType
  }

  export interface CalculationUpdateModel extends UpdateModel {
    id: string,
    type: CalculationType,
    name: string,
    aggregationType?: AggregrationType,
    formulaText?: string,
    valueFormat?: ValueFormatType
  }

  export type FundingLineOrCalculation = FundingLine | Calculation;

  export type FundingLineDictionaryEntry = {
    key: number,
    value: FundingLine
  }

  export type FundingLineOrCalculationSelectedItem = {
    key: number,
    value: FundingLineOrCalculation
  }