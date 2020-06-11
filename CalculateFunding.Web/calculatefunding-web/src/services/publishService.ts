import axios from "axios";
import {SaveReleaseTimetableViewModel} from "../types/SaveReleaseTimetableViewModel";
import {ActionCreator, Dispatch} from "redux";
import {ThunkAction} from "redux-thunk";
import {IViewFundingState} from "../states/IViewFundingState";
import {ViewFundingAction, ViewFundingActionTypes} from "../actions/viewFundingAction";

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
};

export async function approveFundingService(specificationId: string) {

    return axios(`${baseUrl}/approvefunding/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

};

export async function releaseFundingService(specificationId: string){
        return axios(`${baseUrl}/publishfunding/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
};