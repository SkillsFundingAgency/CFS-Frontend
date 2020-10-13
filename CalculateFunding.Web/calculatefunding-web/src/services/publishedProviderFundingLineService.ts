import axios, {AxiosResponse} from "axios"
import {FundingLineProfile} from "../types/PublishedProvider/FundingLineProfile";
import {ApplyCustomProfileRequest} from "../types/PublishedProvider/ApplyCustomProfileRequest";

const baseUrl = "/api/publishedproviderfundinglinedetails";

export async function getFundingLinePublishedProviderDetails(specificationId: string, providerId: string,
    fundingStreamId: string, fundingLineCode: string): Promise<AxiosResponse<FundingLineProfile>> {
    return axios(`${baseUrl}/${specificationId}/${providerId}/${fundingStreamId}/${fundingLineCode}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
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