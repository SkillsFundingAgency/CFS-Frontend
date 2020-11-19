import axios, {AxiosResponse} from "axios"
import {ProfileTotal} from "../types/FundingLineProfile";
import {FundingStreamPeriodProfilePattern} from "../types/ProviderProfileTotalsForStreamAndPeriod";

let baseURL = "/api/profiling";

export async function getProfilePatternsService(fundingStreamId: string, fundingPeriodId: string) {
    return axios.get(`${baseURL}/patterns/fundingStream/${fundingStreamId}/fundingPeriod/${fundingPeriodId}`);
}

export async function getAllProfilePatterns(fundingStreamId: string, fundingPeriodId: string) {
    return axios.get<Promise<FundingStreamPeriodProfilePattern[]>>(`${baseURL}/patterns/fundingStream/${fundingStreamId}/fundingPeriod/${fundingPeriodId}/all`);
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

export async function getProfileHistoryService(fundingStreamId:string, fundingPeriodId:string, providerId:string) {
    return axios(`/api/publish/get-profile-history/${fundingStreamId}/${fundingPeriodId}/${providerId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
}

export async function getProfileArchiveService(fundingStreamId:string, fundingPeriodId:string, providerId:string) {
    return axios(`/api/provider/${fundingStreamId}/${fundingPeriodId}/${providerId}/profileArchive`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
}

export async function previewProfile(specificationId: string, fundingStreamId: string,
    fundingPeriodId: string, providerId: string, fundingLineCode: string, profilePatternKey: string | null)
        : Promise<AxiosResponse<ProfileTotal[]>> {
    return axios(`${baseURL}/preview`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            specificationId: specificationId,
            fundingStreamId: fundingStreamId,
            fundingPeriodId: fundingPeriodId,
            providerId: providerId,
            fundingLineCode: fundingLineCode,
            profilePatternKey: profilePatternKey,
            configurationType: "RuleBased"
        }
    });
}
