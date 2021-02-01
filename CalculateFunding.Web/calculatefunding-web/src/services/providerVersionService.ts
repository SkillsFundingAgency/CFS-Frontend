import axios, {AxiosResponse} from "axios"
import {CoreProviderSummary} from "../types/CoreProviderSummary";

const baseURL = "/api/providerVersions";

export async function getCoreProvidersByFundingStream(fundingStreamId: string):
    Promise<AxiosResponse<CoreProviderSummary[]>> {
    return axios(`${baseURL}/getByFundingStream/${fundingStreamId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
}