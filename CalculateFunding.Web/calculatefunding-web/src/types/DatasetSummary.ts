export interface DatasetSummary {
    statusCode: number;
    content: Content[];
}
export interface Definition {
    description: string;
    id: string;
    name: string;
}

export interface Content {
    definition: Definition;
    relationshipDescription: string;
    isProviderData: boolean;
    id: string;
    name: string;
}