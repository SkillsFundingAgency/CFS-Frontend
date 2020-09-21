import axios from "axios"

let baseURL = "/api/profiling";

export async function GetProfilePatternsService(fundingStreamId:string, fundingPeriodId:string) {
    return axios(`${baseURL}/patterns/fundingStream/${fundingStreamId}/fundingPeriod/${fundingPeriodId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}
