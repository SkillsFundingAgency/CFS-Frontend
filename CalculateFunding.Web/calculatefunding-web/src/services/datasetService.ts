import axios from "axios";

export async  function getDatasetBySpecificationIdService(specificationId: string) {
    return axios(`/api/datasets/getdatasetsbyspecificationid/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}