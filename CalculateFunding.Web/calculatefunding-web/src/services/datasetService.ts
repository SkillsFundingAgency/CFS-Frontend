import {DatasetDefinitionRequestViewModel} from "../types/Datasets/DatasetDefinitionRequestViewModel";
import {CreateDatasetRequestViewModel} from "../types/Datasets/CreateDatasetRequestViewModel";
import {DatasetSearchRequestViewModel} from "../types/Datasets/DatasetSearchRequestViewModel";
import axios, {AxiosResponse} from "axios"
import {DatasourceVersionSearchModel} from "../types/Datasets/DatasourceVersionSearchModel";
import {RelationshipData} from "../types/Datasets/RelationshipData";
import {UpdateNewDatasetVersionResponseViewModel} from "../types/Datasets/UpdateDatasetRequestViewModel";
import {DataschemaDetailsViewModel} from "../types/Datasets/DataschemaDetailsViewModel";
import {AssignDatasetSchemaRequest} from "../types/Datasets/AssignDatasetSchemaRequest";
import {DatasetDefinition} from "../types/Datasets/DatasetDefinitionResponseViewModel";
import {DatasetEmptyFieldEvaluationOptions} from "../types/Datasets/DatasetEmptyFieldEvaluationOptions";
import {NewDatasetVersionResponseViewModel} from "../types/Datasets/NewDatasetVersionResponseViewModel";
import {DatasetSearchResponseViewModel} from "../types/Datasets/DatasetSearchResponseViewModel";
import {DatasetVersionHistoryViewModel} from "../types/Datasets/DatasetVersionHistoryViewModel";
import {ToggleDatasetSchemaRequest} from "../types/Datasets/ToggleDatasetSchemaRequest";
import {EligibleSpecificationReferenceModel} from "../types/Datasets/EligibleSpecificationReferenceModel";
import {
    CreateDatasetSpecificationRelationshipRequest,
    PublishedSpecificationTemplateMetadata,
    ValidateDefinitionSpecificationRelationshipModel
} from "../types/Datasets/PublishedSpecificationTemplateMetadata";

const baseUrl = "/api/datasets";

export async function getDatasetBySpecificationIdService(specificationId: string) {
    return axios(`${baseUrl}/getdatasetsbyspecificationid/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getDatasetDefinitionsService():
    Promise<AxiosResponse<DatasetDefinition[]>> {
    return axios(`${baseUrl}/get-dataset-definitions/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function assignDatasetSchemaService(request: AssignDatasetSchemaRequest):
    Promise<AxiosResponse<boolean>> {
    return axios(`${baseUrl}/assignDatasetSchema/${request.specificationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: request
    });
}

export async function toggleDatasetRelaionshipService(request: ToggleDatasetSchemaRequest):
    Promise<AxiosResponse<boolean>> {
    return axios(`${baseUrl}/toggleDatasetRelationship/${request.relationshipId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: request.converterEnabled
    });
}

export async function searchDatasetDefinitionsService(request: DatasetDefinitionRequestViewModel) {
    return axios(`/api/dataset-definitions/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: request
    })
}

export async function getDatasetHistoryService(datasetId: string, pageNumber: number, pageSize: number):
    Promise<AxiosResponse<DatasetVersionHistoryViewModel>> {

    return axios(`${baseUrl}/getdatasetversions/${datasetId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        params: {
            pageNumber: pageNumber,
            pageSize: pageSize
        }
    })
}

export async function createDatasetService(request: CreateDatasetRequestViewModel):
    Promise<AxiosResponse<NewDatasetVersionResponseViewModel>> {
    return axios(`${baseUrl}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {
            name: request.name,
            description: request.description,
            dataDefinitionId: request.dataDefinitionId,
            filename: request.filename,
            fundingStreamId: request.fundingStreamId
        }
    })
}

export async function updateDatasetService(fundingStreamId: string, datasetId: string, fileName: string) {
    return axios(`${baseUrl}/${fundingStreamId}/${datasetId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            fileName: fileName
        }
    })
}

export async function uploadDataSourceService(blobUrl: string, file: File, datasetId: string, fundingStreamId: string, authorName: string, authorId: string, definitionId: string, name: string, description: string) {
    return axios(`${blobUrl}`, {
        method: 'PUT',
        headers: {
            "x-ms-blob-type": "BlockBlob",
            "x-ms-meta-datasetId": datasetId,
            "x-ms-meta-fundingStreamId": fundingStreamId,
            "x-ms-meta-authorName": authorName,
            "x-ms-meta-authorId": authorId,
            "x-ms-meta-dataDefinitionId": definitionId,
            "x-ms-meta-filename": file.name,
            "x-ms-meta-name": name,
            "x-ms-meta-description": encodeURI(description),
        },
        data: file
    })
}

export async function uploadDatasetVersionService(request: UpdateNewDatasetVersionResponseViewModel, file: File):
    Promise<AxiosResponse<UpdateNewDatasetVersionResponseViewModel>> {
    return axios(`${request.blobUrl}`, {
        method: 'PUT',
        headers: {
            "x-ms-blob-type": "BlockBlob",
            "x-ms-meta-dataDefinitionId": request.definitionId,
            "x-ms-meta-datasetId": request.datasetId,
            "x-ms-meta-fundingStreamId": request.fundingStreamId,
            "x-ms-meta-authorName": request.author.name,
            "x-ms-meta-authorId": request.author.id,
            "x-ms-meta-filename": file.name,
            "x-ms-meta-name": request.name,
            "x-ms-meta-version": request.version
        },
        data: file
    })
}

export async function validateDatasetService(
    datasetId: string,
    fundingStreamId: string,
    filename: string,
    version: string,
    mergeExisting: boolean,
    description: string,
    changeNote: string,
    datasetEmptyFieldEvaluationOptions: DatasetEmptyFieldEvaluationOptions) {
    return axios(`${baseUrl}/validate-dataset`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {
            datasetId: datasetId,
            fundingStreamId: fundingStreamId,
            filename: filename,
            version: version,
            description: description,
            mergeExistingVersion: mergeExisting,
            comment: changeNote,
            emptyFieldEvaluationOption: datasetEmptyFieldEvaluationOptions
        }
    })
}

