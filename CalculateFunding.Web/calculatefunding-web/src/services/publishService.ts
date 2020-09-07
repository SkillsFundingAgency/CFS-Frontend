import axios from "axios"
import {SaveReleaseTimetableViewModel} from "../types/SaveReleaseTimetableViewModel";

const baseUrl = "/api/publish";

export async function getReleaseTimetableForSpecificationService(specificationId: string) {
    return axios(`${baseUrl}/gettimetable/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function saveReleaseTimetableForSpecificationService(saveReleaseTimetable: SaveReleaseTimetableViewModel) {
    return axios(`${baseUrl}/savetimetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: saveReleaseTimetable
    });
}

export async function refreshFundingService(specificationId: string) {
    return axios(`${baseUrl}/refreshfunding/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function approveFundingService(specificationId: string) {

    return axios(`${baseUrl}/approvefunding/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

}

export async function releaseFundingService(specificationId: string){
        return axios(`${baseUrl}/publishfunding/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
}

export async function getProfileHistoryService(fundingStreamId:string, fundingPeriodId:string, providerId:string) {
    return axios(`/api/publish/get-profile-history/${fundingStreamId}/${fundingPeriodId}/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getProfileArchiveService(fundingStreamId:string, fundingPeriodId:string, providerId:string) {
    return axios(`/api/provider/${fundingStreamId}/${fundingPeriodId}/${providerId}/profileArchive`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
