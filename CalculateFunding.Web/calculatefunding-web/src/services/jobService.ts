import axiosInstance from "../services/axiosInterceptor"

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
    return axiosInstance(`${baseURL}/${specificationId}/last-updated/${jobTypes}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}