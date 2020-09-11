import {BackButton} from "../BackButton";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import React from "react";
import {PublishProviderSearchResult} from "../../types/PublishedProvider/PublishProviderSearchResult";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {FundingSpecificationDetails} from "./FundingSpecificationDetails";

export interface IConfirmFundingReleaseProps {
    publishedProviderResults: PublishProviderSearchResult,
    specificationSummary: SpecificationSummary,
    userPermissions: EffectiveSpecificationPermission,
    handleBack: any,
    handleConfirmRelease: any
}

export function ConfirmFundingRelease(props: IConfirmFundingReleaseProps) {

    if (!props.userPermissions.canReleaseFunding || !props.publishedProviderResults.canPublish) {
        return (<></>);
    }
    return (
        <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <BackButton name="Back" callback={props.handleBack}/>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <table className="govuk-table">
                        <caption className="govuk-table__caption">You have selected:</caption>
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th className="govuk-table__header">Item</th>
                            <th className="govuk-table__header">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="govuk-table__row">
                            <td className="govuk-table__header">Number of providers to release</td>
                            <td className="govuk-table__cell">{props.publishedProviderResults.totalProvidersToPublish}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <FundingSpecificationDetails specification={props.specificationSummary} />
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <table className="govuk-table">
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th className="govuk-table__head">Total funding being released</th>
                            <th className="govuk-table__head"></th>
                            <th className="govuk-table__head">
                                <FormattedNumber
                                    value={props.publishedProviderResults.totalFundingAmount}
                                    type={NumberType.FormattedMoney} decimalPoint={2}/>
                            </th>
                        </tr>
                        </thead>
                    </table>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <button data-prevent-double-click="true"
                            className="govuk-button govuk-!-margin-right-1"
                            data-module="govuk-button"
                            onClick={props.handleConfirmRelease}>
                        Confirm release
                    </button>
                    <button className="govuk-button govuk-button--secondary"
                            data-module="govuk-button"
                            onClick={props.handleBack}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}