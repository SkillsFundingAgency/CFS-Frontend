import React from "react";

import { useFeatureFlags } from "../../hooks/useFeatureFlags";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { TextLink } from "../TextLink";

export const ProviderFundingLineProfileLink = ({
  editMode = "view",
  actionType,
  fundingLineId,
  specificationId,
  providerId,
  specCoreProviderVersionId,
  fundingStreamId,
  fundingPeriodId,
  children,
}: {
  actionType: FundingActionType;
  editMode: "view" | "edit";
  fundingLineId: string;
  specificationId: string;
  providerId: string;
  specCoreProviderVersionId?: string;
  fundingStreamId?: string;
  fundingPeriodId?: string;
  children: any;
}) => {
  const { enableNewFundingManagement } = useFeatureFlags();
  return enableNewFundingManagement ? (
    <TextLink
      to={`/FundingManagement/${actionType}/Provider/${providerId}/Specification/${specificationId}/Version/${specCoreProviderVersionId}/FundingLine/${fundingLineId}/${editMode}`}
    >
      {children}
    </TextLink>
  ) : (
    // OLD - deprecated
    <TextLink
      to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${specCoreProviderVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineId}/${editMode}`}
    >
      {children}
    </TextLink>
  );
};
