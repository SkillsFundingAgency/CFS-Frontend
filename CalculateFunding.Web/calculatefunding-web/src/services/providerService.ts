import axios, {AxiosResponse} from "axios"
import {ProviderVersionSearchModel} from "../types/Provider/ProviderVersionSearchResults";
import {ProviderSummary, ProviderTransactionSummary} from "../types/ProviderSummary";
import {SpecificationInformation} from "../types/Provider/SpecificationInformation";
import {PublishedProviderError} from "../types/PublishedProviderError";

const baseURL = "/api/provider";

export async function getProviderByIdAndVersionService(providerId:string, providerVersionId:string): 
    Promise<AxiosResponse<ProviderSummary>> {
    return axios.get<ProviderSummary>(`${baseURL}/getProviderByVersionAndId/${providerVersionId}/${providerId}`);
}

export async function getProviderFundingLineErrors(specificationId: string, fundingStreamId: string, providerId: string): 
    Promise<AxiosResponse<PublishedProviderError[]>> {
    return axios.get<PublishedProviderError[]>(`/api/specifications/${specificationId}/publishedProviders/${providerId}/fundingStreams/${fundingStreamId}/errors`);
}

export async function getProviderTransactionsService(specificationId:string, providerId:string): 
    Promise<AxiosResponse<ProviderTransactionSummary>> {
    return axios.get<ProviderTransactionSummary>(`${baseURL}/getProviderTransactions/${specificationId}/${providerId}`);
}

export async function getReleasedProfileTotalsService(fundingStreamId: string, fundingPeriodId: string, providerId: string) {
    return axios.get(`${baseURL}/${fundingStreamId}/${fundingPeriodId}/${providerId}/profileTotals`);
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