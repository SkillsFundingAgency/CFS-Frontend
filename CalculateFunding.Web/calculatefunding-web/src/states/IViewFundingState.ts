import {FundingPeriod, FundingStream, Specification} from "../types/viewFundingTypes";
import {FacetsEntity, PublishedProviderItems} from "../types/publishedProvider";
import {EffectiveSpecificationPermission} from "../types/EffectiveSpecificationPermission";
import {JobMessage} from "../types/jobMessage";

export interface IViewFundingState {
    specifications: Specification,
    fundingStreams: FundingStream[],
    selectedFundingPeriods: FundingPeriod[],
    publishedProviderResults: PublishedProviderItems,
    latestRefreshDateResults: string,
    specificationSelected: boolean,
    refreshFundingJobId: string,
    approveFundingJobId: string,
    releaseFundingJobId: string,
    filterTypes: FacetsEntity[],
    pageState: string,
    userPermission: EffectiveSpecificationPermission,
    latestJob: JobMessage
    localAuthorities: string[];
}
