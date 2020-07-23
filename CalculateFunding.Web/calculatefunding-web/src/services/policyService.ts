import axios from "axios"

let baseURL = "/api/policy";

export async function getFundingStreamsService() {
    return axios(`${baseURL}/fundingstreams`, {
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