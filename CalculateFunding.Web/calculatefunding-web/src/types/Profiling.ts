export interface Profiling {
    totalAllocation: number;
    previousAllocation: number;
    profilingInstallments: ProfilingInstallments [];
}

export interface ProfilingInstallments {
    installmentYear: number,
    installmentMonth: string,
    installmentNumber: number,
    installmentValue: number;
    isPaid: boolean
}

export interface FundingStreamPeriodProfilePattern {
    fundingPeriodId: string,
    fundingStreamId: string,
    fundingLineId: string,
    profilePatternKey: string,
    fundingStreamPeriodStartDate: Date,
    fundingStreamPeriodEndDate: Date,
    reProfilePastPeriods: boolean,
    calculateBalancingPayment: boolean,
    allowUserToEditProfilePattern: boolean,
    profilePattern: ProfilePeriodPattern[],
    profilePatternDisplayName: string,
    providerTypeSubTypes: ProviderTypeSubType[],
    id: string
}

export interface ProfilePeriodPattern {
    periodType: PeriodType,
    period: string,
    periodStartDate: Date,
    periodEndDate: Date,
    periodYear: number,
    occurrence: number,
    distributionPeriod: string,
    periodPatternPercentage: number
}

enum PeriodType {
    CalendarMonth
}

export interface ProviderTypeSubType {
    providerType: string,
    providerSubType: string
}