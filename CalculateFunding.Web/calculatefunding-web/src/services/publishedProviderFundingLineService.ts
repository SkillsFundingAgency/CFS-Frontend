import axios, {AxiosResponse} from "axios"
import {FundingLineProfile} from "../types/PublishedProvider/FundingLineProfile";

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