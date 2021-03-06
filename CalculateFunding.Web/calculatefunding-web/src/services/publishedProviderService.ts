import {PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";
import axios, {AxiosResponse} from "axios"
import {PublishedProviderSearchResults} from "../types/PublishedProvider/PublishedProviderSearchResults";
import {PublishedProviderIdsSearchRequest} from "../types/publishedProviderIdsSearchRequest";
import {BatchUploadResponse} from "../types/PublishedProvider/BatchUploadResponse";
import {JobCreatedResponse} from "../types/JobCreatedResponse";
import {BatchValidationRequest} from "../types/PublishedProvider/BatchValidationRequest";

const baseUrl = "/api/publishedProviders";

export async function uploadBatchOfPublishedProviders(file: File): 
    Promise<AxiosResponse<BatchUploadResponse>> {
    
    const data = new FormData();
    data.append('file', file);
    
    return axios(`${baseUrl}/batch`, {
        method: 'POST',
        data
    });
}

export async function validatePublishedProvidersByBatch(request: BatchValidationRequest): 
    Promise<AxiosResponse<JobCreatedResponse>> {
    return axios(`${baseUrl}/batch/validate`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        data: request
    });
}

export async function getPublishedProvidersByBatch(batchId: string): 
    Promise<AxiosResponse<string[]>> {
    return axios(`${baseUrl}/batch/${batchId}`, {
        method: 'GET',
        headers: {"Content-Type": "application/json"}
    });
}

export async function searchForPublishedProviderResults(criteria: PublishedProviderSearchRequest): 
    Promise<AxiosResponse<PublishedProviderSearchResults>> {
    return axios(`${baseUrl}/search`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        data: criteria
    });
}

export async function getAllProviderVersionIdsForSearch(criteria: PublishedProviderIdsSearchRequest): 
    Promise<AxiosResponse<string[]>> {
    return axios(`${baseUrl}/search/ids`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        data: criteria
    });
}

export async function getPublishedProviderErrors(specificationId: string): 
    Promise<AxiosResponse<string[]>> {
    return axios.get<string[]>(`/api/specs/${specificationId}/provider-errors`);
}