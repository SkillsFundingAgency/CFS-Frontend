import axios, {AxiosResponse} from "axios"
import {PublishedFundingTemplate} from "../types/TemplateBuilderDefinitions";
import {FundingConfiguration} from "../types/FundingConfiguration";

let baseURL = "/api/policy";

export async function getFundingStreamsService(securityTrimmed: boolean = false) {
    return axios(`${baseURL}/fundingstreams/${securityTrimmed}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getPublishedTemplatesByStreamAndPeriod(fundingStreamId: string, fundingPeriodId: string): 
    Promise<AxiosResponse<PublishedFundingTemplate[]>> {
    return axios(`${baseURL}/templates/${fundingStreamId}/${fundingPeriodId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getFundingStreamByIdService(fundingStreamId: string) {
    return axios(`${baseURL}/fundingstream-by-id/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getFundingConfiguration(fundingStreamId: string, fundingPeriodId: string): Promise<AxiosResponse<FundingConfiguration>> {
    return axios(`${baseURL}/configuration/${fundingStreamId}/${fundingPeriodId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}