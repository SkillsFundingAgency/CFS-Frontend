import axiosInstance from "../services/axiosInterceptor"

let baseURL = "/api/profiling";

export async function getFutureInstallmentsService(fundingStreamId:string, fundingPeriodId:string) {
    return axiosInstance(`${baseURL}/patterns/fundingStream/${fundingStreamId}/fundingPeriod/${fundingPeriodId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}