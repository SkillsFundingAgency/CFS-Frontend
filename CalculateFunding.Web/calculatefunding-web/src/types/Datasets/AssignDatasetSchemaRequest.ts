export interface AssignDatasetSchemaRequest {
    name: string,
    description: string,
    datasetDefinitionId: string,
    specificationId: string,
    isSetAsProviderData: boolean,
    addAnotherAfter: boolean
}