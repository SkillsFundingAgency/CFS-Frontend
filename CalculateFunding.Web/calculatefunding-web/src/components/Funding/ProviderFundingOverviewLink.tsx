import React from "react";
import { useSelector } from "react-redux";

import { IStoreState } from "../../reducers/rootReducer";
import { FeatureFlagsState } from "../../states/FeatureFlagsState";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { TextLink } from "../TextLink";

export const ProviderFundingOverviewUri = ({
  actionType,
  specificationId,
  providerId,
  specCoreProviderVersionId,
  fundingStreamId,
  fundingPeriodId,
}: {
  actionType?: FundingActionType;
  specificationId: string;
  providerId: string;
  specCoreProviderVersionId?: string;
  fundingStreamId: string;
  fundingPeriodId: string;
}) => {
  const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
    (state) => state.featureFlags
  );
  return featureFlagsState.enableNewFundingManagement
    ? `/FundingManagement/${actionType}/Provider/${providerId}/Specification/${specificationId}/Version/${specCoreProviderVersionId}`
    : `/Approvals/ProviderFundingOverview/${specificationId}/${providerId}/${specCoreProviderVersionId}/${fundingStreamId}/${fundingPeriodId}`;
};

export const ProviderFundingOverviewLink = (props: {
  actionType?: FundingActionType;
  specificationId: string;
  providerId: string;
  specCoreProviderVersionId?: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  children: any;
}) => <TextLink to={ProviderFundingOverviewUri(props)}>{props.children}</TextLink>;
