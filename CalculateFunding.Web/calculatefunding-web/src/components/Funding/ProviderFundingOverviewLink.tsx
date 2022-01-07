import React from "react";
import { useSelector } from "react-redux";

import { IStoreState } from "../../reducers/rootReducer";
import { FeatureFlagsState } from "../../states/FeatureFlagsState";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { TextLink } from "../TextLink";

export const ProviderFundingOverviewLink = ({
  actionType,
  specificationId,
  providerId,
  specCoreProviderVersionId,
  fundingStreamId,
  fundingPeriodId,
  children,
}: {
  actionType: FundingActionType;
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
      to={`/FundingManagement/${actionType}/Provider/${providerId}/Specification/${specificationId}/Version/${specCoreProviderVersionId}`}
    >
      {children}
    </TextLink>
  ) : (
    // OLD - deprecated
    <TextLink
      to={`/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${specCoreProviderVersionId}/${fundingStreamId}/${fundingPeriodId}`}
    >
      {children}
    </TextLink>
  );
};