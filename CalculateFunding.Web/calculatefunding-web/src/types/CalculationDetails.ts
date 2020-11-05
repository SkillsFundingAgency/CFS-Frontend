import {ValueType} from "./ValueType";
import {Author} from "./Calculations/Author";
import {PublishStatus} from "./PublishStatusModel";
import {CalculationType} from "./CalculationSearchResponse";

export interface CalculationDetails {
    id: string;
    name: string;
    specificationId: string;
    fundingStreamId: string;
    sourceCode: string;
    calculationType: CalculationType;
    sourceCodeName: string;
    namespace: string;
    wasTemplateCalculation: boolean;
    valueType: ValueType;
    lastUpdated: Date;
    author: Author | null;
    version?: number | undefined;
    publishStatus: PublishStatus;
    description?: string | undefined;
}

export interface CalculationSummary {
    calculationType: CalculationType,
    publishStatus: PublishStatus,
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