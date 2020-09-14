import axios, {AxiosResponse} from "axios"
import {ProviderVersionSearchModel} from "../types/Provider/ProviderVersionSearchResults";
import {ProviderSummary} from "../types/ProviderSummary";
import {SpecificationInformation} from "../types/Provider/SpecificationInformation";

let baseURL = "/api/provider";

export async function getProviderByIdAndVersionService(providerId:string, providerVersionId:string) : 
    Promise<AxiosResponse<ProviderSummary>> {
    return axios(`${baseURL}/getproviderbyversionandid/${providerVersionId}/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}
export async function getProviderTransactionsService(specificationId:string, providerId:string) {
    return axios(`${baseURL}/getProviderTransactions/${specificationId}/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}
export async function getProfilingService(fundingStreamId: string, fundingPeriodId: string, providerId: string) {
    return axios(`${baseURL}/${fundingStreamId}/${fundingPeriodId}/${providerId}/profileTotals`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}

export async function getLocalAuthoritiesService(fundingStreamId: string, fundingPeriodId: string, searchText: string) {
    return axios(`${baseURL}/getlocalauthorities/${fundingStreamId}/${fundingPeriodId}/?searchText=${searchText}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function GetProvidersByFundingStreamService(fundingStreamId: string, search: ProviderVersionSearchModel) {
    return axios(`${baseURL}/fundingstreams/${fundingStreamId}/current/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: search
    });
}

export async function getProviderResultsService(providerId: string): Promise<AxiosResponse<SpecificationInformation[]>> {
    return axios(`${baseURL}/getproviderresults/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getProviderSnapshotsForFundingStreamService(fundingStreamId:string) {
    return axios(`/api/providers/fundingStreams/${fundingStreamId}/snapshots`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}