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

export async  function saveReleaseTimetableForSpecificationService(saveReleaseTimetable: SaveReleaseTimetableViewModel) {
    return axios(`/api/publish/savetimetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: saveReleaseTimetable
    });
}