export async function getDatasetValidateStatusService(operationId: string) {
    return axios(`/api/dataset-validate-status/${operationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function searchDatasetService(request: DatasetSearchRequestViewModel):
    Promise<AxiosResponse<DatasetSearchResponseViewModel>> {
    return axios(`${baseUrl}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            searchTerm: request.searchTerm,
            pageNumber: request.pageNumber,
            includeFacets: request.includeFacets,
            pageSize: request.pageSize,
            fundingStreams: request.fundingStreams,
            dataSchemas: request.dataSchemas
        }
    })
}

export async function getDatasetsForFundingStreamService(fundingStreamId: string):
    Promise<AxiosResponse<DataschemaDetailsViewModel[]>> {
    return axios(`${baseUrl}/get-datasets-for-fundingstream/${fundingStreamId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
}

export async function getRelationshipData(relationshipId: string): Promise<AxiosResponse<RelationshipData>> {
    return axios(`${baseUrl}/get-datasources-by-relationship-id/${relationshipId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function searchDatasetRelationshipsService(request: DatasetDefinitionRequestViewModel) {
    return axios(`/api/datasetrelationships/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: request
    })
}

export async function assignDataSourceService(relationshipId: string, specificationId: string, datasetVersionId: string) {
    return axios(`${baseUrl}/assign-datasource-version-to-relationship/${specificationId}/${relationshipId}/${datasetVersionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function getExpandedDataSources(relationshipId: string, datasetId: string, searchRequest: DatasourceVersionSearchModel) {
    return axios(`${baseUrl}/expanded-datasources/${relationshipId}/${datasetId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: searchRequest
    })
}

export async function getEligibleSpecificationDetailsForCreatingNewDataset(specificationId: string):
    Promise<AxiosResponse<EligibleSpecificationReferenceModel[]>> {
    return axios(`/api/dataset-specifications/${specificationId}/eligible-specification-references`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
}

export async function getPublishedSpecificationTemplateMetadataForCreatingNewDataset(specificationId: string):
    Promise<AxiosResponse<PublishedSpecificationTemplateMetadata[]>> {
    return axios(`/api/dataset-specifications/${specificationId}/published-specification-template-metadata`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
}

export async function validateDefinitionForCreatingNewDataset(request: ValidateDefinitionSpecificationRelationshipModel):
    Promise<AxiosResponse<ValidateDefinitionSpecificationRelationshipModel[]>> {
    return axios(`/api/datasets/validate-definition-specification-relationship`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: request
    })
}

export async function createDatasetFromReleased(request: CreateDatasetSpecificationRelationshipRequest):
    Promise<AxiosResponse<object>> {
    return axios(`/api/datasets/createRelationship/${request.specificationId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: request
    })
}

export async function getCurrentDatasetVersionByDatasetId(datasetId: string) {
    return axios(`${baseUrl}/get-current-dataset-version-by-dataset-id/${datasetId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function downloadValidateDatasetValidationErrorSasUrl(jobId: string) {
    return axios(`${baseUrl}/download-validate-dataset-error-url/${jobId}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
