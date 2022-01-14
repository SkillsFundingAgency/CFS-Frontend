import React from "react";

import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { PublishedProviderResult } from "../../types/PublishedProvider/PublishedProviderSearchResults";
import { FormattedNumber, NumberType } from "../FormattedNumber";
import { ProviderFundingOverviewUri } from "./ProviderFundingOverviewLink";
import { PublishedProviderNameColumn } from "./PublishedProviderNameColumn";

export interface IPublishedProviderRowProps {
  actionType?: FundingActionType;
  publishedProvider: PublishedProviderResult;
  specCoreProviderVersionId?: string;
  enableSelection: boolean;
  isSelected: boolean;
  handleItemSelectionToggle: any;
}

export const PublishedProviderRow = (props: IPublishedProviderRowProps) => {
  const provider = props.publishedProvider;
  const { actionType, specCoreProviderVersionId } = props;

  return (
    <tr key={provider.publishedProviderVersionId}>
      <PublishedProviderNameColumn
        id={`provider-approval-${provider.publishedProviderVersionId}`}
        fundingOverviewUrl={ProviderFundingOverviewUri({
          actionType: actionType,
          providerId: provider.ukprn,
          specificationId: provider.specificationId,
          specCoreProviderVersionId: specCoreProviderVersionId,
          fundingStreamId: provider.fundingStreamId,
          fundingPeriodId: provider.fundingPeriodId,
        })}
        enableSelection={props.enableSelection}
        handleItemSelectionToggle={props.handleItemSelectionToggle}
        isSelected={props.isSelected}
        publishedProvider={provider}
      />
      {!props.actionType && <td className="govuk-table__cell govuk-body">{provider.ukprn}</td>}

      {provider.hasErrors ? (
        <td className="govuk-table__cell govuk-body">
          <span className="govuk-error-message">Error</span>
        </td>
      ) : !props.actionType ? (
        <td className="govuk-table__cell govuk-body">{provider.fundingStatus}</td>
      ) : (
        <>
          <td className="govuk-table__cell govuk-body">
            {provider.fundingStatus}{" "}
            {provider.majorVersion > 0 && <span>{`v${provider.majorVersion}.${provider.minorVersion}`}</span>}
          </td>
          {!!actionType && (
            <td className="govuk-table__cell govuk-body">
              {provider.releases?.map((release, idx) => (
                <div
                  key={idx}
                >{`${release.channelName} v${release.majorVersion}.${release.minorVersion}`}</div>
              ))}
            </td>
          )}
        </>
      )}
      <td className="govuk-table__cell govuk-body govuk-table__cell--numeric">
        <span className="right-align">
          <FormattedNumber value={provider.fundingValue} type={NumberType.FormattedMoney} decimalPlaces={2} />
        </span>
      </td>
    </tr>
  );
};
