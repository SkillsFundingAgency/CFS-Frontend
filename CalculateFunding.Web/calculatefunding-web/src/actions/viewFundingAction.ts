import axiosInstance from "../services/axiosInterceptor"
import {FundingPeriod, FundingStream, Specification} from "../types/viewFundingTypes";
import {ThunkAction} from "redux-thunk";
import {ActionCreator, Dispatch} from "redux";
import {IViewFundingState} from "../states/IViewFundingState";
import {SearchRequestViewModel} from "../types/searchRequestViewModel";
import {FacetsEntity, PublishedProviderItems} from "../types/publishedProvider";
import {EffectiveSpecificationPermission} from "../types/EffectiveSpecificationPermission";
import {JobMessage} from "../types/jobMessage";
import {SearchMode} from "../types/SearchMode";
import {getLatestJobForSpecificationService} from "../services/jobService";
import {getLocalAuthoritiesService} from "../services/providerService";

export enum ViewFundingActionTypes {
    GET_SPECIFICATIONS = 'getSelectedSpecifications',
    GET_FUNDINGSTREAMS = 'getAllFundingStreams',
    GET_SELECTEDFUNDINGPERIODS = 'getSelectedFundingPeriods',
    GET_PUBLISHEDPROVIDERRESULTS = 'getPublishedProviderResults',
    GET_LATESTREFRESHDATE = 'getLatestRefreshDate',
    GET_USERPERMISSION = 'getUserPermissions',
    GET_LATESTJOBFORSPECIFICATION = 'getLatestJobForSpecification',
    FILTER_PUBLISHEDPROVIDERRESULTS = 'filterPublishedProviderResults',
    REFRESH_FUNDING = 'refreshFunding',
    APPROVE_FUNDING = 'approveFunding',
    RELEASE_FUNDING = 'releaseFunding',
    CHANGE_PAGESTATE = 'changePageState',
    GET_LOCALAUTHORITIES = 'getLocalAuthorities',
    
}

export interface IGetSpecificationAction {
    type: ViewFundingActionTypes.GET_SPECIFICATIONS;
    payload: Specification
}

export interface IGetAllFundingStreamsAction {
    type: ViewFundingActionTypes.GET_FUNDINGSTREAMS,
    payload: FundingStream[]
}

export interface IGetSelectedFundingPeriodsAction {
    type: ViewFundingActionTypes.GET_SELECTEDFUNDINGPERIODS,
    payload: FundingPeriod[]
}

export interface IGetPublishedProviderResultsAction {
    type: ViewFundingActionTypes.GET_PUBLISHEDPROVIDERRESULTS,
    payload: PublishedProviderItems,
    success: boolean,
    filterTypes: FacetsEntity[]
}

export interface IGetLatestRefreshDateAction {
    type: ViewFundingActionTypes.GET_LATESTREFRESHDATE,
    payload: string
}

export interface IGetUserPermissions {
    type: ViewFundingActionTypes.GET_USERPERMISSION;
    payload: EffectiveSpecificationPermission
}

export interface IGetLatestJobForSpecification {
    type: ViewFundingActionTypes.GET_LATESTJOBFORSPECIFICATION;
    payload: JobMessage
}

export interface IFilterPublishedProviderResultsAction {
    type: ViewFundingActionTypes.FILTER_PUBLISHEDPROVIDERRESULTS,
    payload: PublishedProviderItems,
}

export interface IRefreshFundingAction {
    type: ViewFundingActionTypes.REFRESH_FUNDING,
    payload: string,
}

export interface IApproveFundingAction {
    type: ViewFundingActionTypes.APPROVE_FUNDING,
    payload: string,
}

export interface IReleaseFundingAction {
    type: ViewFundingActionTypes.RELEASE_FUNDING,
    payload: string,
}
export interface ChangePageStateAction {
    type: ViewFundingActionTypes.CHANGE_PAGESTATE,
    payload: string
}

export interface GetLocalAuthoritiesAction {
    type: ViewFundingActionTypes.GET_LOCALAUTHORITIES,
    payload: string[]
}

export type ViewFundingAction =
    IGetSpecificationAction
    | IGetAllFundingStreamsAction
    | IGetSelectedFundingPeriodsAction
    | IGetPublishedProviderResultsAction
    | IGetLatestRefreshDateAction
    | IGetLatestJobForSpecification
    | IGetUserPermissions
    | IRefreshFundingAction
    | IApproveFundingAction
    | IReleaseFundingAction
    | IFilterPublishedProviderResultsAction
    | ChangePageStateAction
    | GetLocalAuthoritiesAction;

