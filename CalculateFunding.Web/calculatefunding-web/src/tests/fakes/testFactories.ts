import { UseExportToSqlJobsHookResults } from "hooks/ExportToSql/useExportToSqlJobs";
import { SpecificationSummaryQueryResult } from "hooks/useSpecificationSummary";
import { JobDetails } from "types/jobDetails";
import { SpecificationSummary } from "types/SpecificationSummary";

import { PublishedProviderErrorSearchQueryResult } from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import { PublishedProviderIdsQueryResult } from "../../hooks/FundingApproval/usePublishedProviderIds";
import { PublishedProviderSearchQueryResult } from "../../hooks/FundingApproval/usePublishedProviderSearch";
import { SpecificationPermissionsResult } from "../../hooks/Permissions/useSpecificationPermissions";
import * as specPermsHook from "../../hooks/Permissions/useSpecificationPermissions";
import * as permissionsHook from "../../hooks/Permissions/useSpecificationPermissions";
import { EffectiveSpecificationPermission } from "../../types/EffectiveSpecificationPermission";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { Permission } from "../../types/Permission";
import {
  PublishedProviderResult,
  PublishedProviderSearchResults,
} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import { PublishedProviderSearchFacet } from "../../types/publishedProviderSearchRequest";

export const defaultFacets = [
  {
    name: PublishedProviderSearchFacet.HasErrors,
    facetValues: [
      { name: "True", count: 1 },
      { name: "False", count: 0 },
    ],
  },
  { name: PublishedProviderSearchFacet.ProviderType, facetValues: [] },
  { name: PublishedProviderSearchFacet.ProviderSubType, facetValues: [] },
  { name: PublishedProviderSearchFacet.LocalAuthority, facetValues: [{ name: "East London", count: 1 }] },
  { name: PublishedProviderSearchFacet.ProviderType, facetValues: [] },
  {
    name: PublishedProviderSearchFacet.MonthYearOpened,
    facetValues: [
      { name: "January 2000", count: 1 },
      { name: "September 2016", count: 2 },
      { name: "June 2015", count: 1 },
    ],
  },
];

export const allPermissions = () => Object.keys(Permission).map((p) => (<any>Permission)[p] as Permission);

export const noSpecPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => false,
  hasMissingPermissions: true,
  isPermissionsFetched: true,
  permissionsEnabled: [],
  permissionsDisabled: allPermissions(),
  missingPermissions: allPermissions(),
};

export const withSpecPermissions = (withPermissions: Permission[]): SpecificationPermissionsResult => {
  return {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => true,
    hasMissingPermissions: false,
    isPermissionsFetched: true,
    permissionsEnabled: withPermissions,
    permissionsDisabled: allPermissions().filter((p) => !withPermissions.includes(p)),
    missingPermissions: allPermissions().filter((p) => !withPermissions.includes(p)),
  };
};
export const withMissingSpecPermissions = (
  missingPermissions: Permission[]
): SpecificationPermissionsResult => {
  return {
    userId: "3456",
    isCheckingForPermissions: false,
    hasPermission: () => false,
    hasMissingPermissions: true,
    isPermissionsFetched: true,
    permissionsEnabled: allPermissions().filter((p) => !missingPermissions.includes(p)),
    permissionsDisabled: missingPermissions,
    missingPermissions: missingPermissions,
  };
};

export const withSpecification = (specification: SpecificationSummary): SpecificationSummaryQueryResult => {
  return {
    specification: specification,
    isLoadingSpecification: false,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: false,
    errorCheckingForSpecification: null,
    clearSpecificationFromCache: jest.fn(),
  };
};

export const withExportSqlJobs = (jobDetails: JobDetails | undefined): UseExportToSqlJobsHookResults => {
  return {
    jobsInfo: {
      latestExportAllocationDataJob: undefined,
      latestCalcResultsExportJob: undefined,
      latestReleasedAllocationJob: undefined,
      latestCalcEngineRunJob: undefined,
      lastSuccessfulFundingChangeJob: jobDetails,
      latestReleasedAllocationExportJob: undefined,
      hasRunningSqlJob: false,
      hasRunningFundingJobs: false,
      hasRunningReleasedAllocationSqlImportJob: false,
      exportJob: undefined,
      hasRunningCalcEngineJob: false,
    },
    exportState: {
      isAnotherUserExporting: false,
      isExportBlockedByJob: false,
      isCurrentAllocationStateBlockedByJob: false,
      isLatestAllocationStateBlockedByJob: false,
      isLatestCalcResultsAlreadyExported: false,
      isLatestAllocationDataAlreadyExported: false,
      isLatestReleaseDataAlreadyExported: false,
      isExporting: false,
      isExportingCalcResults: false,
      isExportingCurrentResults: false,
      isExportingReleasedResults: false,
      fundingJobStatusMessage: "",
      exportJobStatusMessage: "",
    },
    actions: {
      triggerCalcResultsExport: jest.fn(),
      triggerCurrentAllocationResultsExport: jest.fn(),
      triggerReleasedResultsExport: jest.fn(),
    },
    latestPublishedDate: undefined,
    isLoadingLatestPublishedDate: false,
    exportJobId: "",
  };
};

