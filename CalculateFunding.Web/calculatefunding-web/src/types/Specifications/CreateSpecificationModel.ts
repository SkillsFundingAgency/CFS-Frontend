import {ProviderDataTrackingMode} from "./ProviderDataTrackingMode";

export interface CreateSpecificationModel {
    name: string;
    fundingStreamId: string;
    providerVersionId?: string;
    description: string;
    fundingPeriodId: string;
    assignedTemplateIds: { [key: string]: string[] };
    providerSnapshotId?: number;
    coreProviderVersionUpdates: ProviderDataTrackingMode | undefined;
}

