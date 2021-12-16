import axios, { AxiosResponse } from "axios";

import { JobCreatedResponse } from "../types/JobCreatedResponse";
import { LatestPublishedDate } from "../types/PublishedProvider/LatestPublishedDate";
import { PublishedProviderFundingCount } from "../types/PublishedProvider/PublishedProviderFundingCount";
import { PublishProviderDataDownload } from "../types/PublishedProvider/PublishProviderDataDownload";
import { AvailableVariationPointerFundingLine } from "../types/Publishing/AvailableVariationPointerFundingLine";
import { ReleaseTimetableSummary } from "../types/ReleaseTimetableSummary";
import { SaveReleaseTimetableViewModel } from "../types/SaveReleaseTimetableViewModel";

export async function getFundingSummaryForApprovingService(
  specificationId: string,
  publishedProviderIds: string[]
): Promise<AxiosResponse<PublishedProviderFundingCount>> {
  return axios(`/api/specs/${specificationId}/funding-summary-for-approval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { publishedProviderIds: publishedProviderIds },
  });
}

export async function getFundingSummaryForReleasingService(
  specificationId: string,
  publishedProviderIds: string[]
): Promise<AxiosResponse<PublishedProviderFundingCount>> {
  return axios(`/api/specs/${specificationId}/funding-summary-for-release`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { publishedProviderIds: publishedProviderIds },
  });
}

export async function getReleaseTimetableForSpecificationService(
  specificationId: string
): Promise<AxiosResponse<ReleaseTimetableSummary>> {
  return axios(`/api/publish/getTimetable/${specificationId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function saveReleaseTimetableForSpecificationService(
  saveReleaseTimetable: SaveReleaseTimetableViewModel
) {
  return axios("/api/publish/saveTimetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: saveReleaseTimetable,
  });
}

export async function preValidateForRefreshFundingService(
  specificationId: string
): Promise<AxiosResponse<string[]>> {
  return axios(`/api/specs/${specificationId}/validate-for-refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function refreshSpecificationFundingService(
  specificationId: string
): Promise<AxiosResponse<string>> {
  return axios(`/api/specs/${specificationId}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function approveSpecificationFundingService(
  specificationId: string
): Promise<AxiosResponse<JobCreatedResponse>> {
  return axios(`/api/specs/${specificationId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function releaseSpecificationFundingService(
  specificationId: string
): Promise<AxiosResponse<JobCreatedResponse>> {
  return axios(`/api/specs/${specificationId}/release`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function approveProvidersFundingService(
  specificationId: string,
  providers: string[]
): Promise<AxiosResponse<JobCreatedResponse>> {
  return axios(`/api/specs/${specificationId}/funding-approval/providers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { publishedProviderIds: providers },
  });
}

export async function releaseProvidersFundingService(
  specificationId: string,
  providers: string[]
): Promise<AxiosResponse<JobCreatedResponse>> {
  return axios(`/api/specs/${specificationId}/funding-release/providers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { publishedProviderIds: providers },
  });
}

/// last time funding data was modified (e.g. refresh, approved, released)
export async function getLatestPublishedDate(fundingStreamId: string, fundingPeriodId: string) {
  return axios.request<LatestPublishedDate>({
    url: `/api/publishedproviders/${fundingStreamId}/${fundingPeriodId}/lastupdated`,
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function generateCsvForReleaseBatch(
  specificationId: string,
  publishedProviderIds: string[]
): Promise<AxiosResponse<PublishProviderDataDownload>> {
  return axios(`/api/specifications/${specificationId}/publishedproviders/generate-csv-for-release/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: {
      publishedProviderIds: publishedProviderIds,
    },
  });
}

export async function generateCsvForReleaseAll(
  specificationId: string
): Promise<AxiosResponse<PublishProviderDataDownload>> {
  return axios(`/api/specifications/${specificationId}/publishedproviders/generate-csv-for-release/all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: {},
  });
}

export async function generateCsvForApprovalBatch(
  specificationId: string,
  publishedProviderIds: string[]
): Promise<AxiosResponse<PublishProviderDataDownload>> {
  return axios(`/api/specifications/${specificationId}/publishedproviders/generate-csv-for-approval/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: {
      publishedProviderIds: publishedProviderIds,
    },
  });
}

export async function generateCsvForApprovalAll(
  specificationId: string
): Promise<AxiosResponse<PublishProviderDataDownload>> {
  return axios(`/api/specifications/${specificationId}/publishedproviders/generate-csv-for-approval/all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: {},
  });
}

export async function getAvailableFundingLinePeriods(
  specificationId: string
): Promise<AxiosResponse<AvailableVariationPointerFundingLine[]>> {
  return axios(`/api/publishing/available-funding-line-periods/${specificationId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
