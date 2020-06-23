import axios from "axios"

let baseURL = "/api/jobs";

export async function getLatestJobForSpecificationService(specificationId: string, jobTypes: string) {
    return axios(`${baseURL}/${specificationId}/latest/${jobTypes}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}
export async function getLastUpdateJobForSpecificationService(specificationId: string) {
    const jobTypes = "RefreshFundingJob";
    return axios(`${baseURL}/${specificationId}/last-updated/${jobTypes}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}