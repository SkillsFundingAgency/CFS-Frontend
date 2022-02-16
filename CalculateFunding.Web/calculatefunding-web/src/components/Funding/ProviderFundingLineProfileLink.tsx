import React from "react";

import { useFeatureFlags } from "../../hooks/useFeatureFlags";
import { FundingLineProfile } from "../../types/FundingLineProfile";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { TextLink } from "../TextLink";

export const ProviderFundingLineProfileLink = ({
  editMode = "view",
  actionType,
  profile,
  specificationId,
  providerId,
  specCoreProviderVersionId,
  fundingStreamId,
  fundingPeriodId,
  children,
}: {
  actionType: FundingActionType;
  editMode: "view" | "edit";
  profile: FundingLineProfile;
  specificationId: string;
  providerId: string;
  specCoreProviderVersionId?: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  children: any;
}) => {
  const { enableNewFundingManagement } = useFeatureFlags();
  return enableNewFundingManagement ? (
    <TextLink
      to={`/FundingManagement/${actionType}/Provider/${providerId}/Specification/${specificationId}/Version/${specCoreProviderVersionId}/FundingLine/${profile.fundingLineCode}/${editMode}`}
    >
      {children}
    </TextLink>
  ) : (
    // OLD - deprecated
    <TextLink
      to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${specCoreProviderVersionId}/${fundingStreamId}/${fundingPeriodId}/${profile.fundingLineCode}/${editMode}`}
    >
      {children}
    </TextLink>
  );
};
