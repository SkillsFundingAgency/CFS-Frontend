import {RunningStatus} from "./RunningStatus";
import {CompletionStatus} from "./CompletionStatus";
import {JobType} from "./jobType";

export interface JobTrigger {
    message: string,
    entityId: string,
    entityType: string,
}

export interface JobResponse {
    jobId: string,
    jobType: string,
    specificationId?: string,
    entityId?: string,
    outcome?: string,
    outcomes?: JobOutcome[],
    runningStatus: RunningStatus,
    completionStatus?: CompletionStatus | undefined,
    invokerUserId?: string,
    invokerUserDisplayName?: string,
    parentJobId?: string,
    trigger?: JobTrigger,
    lastUpdated: Date,
    created?: Date
}

export interface JobDetails {
    jobId: string,
    jobType?: string,
    specificationId?: string,
    statusDescription: string,
    jobDescription: string,
    runningStatus: RunningStatus,
    completionStatus?: CompletionStatus | undefined,
    outcome?: string,
    failures: JobFailure[],
    isSuccessful: boolean,
    isFailed: boolean,
    isActive: boolean,
    isComplete: boolean,
    parentJobId?: string,
    invokerUserId?: string,
    invokerUserDisplayName?: string,
    lastUpdated?: Date,
    created?: Date,
    trigger?: JobTrigger
}

export enum JobOutcomeType {
    Succeeded = "Succeeded",
    ValidationError = "ValidationError",
    UserError = "UserError",
    Inconclusive = "Inconclusive",
    Failed = "Failed"
}

export interface JobOutcome {
    description: string,
    type: JobOutcomeType,
    jobType: JobType,
    isSuccessful: boolean
}
export interface JobFailure {
    description: string,
    type: JobOutcomeType,
    jobType: JobType,
    jobDescription: string
}