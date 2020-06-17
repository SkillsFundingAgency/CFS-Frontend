import axios from "axios";

let baseURL = "/api/policy";

export async function getFundingStreamsService() {
    return axios(`${baseURL}/fundingstreams`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}