import axios, {AxiosResponse} from "axios"
import {FundingLineChangeViewModel} from "../types/PublishedProvider/FundingLineProfile";
import {FundingLineProfile} from "../types/FundingLineProfile";

let baseURL = "/api/publishedproviderfundinglinedetails";

export async function getCurrentProfileConfigService(
    specificationId: string,
    providerId: string,
    fundingStreamId: string) {
    return axios.get<FundingLineProfile[]>(`${baseURL}/${specificationId}/${providerId}/${fundingStreamId}`);
}

export async function getPreviousProfilesForSpecificationForProviderForFundingLine(queryKey: string, specificationId: string, providerId: string, fundingStreamId: string, fundingLineCode: string)
    : Promise<FundingLineChangeViewModel> {
    const {data} = await axios(`${baseURL}/${specificationId}/${providerId}/${fundingStreamId}/${fundingLineCode}/changes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    return data;
}

export async function getPreviousProfileExistsForSpecificationForProviderForFundingLine(queryKey: string, specificationId: string, providerId: string, fundingStreamId: string, fundingLineCode: string)
    : Promise<boolean> {
    const {data} = await axios(`${baseURL}/${specificationId}/${providerId}/${fundingStreamId}/${fundingLineCode}/change-exists`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    return data;
}