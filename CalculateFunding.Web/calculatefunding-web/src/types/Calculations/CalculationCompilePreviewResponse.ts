import {Author} from "./Author";

export interface CalculationCompilePreviewResponse {
    compilerOutput: CompilerOutput
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

export interface CompilerOutputViewModel {
    hasCodeBuiltSuccessfully: boolean | undefined;
    previewResponse: CalculationCompilePreviewResponse | undefined
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