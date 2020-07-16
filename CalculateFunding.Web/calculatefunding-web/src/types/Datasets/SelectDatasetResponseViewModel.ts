export interface Definition {
    description: string;
    id: string;
    name: string;
}

export interface Content {
    definition: Definition;
    datasetName: string;
    version: number;
    datasetId: string;
    relationshipDescription: string;
    isProviderData: boolean;
    isLatestVersion: boolean;
    id: string;
    name: string;
}

export interface SelectDatasetResponseViewModel {
    statusCode: number;
    content: Content[];
}