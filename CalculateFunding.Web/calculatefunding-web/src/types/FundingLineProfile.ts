import {Reference} from "./Reference";

export interface FundingLineProfile {
    fundingLineCode: string,
    fundingLineName: string,
    totalAllocation?: number,
    amountAlreadyPaid: number,
    remainingAmount?: number,
    carryOverAmount?: number,
    providerId: string,
    providerName: string,
    ukprn: string,
    profilePatternKey: string | null,
    profilePatternName: string,
    profilePatternDescription: string,
    lastUpdatedUser: Reference,
    lastUpdatedDate?: Date,
    profileTotalAmount?: number,
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

