export interface FundingLineProfile {
  fundingLineCode: string;
  fundingLineName: string;
  ukprn: string;
  fundingLineAmount?: number;
  profilePatternTotal?: number;
  profilePatternTotalWithCarryOver?: number;
  amountAlreadyPaid: number;
  remainingAmount?: number;
  carryOverAmount: number | null;
  providerName: string;
  profilePatternKey: string;
  profilePatternName: string;
  profilePatternDescription: string;
  isCustomProfile: boolean;
  lastUpdatedUser: Reference;
  lastUpdatedDate?: Date;
  profileTotals: ProfileTotal[];
}

export interface FundingLineProfileViewModel {
  fundingLineProfile: FundingLineProfile;
  enableUserEditableCustomProfiles: boolean;
  enableUserEditableRuleBasedProfiles: boolean;
  contractedProvider: boolean;
}

export interface ProfileTotal {
  year: number;
  typeValue: string;
  occurrence: number;
  value: number;
  periodType: string;
  isPaid: boolean;
  installmentNumber: number;
  profileRemainingPercentage?: number;
  actualDate?: Date;
  distributionPeriodId: string;
}

export interface Reference {
  id: string;
  name: string;
}

export interface FundingLineChange {
  fundingLineTotal?: number;
  previousFundingLineTotal?: number;
  fundingStreamName: string;
  fundingLineName: string;
  carryOverAmount?: number;
  lastUpdatedUser: Reference;
  lastUpdatedDate?: Date;
  profileTotals: ProfileTotal[];
}

export interface FundingLineChangeViewModel {
  providerName: string;
  specificationName: string;
  fundingPeriodName: string;
  fundingLineChanges: FundingLineChange[];
}
