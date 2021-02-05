import axios from "axios";

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