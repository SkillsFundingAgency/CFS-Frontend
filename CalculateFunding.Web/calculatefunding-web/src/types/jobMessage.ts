export interface JobMessage {
    completionStatus: string | null;
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
    statusDateTime: Date;
    supersededByJobId: number;
    jobCreatedDateTime: Date;
}

export interface JobSummary {
    completionStatus: string | null;
    invokerUserDisplayName: string;
    invokerUserId: string;
    jobId: string;
    jobType: string;
    parentJobId: number;
    runningStatus: string;
    specificationId: string;
    lastUpdated: Date;
    created: Date;
    entityId: string;
    lastUpdatedFormatted: string;
    createdFormatted: string;
}