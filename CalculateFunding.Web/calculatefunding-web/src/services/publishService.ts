import axios from "axios";
import {SaveReleaseTimetableViewModel} from "../types/SaveReleaseTimetableViewModel";

export async  function getReleaseTimetableForSpecificationService(specificationId:string) {
    return axios(`/api/publish/gettimetable/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function saveReleaseTimetableForSpecificationService(saveReleaseTimetable: SaveReleaseTimetableViewModel) {
    return axios(`/api/publish/savetimetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: saveReleaseTimetable
    });
}

export async function getLocalAuthoritiesService(fundingStreamId:string, fundingPeriodId:string, searchText:string) {
    return axios(`/api/provider/getlocalauthorities/${fundingStreamId}/${fundingPeriodId}/?searchText=${searchText}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}