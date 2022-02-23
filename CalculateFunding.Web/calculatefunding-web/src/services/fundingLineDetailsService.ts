import axios from "axios";

import { FundingLineProfile } from "../types/FundingLineProfile";
import { FundingLineChangeViewModel } from "../types/PublishedProvider/FundingLineProfile";

const baseURL = "/api/publishedproviderfundinglinedetails";

export async function getCurrentProfileConfigService(
  specificationId: string,
  providerId: string,
  fundingStreamId: string
) {
  return axios.get<FundingLineProfile[]>(`${baseURL}/${specificationId}/${providerId}/${fundingStreamId}`);
}

export async function getPreviousProfilesForSpecificationForProviderForFundingLine(
  specificationId: string,
  providerId: string,
  fundingStreamId: string,
  fundingLineCode: string,
  providerVersionId: string
) {
  return axios.get<FundingLineChangeViewModel>(
    `${baseURL}/${specificationId}/${providerId}/${fundingStreamId}/${fundingLineCode}/${providerVersionId}/changes`
  );
}

export async function getPreviousProfileExistsForSpecificationForProviderForFundingLine(
  specificationId: string,
  providerId: string,
  fundingStreamId: string,
  fundingLineCode: string
) {
  return axios.get<boolean>(
    `${baseURL}/${specificationId}/${providerId}/${fundingStreamId}/${fundingLineCode}/change-exists`
  );
}
