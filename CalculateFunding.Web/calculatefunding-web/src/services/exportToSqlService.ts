import axios from "axios";

import { JobCreatedResponse } from "../types/JobCreatedResponse";

const runJobToExportAllocationDataToSql = (specificationId: string, fundingStreamId: string) => {
  return axios.request<JobCreatedResponse>({
    url: `/api/sqlqa/specifications/${specificationId}/funding-streams/${fundingStreamId}/export-to-sql`,
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
};

const runJobToExportCalcResultsToSql = (specificationId: string) => {
  return axios.request<JobCreatedResponse>({
    url: `/api/results/specifications/${specificationId}/calculation-results/export-to-sql`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: {}
  });
};

export const sqlExportService = {
  runJobToExportAllocationDataToSql,
  runJobToExportCalcResultsToSql,
};
