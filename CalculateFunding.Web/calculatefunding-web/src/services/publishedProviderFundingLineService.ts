import axios, { AxiosResponse } from "axios";

import { ApplyCustomProfileRequest } from "../types/PublishedProvider/ApplyCustomProfileRequest";
import { FundingLineProfileViewModel } from "../types/PublishedProvider/FundingLineProfile";

const baseUrl = "/api/publishedproviderfundinglinedetails";

export async function getFundingLinePublishedProviderDetails(
  specificationId: string,
  providerId: string,
  fundingStreamId: string,
  fundingLineCode: string,
  fundingPeriodId: string
): Promise<AxiosResponse<FundingLineProfileViewModel>> {
  return axios.get<FundingLineProfileViewModel>(
    `${baseUrl}/${specificationId}/${providerId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineCode}`
  );
}

export async function applyCustomProfile(profile: ApplyCustomProfileRequest) {
  return axios(`${baseUrl}/customprofiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: profile,
  });
}
