import {FundingPeriod, FundingStream, TemplateIds} from "../viewFundingTypes";

export interface EditSpecificationViewModel {
    fundingPeriod: FundingPeriod;
    fundingStreams: FundingStream[];
    providerVersionId: string;
    providerSnapshotId?: number;
    description: string;
    isSelectedForFunding: boolean;
    approvalStatus: string;
    templateIds: { [key: string]: string };
    dataDefinitionRelationshipIds: string[];
    id: string;
    name: string;
}
