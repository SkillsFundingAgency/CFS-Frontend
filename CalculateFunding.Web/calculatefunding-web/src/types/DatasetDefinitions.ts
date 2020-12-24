export interface FieldDefinition {
    id: string;
    name: string;
    identifierFieldType: string;
    matchExpression?: string;
    description: string;
    type: string;
    required: boolean;
    min?: number;
    max?: number;
    mustMatch?: string[];
    isAggregable: boolean;
}

export interface TableDefinition {
    id: string;
    name: string;
    description: string;
    fieldDefinitions: FieldDefinition[];
}

export interface DatasetDefinition {
    description: string;
    tableDefinitions: TableDefinition[];
    id: string;
    name: string;
}


