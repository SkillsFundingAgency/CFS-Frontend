import axios, { AxiosResponse } from "axios";

import { JobCreatedResponse } from "../types/JobCreatedResponse";
import { BatchUploadResponse } from "../types/PublishedProvider/BatchUploadResponse";
import { BatchValidationRequest } from "../types/PublishedProvider/BatchValidationRequest";
import { PublishedProviderSearchResults } from "../types/PublishedProvider/PublishedProviderSearchResults";
import { ReleaseFundingPublishedProvidersSummary } from "../types/PublishedProvider/ReleaseFundingPublishedProvidersSummary";
import { PublishedProviderIdsSearchRequest } from "../types/publishedProviderIdsSearchRequest";
import { PublishedProviderSearchRequest } from "../types/publishedProviderSearchRequest";

const baseUrl = "/api/publishedProviders";

const uploadBatchOfPublishedProviders = async (file: File): Promise<AxiosResponse<BatchUploadResponse>> => {
  const data = new FormData();
  data.append("file", file);

  return axios(`${baseUrl}/batch`, {
    method: "POST",
    data,
  });
};

const validatePublishedProvidersByBatch = (
  request: BatchValidationRequest
): Promise<AxiosResponse<JobCreatedResponse>> => {
  return axios(`${baseUrl}/batch/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: request,
  });
};

const getPublishedProvidersByBatch = (batchId: string): Promise<AxiosResponse<string[]>> => {
  return axios(`${baseUrl}/batch/${batchId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
};

const searchForPublishedProviderResults = (
  criteria: PublishedProviderSearchRequest
): Promise<AxiosResponse<PublishedProviderSearchResults>> => {
  return axios(`${baseUrl}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: criteria,
  });
};

const getAllProviderVersionIdsForSearch = (
  criteria: PublishedProviderIdsSearchRequest
): Promise<AxiosResponse<string[]>> => {
  return axios(`${baseUrl}/search/ids`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: criteria,
  });
};

const getAllProviderVersionIds = (specificationId: string): Promise<AxiosResponse<string[]>> => {
  return axios.get<string[]>(`${baseUrl}/publishedprovider-ids/${specificationId}`);
};

const getPublishedProviderErrors = (specificationId: string): Promise<AxiosResponse<string[]>> => {
  return axios.get<string[]>(`/api/specs/${specificationId}/provider-errors`);
};

const getReleaseFundingChannelSummary = (
  specificationId: string,
  channelCodes: string[],
  publishedProviderIds: string[]
): Promise<AxiosResponse<ReleaseFundingPublishedProvidersSummary>> => {
  return axios.request<ReleaseFundingPublishedProvidersSummary>({
    url: `/api/specifications/${specificationId}/publishedproviders/release-funding-summary`,
    method: "POST",
    data: {
      channelCodes,
      publishedProviderIds,
    },
  });
};

export const publishedProviderService = {
  uploadBatchOfPublishedProviders,
  validatePublishedProvidersByBatch,
  getPublishedProvidersByBatch,
  searchForPublishedProviderResults,
  getAllProviderVersionIdsForSearch,
  getAllProviderVersionIds,
  getPublishedProviderErrors,
  getReleaseFundingChannelSummary,
};
