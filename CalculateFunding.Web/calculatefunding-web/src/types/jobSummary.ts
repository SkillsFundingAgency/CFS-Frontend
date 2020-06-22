export interface JobSummary{
    jobId: string;
    jobType: string;
    specificationId: string;
    entityId: string;
    runningStatus: RunningStatus;
    completionStatus: CompletionStatus;
    invokerUserId: string;
    invokerUserDisplayName: string;
    parentJobId: string;
    lastUpdated: Date
    created: Date;
}

export enum RunningStatus
{
    queued = 0,
    queuedWithService = 1,
    inProgress = 2,
    completed = 3,
}

export enum CompletionStatus {
    succeeded = 0,
    failed = 1,
    cancelled = 2,
    timedOut = 3,
    superseded = 4
}