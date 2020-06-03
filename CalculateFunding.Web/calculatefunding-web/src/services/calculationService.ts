import axios from "axios";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {CalculationProviderSearchRequestViewModel} from "../types/searchRequestViewModel";
import { CreateAdditionalCalculationViewModel, UpdateAdditionalCalculationViewModel } from "../types/Calculations/CreateAdditonalCalculationViewModel";
import {PublishStatusModel} from "../types/PublishStatusModel";

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
export async function updateAdditionalCalculationService(updateAdditionalCalculationViewModel: UpdateAdditionalCalculationViewModel, specificationId:string, calculationId:string) {
    return axios(`/api/specs/${specificationId}/calculations/${calculationId}/editadditionalcalculation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: updateAdditionalCalculationViewModel
    })
}

export async function compileCalculationPreviewService(specificationId:string, calculationId:string, sourceCode:string)
{
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

export async function getCodeContextService(specificationId: string) {
    return axios(`/api/specs/${specificationId}/codeContext`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
export async function getCalculationVersionHistoryService(calculationId: string) {
    return axios(`/api/calcs/getcalculationversionhistory/${calculationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function approveCalculationService(publishStatusModel: PublishStatusModel, specificationId: string, calculationId: string) {
    return axios(`/api/specs/${specificationId}/calculations/${calculationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: publishStatusModel
    })
}

export async function getIsUserAllowedToApproveCalculationService(calculationId: string) {
    return axios(`/api/calcs/${calculationId}/approvepermission`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
