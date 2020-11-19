import axios, {AxiosResponse} from "axios"
import {SaveReleaseTimetableViewModel} from "../types/SaveReleaseTimetableViewModel";
import {ReleaseTimetableSummary} from "../types/ReleaseTimetableSummary";
import {PublishedProviderFundingCount} from "../types/PublishedProvider/PublishedProviderFundingCount";
import {JobCreatedResponse} from "../types/JobCreatedResponse";

export async function getFundingSummaryForApprovingService(specificationId: string, publishedProviderIds: string[]): 
    Promise<AxiosResponse<PublishedProviderFundingCount>> {
    return axios(`/api/specs/${specificationId}/funding-summary-for-approval`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {publishedProviderIds: publishedProviderIds}
    });
}

export async function getFundingSummaryForReleasingService(specificationId: string, publishedProviderIds: string[]): 
    Promise<AxiosResponse<PublishedProviderFundingCount>> {
    return axios(`/api/specs/${specificationId}/funding-summary-for-release`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {publishedProviderIds: publishedProviderIds}
    });
}

export async function getReleaseTimetableForSpecificationService(specificationId: string): 
    Promise<AxiosResponse<ReleaseTimetableSummary>> {
    return axios(`/api/publish/getTimetable/${specificationId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
}

export async function saveReleaseTimetableForSpecificationService(saveReleaseTimetable: SaveReleaseTimetableViewModel) {
    return axios(`/api/publish/saveTimetable`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: saveReleaseTimetable
    });
}

export async function preValidateForRefreshFundingService(specificationId: string): 
    Promise<AxiosResponse<string[]>> {
    return axios(`/api/specs/${specificationId}/validate-for-refresh`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    });
}

export async function refreshSpecificationFundingService(specificationId: string): 
    Promise<AxiosResponse<JobCreatedResponse>> {
    return axios(`/api/specs/${specificationId}/refresh`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    });
}

export async function approveSpecificationFundingService(specificationId: string): 
    Promise<AxiosResponse<JobCreatedResponse>> {
    return axios(`/api/specs/${specificationId}/approve`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    });
}

export async function releaseSpecificationFundingService(specificationId: string): 
    Promise<AxiosResponse<JobCreatedResponse>> {
        return axios(`/api/specs/${specificationId}/release`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
}

export async function approveProvidersFundingService(specificationId: string, providers: string[]): 
    Promise<AxiosResponse<JobCreatedResponse>> {
    return axios(`/api/specs/${specificationId}/funding-approval/providers`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: {publishedProviderIds: providers}
    });
}

export async function releaseProvidersFundingService(specificationId: string, providers: string[]): 
    Promise<AxiosResponse<JobCreatedResponse>> {
        return axios(`/api/specs/${specificationId}/funding-release/providers`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            data: {publishedProviderIds: providers}
        });
}

