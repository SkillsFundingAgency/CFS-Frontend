import { PublishStatus } from "../PublishStatusModel";
import { ValueFormatType } from "../TemplateBuilderDefinitions";

export interface ProviderResultForSpecification {
  specificationId: string;
  specificationName: string;
  fundingStreamId: string;
  fundingStreamName: string;
  fundingLineResults: { [key: number]: FundingLineResult };
  calculationResults: { [key: number]: TemplateCalculationResult };
}

export interface FundingLineResult {
  templateLineId: number;
  name: string;
  value: number | null;
  exceptionMessage: string | null;
  fundingLineCode: string | null;
}

export interface TemplateCalculationResult {
  calculationId: string;
  name: string;
  templateCalculationId: number;
  status: PublishStatus;
  valueFormat: ValueFormatType;
  templateCalculationType: LegacyCalculationType;
  value: number | null;
  exceptionMessage: string | null;
}

export enum LegacyCalculationType {
  Cash = "Cash",
  Rate = "Rate",
  PupilNumber = "Pupil Number",
  Weighting = "Weighting",
  Scope = "Scope",
  Information = "Information",
  Drilldown = "Drilldown",
  PerPupilFunding = "PerPupilFunding",
  LumpSum = "LumpSum",
  ProviderLedFunding = "ProviderLedFunding",
  Adjustment = "Adjustment",
  Number = "Number",
  Boolean = "Boolean",
  Enum = "Enum",
}
