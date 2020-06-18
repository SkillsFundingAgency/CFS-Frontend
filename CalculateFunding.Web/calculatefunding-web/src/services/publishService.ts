import axiosInstance from "../services/axiosInterceptor"
import {SaveReleaseTimetableViewModel} from "../types/SaveReleaseTimetableViewModel";
import {ActionCreator, Dispatch} from "redux";
import {ThunkAction} from "redux-thunk";
import {IViewFundingState} from "../states/IViewFundingState";
import {ViewFundingAction, ViewFundingActionTypes} from "../actions/viewFundingAction";

const baseUrl = "/api/publish";

export async function getReleaseTimetableForSpecificationService(specificationId: string) {
    return axiosInstance(`${baseUrl}/gettimetable/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function saveReleaseTimetableForSpecificationService(saveReleaseTimetable: SaveReleaseTimetableViewModel) {
    return axiosInstance(`${baseUrl}/savetimetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: saveReleaseTimetable
    });
}


export async function refreshFundingService(specificationId: string) {
    return axiosInstance(`${baseUrl}/refreshfunding/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export async function approveFundingService(specificationId: string) {

    return axiosInstance(`${baseUrl}/approvefunding/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

};

export async function releaseFundingService(specificationId: string){
        return axiosInstance(`${baseUrl}/publishfunding/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
};