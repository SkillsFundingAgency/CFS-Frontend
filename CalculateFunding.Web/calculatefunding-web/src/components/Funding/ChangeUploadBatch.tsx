import React from "react";
import { Link } from "react-router-dom";

import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { SpecificationSummary } from "../../types/SpecificationSummary";

export const ChangeUploadBatch = ({
  specification,
  actionType,
}: {
  specification: SpecificationSummary;
  actionType: FundingActionType;
}) => {
  return (
    <div className="govuk-grid-row govuk-!-margin-bottom-7">
      <div className="govuk-grid-column-three-quarters">
        <Link
          to={`/FundingManagement/${actionType}/UploadBatch/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specification.id}`}
          className="govuk-link govuk-link--no-visited-state right-align"
        >
          Change selection
        </Link>
      </div>
    </div>
  );
};
