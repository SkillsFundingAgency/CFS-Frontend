import {RunningStatus} from "./RunningStatus";
import {CompletionStatus} from "./CompletionStatus";

export interface JobSummary {
    jobId: string;
    jobType: string;
    specificationId?: string;
    entityId?: string;
    outcome?: string;
    message?: string;
    runningStatus: RunningStatus;
    completionStatus?: CompletionStatus | undefined;
    invokerUserId?: string;
    invokerUserDisplayName?: string;
    parentJobId?: string;
    lastUpdated: Date
    created?: Date;
}