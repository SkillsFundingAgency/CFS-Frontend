import {ValueType} from "./ValueType";
import {Author} from "./Calculations/Author";
import {PublishStatus} from "./PublishStatusModel";
import {CalculationType} from "./CalculationSearchResponse";
import { CalculationDataType } from "./Calculations/CalculationCompilePreviewResponse";

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
}

export interface CalculationSummary {
    calculationType: CalculationType,
    status: PublishStatus,
    version: number,
    calculationValueType: CalculationValueType
}

export enum CalculationValueType {
    Number = "Number",
    Percentage = "Percentage",
    Currency = "Currency",
    Boolean = "Boolean",
    String = "String"
}