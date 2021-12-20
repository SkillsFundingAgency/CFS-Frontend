import { ApprovalMode } from "./ApprovalMode";
import { PaymentOrganisationSource, ProviderSource } from "./CoreProviderSummary";
import { UpdateCoreProviderVersion } from "./Provider/UpdateCoreProviderVersion";

export interface FundingConfiguration {
    fundingStreamId: string;
    fundingPeriodId: string;
    approvalMode: ApprovalMode;
    providerSource: ProviderSource;
    paymentOrganisationSource?: PaymentOrganisationSource;
    defaultTemplateVersion: string;
    indicativeOpenerProviderStatus?: string[];
    allowedPublishedFundingStreamsIdsToReference?: string[];
    enableUserEditableCustomProfiles?: boolean;
    enableUserEditableRuleBasedProfiles?: boolean;
    runCalculationEngineAfterCoreProviderUpdate?: boolean;
    enableConverterDataMerge: boolean;
    updateCoreProviderVersion: UpdateCoreProviderVersion;
    releaseActionGroups?: ReleaseActionGroup[];
    releaseChannels: ReleaseChannel[]
}

export interface ReleaseChannel {
    channelCode: string
}

export interface ReleaseActionGroup {
    sortOrder: number;
    description: string;
    channelCodes: string[];
}
