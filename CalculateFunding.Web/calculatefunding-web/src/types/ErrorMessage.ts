export interface ErrorMessage {
    id: number,
    fieldName?: string,
    description?: string,
    suggestion?: string,
    message: string
}