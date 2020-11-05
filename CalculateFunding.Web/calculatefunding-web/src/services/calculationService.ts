import axios, {AxiosResponse} from "axios"
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import { CreateAdditionalCalculationViewModel, UpdateCalculationViewModel } from "../types/Calculations/CreateAdditonalCalculationViewModel";
import {PublishStatus, PublishStatusModel} from "../types/PublishStatusModel";
import {CalculationSearchResponse} from "../types/CalculationSearchResponse";
import {CalculationProviderSearchRequestViewModel} from "../types/calculationProviderSearchRequestViewModel";
import {CircularReferenceError} from "../types/Calculations/CircularReferenceError";
import {CalculationCompilePreviewResponse} from "../types/Calculations/CalculationCompilePreviewResponse";
import {CalculationDetails, CalculationSummary} from "../types/CalculationDetails";
import {AdditionalCalculationSearchResultViewModel} from "../types/Calculations/AdditionalCalculation";
import {CalculationVersionHistorySummary} from "../types/Calculations/CalculationVersionHistorySummary";
import {CalculationProviderResultList} from "../types/CalculationProviderResult";

export async function searchForCalculationsService(calculationSearchRequestViewModel: CalculationSearchRequestViewModel): 
    Promise<AxiosResponse<CalculationSearchResponse>> {
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

export async function searchForCalculationsByProviderService(
    calculationSearchRequestViewModel: CalculationSearchRequestViewModel, providerId: string):
    Promise<AxiosResponse<AdditionalCalculationSearchResultViewModel>>{
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

export async function getCalculationByIdService(calculationId: string):
    Promise<AxiosResponse<CalculationDetails>>{
    return axios.get<CalculationDetails>(`/api/calcs/getcalculationbyid/${calculationId}`)
}

export async function getCalculationSummaryBySpecificationId(specificationId: string):
    Promise<AxiosResponse<CalculationSummary[]>>{
    return axios.get<CalculationSummary[]>(`/api/calcs/calculation-summaries-for-specification?specificationId=${specificationId}`)
}

export async function getCalculationProvidersService(calculationProviderSearchRequestViewModel: CalculationProviderSearchRequestViewModel):
    Promise<AxiosResponse<CalculationProviderResultList>>{
    return axios(`/api/results/calculationproviderresultssearch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: calculationProviderSearchRequestViewModel
    })
}

export async function createAdditionalCalculationService(
    createAdditionalCalculationViewModel: CreateAdditionalCalculationViewModel, specificationId: string): Promise<AxiosResponse<CalculationDetails>> {
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

export async function getCalculationVersionHistoryService(calculationId: string):
    Promise<AxiosResponse<CalculationVersionHistorySummary[]>>{
    return axios(`/api/calcs/getcalculationversionhistory/${calculationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export async function updateCalculationStatusService(newStatus: PublishStatus, specificationId: string, calculationId: string) {
    return axios(`/api/specs/${specificationId}/calculations/${calculationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {publishStatus: newStatus}
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

