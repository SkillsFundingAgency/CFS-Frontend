import {FundingPeriod, FundingStream} from "./viewFundingTypes";

export interface SpecificationSummary {
    name: string;
    id: string;
    approvalStatus: string;
    isSelectedForFunding: boolean;
    description: string | null;
    providerVersionId?: string;
    fundingStreams: FundingStream[];
    fundingPeriod: FundingPeriod
    providerSnapshotId?: number;
    templateIds: { [key: string]: string };
    dataDefinitionRelationshipIds: string[];
}
