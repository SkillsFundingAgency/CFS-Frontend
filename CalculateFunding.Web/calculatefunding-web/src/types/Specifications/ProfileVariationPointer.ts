export interface ProfileVariationPointer {
    fundingStreamId: string;
    fundingLineId: string;
    periodType: string;
    typeValue: string;
    year: number;
    occurrence: number;
}

export interface FundingLineProfileVariationPointer {
    fundingLineId: string;
    profileVariationPointer: ProfileVariationPointer | null;
}
