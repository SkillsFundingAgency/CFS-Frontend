import {PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";
import axios, {AxiosResponse} from "axios"
import {PublishProviderSearchResult} from "../types/PublishedProvider/PublishProviderSearchResult";

const baseUrl = "/api/publishedprovider";

export async function searchForPublishedProviderResults(criteria: PublishedProviderSearchRequest): 
    Promise<AxiosResponse<PublishProviderSearchResult>> {
    return axios(`${baseUrl}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });
}
export async function searchForPublishedProviderIds(criteria: PublishedProviderSearchRequest): 
    Promise<AxiosResponse<string[]>> {
    return axios(`${baseUrl}/search/ids`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });
}