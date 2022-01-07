import React from "react";
import { useSelector } from "react-redux";

import { IStoreState } from "../../reducers/rootReducer";
import { FeatureFlagsState } from "../../states/FeatureFlagsState";
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
  children
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
  const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
    (state) => state.featureFlags
  );
  return featureFlagsState.enableNewFundingManagement ? (
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
