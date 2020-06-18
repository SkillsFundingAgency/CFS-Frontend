import axiosInstance from "../services/axiosInterceptor"

let baseURL = "/api/users";

export async function getUserPermissionsService(specificationId: string) {
    const jobTypes = "RefreshFundingJob,ApproveFundingJob,PublishProviderFundingJob,ApproveFunding";
    return axiosInstance(`${baseURL}/effectivepermissions/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}