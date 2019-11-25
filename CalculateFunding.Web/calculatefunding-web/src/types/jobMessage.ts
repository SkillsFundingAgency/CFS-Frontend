export interface JobMessage{
    completionStatus: null;
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
    runningStatus: string;
    specificationId: string;
    statusDateTime: string;
    supersededByJobId: number;
}