import axios, { AxiosResponse } from "axios";

import { EffectiveSpecificationPermission } from "../types/EffectiveSpecificationPermission";
import { FundingStreamPermissions } from "../types/FundingStreamPermissions";
import { ReportOnUsersWithFundingStreamPermissionsModel } from "../types/ReportOnUsersWithFundingStreamPermissionsModel";
import { User } from "../types/User";
import { UserSearchRequest } from "../types/Users/UserSearchRequest";
import { UserSearchResult } from "../types/Users/UserSearchResult";

const baseURL = "/api/users";

export async function getUserPermissionsService(
  specificationId: string
): Promise<AxiosResponse<EffectiveSpecificationPermission>> {
  return axios(`${baseURL}/effectivepermissions/${specificationId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getAdminUsersForFundingStream(fundingStreamId: string): Promise<AxiosResponse<User[]>> {
  return axios(`${baseURL}/permissions/${fundingStreamId}/admin`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getOtherUsersPermissionsForFundingStream(
  userId: string,
  fundingStreamId: string
): Promise<AxiosResponse<FundingStreamPermissions>> {
  return axios(`${baseURL}/${userId}/permissions/${fundingStreamId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateOtherUsersPermissionsForFundingStream(
  permissions: FundingStreamPermissions
): Promise<AxiosResponse<FundingStreamPermissions>> {
  return axios(`${baseURL}/${permissions.userId}/permissions/${permissions.fundingStreamId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: permissions,
  });
}

export async function removeOtherUserFromFundingStream(
  userId: string,
  fundingStreamId: string
): Promise<AxiosResponse<FundingStreamPermissions>> {
  return axios(`${baseURL}/${userId}/permissions/${fundingStreamId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getReportOnUsersByFundingStream(
  fundingStreamId: string
): Promise<AxiosResponse<ReportOnUsersWithFundingStreamPermissionsModel>> {
  return axios(`${baseURL}/effectivepermissions/generate-report/${fundingStreamId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function findUsers(searchText: string): Promise<AxiosResponse<UserSearchResult>> {
  return axios(`${baseURL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { searchTerm: searchText, pageSize: 5000 } as UserSearchRequest,
  });
}
