import axios from "axios";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {CalculationProviderSearchRequestViewModel} from "../types/searchRequestViewModel";

export async function getAdditionalCalculations(calculationSearchRequestViewModel: CalculationSearchRequestViewModel) {
    return axios(`/api/calculations/getcalculationsforspecification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        params: calculationSearchRequestViewModel
    });
}

export async function getCalculationByIdService(calculationId: string) {
    return axios(`/api/calcs/getcalculationbyid/${calculationId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
}

export async function getCalculationProvidersService(calculationProviderSearchRequestViewModel: CalculationProviderSearchRequestViewModel){
    return axios(`/api/results/calculationproviderresultssearch`, {
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        data : calculationProviderSearchRequestViewModel
    })
}