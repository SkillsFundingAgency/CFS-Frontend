import axios from "axios";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";

export async function getAdditionalCalculations(calculationSearchRequestViewModel: CalculationSearchRequestViewModel) {
    return axios(`/api/calculations/getcalculationsforspecification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        params: calculationSearchRequestViewModel
    });
}