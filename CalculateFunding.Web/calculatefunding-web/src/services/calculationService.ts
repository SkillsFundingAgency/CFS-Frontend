import axios, { AxiosResponse } from "axios";

import { CalculationDetails, CalculationSummary } from "../types/CalculationDetails";
import { CalculationProviderResultList } from "../types/CalculationProviderResult";
import { CalculationProviderSearchRequestViewModel } from "../types/calculationProviderSearchRequestViewModel";
import { AdditionalCalculationSearchResultViewModel } from "../types/Calculations/AdditionalCalculation";
import {
  CalculationCompilePreviewResponse,
  PreviewCompileRequestViewModel,
} from "../types/Calculations/CalculationCompilePreviewResponse";
import { CalculationError } from "../types/Calculations/CalculationError";
import { CalculationVersionHistorySummary } from "../types/Calculations/CalculationVersionHistorySummary";
import { CircularReferenceError } from "../types/Calculations/CircularReferenceError";
import {
  CreateAdditionalCalculationViewModel,
  UpdateCalculationViewModel,
} from "../types/Calculations/CreateAdditonalCalculationViewModel";
import { CalculationSearchRequestViewModel } from "../types/CalculationSearchRequestViewModel";
import {
  CalculationSearchResponse,
  CalculationSearchResultResponse,
} from "../types/CalculationSearchResponse";
import { PublishStatus } from "../types/PublishStatusModel";

export async function searchForCalculationsService(
  calculationSearchRequestViewModel: CalculationSearchRequestViewModel
): Promise<AxiosResponse<CalculationSearchResponse>> {
  return axios(
    `/api/calcs/getcalculations/${calculationSearchRequestViewModel.specificationId}/${calculationSearchRequestViewModel.calculationType}/${calculationSearchRequestViewModel.pageNumber}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      params: {
        status: calculationSearchRequestViewModel.status,
        searchTerm: calculationSearchRequestViewModel.searchTerm,
      },
    }
  );
}

export async function searchCalculationsForSpecification(
  calculationSearchRequestViewModel: CalculationSearchRequestViewModel
): Promise<AxiosResponse<CalculationSearchResultResponse>> {
  return axios(
    `/api/specifications/${calculationSearchRequestViewModel.specificationId}/calculations/calculationType/${calculationSearchRequestViewModel.calculationType}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      params: {
        status: calculationSearchRequestViewModel.status,
        searchTerm: calculationSearchRequestViewModel.searchTerm,
        page: calculationSearchRequestViewModel.pageNumber,
      },
    }
  );
}

export async function searchForCalculationsByProviderService(
  calculationSearchRequestViewModel: CalculationSearchRequestViewModel,
  providerId: string
): Promise<AxiosResponse<AdditionalCalculationSearchResultViewModel>> {
  return axios(
    `/api/calcs/getcalculations/${calculationSearchRequestViewModel.specificationId}/${calculationSearchRequestViewModel.calculationType}/${calculationSearchRequestViewModel.pageNumber}/provider/${providerId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      params: {
        status: calculationSearchRequestViewModel.status,
        searchTerm: calculationSearchRequestViewModel.searchTerm,
      },
    }
  );
}

export async function getCalculationByIdService(
  calculationId: string
): Promise<AxiosResponse<CalculationDetails>> {
  return axios.get<CalculationDetails>(`/api/calcs/getcalculationbyid/${calculationId}`);
}

export async function getCalculationSummaryBySpecificationId(
  specificationId: string
): Promise<AxiosResponse<CalculationSummary[]>> {
  return axios.get<CalculationSummary[]>(
    `/api/calcs/calculation-summaries-for-specification?specificationId=${specificationId}`
  );
}

export async function getCalculationProvidersService(
  calculationProviderSearchRequestViewModel: CalculationProviderSearchRequestViewModel
): Promise<AxiosResponse<CalculationProviderResultList>> {
  return axios("/api/results/calculationproviderresultssearch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: calculationProviderSearchRequestViewModel,
  });
}

export async function createAdditionalCalculationService(
  createAdditionalCalculationViewModel: CreateAdditionalCalculationViewModel,
  specificationId: string
): Promise<AxiosResponse<CalculationDetails>> {
  return axios(`/api/specs/${specificationId}/calculations/createadditionalcalculation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: createAdditionalCalculationViewModel,
  });
}

export interface UpdateCalculationRequest {
  updateCalculationViewModel: UpdateCalculationViewModel;
  specificationId: string;
  calculationId: string;
}
export async function updateCalculationService(
  request: UpdateCalculationRequest
): Promise<AxiosResponse<CalculationDetails>> {
  return axios(
    `/api/specs/${request.specificationId}/calculations/${request.calculationId}/editadditionalcalculation`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: request.updateCalculationViewModel,
    }
  );
}

export async function compileCalculationPreviewService(
  specificationId: string,
  calculationId: string,
  previewCompileRequestViewModel: PreviewCompileRequestViewModel
): Promise<AxiosResponse<CalculationCompilePreviewResponse>> {
  return axios(`/api/specs/${specificationId}/calculations/${calculationId}/compilePreview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: previewCompileRequestViewModel,
  });
}

export async function getCodeContextService(specificationId: string) {
  const response = await axios(`/api/specs/${specificationId}/codeContext`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function getCalculationVersionHistoryService(
  calculationId: string
): Promise<AxiosResponse<CalculationVersionHistorySummary[]>> {
  return axios(`/api/calcs/getcalculationversionhistory/${calculationId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateCalculationStatusService(
  newStatus: PublishStatus,
  specificationId: string,
  calculationId: string
) {
  return axios(`/api/specs/${specificationId}/calculations/${calculationId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    data: { publishStatus: newStatus },
  });
}

export async function getMultipleVersionsByCalculationIdService(calculationId: string, versions: number[]) {
  return axios("/api/calcs/getmultipleversions", {
    method: "GET",
    params: {
      calculationId,
      versions: [versions[0], versions[1]],
    },
  });
}

export async function getIsUserAllowedToApproveCalculationService(calculationId: string) {
  return axios.get<boolean>(`/api/calcs/${calculationId}/approvepermission`);
}

export async function getCalculationCircularDependencies(specificationId: string) {
  return axios.get<CircularReferenceError[]>(
    `/api/graph/calculation/circulardependencies/${specificationId}`
  );
}

export async function approveAllCalculationsService(specificationId: string) {
  return axios(`/api/specs/${specificationId}/calculations/approveall`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
}

export async function runGenerateCalculationCsvResultsJob(specificationId: string) {
  return axios(`/api/calcs/specifications/${specificationId}/generate-calculation-csv-results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function getCalculationErrorsBySpecificationId(specificationId: string) {
  return axios(`/api/specification/${specificationId}/obsoleteitems`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    params: {
      specificationId,
    },
  });
}
