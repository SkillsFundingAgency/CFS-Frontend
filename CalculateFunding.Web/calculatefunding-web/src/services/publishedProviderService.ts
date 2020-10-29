import {PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";
import axios, {AxiosResponse} from "axios"
import {PublishedProviderSearchResults} from "../types/PublishedProvider/PublishedProviderSearchResults";
import {PublishedProviderIdsSearchRequest} from "../types/publishedProviderIdsSearchRequest";

const baseUrl = "/api/publishedprovider";

export async function searchForPublishedProviderResults(criteria: PublishedProviderSearchRequest): 
    Promise<AxiosResponse<PublishedProviderSearchResults>> {
    return axios(`${baseUrl}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });
}
export async function getAllProviderVersionIdsForSearch(criteria: PublishedProviderIdsSearchRequest): Promise<AxiosResponse<string[]>> {
    return axios(`${baseUrl}/search/ids`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });
}
export async function getPublishedProviderErrors(specificationId: string) {
    return axios.get<string[]>(`/api/publishedprovidererrors/${specificationId}`);
}