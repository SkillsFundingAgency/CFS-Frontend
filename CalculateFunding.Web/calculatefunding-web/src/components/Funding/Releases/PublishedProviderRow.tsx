import React from "react";

import { PublishedProviderResult } from "../../../types/PublishedProvider/PublishedProviderSearchResults";
import { FormattedNumber, NumberType } from "../../FormattedNumber";
import { PublishedProviderNameColumn } from "../PublishedProviderNameColumn";

export interface IPublishedProviderRowProps {
    publishedProvider: PublishedProviderResult;
    specCoreProviderVersionId?: string;
    enableSelection: boolean;
    isSelected: boolean;
    handleItemSelectionToggle: any;
}

export const PublishedProviderRow = (props: IPublishedProviderRowProps) => {
    const provider = props.publishedProvider;

    return (
        <tr key={provider.publishedProviderVersionId}>
            <PublishedProviderNameColumn
                id={`provider-approval-${provider.publishedProviderVersionId}`}
                fundingOverviewUrl={`/Approvals/ProviderFundingOverview/${provider.specificationId}/${provider.ukprn}/${props.specCoreProviderVersionId}/${provider.fundingStreamId}/${provider.fundingPeriodId}`}
                enableSelection={props.enableSelection}
                handleItemSelectionToggle={props.handleItemSelectionToggle}
                isSelected={props.isSelected}
                publishedProvider={provider}
            />
            {provider.hasErrors ? (
                <td className="govuk-table__cell govuk-body">
                    <span className="govuk-error-message">Error</span>
                </td>
            ) : (<>
                    <td className="govuk-table__cell govuk-body">{provider.fundingStatus}
                        {provider.majorVersion && provider.minorVersion ?
                            <div>{`v${provider.majorVersion}.${provider.minorVersion}`}</div> : ""}
                    </td>
                    <td className="govuk-table__cell govuk-body">
                        {provider.releases?.map(release =>
                            <div>{`${release.channelName} v${release.majorVersion}.${release.minorVersion}`}</div>
                        )}
                    </td>
                </>
            )}
            <td className="govuk-table__cell govuk-body govuk-table__cell--numeric">
        <span className="right-align">
          <FormattedNumber value={provider.fundingValue} type={NumberType.FormattedMoney} decimalPlaces={2}/>
        </span>
            </td>
        </tr>
    );
};
