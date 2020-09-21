import {number} from "yargs";

export interface FundingLineProfile {
  fundingLineCode: string,
  fundingLineName: string,
  ukprn: string,
  totalAllocation?: number,
  amountAlreadyPaid: number,
  remainingAmount?: number,
  carryOverAmount?: number,
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
  actualDate?: Date
}

export interface Reference {
  id: string,
  name: string
}