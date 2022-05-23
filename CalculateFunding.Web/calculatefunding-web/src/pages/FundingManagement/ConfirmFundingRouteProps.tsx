import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";

export interface ConfirmFundingRouteProps {
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
    mode: Exclude<FundingActionType, FundingActionType.Refresh>;
}
