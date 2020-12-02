import axios, {AxiosResponse} from "axios"
import {FundingLineProfile} from "../types/PublishedProvider/FundingLineProfile";
import {ApplyCustomProfileRequest} from "../types/PublishedProvider/ApplyCustomProfileRequest";
import {PublishedProviderFundingStructure} from "../types/FundingStructureItem";

const baseUrl = "/api/publishedproviderfundinglinedetails";

export async function getFundingLinePublishedProviderDetails(specificationId: string, providerId: string,
    fundingStreamId: string, fundingLineCode: string): Promise<AxiosResponse<FundingLineProfile>> {
    return axios.get<FundingLineProfile>(`${baseUrl}/${specificationId}/${providerId}/${fundingStreamId}/${fundingLineCode}`);
}

export async function applyCustomProfile(profile: ApplyCustomProfileRequest) {
    return axios(`${baseUrl}/customprofiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: profile
    });
}

export async function getCurrentPublishedProviderFundingStructureService(specificationId: string, fundingStreamId: string, providerId: string): 
    Promise<AxiosResponse<PublishedProviderFundingStructure>> {
    return axios(`/api/specifications/${specificationId}/publishedProviders/${providerId}/fundingStreams/${fundingStreamId}/fundingStructure`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}