import {ProviderDataTrackingMode} from "./ProviderDataTrackingMode";

export interface UpdateSpecificationModel {
    name: string;
    fundingStreamId: string;
    providerVersionId?: string;
    providerSnapshotId?: number;
    description: string;
    fundingPeriodId: string;
    assignedTemplateIds: Record<string, string>;
    coreProviderVersionUpdates: ProviderDataTrackingMode | undefined
}
