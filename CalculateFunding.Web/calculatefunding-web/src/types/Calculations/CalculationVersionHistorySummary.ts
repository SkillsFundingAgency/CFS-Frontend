import {Author} from "./Author";

export interface CalculationVersionHistorySummary {
    calculationId: string;
    name: string;
    sourceCode: string;
    calculationType: string;
    sourceCodeName: string;
    namespace: string;
    wasTemplateCalculation: boolean;
    lastUpdated: Date;
    author: Author;
    version: number;
    publishStatus: string;
    description?: any;
}
