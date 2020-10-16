export interface PublishedProviderIdsSearchRequest {
    searchTerm: string,
    hasErrors: boolean | undefined,
    fundingStreamId: string,
    fundingPeriodId: string,
    specificationId: string,
    localAuthority: string[],
    status: string[],
    providerType: string[],
    providerSubType: string[],
    searchFields: string[],
}

export const buildInitialPublishedProviderIdsSearchRequest = (fundingStreamId: string, fundingPeriodId: string, specificationId: string):
    PublishedProviderIdsSearchRequest => {return {
    searchTerm: "",
    status: [],
    providerType: [],
    providerSubType: [],
    localAuthority: [],
    fundingStreamId: fundingStreamId,
    specificationId: specificationId,
    hasErrors: undefined,
    fundingPeriodId: fundingPeriodId,
    searchFields: []
}};
