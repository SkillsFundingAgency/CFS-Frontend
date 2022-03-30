import React from "react";

import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { PublishedProviderResult } from "../../../types/PublishedProvider/PublishedProviderSearchResults";

export const ProviderStatusColumn = ({
  provider,
  actionType,
}: {
  provider: PublishedProviderResult;
  actionType: Exclude<FundingActionType, FundingActionType.Refresh> | undefined;
}) =>
  provider.hasErrors ? (
    <td className="govuk-table__cell govuk-body">
      <span className="govuk-error-message">Error</span>
    </td>
  ) : !actionType ? ( // only for old funding page
    <td className="govuk-table__cell govuk-body">{provider.fundingStatus}</td>
  ) : (
    <>
      <td className="govuk-table__cell govuk-body">
        {provider.fundingStatus} <span>{`v${provider.majorVersion}.${provider.minorVersion}`}</span>
      </td>
      {!!actionType && ( // exclude old funding page
        <td className="govuk-table__cell govuk-body">
          {!provider.releaseChannels ? (
            <>&nbsp;</>
          ) : (
            provider.releaseChannels.map((release, idx) => (
              <div key={idx}>{`${release.channelName} v${release.majorVersion}.${release.minorVersion}`}</div>
            ))
          )}
        </td>
      )}
    </>
  );
