import {PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";
import axios, {AxiosResponse} from "axios"
import {PublishedProviderSearchResult} from "../types/PublishedProvider/PublishedProviderSearchResult";

const baseUrl = "/api/publishedprovider";

export async function searchForPublishedProviderResults(criteria: PublishedProviderSearchRequest): 
    Promise<AxiosResponse<PublishedProviderSearchResult>> {
    return axios(`${baseUrl}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });
}
export async function getAllProviderVersionIdsForSearch(criteria: PublishedProviderSearchRequest): 
    Promise<AxiosResponse<string[]>> {
    return axios(`${baseUrl}/search/ids`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });
}