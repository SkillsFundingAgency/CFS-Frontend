import axios, { AxiosResponse } from "axios";

import { FundingStructureItemViewModel } from "../types/FundingStructureItem";

const baseURL = "/api/fundingStructures";

export async function getFundingLineStructureService(
  specificationId: string,
  fundingPeriodId: string,
  fundingStreamId: string
): Promise<AxiosResponse<FundingStructureItemViewModel[]>> {
  return axios(
    `${baseURL}/specifications/${specificationId}/fundingPeriods/${fundingPeriodId}/fundingStreams/${fundingStreamId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
