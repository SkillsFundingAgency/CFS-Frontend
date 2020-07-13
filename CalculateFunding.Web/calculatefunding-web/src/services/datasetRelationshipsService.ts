import axios from "axios";
import {DatasetRelationshipSearchRequestViewModel} from "../types/Datasets/DatasetRelationshipSearchRequestViewModel";

const baseUrl = "/api/datasetrelationships";

export async function searchDatasetRelationships(specificationId: string) {
    return axios(`${baseUrl}/get-sources`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            specificationId: specificationId
        }
    })
}