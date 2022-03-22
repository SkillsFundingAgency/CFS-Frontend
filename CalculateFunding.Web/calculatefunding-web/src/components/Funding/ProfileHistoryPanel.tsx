import { useFeatureFlags } from "hooks/useFeatureFlags";
import React from "react";
import { useQuery } from "react-query";

import { getPreviousProfileExistsForSpecificationForProviderForFundingLine } from "../../services/fundingLineDetailsService";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { TextLink } from "../TextLink";

export interface ProfileHistoryPanelProps {
  providerId: string;
  fundingStreamId: string;
  specificationId: string;
  fundingLineCode: string;
  providerVersionId: string;
  fundingPeriodId: string;
  actionType?: FundingActionType;
}

export function ProfileHistoryPanel({
  specificationId,
  providerId,
  providerVersionId,
  fundingStreamId,
  fundingPeriodId,
  fundingLineCode,
  actionType,
}: ProfileHistoryPanelProps) {
  const { enableNewFundingManagement } = useFeatureFlags();
  const { isLoading, isError, data } = useQuery<boolean>(
    `profile-history-exists-${specificationId}--${providerId}-${fundingStreamId}-${fundingLineCode}`,
    async () =>
      (
        await getPreviousProfileExistsForSpecificationForProviderForFundingLine(
          specificationId,
          providerId,
          fundingStreamId,
          fundingLineCode
        )
      ).data
  );

  return (
    <>
      <h3 className="govuk-heading-m">Previous profiles</h3>
      {isLoading && (
        <div className="govuk-inset-text">
          Checking whether profile history exists for this funding line...
        </div>
      )}
      {isError && (
        <div className="govuk-inset-text">
          An error occurred whilst checking profile history. Try refreshing the page.
        </div>
      )}
      {data !== undefined && !data ? (
        <div className="govuk-inset-text">No profile history exists for this funding line.</div>
      ) : null}
      {data !== undefined && data ? (
        <div className="govuk-body">
          {enableNewFundingManagement ? (
            <TextLink
              to={`/FundingManagement/${actionType}/${specificationId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineCode}/${providerId}/${providerVersionId}/ProfilingHistory`}
            >
              History of previous profiles
            </TextLink>
          ) : (
            <TextLink
              to={`/Approvals/ProfilingHistory/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineCode}`}
            >
              History of previous profiles
            </TextLink>
          )}
        </div>
      ) : null}
    </>
  );
}
