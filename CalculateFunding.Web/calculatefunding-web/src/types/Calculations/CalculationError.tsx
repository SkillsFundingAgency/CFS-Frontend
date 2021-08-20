import {AxiosError} from "axios";

export interface CalculationError{
    id: string;
    specificationId: string;
    datasetRelationshipId: string;
    datasetRelationshipName: string;
    datasetFieldId: string;
    datasetFieldName: string;
    datasetDatatype: DatasetDataType;
    isReleasedData: boolean;
    title: string;
    itemType: string;
    enumValueName: string;
    fundingLineId?: number;
    fundingStreamId?: any;
    templateCalculationId: number;
    codeReference: string;
    fundingLineName: string;
    templateCalculations: ObsoleteCalculationSummary[];
    additionalCalculations: ObsoleteCalculationSummary[];
}

export interface CalculationErrorQueryResult {
    calculationErrors: CalculationError[] | undefined,
    calculationErrorCount: number,
    isLoadingCalculationErrors: boolean,
    errorCheckingForCalculationErrors: AxiosError | null,
    haveErrorCheckingForCalculationErrors: boolean,
    isFetchingCalculationErrors: boolean,
    areCalculationErrorsFetched: boolean,
    clearCalculationErrorsFromCache: () => Promise<void>
}

export enum ObsoleteItemType{
    EnumValue = "EnumValue",
    FundingLine = "FundingLine",
    Calculation = "Calculation",
    DatasetRelationship = "DatasetRelationship",
    DatasetField = "DatasetField",
}

export interface ObsoleteCalculationSummary{
    id:string,
    name:string,
}

export enum DatasetDataType {
    Boolean = "Boolean",
    Char = "Char",
    Byte = "Byte",
    Integer = "Integer",
    Float = "Float",
    Decimal = "Decimal",
    DateTime = "DateTime",
    String = "String",
    NullableOfInteger = "NullableOfInteger",
    NullableOfDecimal = "NullableOfDecimal",
    NullableOfBoolean = "NullableOfBoolean"
}