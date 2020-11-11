import axios from "axios"
import {FundingStreamPeriodProfilePattern} from "../types/ProviderProfileTotalsForStreamAndPeriod";

let baseURL = "/api/profiling";

export async function getProfilePatternsService(fundingStreamId: string, fundingPeriodId: string) {
    return axios.get(`${baseURL}/patterns/fundingStream/${fundingStreamId}/fundingPeriod/${fundingPeriodId}`);
}

export async function getAllProfilePatterns(fundingStreamId: string, fundingPeriodId: string) {
    return axios.get<FundingStreamPeriodProfilePattern[]>(`${baseURL}/patterns/fundingStream/${fundingStreamId}/fundingPeriod/${fundingPeriodId}/all`);
}

export async function assignProfilePatternKeyToPublishedProvider(
    fundingStreamId: string, fundingPeriodId: string, providerId: string, fundingLineCode: string, profilePatternKey: string | null) {
    return axios(`${baseURL}/patterns/fundingStream/${fundingStreamId}/fundingPeriod/${fundingPeriodId}/provider/${providerId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            fundingLineCode: fundingLineCode,
            key: profilePatternKey
        }
    });
}
