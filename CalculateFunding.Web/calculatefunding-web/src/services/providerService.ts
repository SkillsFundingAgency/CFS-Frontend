import axios from "axios"
import {TemplateSearchRequest} from "../types/searchRequestViewModel";
import {SearchMode} from "../types/SearchMode";
import {useState} from "react";
import {ProviderVersionSearchModel} from "../types/Provider/ProviderVersionSearchResults";

let baseURL = "/api/provider";

export async function getProviderByIdAndVersionService(providerId:string, providerVersionId:string) {
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

export async function getProviderResultsService(providerId: string) {
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