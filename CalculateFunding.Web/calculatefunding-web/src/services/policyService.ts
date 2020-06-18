import axiosInstance from "../services/axiosInterceptor"

let baseURL = "/api/policy";

export async function getFundingStreamsService() {
    return axiosInstance(`${baseURL}/fundingstreams`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}