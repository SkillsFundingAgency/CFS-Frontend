import axios, {AxiosResponse} from "axios"
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import { CreateAdditionalCalculationViewModel, UpdateCalculationViewModel } from "../types/Calculations/CreateAdditonalCalculationViewModel";
import {PublishStatusModel} from "../types/PublishStatusModel";
import {Calculation, CalculationSummary} from "../types/CalculationSummary";
import {CalculationProviderSearchRequestViewModel} from "../types/calculationProviderSearchRequestViewModel";
import {CircularReferenceError} from "../types/Calculations/CircularReferenceError";
import {CalculationCompilePreviewResponse} from "../types/Calculations/CalculationCompilePreviewResponse";

export async function getCalculationsService(calculationSearchRequestViewModel: CalculationSearchRequestViewModel): Promise<AxiosResponse<CalculationSummary>> {
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

export async function getCalculationsByProviderService(calculationSearchRequestViewModel: CalculationSearchRequestViewModel, providerId: string) {
    return axios(`/api/calcs/getcalculations/${calculationSearchRequestViewModel.specificationId}/${calculationSearchRequestViewModel.calculationType}/${calculationSearchRequestViewModel.pageNumber}/provider/${providerId}`, {
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
    return axios.get<Calculation>(`/api/calcs/getcalculationbyid/${calculationId}`)
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

export async function createAdditionalCalculationService(createAdditionalCalculationViewModel: CreateAdditionalCalculationViewModel, specificationId: string) {
    return axios(`/api/specs/${specificationId}/calculations/createadditionalcalculation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: createAdditionalCalculationViewModel
    })
}

export async function updateCalculationService(updateCalculationViewModel: UpdateCalculationViewModel, specificationId: string, calculationId: string) {
    return axios(`/api/specs/${specificationId}/calculations/${calculationId}/editadditionalcalculation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: updateCalculationViewModel
    })
}

export async function compileCalculationPreviewService(
    specificationId: string, 
    calculationId: string, 
    sourceCode: string): Promise<AxiosResponse<CalculationCompilePreviewResponse>> {
    return axios(`/api/specs/${specificationId}/calculations/${calculationId}/compilePreview`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            sourceCode: sourceCode
        }
    })
}

export async function getCodeContextService(specificationId: string) {
    let response = await axios(`/api/specs/${specificationId}/codeContext`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.data;
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

export async function getMultipleVersionsByCalculationIdService(calculationId: string, versions: number[]) {
    return axios(`/api/calcs/getmultipleversions`, {
        method: 'GET',
        params: {
            calculationId,
            versions: [versions[0], versions[1]]
        }});
}


export async function getIsUserAllowedToApproveCalculationService(calculationId: string) {
    return axios.get<boolean>(`/api/calcs/${calculationId}/approvepermission`)
}

export async function getCalculationCircularDependencies(specificationId: string) {
    return axios.get<CircularReferenceError[]>(`/api/graph/calculation/circulardependencies/${specificationId}`);
}

