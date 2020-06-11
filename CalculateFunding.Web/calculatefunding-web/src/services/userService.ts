import axios from "axios";

let baseURL = "/api/users";

export async function getUserPermissionsService(specificationId: string) {
    const jobTypes = "RefreshFundingJob,ApproveFundingJob,PublishProviderFundingJob,ApproveFunding";
    return axios(`${baseURL}/effectivepermissions/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}