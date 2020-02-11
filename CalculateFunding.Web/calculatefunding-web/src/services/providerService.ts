import axios from "axios";

export async function getProviderByIdAndVersionService(providerId:string, providerVersionId:string) {
    return axios(`/api/provider/getproviderbyversionandid/${providerVersionId}/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}
export async function getProviderTransactionsService(specificationId:string, providerId:string) {
    return axios(`/api/provider/getProviderTransactions/${specificationId}/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}