export const getSelectedSpecifications: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (fundingPeriodId: string, fundingStreamId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance(`/api/specs/selected-specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        dispatch({
            type: ViewFundingActionTypes.GET_SPECIFICATIONS,
            payload: response.data[0] as Specification
        });
    }
};

export const getAllFundingStreams: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = () => {
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance('/api/specs/get-fundingstreams-for-selected-specifications', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        dispatch({
            type: ViewFundingActionTypes.GET_FUNDINGSTREAMS,
            payload: response.data as FundingStream[]
        })
    }
};

export const getSelectedFundingPeriods: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (id: string) => {
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance(`/api/specs/get-fundingperiods-for-selected-fundingstream/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        dispatch({
            type: ViewFundingActionTypes.GET_SELECTEDFUNDINGPERIODS,
            payload: response.data as FundingPeriod[]
        })
    }
};

export const getPublishedProviderResults: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (fundingPeriodId: string, fundingStreamId: string, specificationId: string, providerType: string, localAuthority: string, status: string) => {
    return async (dispatch: Dispatch) => {

        const searchRequest: SearchRequestViewModel = {
            errorToggle: "",
            facetCount: 10,
            fundingStreamId: fundingStreamId,
            fundingPeriodId: fundingPeriodId,
            localAuthority: localAuthority,
            status: status,
            providerType: providerType,
            includeFacets: true,
            pageNumber: 1,
            pageSize: 50,
            searchMode: SearchMode.All,
            searchTerm: "",
        };

        const response = await axiosInstance(`/api/publishedprovider/searchpublishedproviders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchRequest
        });
        dispatch({
            type: ViewFundingActionTypes.GET_PUBLISHEDPROVIDERRESULTS,
            payload: response.data as PublishedProviderItems,
            success: (response.data as PublishedProviderItems).totalResults > 0,
            filterTypes: (response.data as PublishedProviderItems).facets
        })
    }
};

export const getUserPermissions: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance(`/api/users/effectivepermissions/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        dispatch({
            type: ViewFundingActionTypes.GET_USERPERMISSION,
            payload: response.data as EffectiveSpecificationPermission
        });
    }
};

export const getLatestRefreshDate: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (specificationId: string) => {
    const jobTypes = "RefreshFundingJob";
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance(`/api/jobs/${specificationId}/last-updated/${jobTypes}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let latestDate = "";

        if (response.status === 200)
            latestDate = response.data;

        dispatch({
            type: ViewFundingActionTypes.GET_LATESTREFRESHDATE,
            payload: latestDate,
        })
    }
};

export const getLatestJobForSpecification: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await getLatestJobForSpecificationService(specificationId);
        let jobMessage = response.data as JobMessage;
        dispatch({
            type: ViewFundingActionTypes.GET_LATESTJOBFORSPECIFICATION,
            payload: jobMessage,
        })
    }
};

export const filterPublishedProviderResults: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (fundingPeriodId: string, fundingStreamId: string, specificationId: string, providerType: string, localAuthority: string, status: string, pageNumber: number, pageSize: number) => {
    return async (dispatch: Dispatch) => {

        const searchRequest: SearchRequestViewModel = {
            errorToggle: "",
            facetCount: 10,
            fundingStreamId: fundingStreamId,
            fundingPeriodId: fundingPeriodId,
            localAuthority: localAuthority,
            status: status,
            providerType: providerType,
            includeFacets: true,
            pageNumber: pageNumber !== 0 ? pageNumber : 1,
            pageSize: pageSize > 50 ? pageSize:50,
            searchMode: SearchMode.All,
            searchTerm: "",
        };

        const response = await axiosInstance(`/api/publishedprovider/searchpublishedproviders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: searchRequest
        });
        dispatch({
            type: ViewFundingActionTypes.FILTER_PUBLISHEDPROVIDERRESULTS,
            payload: response.data as PublishedProviderItems,
        })
    }
};

export const refreshFunding: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance(`/api/publish/refreshfunding/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        dispatch({
            type: ViewFundingActionTypes.REFRESH_FUNDING,
            payload: response.data,
        })
    }
};

export const approveFunding: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance(`/api/publish/approvefunding/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        dispatch({
            type: ViewFundingActionTypes.APPROVE_FUNDING,
            payload: response.data,
        })
    }
};

export const releaseFunding: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (specificationId: string) => {
    return async (dispatch: Dispatch) => {
        const response = await axiosInstance(`/api/publish/publishfunding/${specificationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        dispatch({
            type: ViewFundingActionTypes.RELEASE_FUNDING,
            payload: response.data,
        })
    }
};

export const changePageState: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (state: string) => {
    return async (dispatch: Dispatch) => {
        dispatch({
            type: ViewFundingActionTypes.CHANGE_PAGESTATE,
            payload: state,
        })
    }
};

export const getLocalAuthorities: ActionCreator<ThunkAction<Promise<any>, IViewFundingState, null, ViewFundingAction>> = (fundingStreamId: string, fundingPeriodId:string) => {
    return async (dispatch: Dispatch) => {
        const response = getLocalAuthoritiesService(fundingStreamId, fundingPeriodId, "");
        dispatch({
            type: ViewFundingActionTypes.GET_LOCALAUTHORITIES,
            payload: response,
        })
    }
};
