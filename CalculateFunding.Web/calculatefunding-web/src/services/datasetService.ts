import {AssignDatasetSchemaUpdateViewModel} from "../types/Datasets/AssignDatasetSchemaUpdateViewModel";
import {DatasetDefinitionRequestViewModel} from "../types/Datasets/DatasetDefinitionRequestViewModel";
import {CreateDatasetRequestViewModel} from "../types/Datasets/CreateDatasetRequestViewModel";
import {DatasetSearchRequestViewModel} from "../types/Datasets/DatasetSearchRequestViewModel";
import axios from "axios"
import {DatasourceVersionSearchModel} from "../types/Datasets/DatasourceVersionSearchModel";

const baseUrl = "/api/datasets";

export async function getDatasetBySpecificationIdService(specificationId: string) {
    return axios(`${baseUrl}/getdatasetsbyspecificationid/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getDatasetDefinitionsService() {
    return axios(`${baseUrl}/get-dataset-definitions/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function assignDatasetSchemaUpdateService(name: string, description: string, dataSchemaId: string, specificationId: string, isSetAsProviderData: boolean) {
    let data: AssignDatasetSchemaUpdateViewModel = {
        datasetDefinitionId: dataSchemaId,
        description: description,
        name: name,
        isSetAsProviderData: isSetAsProviderData
    };
    return axios(`${baseUrl}/assignDatasetSchema/${specificationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    });
}

export async function searchDatasetDefinitionsService(request: DatasetDefinitionRequestViewModel) {
    return axios(`/api/dataset-definitions/search`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            searchTerm: request.searchTerm,
            pageNumber: request.pageNumber,
            includeFacets: request.includeFacets,
            pageSize: request.pageSize
        }
    })
}

export async function getDatasetHistoryService(datasetId: string, pageNumber: number, pageSize: number) {
    return axios(`${baseUrl}/getdatasetversions/${datasetId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            pageNumber: pageNumber,
            pageSize: pageSize
        }
    })
}

export async function createDatasetService(request: CreateDatasetRequestViewModel) {
    return axios(`${baseUrl}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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

export async function uploadDatasetVersionService(blobUrl: string, file: File, datasetId: string, fundingStreamId: string, authorName: string, authorId: string, definitionId: string, name: string, version: string) {
    return axios(`${blobUrl}`, {
        method: 'PUT',
        headers: {
            "x-ms-blob-type": "BlockBlob",
            "x-ms-meta-dataDefinitionId": definitionId,
            "x-ms-meta-datasetId": datasetId,
            "x-ms-meta-fundingStreamId": fundingStreamId,
            "x-ms-meta-authorName": authorName,
            "x-ms-meta-authorId": authorId,
            "x-ms-meta-filename": file.name,
            "x-ms-meta-name": name,
            "x-ms-meta-version": version,
        },
        data: file
    })
}

export async function validateDatasetService(datasetId: string, fundingStreamId: string, filename: string, version: string, description: string, changeNote: string) {
    return axios(`${baseUrl}/validate-dataset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            datasetId: datasetId,
            fundingStreamId: fundingStreamId,
            filename: filename,
            version: version,
            description: description,
            comment: changeNote
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

export async function searchDatasetService(request: DatasetSearchRequestViewModel) {
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

export async function getDatasetsForFundingStreamService(fundingStreamId: string) {
    return axios(`${baseUrl}/get-datasets-for-fundingstream/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function getDatasourcesByRelationshipIdService(relationshipId: string) {
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

export async function getExpandedDataSources(relationshipId:string, searchRequest: DatasourceVersionSearchModel) {
    return axios(`${baseUrl}/expanded-datasources/${relationshipId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: searchRequest
    })
}
