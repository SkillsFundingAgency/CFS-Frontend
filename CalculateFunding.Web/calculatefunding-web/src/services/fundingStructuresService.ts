import axios from "axios"

let baseURL = "/api/fundingstructures";

export async function getFundingLineStructureService(specificationId: string, fundingPeriodId: string, fundingStreamId: string) {
    return axios(`${baseURL}/specifications/${specificationId}/fundingperiods/${fundingPeriodId}/fundingstreams/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}