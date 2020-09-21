import axios from "axios"

let baseURL = "/api/publishedproviderfundinglinedetails";

export async function GetCurrentProfileConfigService(specificationId: string, providerId: string, fundingStreamId: string) {
    return axios(`${baseURL}/${specificationId}/${providerId}/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}