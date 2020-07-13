import {FundingPeriod, FundingStream} from "./viewFundingTypes";

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
    Number = "Number",
    Weighting = "Weighting",
    Boolean = "Boolean",
    Enum = "Enum"
}

export enum AggregrationType {
    None = "None",
    Average = "Average",
    Sum = "Sum",
    GroupRate = "GroupRate",
    PercentageChangeBetweenAandB = "PercentageChangeBetweenAandB"
}

export enum CalculationAggregationType {
    Sum = "Sum",
    Average = "Average"
}

export enum ValueFormatType {
    Number = "Number",
    Percentage = "Percentage",
    Currency = "Currency",
    Boolean = "Boolean",
    String = "String"
}

export enum TemplatePermissions {
  Create = "create",
  Edit = "edit",
  Delete = "delete",
  Approve = "approve"
}

export interface GroupRate {
    numerator: number,
    denominator: number
}

export interface PercentageChangeBetweenAandB {
    calculationA: number,
    calculationB: number,
    calculationAggregationType: CalculationAggregationType
}

export interface FundingLine {
    id: string,
    relationship?: string,
    dsKey?: number,
    templateLineId: number,
    kind: NodeType,
    type: FundingLineType,
    name: string,
    fundingLineCode?: string,
    children?: Array<FundingLineOrCalculation>
}

export interface TemplateFundingLine {
    templateLineId: number,
    type: FundingLineType | string,
    name: string,
    fundingLineCode?: string,
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
    aggregationType: AggregrationType,
    formulaText: string,
    valueFormat: ValueFormatType,
    allowedEnumTypeValues?: string,
    groupRate?: GroupRate,
    percentageChangeBetweenAandB?: PercentageChangeBetweenAandB,
    children?: Array<FundingLineOrCalculation>
}

export interface TemplateCalculation {
    templateCalculationId: number,
    type: CalculationType | string,
    name: string,
    aggregationType: AggregrationType | string,
    formulaText: string,
    valueFormat: ValueFormatType | string,
    allowedEnumTypeValues?: string[],
    groupRate?: GroupRate,
    percentageChangeBetweenAandB?: PercentageChangeBetweenAandB,
    calculations: Array<TemplateCalculation>
}

export interface TemplateResponse {
    templateId: string,
    templateJson: string,
    schemaVersion: string,
    fundingStreamId: string,
    fundingStreamName: string,
    fundingPeriodId: string,
    fundingPeriodName: string,
    name: string,
    status: string,
    publishStatus: string,
    description: string,
    minorVersion: number,
    majorVersion: number,
    version: number,
    isCurrentVersion: boolean,
    authorId: string,
    authorName: string,
    comments: string,
    lastModificationDate: Date
}

export interface FundingStreamWithPeriodsResponse {
    fundingStream: FundingStream,
    fundingPeriods: FundingPeriod[]
}

export interface Template {
    $schema: string,
    schemaVersion: string,
    fundingTemplate: FundingTemplate
}

export interface TemplateContentUpdateCommand {
    templateId: string,
    templateFundingLinesJson: string
}


export enum TemplateStatus {
    Draft = "Draft",
    Published = "Published"
}

export interface GetTemplateVersionsResponse {
    pageResults: TemplateVersionSummary[],
    totalCount: number
}

export interface TemplateVersionSummary {
    authorName: string,
    lastModificationDate: Date,
    fundingStreamId: string,
    fundingStreamName: string,
    fundingPeriodId: string,
    fundingPeriodName: string,
    status: string,
    version: number,
    isCurrentVersion: boolean,
    majorVersion: number,
    minorVersion: number
}

export interface TemplateSearchResult {
    id: string,
    name: string,
    fundingStreamId: string,
    fundingStreamName: string,
    fundingPeriodId: string,
    fundingPeriodName: string,
    lastUpdatedAuthorName: string,
    lastUpdatedDate: Date,
    status: TemplateStatus,
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
    results: TemplateSearchResult[]
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
    fundingLineCode?: string
}

export interface CalculationUpdateModel extends UpdateModel {
    id: string,
    type: CalculationType,
    name: string,
    aggregationType: AggregrationType,
    formulaText: string,
    valueFormat: ValueFormatType,
    allowedEnumTypeValues?: string,
    groupRate?: GroupRate,
    percentageChangeBetweenAandB?: PercentageChangeBetweenAandB
}

export interface CalculationDictionaryItem {
    id: string,
    templateCalculationId: number,
    aggregationType: AggregrationType,
    name: string
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