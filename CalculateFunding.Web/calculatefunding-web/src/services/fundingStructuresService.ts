import axios, {AxiosResponse} from "axios"
import {FundingStructureItem} from "../types/FundingStructureItem";

const baseURL = "/api/fundingStructures";

export async function getFundingLineStructureService(
    specificationId: string, 
    fundingPeriodId: string, 
    fundingStreamId: string): Promise<AxiosResponse<FundingStructureItem[]>> {
    return axios(`${baseURL}/specifications/${specificationId}/fundingPeriods/${fundingPeriodId}/fundingStreams/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getFundingLineStructureByProviderService(
    specificationId: string, 
    fundingPeriodId: string, 
    fundingStreamId: string, 
    providerId: string): Promise<AxiosResponse<FundingStructureItem[]>> {
    return axios(`${baseURL}/specifications/${specificationId}/fundingPeriods/${fundingPeriodId}/fundingStreams/${fundingStreamId}/provider/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getFundingStructuresWithCalculationResultService(
    specificationId: string, 
    fundingPeriodId: string, 
    fundingStreamId: string): Promise<AxiosResponse<FundingStructureItem[]>> {
    return axios(`${baseURL}/results/specifications/${specificationId}/fundingPeriods/${fundingPeriodId}/fundingStreams/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}