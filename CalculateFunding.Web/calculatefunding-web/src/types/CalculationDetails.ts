﻿import { Author } from "./Calculations/Author";
import { CalculationDataType } from "./Calculations/CalculationCompilePreviewResponse";
import { CalculationType } from "./CalculationSearchResponse";
import { PublishStatus } from "./PublishStatusModel";
import { CalculationType as TemplateCalculationType } from "./TemplateBuilderDefinitions";
import { ValueType } from "./ValueType";

export interface CalculationDetails {
  author: Author | null;
  calculationType: CalculationType;
  dataType: CalculationDataType;
  description?: string | undefined;
  fundingStreamId: string;
  id: string;
  lastUpdated: Date;
  name: string;
  namespace: string;
  publishStatus: PublishStatus;
  sourceCode: string;
  sourceCodeName: string;
  specificationId: string;
  wasTemplateCalculation: boolean;
  valueType: ValueType;
  version?: number | undefined;
  templateCalculationId?: number;
  templateCalculationType?: TemplateCalculationType;
}

export interface CalculationSummary {
  calculationType: CalculationType;
  status: PublishStatus;
  version: number;
  calculationValueType: CalculationValueType;
  id: string;
  name: string;
}

export enum CalculationValueType {
  Number = "Number",
  Percentage = "Percentage",
  Currency = "Currency",
  Boolean = "Boolean",
  String = "String",
}
