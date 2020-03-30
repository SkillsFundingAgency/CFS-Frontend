export interface Parameter {
    name: string;
    description: string;
    type: string;
}

export interface Method {
    name: string;
    friendlyName: string;
    description: string;
    parameters: Parameter[];
    returnType: string;
    entityId: string;
    isCustom: boolean;
}

export interface Property {
    name: string;
    friendlyName: string;
    description: string;
    type: string;
    isAggregable: string;
    children?: any;
}

export interface CodeContext {
    name: string;
    description: string;
    methods: Method[];
    properties: Property[];
    type: string;
}
