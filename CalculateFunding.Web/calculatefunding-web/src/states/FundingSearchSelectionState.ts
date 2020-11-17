import {PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";

export interface FundingSearchSelectionState {
    providerVersionIds: string[];
    searchCriteria: PublishedProviderSearchRequest | undefined
}