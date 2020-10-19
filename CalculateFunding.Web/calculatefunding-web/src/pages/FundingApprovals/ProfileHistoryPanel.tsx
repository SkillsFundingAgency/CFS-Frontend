import React from "react";
import {useQuery} from "react-query";
import {Link} from "react-router-dom";
import {getPreviousProfileExistsForSpecificationForProviderForFundingLine} from "../../services/fundingLineDetailsService";

export interface ProfileHistoryPanelProps {
  providerId: string;
  fundingStreamId: string;
  specificationId: string;
  fundingLineCode: string;
  providerVersionId: string;
  fundingPeriodId: string;
}

function useProfileHistory(specificationId: string, providerId: string, fundingStreamId: string, fundingLineCode: string) {
  return useQuery<boolean>(
    [`profile-history-exists`, specificationId, providerId, fundingStreamId, fundingLineCode],
    getPreviousProfileExistsForSpecificationForProviderForFundingLine, {retry: 1, enabled: specificationId});
}

export function ProfileHistoryPanel({specificationId, providerId, providerVersionId, fundingStreamId,
  fundingPeriodId, fundingLineCode}: ProfileHistoryPanelProps) {
  const {isLoading, isError, data} = useProfileHistory(specificationId, providerId, fundingStreamId, fundingLineCode);

  return (
    <>
      <h3 className="govuk-heading-m">Previous profiles</h3>
      {isLoading && <div className="govuk-inset-text">Checking whether profile history exists for this funding line...</div>}
      {isError && <div className="govuk-inset-text">An error occurred whilst checking profile history. Try refreshing the page.</div>}
      {data !== undefined && !data ? <div className="govuk-inset-text">No profile history exists for this funding line.</div> : null}
      {data !== undefined && data ?
        <div className="govuk-body">
          <Link
            to={`/Approvals/ProfilingHistory/${specificationId}/${providerId}/${providerVersionId}/${fundingStreamId}/${fundingPeriodId}/${fundingLineCode}`}
            className="govuk-link">
            History of previous profiles
        </Link>
        </div>
        : null}
    </>
  )
}