import React from "react";
import {PublishedProviderResult} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {Link} from "react-router-dom";
import {FormattedNumber, NumberType} from "../FormattedNumber";

export interface IPublishedProviderRowProps {
    publishedProvider: PublishedProviderResult;
    enableSelection: boolean;
    isSelected: boolean;
    specProviderVersionId: string;
    handleItemSelectionToggle: any
}

export function PublishedProviderRow(props: IPublishedProviderRowProps) {
    const provider = props.publishedProvider;
    const fundingOverviewUrl = `/Approvals/ProviderFundingOverview/${provider.specificationId}/${provider.ukprn}/${props.specProviderVersionId}/${provider.fundingStreamId}/${provider.fundingPeriodId}`;

    return (
        <tr key={provider.publishedProviderVersionId}>
            <td className="govuk-table__cell govuk-body">
                <div className="govuk-checkboxes govuk-checkboxes--small">
                    {props.enableSelection &&
                    <div className="govuk-checkboxes__item">
                        <input className="govuk-checkboxes__input provider-checked"
                               id={`provider-approval-${provider.publishedProviderVersionId}`}
                               type="checkbox"
                               value={provider.publishedProviderVersionId}
                               checked={props.isSelected}
                               onChange={props.handleItemSelectionToggle}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor={`provider-approval-${provider.publishedProviderVersionId}`}>
                            <Link to={fundingOverviewUrl}>
                                {provider.providerName}
                            </Link>
                        </label>
                    </div>
                    }
                    {!props.enableSelection &&
                    <Link to={fundingOverviewUrl}>
                        {provider.providerName}
                    </Link>
                    }
                </div>
            </td>
            <td className="govuk-table__cell govuk-body">{provider.ukprn}</td>
            <td className="govuk-table__cell govuk-body">{provider.fundingStatus}</td>
            <td className="govuk-table__cell govuk-body govuk-table__cell--numeric">
                <span className="right-align">
                    <FormattedNumber value={provider.fundingValue} type={NumberType.FormattedMoney} decimalPlaces={2}/>
                </span>
            </td>
        </tr>
    );
}
