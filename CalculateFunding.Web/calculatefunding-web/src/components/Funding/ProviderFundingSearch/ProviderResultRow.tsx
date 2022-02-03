import React from "react";

import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { PublishedProviderResult } from "../../../types/PublishedProvider/PublishedProviderSearchResults";
import { FormattedNumber, NumberType } from "../../FormattedNumber";
import { ProviderFundingOverviewUri } from "../ProviderFundingOverviewLink";
import { ProviderResultNameColumn } from "./ProviderResultNameColumn";
import { ProviderStatusColumn } from "./ProviderStatusColumn";

export interface ProviderResultRowProps {
  actionType?: FundingActionType; // null indicates old funding page
  publishedProvider: PublishedProviderResult;
  specCoreProviderVersionId?: string;
  enableSelection: boolean;
  isSelected: boolean;
  handleItemSelectionToggle: any;
}

export const ProviderResultRow = ({
  actionType,
  publishedProvider: provider,
  specCoreProviderVersionId,
  enableSelection,
  isSelected,
  handleItemSelectionToggle,
}: ProviderResultRowProps) => {
  return (
    <tr key={provider.publishedProviderVersionId}>
      <ProviderResultNameColumn
        id={`provider-${provider.publishedProviderVersionId}`}
        fundingOverviewUrl={ProviderFundingOverviewUri({
          actionType: actionType,
          providerId: provider.ukprn,
          specificationId: provider.specificationId,
          specCoreProviderVersionId: specCoreProviderVersionId,
          fundingStreamId: provider.fundingStreamId,
          fundingPeriodId: provider.fundingPeriodId,
        })}
        enableSelection={enableSelection}
        handleItemSelectionToggle={handleItemSelectionToggle}
        isSelected={isSelected}
        publishedProvider={provider}
      />
      <ProviderUKPRNColumn actionType={actionType} provider={provider} />
      <ProviderStatusColumn actionType={actionType} provider={provider} />
      <ProviderTotalFundingColumn provider={provider} />
    </tr>
  );
};

const ProviderTotalFundingColumn = ({ provider }: { provider: PublishedProviderResult }) => (
  <td className="govuk-table__cell govuk-body govuk-table__cell--numeric">
    <span className="right-align">
      <FormattedNumber value={provider.fundingValue} type={NumberType.FormattedMoney} decimalPlaces={2} />
    </span>
  </td>
);

const ProviderUKPRNColumn = ({
  provider,
  actionType,
}: {
  provider: PublishedProviderResult;
  actionType: FundingActionType | undefined;
}) => (!actionType ? <td className="govuk-table__cell govuk-body">{provider.ukprn}</td> : null);
