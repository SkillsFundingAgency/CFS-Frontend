import axios from "axios";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {CalculationProviderSearchRequestViewModel} from "../types/searchRequestViewModel";
import {CreateAdditionalCalculationViewModel} from "../types/Calculations/CreateAdditonalCalculationViewModel";

export async function getCalculationsService(calculationSearchRequestViewModel: CalculationSearchRequestViewModel) {
    return axios(`/api/calcs/getcalculations/${calculationSearchRequestViewModel.specificationId}/${calculationSearchRequestViewModel.calculationType}/${calculationSearchRequestViewModel.pageNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params:
                {
                    status: calculationSearchRequestViewModel.status,
                    searchTerm: calculationSearchRequestViewModel.searchTerm
                }
        }
    );
}

export async function getCalculationByIdService(calculationId: string) {
    return axios(`/api/calcs/getcalculationbyid/${calculationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function getCalculationProvidersService(calculationProviderSearchRequestViewModel: CalculationProviderSearchRequestViewModel) {
    return axios(`/api/results/calculationproviderresultssearch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: calculationProviderSearchRequestViewModel
    })
}

export async function createAdditionalCalculationService(createAdditionalCalculationViewModel: CreateAdditionalCalculationViewModel, specificationId:string) {
    return axios(`/api/specs/${specificationId}/calculations/createadditionalcalculation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: createAdditionalCalculationViewModel
    })
}

export async function compileCalculationPreviewService(specificationId:string, calculationId:string, sourceCode:string)
{
    console.log("compileCalculationPreviewService");
    console.log(specificationId);
    console.log(calculationId);
    console.log(sourceCode);

    return axios(`/api/specs/${specificationId}/calculations/${calculationId}/compilePreview`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        data: {
            sourceCode: sourceCode
        }
    })
}
