import axios from "axios"

let baseURL = "/api/providerversions";

export async function getProviderByFundingStreamIdService(fundingStreamId:string) {
    return axios(`${baseURL}/getbyfundingstream/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}