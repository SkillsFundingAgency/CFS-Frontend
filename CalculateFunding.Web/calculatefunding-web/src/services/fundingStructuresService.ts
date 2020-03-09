import axios from "axios";

let baseURL = "/api/fundingstructures";

export async function getFundingLineStructureService(specificationId: string, fundingStreamId: string) {
    return axios(`${baseURL}/specifications/${specificationId}/fundingstreams/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}