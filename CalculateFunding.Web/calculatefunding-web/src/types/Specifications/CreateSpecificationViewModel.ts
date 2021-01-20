export interface CreateSpecificationViewModel {
    name: string;
    fundingStreamId: string;
    providerVersionId?: string;
    description: string;
    fundingPeriodId: string;
    assignedTemplateIds: { [key: string]: string[] };
    providerSnapshotId?: string;
}

