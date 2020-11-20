import {RunningStatus} from "./RunningStatus";
import {CompletionStatus} from "./CompletionStatus";

export interface JobTrigger {
    message: string,
    entityId: string,
    entityType: string,
}
export interface JobMessage {
    jobId: string;
    jobType: string;
    runningStatus: RunningStatus;
    completionStatus?: CompletionStatus | undefined;
    specificationId: string;
    invokerUserId: string;
    invokerUserDisplayName: string;
    itemCount?: number;
    overallItemsFailed?: number;
    overallItemsProcessed?: number;
    overallItemsSucceeded?: number;
    trigger: JobTrigger;
    parentJobId: string;
    statusDateTime: Date;
    supersededByJobId: number;
    outcome: string;
    jobCreatedDateTime: Date;
}