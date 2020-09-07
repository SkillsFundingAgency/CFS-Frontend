import {RunningStatus} from "./RunningStatus";
import {CompletionStatus} from "./CompletionStatus";

export interface JobSummary {
    jobId?: string;
    jobType?: string;
    specificationId?: string;
    entityId?: string;
    runningStatus?: RunningStatus | null;
    completionStatus?: CompletionStatus | null;
    invokerUserId?: string;
    invokerUserDisplayName?: string;
    parentJobId?: string;
    lastUpdated?: Date
    created?: Date;
}