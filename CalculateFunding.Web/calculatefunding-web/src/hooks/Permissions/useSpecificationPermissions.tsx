import { AxiosError } from "axios";
import { UseQueryOptions,useQuery } from "react-query";

import { milliseconds } from "../../helpers/TimeInMs";
import { getUserPermissionsService } from "../../services/userService";
import { EffectiveSpecificationPermission } from "../../types/EffectiveSpecificationPermission";
import { Permission } from "../../types/Permission";
import { getDisabledPermissions, getEnabledPermissions } from "./useFundingStreamPermissions";

export interface SpecificationPermissionsResult {
  isCheckingForPermissions: boolean;
  isPermissionsFetched: boolean;
  userId: string | undefined;
  permissionsEnabled: Permission[] | undefined;
  permissionsDisabled: Permission[] | undefined;
  hasPermission: (perm: Permission) => boolean | undefined;
  hasMissingPermissions: boolean;
  missingPermissions: Permission[] | undefined;
}

export const useSpecificationPermissions = (
  specificationId: string,
  requiredPermissions: Permission[],
  queryOptions: UseQueryOptions<EffectiveSpecificationPermission, AxiosError> = {
    cacheTime: milliseconds.OneHour,
    staleTime: milliseconds.OneHour,
    enabled: (specificationId && specificationId.length > 0) === true,
    refetchOnWindowFocus: false,
  }
): SpecificationPermissionsResult => {
  const {
    data: specPermissions,
    isLoading,
    isFetched,
  } = useQuery<EffectiveSpecificationPermission, AxiosError>(
    `specification-${specificationId}-permissions`,
    async () => (await getUserPermissionsService(specificationId)).data,
    queryOptions
  );

  const permissionsEnabled = specPermissions && getEnabledPermissions(specPermissions);
  const permissionsDisabled = specPermissions && getDisabledPermissions(specPermissions);
  const missingPermissions =
    permissionsDisabled && requiredPermissions.filter((p) => permissionsDisabled.includes(p));
  const hasPermission = (perm: Permission): boolean | undefined => {
    return permissionsEnabled && permissionsEnabled.some((p) => p === perm);
  };

  return {
    isCheckingForPermissions: queryOptions.enabled ? isLoading : false,
    isPermissionsFetched: queryOptions.enabled ? isFetched : false,
    userId: specPermissions?.userId,
    permissionsEnabled,
    permissionsDisabled,
    hasPermission,
    hasMissingPermissions: queryOptions.enabled
      ? missingPermissions !== undefined && missingPermissions.length > 0
      : false,
    missingPermissions,
  };
};
