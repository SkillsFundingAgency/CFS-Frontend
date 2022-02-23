import React from "react";

import { useFeatureFlags } from "../../../hooks/useFeatureFlags";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { TextLink } from "../../TextLink";

export const ProviderFundingSearchLink = ({
  actionType,
  specificationId,
  fundingStreamId,
  fundingPeriodId,
  children,
}: {
  actionType: Exclude<FundingActionType, FundingActionType.Refresh>;
  specificationId: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  children: any;
}) => {
  const { enableNewFundingManagement } = useFeatureFlags();
  return enableNewFundingManagement ? (
    <TextLink
      to={`/FundingManagement/${actionType}/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
    >
      {children}
    </TextLink>
  ) : (
    // OLD - deprecated
    <TextLink
      to={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
    >
      {children}
    </TextLink>
  );
};