export const fullSpecPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => true,
  hasMissingPermissions: false,
  isPermissionsFetched: true,
  permissionsEnabled: allPermissions(),
  permissionsDisabled: [],
  missingPermissions: [],
};

export const hasFullSpecPermissions = () =>
  jest.spyOn(permissionsHook, "useSpecificationPermissions").mockImplementation(() => fullSpecPermissions);
export const hasSpecPermissions = (
  expectedSpecificationPermissionsResult: SpecificationPermissionsResult
) => {
  jest
    .spyOn(specPermsHook, "useSpecificationPermissions")
    .mockImplementation(() => expectedSpecificationPermissionsResult);
};

export const createPublishedProviderResult = (
  providers: PublishedProviderResult[],
  canApprove = true,
  canPublish = true,
  facets = defaultFacets
): PublishedProviderSearchResults => {
  return {
    providers: providers,
    canApprove: canApprove,
    canPublish: canPublish,
    facets: facets,
    filteredFundingAmount: 10000,
    pagerState: {
      displayNumberOfPages: 1,
      previousPage: 0,
      nextPage: 1,
      lastPage: 1,
      pages: [1],
      currentPage: 1,
    },
    currentPage: 1,
    endItemNumber: 1,
    startItemNumber: 1,
    totalFundingAmount: 10000,
    totalProvidersToApprove: 1,
    totalProvidersToPublish: 0,
    totalResults: providers.length,
  };
};

export const createPublishedProviderSearchQueryResult = (
  results: PublishedProviderSearchResults,
  ids: string[]
): PublishedProviderSearchQueryResult => {
  return {
    publishedProviderSearchResults: results,
    isLoadingSearchResults: false,
    publishedProviderIds: ids,
    refetchSearchResults: jest.fn(),
  };
};

export const createPublishedProviderErrorSearchQueryResult = (
  errors: string[]
): PublishedProviderErrorSearchQueryResult => {
  return {
    publishedProvidersWithErrors: errors,
    isLoadingPublishedProviderErrors: false,
    isErrorLoadingPublishedProviderErrors: false,
    errorLoadingPublishedProviderErrors: "",
  };
};
export const createPublishedProviderIdsQueryResult = (ids: string[]): PublishedProviderIdsQueryResult => {
  return {
    publishedProviderIds: ids,
    isLoadingPublishedProviderIds: false,
    refetchPublishedProviderIds: jest.fn(),
  };
};

export function buildPermissions(props: {
  fundingStreamId: string;
  fundingStreamName?: string;
  setAllPermsEnabled?: boolean;
  userId?: string;
  actions?: ((perm: FundingStreamPermissions) => void)[];
}): FundingStreamPermissions {
  const perm: FundingStreamPermissions = {
    fundingStreamId: props.fundingStreamId,
    fundingStreamName: props.fundingStreamName ? props.fundingStreamName : "",
    userId: props.userId ? props.userId : "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateSpecification: false,
    canEditCalculations: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canApproveTemplates: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false,
    canRefreshPublishedQa: false,
    canApproveAllCalculations: false,
    canApproveAnyCalculations: false,
    canApproveCalculations: false,
    canUploadDataSourceFiles: false,
  };
  if (props.setAllPermsEnabled) {
    const boolFields = Object.keys(perm).filter((p) => (<any>perm)[p] === false);
    boolFields.forEach((x) => ((<any>perm)[x] === false ? ((<any>perm)[x] = true) : null));
  }
  if (props.actions) {
    props.actions.forEach((doIt) => doIt(perm));
  }
  return perm;
}

export function buildEffectiveSpecificationPermission(props: {
  specificationId: string;
  setAllPermsEnabled?: boolean;
  userId?: string;
  actions?: ((perm: EffectiveSpecificationPermission) => void)[];
}): EffectiveSpecificationPermission {
  const perm: EffectiveSpecificationPermission = {
    specificationId: props.specificationId,
    userId: props.userId ? props.userId : "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateSpecification: false,
    canEditCalculations: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canApproveTemplates: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false,
    canRefreshPublishedQa: false,
    canApproveAllCalculations: false,
    canApproveAnyCalculations: false,
    canApproveCalculations: false,
    canUploadDataSourceFiles: false,
  };
  if (props.setAllPermsEnabled) {
    const boolFields = Object.keys(perm).filter((p) => (<any>perm)[p] === false);
    boolFields.forEach((x) => ((<any>perm)[x] === false ? ((<any>perm)[x] = true) : null));
  }
  if (props.actions) {
    props.actions.forEach((doIt) => doIt(perm));
  }
  return perm;
}
