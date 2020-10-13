import {StringNullableChain} from "lodash";
import {string} from "prop-types";

export interface ApplyCustomProfileRequest {
    fundingStreamId: string,
    fundingPeriodId: string,
    fundingLineCode: string,
    providerId: string,
    customProfileName: string,
    carryOver: number | null,
    profilePeriods: ProfilePeriod[]
}

export interface ProfilePeriod {
    type: ProfilePeriodType,
    typeValue: string,
    year: number,
    occurrence: number,
    profiledValue: number,
    distributionPeriodId: string
}

export enum ProfilePeriodType {
    CalendarMonth = "CalendarMonth"
}