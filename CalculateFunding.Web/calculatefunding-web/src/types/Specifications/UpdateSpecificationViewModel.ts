export interface UpdateSpecificationViewModel {
    name: string;
    fundingStreamId: string;
    providerVersionId?: string;
    providerSnapshotId?: number;
    description: string;
    fundingPeriodId: string;
    assignedTemplateIds: { [key: string]: string[] };
}
