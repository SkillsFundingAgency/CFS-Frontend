import {Calculation} from "../CalculationSummary";

export interface PreviewResponse {
   // calculation: Calculation,
    compilerOutput: CompilerOutput
}

export interface CompilerOutputViewModel{
 buildSuccess: boolean;
 compileRun: boolean;
 previewResponse: PreviewResponse
}

export interface CompilerMessage {
    severity: string;
    message: string;
    location: Location;
}

export interface SourceFile {
    fileName: string;
    sourceCode: string;
}

export interface CompilerOutput {
    success: boolean;
    compilerMessages: CompilerMessage[];
    sourceFiles: SourceFile[];
}
