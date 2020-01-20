import axios from "axios";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";

export async function getSpecificationSummaryService(specificationId: string) {
    return axios(`/api/specs/specification-summary-by-id/${specificationId}`, {
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