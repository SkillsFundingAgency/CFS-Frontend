import axiosInstance from "../services/axiosInterceptor"

let baseURL = "/api/provider";

export async function getProviderByIdAndVersionService(providerId:string, providerVersionId:string) {
    return axiosInstance(`${baseURL}/getproviderbyversionandid/${providerVersionId}/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}
export async function getProviderTransactionsService(specificationId:string, providerId:string) {
    return axiosInstance(`${baseURL}/getProviderTransactions/${specificationId}/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}
export async function getProfilingService(fundingStreamId: string, fundingPeriodId: string, providerId: string) {
    return axiosInstance(`${baseURL}/${fundingStreamId}/${fundingPeriodId}/${providerId}/profileTotals`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}

export async function getLocalAuthoritiesService(fundingStreamId: string, fundingPeriodId: string, searchText: string) {
    return axiosInstance(`${baseURL}/getlocalauthorities/${fundingStreamId}/${fundingPeriodId}/?searchText=${searchText}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}