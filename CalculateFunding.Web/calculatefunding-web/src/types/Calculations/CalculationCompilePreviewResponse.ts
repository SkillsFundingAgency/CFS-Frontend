import {Author} from "./Author";
import {Reference} from "../Reference";
import {CalculationType} from "../CalculationSearchResponse";
import {CalculationDetails} from "../CalculationDetails";

export interface CalculationCompilePreviewResponse {
    compilerOutput: CompilerOutput
    calculation: CalculationDetails,
    previewProviderCalculation: PreviewProviderCalculationResponseModel
}

export interface PreviewProviderCalculationResponseModel {
    providerName: string;
    calculationResult: CalculationResult;
}

export interface CalculationResult {
    calculation: Reference;
    value: object | undefined;
    exceptionType: string,
    exceptionMessage: string,
    exceptionStackTrace: string,
    calculationType: CalculationType,
    calculationDataType: CalculationDataType
}

export enum CalculationDataType
{
    Decimal,
    String,
    Boolean,
    Enum,
}

export interface CompilerOutput {
    success: boolean;
    compilerMessages: CompilerMessage[];
    sourceFiles: SourceFile[];
}

export interface CompilerMessage {
    severity: CompileErrorSeverity;
    message: string;
    location: Location;
}

export enum CompileErrorSeverity
{
    Hidden,
    Info,
    Warning,
    Error,
}

export interface PreviewCompileRequestViewModel{
    sourceCode: string,
    providerId: string,
    dataType: CalculationDataType
}

export interface CompilerOutputViewModel {
    hasCodeBuiltSuccessfully: boolean | undefined;
    previewResponse: CalculationCompilePreviewResponse | undefined
    isProviderValid: boolean | undefined;
    providerRuntimeException: string;
    providerName: string;
    providerResult: CalculationResult | undefined;
}

export interface SourceFile {
    fileName: string;
    sourceCode: string;
}


export interface Location {
    startChar: number;
    endChar: number;
    startLine: number;
    endLine: number;
    owner: Author;
}