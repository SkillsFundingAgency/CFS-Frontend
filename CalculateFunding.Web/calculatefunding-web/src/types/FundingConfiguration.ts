import {ApprovalMode} from "./ApprovalMode";
import {ProviderSource} from "./CoreProviderSummary";
import {UpdateCoreProviderVersion} from "./Provider/UpdateCoreProviderVersion";

export interface FundingConfiguration {
    fundingStreamId: string;
    fundingPeriodId: string;
    approvalMode: ApprovalMode;
    providerSource: ProviderSource;
    defaultTemplateVersion: string;
    enableConverterDataMerge: boolean;
    updateCoreProviderVersion: UpdateCoreProviderVersion;
}
