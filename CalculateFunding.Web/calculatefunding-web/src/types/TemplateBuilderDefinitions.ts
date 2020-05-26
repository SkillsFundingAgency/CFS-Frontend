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

  export interface TemplateFundingLine {
    templateLineId: number,
    type: FundingLineType | string,
    name: string,
    fundingLineCode: string,
    aggregationType?: AggregrationType,
    fundingLines: Array<TemplateFundingLine>,
    calculations: Array<TemplateCalculation>
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

  export interface TemplateCalculation {
    templateCalculationId: number,
    type: CalculationType | string,
    name: string,
    aggregationType?: AggregrationType | string,
    formulaText?: string,
    valueFormat?: ValueFormatType | string,
    calculations: Array<TemplateCalculation>
  }

  export interface TemplateResponse {
    templateId: string,
    templateJson: string,
    schemaVersion: string,
    fundingStreamId: string,
    fundingPeriodId: string,
    name: string,
    status: string,
    publishStatus: string,
    description: string,
    minorVersion: number,
    majorVersion: number,
    version: number,
    authorId: string,
    authorName: string,
    comments: string,
    lastModificationDate: Date
  }

  export interface Template {
    $schema: string,
    schemaVersion: string,
    fundingTemplate: FundingTemplate
  }
  
  export interface TemplateSummary {
    id: string,
    name: string,
    fundingStreamId: string,
    fundingStreamName: string,
    fundingPeriodId: string,
    fundingPeriodName: string,
    lastUpdatedAuthorName: string,
    lastUpdatedDate: Date,
    version: number,
    currentMajorVersion: number,
    currentMinorVersion: number,
    publishedMajorVersion: number,
    publishedMinorVersion: number,
    hasReleasedVersion: boolean
  }
  
  export interface TemplateSearchResponse {
    totalCount: number,
    totalErrorCount: number,
    facets: SearchFacet[],
    results: TemplateSummary[]
  }

  export interface SearchFacet {
    name: string;
    facetValues: SearchFacetValue[];
  }
  export interface SearchFacetValue {
    name: string;
    count: number;
  }

  export interface FundingTemplate {
    fundingTemplateVersion: string,
    fundingStream: TemplateFundingStream,
    fundingPeriod: TemplateFundingPeriod,
    fundingLines: Array<TemplateFundingLine>
  }

  export interface TemplateFundingStream {
    code: string,
    name: string
  }

  export interface TemplateFundingPeriod {
    id: string,
    period: string,
    name: string,
    type: string,
    startDate: string,
    endDate: string
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