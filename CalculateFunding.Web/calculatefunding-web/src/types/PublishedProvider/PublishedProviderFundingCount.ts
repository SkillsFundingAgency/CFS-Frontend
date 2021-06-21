
export enum FundingActionType {
    Refresh = "Refresh",
    Approve = "Approve",
    Release = "Release",
}

export interface PublishedProviderFundingCount {
    count: number,
    paidProviderCount: number,
    indicativeProviderCount: number,
    providerTypes: ProviderTypeSubType[],
    providerTypesCount: number,
    localAuthorities: string[],
    localAuthoritiesCount: number,
    fundingStreamsFundings: PublishedProviderFundingStreamFunding[],
    totalFunding: number | null,
    paidProvidersTotalFunding: number | null,
    indicativeProviderTotalFunding: number | null
}

export interface ProviderTypeSubType {
    providerType: string,
    providerSubType: string
}

export interface PublishedProviderFundingStreamFunding {
    fundingStreamId: string,
    totalFunding: number | null
}

