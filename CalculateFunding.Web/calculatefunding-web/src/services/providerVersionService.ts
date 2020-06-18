import axiosInstance from "../services/axiosInterceptor"

let baseURL = "/api/providerversions";

export async function getProviderByFundingStreamIdService(fundingStreamId:string) {
    return axiosInstance(`${baseURL}/getbyfundingstream/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}