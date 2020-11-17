
export enum FundingActionType {
    Refresh = "Refresh",
    Approve = "Approve",
    Release = "Release",
}

export interface PublishedProviderFundingCount {
    count: number,
    providerTypes: ProviderTypeSubType[],
    providerTypesCount: number,
    localAuthorities: string[],
    localAuthoritiesCount: number,
    fundingStreamsFundings: PublishedProviderFundingStreamFunding[],
    totalFunding: number | null
}

export interface ProviderTypeSubType {
    providerType: string,
    providerSubType: string
}

export interface PublishedProviderFundingStreamFunding {
    fundingStreamId: string,
    totalFunding: number | null
}

