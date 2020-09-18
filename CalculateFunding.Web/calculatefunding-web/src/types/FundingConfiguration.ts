import {ApprovalMode} from "./ApprovalMode";
import {ProviderSource} from "./CoreProviderSummary";

export interface FundingConfiguration {
    fundingStreamId: string;
    fundingPeriodId: string;
    approvalMode: ApprovalMode;
    providerSource: ProviderSource;
    defaultTemplateVersion: string;
}