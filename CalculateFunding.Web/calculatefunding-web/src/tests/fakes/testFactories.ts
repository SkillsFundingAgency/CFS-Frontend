import {PublishedProviderResult, PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {PublishedProviderSearchQueryResult} from "../../hooks/FundingApproval/usePublishedProviderSearch";
import {PublishedProviderErrorSearchQueryResult} from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import {PublishedProviderIdsQueryResult} from "../../hooks/FundingApproval/usePublishedProviderIds";
import {PublishedProviderSearchFacet} from "../../types/publishedProviderSearchRequest";
import {SpecificationPermissionsResult} from "../../hooks/Permissions/useSpecificationPermissions";
import * as specPermsHook from "../../hooks/Permissions/useSpecificationPermissions";
import * as permissionsHook from "../../hooks/Permissions/useSpecificationPermissions";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";

export const defaultFacets = [
    {name: PublishedProviderSearchFacet.HasErrors, facetValues: [{"name": "True", "count": 1}, {"name": "False", "count": 0}]},
    {name: PublishedProviderSearchFacet.ProviderType, facetValues: []},
    {name: PublishedProviderSearchFacet.ProviderSubType, facetValues: []},
    {name: PublishedProviderSearchFacet.LocalAuthority, facetValues: [{"name": "East London", "count": 1}]},
    {name: PublishedProviderSearchFacet.ProviderType, facetValues: []}
];

export const fullSpecPermissions: SpecificationPermissionsResult = {
    canApproveFunding: true,
    canCreateSpecification: true,
    canEditCalculation: true,
    canEditSpecification: true,
    canMapDatasets: true,
    canRefreshFunding: true,
    canReleaseFunding: true,
    canApproveCalculation: true,
    canApproveAllCalculations: true,
    canChooseFunding: true,
    hasMissingPermissions: true,
    isCheckingForPermissions: true,
    isPermissionsFetched: true,
    canApplyCustomProfilePattern: true,
    missingPermissions: [],
    canCreateAdditionalCalculation: true
}
export const hasFullSpecPermissions = () => jest.spyOn(permissionsHook, 'useSpecificationPermissions').mockImplementation(() => (fullSpecPermissions));
export const hasSpecPermissions = (expectedSpecificationPermissionsResult: SpecificationPermissionsResult) => {
    jest.spyOn(specPermsHook, 'useSpecificationPermissions')
        .mockImplementation(() => (expectedSpecificationPermissionsResult));
}

export const createPublishedProviderResult = (providers: PublishedProviderResult[],
                                              canApprove = true,
                                              canPublish = true,
                                              facets = defaultFacets)
    : PublishedProviderSearchResults => {
    return {
        providers: providers,
        canApprove: canApprove,
        canPublish: canPublish,
        facets: facets,
        filteredFundingAmount: 10000,
        pagerState: {displayNumberOfPages: 1, previousPage: 0, nextPage: 1, lastPage: 1, pages: [1], currentPage: 1},
        currentPage: 1,
        endItemNumber: 1,
        startItemNumber: 1,
        totalFundingAmount: 10000,
        totalProvidersToApprove: 1,
        totalProvidersToPublish: 0,
        totalResults: providers.length
    };
};

export const createPublishedProviderSearchQueryResult = (results: PublishedProviderSearchResults, ids: string[])
    : PublishedProviderSearchQueryResult => {
    return {
        publishedProviderSearchResults: results,
        isLoadingSearchResults: false,
        publishedProviderIds: ids,
        refetchSearchResults: jest.fn()
    };
};

export const createPublishedProviderErrorSearchQueryResult = (errors: string[])
    : PublishedProviderErrorSearchQueryResult => {
    return {
        publishedProvidersWithErrors: errors,
        isLoadingPublishedProviderErrors: false,
        isErrorLoadingPublishedProviderErrors: false,
        errorLoadingPublishedProviderErrors: ""
    };
};
export const createPublishedProviderIdsQueryResult = (ids: string[])
    : PublishedProviderIdsQueryResult => {
    return {
        publishedProviderIds: ids,
        isLoadingPublishedProviderIds: false,
        refetchPublishedProviderIds: jest.fn()
    };
};

export function buildPermissions(props: {
    fundingStreamId: string,
    fundingStreamName?: string,
    setAllPermsEnabled?: boolean,
    userId?: string,
    actions?: ((perm: FundingStreamPermissions) => void)[]
}): FundingStreamPermissions {
    let perm: FundingStreamPermissions = {
        fundingStreamId: props.fundingStreamId,
        fundingStreamName: props.fundingStreamName ? props.fundingStreamName : "",
        userId: props.userId ? props.userId : "",
        canAdministerFundingStream: false,
        canApproveFunding: false,
        canApproveSpecification: false,
        canChooseFunding: false,
        canCreateQaTests: false,
        canCreateSpecification: false,
        canDeleteCalculations: false,
        canDeleteQaTests: false,
        canDeleteSpecification: false,
        canEditCalculations: false,
        canEditQaTests: false,
        canEditSpecification: false,
        canMapDatasets: false,
        canRefreshFunding: false,
        canReleaseFunding: false,
        canCreateTemplates: false,
        canEditTemplates: false,
        canDeleteTemplates: false,
        canApproveTemplates: false,
        canApplyCustomProfilePattern: false,
        canAssignProfilePattern: false,
        canDeleteProfilePattern: false,
        canEditProfilePattern: false,
        canCreateProfilePattern: false,
        canRefreshPublishedQa: false,
        canApproveAllCalculations: false,
        canApproveAnyCalculations: false,
        canApproveCalculations: false,
        canUploadDataSourceFiles: false
    }
    if (props.setAllPermsEnabled) {
        const boolFields = Object
            .keys(perm)
            .filter(p => (<any>perm)[p] === false);
        boolFields.forEach(x => (<any>perm)[x] === false ? (<any>perm)[x] = true : null);
    }
    if (props.actions) {
        props.actions.forEach(doIt => doIt(perm));
    }
    return perm;
}