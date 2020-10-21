import React from "react";
import {PublishedProviderResult} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {PublishedProviderNameColumn} from "./PublishedProviderNameColumn";

export interface IPublishedProviderRowProps {
    publishedProvider: PublishedProviderResult;
    enableSelection: boolean;
    isSelected: boolean;
    specProviderVersionId: string;
    handleItemSelectionToggle: any
}

export const PublishedProviderRow = (props: IPublishedProviderRowProps) => {
    const provider = props.publishedProvider;

    return (
        <tr key={provider.publishedProviderVersionId}>
            <PublishedProviderNameColumn
                        id={`provider-approval-${provider.publishedProviderVersionId}`}
                        fundingOverviewUrl={`/Approvals/ProviderFundingOverview/${provider.specificationId}/${provider.ukprn}/${props.specProviderVersionId}/${provider.fundingStreamId}/${provider.fundingPeriodId}`}
                        enableSelection={props.enableSelection}
                        handleItemSelectionToggle={props.handleItemSelectionToggle}
                        isSelected={props.isSelected}
                        publishedProvider={provider}/>
            <td className="govuk-table__cell govuk-body">{provider.ukprn}</td>
            {provider.hasErrors ?
                <td className="govuk-table__cell govuk-body"><span className="govuk-error-message">Error</span></td>
                :
                <td className="govuk-table__cell govuk-body">{provider.fundingStatus}</td>
            }
            <td className="govuk-table__cell govuk-body govuk-table__cell--numeric">
                <span className="right-align">
                    <FormattedNumber value={provider.fundingValue} type={NumberType.FormattedMoney} decimalPlaces={2}/>
                </span>
            </td>
        </tr>
    );
};
