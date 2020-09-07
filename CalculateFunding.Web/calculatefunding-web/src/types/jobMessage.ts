import {RunningStatus} from "./RunningStatus";
import {CompletionStatus} from "./CompletionStatus";

export interface JobMessage {
    runningStatus?: RunningStatus | null;
    completionStatus?: CompletionStatus | null;
    invokerUserDisplayName: string;
    invokerUserId: string;
    itemCount: number;
    jobId: string;
    jobType: string;
    outcome: any;
    overallItemsFailed: number;
    overallItemsProcessed: number;
    overallItemsSucceeded: number;
    parentJobId: number;
    specificationId: string;
    statusDateTime: Date;
    supersededByJobId: number;
    jobCreatedDateTime: Date;
}