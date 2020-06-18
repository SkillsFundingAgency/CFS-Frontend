import axiosInstance from "../services/axiosInterceptor"

let baseURL = "/api/fundingstructures";

export async function getFundingLineStructureService(specificationId: string, fundingPeriodId: string, fundingStreamId: string) {
    return axiosInstance(`${baseURL}/specifications/${specificationId}/fundingperiods/${fundingPeriodId}/fundingstreams/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}