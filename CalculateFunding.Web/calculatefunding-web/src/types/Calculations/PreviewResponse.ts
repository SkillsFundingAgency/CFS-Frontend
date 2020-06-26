export interface PreviewResponse {
    compilerOutput: CompilerOutput
}

export interface CompilerOutputViewModel {
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

export interface Location {
    startChar: number;
    endChar: number;
    startLine: number;
    endLine: number;
    owner: {
        id: string;
        name: string;
    }
}
