import axios from "axios";
import {AssignDatasetSchemaUpdateViewModel} from "../types/Datasets/AssignDatasetSchemaUpdateViewModel";
import {DatasetDefinitionRequestViewModel} from "../types/Datasets/DatasetDefinitionRequestViewModel";
import {DatasetSearchRequestViewModel} from "../types/Datasets/DatasetSearchRequestViewModel";

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


