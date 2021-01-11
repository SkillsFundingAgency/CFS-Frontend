import axios, {AxiosResponse} from "axios"
import {FundingLineProfileViewModel} from "../types/PublishedProvider/FundingLineProfile";
import {ApplyCustomProfileRequest} from "../types/PublishedProvider/ApplyCustomProfileRequest";

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