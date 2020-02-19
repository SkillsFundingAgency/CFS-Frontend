import {IViewFundingState} from "../states/IViewFundingState";
import {ViewFundingAction, ViewFundingActionTypes} from "../actions/viewFundingAction";
import {ProvidersEntity} from "../types/publishedProvider";

const initialState: IViewFundingState = {
    specifications: {
        name: "",
        id: "",
        templateIds: {
            PSG: ""
        },
        publishedResultsRefreshedAt: null,
        providerVersionId: "",
        lastCalculationUpdatedAt: "",
        fundingStreams: [],
        fundingPeriod: {
            id: "",
            name: ""
        },
        isSelectedForFunding: false,
        description: "",
        approvalStatus: ""
    },
    fundingStreams: [],
    selectedFundingPeriods: [],
    specificationSelected: false,
    publishedProviderResults: {
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 1,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0,
        },
        providers: [] as ProvidersEntity[],
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0,
        filteredFundingAmount: 0,
        canPublish: false,
        canApprove: false,
        totalFundingAmount: 0,
        totalProvidersToApprove: 0,
        totalProvidersToPublish: 0,
    },
    latestRefreshDateResults: '',
    approveFundingJobId: '',
    releaseFundingJobId: '',
    refreshFundingJobId: '',
    filterTypes: [],
    pageState: "IDLE",
    userPermission: {
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
        specificationId: "",
        userId: ""
    },
    jobCurrentlyInProgress: '',
    localAuthorities: []
};

export function reduceViewFundingState(state: IViewFundingState = initialState, action: ViewFundingAction): IViewFundingState {
    switch (action.type) {
        case ViewFundingActionTypes.GET_SPECIFICATIONS:
            return {...state, specifications: action.payload};
        case ViewFundingActionTypes.GET_FUNDINGSTREAMS:
            return {...state, fundingStreams: action.payload};
        case ViewFundingActionTypes.GET_SELECTEDFUNDINGPERIODS:
            return {...state, selectedFundingPeriods: action.payload};
        case ViewFundingActionTypes.GET_PUBLISHEDPROVIDERRESULTS:
            return {...state, publishedProviderResults: action.payload, specificationSelected: action.success, filterTypes: action.filterTypes};
        case ViewFundingActionTypes.GET_LATESTREFRESHDATE:
            return {...state, latestRefreshDateResults: action.payload};
        case ViewFundingActionTypes.FILTER_PUBLISHEDPROVIDERRESULTS:
            return {...state, publishedProviderResults: action.payload};
        case ViewFundingActionTypes.REFRESH_FUNDING:
            return {...state, refreshFundingJobId: action.payload};
        case ViewFundingActionTypes.APPROVE_FUNDING:
            return {...state, approveFundingJobId: action.payload};
        case ViewFundingActionTypes.RELEASE_FUNDING:
            return {...state, releaseFundingJobId: action.payload};
        case ViewFundingActionTypes.CHANGE_PAGESTATE:
            return {...state, pageState: action.payload};
        case ViewFundingActionTypes.GET_USERPERMISSION:
            return {...state, userPermission: action.payload};
        case ViewFundingActionTypes.GET_LATESTJOBFORSPECIFICATION:
            return {...state, jobCurrentlyInProgress: action.payload};
        case ViewFundingActionTypes.GET_LOCALAUTHORITIES:
            return {...state, localAuthorities: action.payload};
        default:
            return state;
    }
}