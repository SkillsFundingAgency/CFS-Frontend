import axios from "axios";

let baseURL = "/api/jobs";

export async function GetLatestJobForSpecification(specificationId: string) {
    const jobTypes = "RefreshFundingJob,ApproveFundingJob,PublishProviderFundingJob,ApproveFunding";
    return axios(`${baseURL}/${specificationId}/latest/${jobTypes}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}