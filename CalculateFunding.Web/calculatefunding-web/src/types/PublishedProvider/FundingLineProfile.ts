export interface FundingLineProfile {
  fundingLineCode: string,
  fundingLineName: string,
  ukprn: string,
  totalAllocation?: number,
  amountAlreadyPaid: number,
  remainingAmount?: number,
  carryOverAmount: number | null,
  providerName: string,
  profilePatternKey: string,
  profilePatternName: string,
  profilePatternDescription: string,
  lastUpdatedUser: Reference,
  lastUpdatedDate?: Date,
  profileTotalAmount: number,
  profileTotals: ProfileTotal[]
}

export interface ProfileTotal {
  year: number,
  typeValue: string,
  occurrence: number,
  value: number,
  periodType: string,
  isPaid: boolean,
  installmentNumber: number,
  profileRemainingPercentage?: number,
  actualDate?: Date,
  distributionPeriodId: string
}

export interface Reference {
  id: string,
  name: string
}