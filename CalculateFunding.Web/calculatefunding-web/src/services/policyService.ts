import axios from "axios"

let baseURL = "/api/policy";

export async function getFundingStreamsService(securityTrimmed: boolean = false) {
    return axios(`${baseURL}/fundingstreams/${securityTrimmed}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getDefaultTemplateVersionService(fundingStreamId: string, fundingPeriodId: string) {
    return axios(`${baseURL}/configuration/${fundingStreamId}/${fundingPeriodId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getTemplatesService(fundingStreamId: string, fundingPeriodId: string) {
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

export async function getProviderSourceService(fundingStreamId: string, fundingPeriodId: string) {
    return axios(`${baseURL}/configuration/${fundingStreamId}/${fundingPeriodId}/providersource`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}