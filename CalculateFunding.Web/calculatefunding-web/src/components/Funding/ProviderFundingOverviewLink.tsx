import React from "react";

import { useFeatureFlags } from "../../hooks/useFeatureFlags";
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
  const { enableNewFundingManagement } = useFeatureFlags();
  return enableNewFundingManagement
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
