import axios, {AxiosResponse} from "axios"
import {FundingLineProfileViewModel} from "../types/PublishedProvider/FundingLineProfile";
import {ApplyCustomProfileRequest} from "../types/PublishedProvider/ApplyCustomProfileRequest";
import {PublishedProviderFundingStructure} from "../types/FundingStructureItem";

const baseUrl = "/api/publishedproviderfundinglinedetails";

export async function getFundingLinePublishedProviderDetails(specificationId: string, providerId: string,
    fundingStreamId: string, fundingLineCode: string, fundingPeriodId: string): Promise<AxiosResponse<FundingLineProfileViewModel>> {
    return axios.get<FundingLineProfileViewModel>(`${baseUrl}/${specificationId}/${providerId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineCode}`);
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