import {PublishedProviderSearchRequest} from "../types/publishedProviderSearchRequest";

export interface FundingSearchSelectionState {
    selectedProviderIds: string[];
    searchCriteria: PublishedProviderSearchRequest | undefined;
}