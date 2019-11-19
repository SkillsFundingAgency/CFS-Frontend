import {FundingPeriod, FundingStream, Specification} from "../types/viewFundingTypes";
import {FacetsEntity, PublishedProviderItems} from "../types/publishedProvider";

export interface IViewFundingState {
    specifications: Specification,
    fundingStreams: FundingStream[],
    selectedFundingPeriods: FundingPeriod[],
    publishedProviderResults: PublishedProviderItems,
    specificationSelected: boolean,
    refreshFundingStatus: string,
    refreshFundingJobId: string,
    approveFundingJobId: string,
    publishFundingJobId: string,
    filterTypes: FacetsEntity[]
}