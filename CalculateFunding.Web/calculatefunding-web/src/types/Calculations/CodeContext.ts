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

export interface ITypeInformationResponse {
    name: string;
    description: string;
    type: string;
    methods: Array<IMethodInformationResponse>;
    properties: Array<IPropertyInformationResponse>;
    enumValues: Array<string>;
}

export interface IMethodInformationResponse {
    name: string;
    friendlyName: string;
    description: string;
    returnType: string;
    returnTypeClass:string;
    returnTypeIsNullable:boolean;
    entityId: string;
    isCustom: boolean;
    parameters: Array<IParameterInformationResponse>;
}

export interface IParameterInformationResponse {
    name: string;
    description: string;
    type: string;
}

export interface IPropertyInformationResponse {
    name: string;
    friendlyName: string;
    description: string;
    type: string;
    isAggregable: boolean;
    children: Array<IPropertyInformationResponse>;
}
