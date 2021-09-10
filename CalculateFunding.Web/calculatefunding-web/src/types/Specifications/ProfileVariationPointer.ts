export interface ProfileVariationPointer {
  fundingStreamId: string;
  fundingLineId: string;
  periodType: string;
  typeValue: string;
  year: number;
  occurrence: number;
}

export interface FundingLineProfileVariationPointer {
  fundingLineName: string;
  fundingLineId: string;
  profileVariationPointer: ProfileVariationPointer | null;
}
