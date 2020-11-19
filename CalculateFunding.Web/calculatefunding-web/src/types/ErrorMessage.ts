export interface ErrorMessage {
    id: number,
    fieldName?: string,
    description?: string,
    suggestion?: string,
    message: string,
    validationErrors?: ValidationErrors | undefined
}

export interface ValidationErrors {
    [key: string]: string[]
}