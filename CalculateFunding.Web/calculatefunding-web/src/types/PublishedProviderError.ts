
export enum PublishedProviderErrorType {
    Undefined = "Undefined",
    FundingLineValueProfileMismatch = "FundingLineValueProfileMismatch",
    TrustIdMismatch = "TrustIdMismatch",
}

export interface PublishedProviderError {
    identifier: string,
    fundingLineCode: string,
    fundingStreamId: string,
    publishedProviderErrorType: PublishedProviderErrorType,
    summaryErrorMessage: string,
    detailedErrorMessage: string,
}