export interface UpdateSpecificationViewModel {
    name: string;
    fundingStreamId: string;
    providerVersionId: string;
    description: string;
    fundingPeriodId: string;
    assignedTemplateIds: { [key: string]: string[] };
}
