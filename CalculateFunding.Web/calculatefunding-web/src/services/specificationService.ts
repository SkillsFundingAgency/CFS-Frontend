import axios from "axios";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";

let baseURL = "/api/specs";

export async function getSpecificationSummaryService(specificationId: string) {
    return axios(`${baseURL}/specification-summary-by-id/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async  function getAdditionalCalculationsForSpecificationService(calculationSearchRequestViewModel: CalculationSearchRequestViewModel) {
    return axios(`/api/calculations/getcalculationsforspecification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        params: calculationSearchRequestViewModel
    });
}

export async function getFundingStreamsService() {
    return axios(`${baseURL}/fundingstream-id-for-specifications`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getFundingPeriodsByFundingStreamIdService(fundingstreamId: string) {
    return axios(`${baseURL}/get-fundingperiods-for-selected-fundingstream/${fundingstreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getSpecificationsByFundingPeriodAndStreamIdService(fundingStreamId: string, fundingPeriodId: string) {
    return axios(`${baseURL}/selected-specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}