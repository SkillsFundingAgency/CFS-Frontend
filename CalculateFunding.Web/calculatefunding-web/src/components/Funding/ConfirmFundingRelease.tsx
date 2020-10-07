import {BackButton} from "../BackButton";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import React, {useState} from "react";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {FundingSpecificationDetails} from "./FundingSpecificationDetails";
import {releaseFundingService} from "../../services/publishService";
import {LoadingStatus} from "../LoadingStatus";

export interface IConfirmFundingReleaseProps {
    publishedProviderResults: PublishedProviderSearchResults,
    specificationSummary: SpecificationSummary,
    canReleaseFunding: boolean | undefined,
    handleBackToResults: () => void,
    addError: (errorMessage: string, fieldName?: string) => void,
}

export function ConfirmFundingRelease(props: IConfirmFundingReleaseProps) {
    const [isLoadingRelease, setIsLoadingRelease] = useState<boolean>(false);

    async function handleConfirmRelease() {
        setIsLoadingRelease(true);
        try {
            await releaseFundingService(props.specificationSummary.id);
            setIsLoadingRelease(false);
            props.handleBackToResults();
        } catch (e) {
            setIsLoadingRelease(false);
            props.addError("An error occured whilst calling the server to confirm release: " + e);
        }
    }


    if (!props.canReleaseFunding || !props.publishedProviderResults.canPublish) {
        return (<></>);
    }

    if (isLoadingRelease) {
        return (
            <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
                <LoadingStatus title={"Releasing..."} description={"Please wait"}/>
            </div>
        );
    } else {
        return (
            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <BackButton name="Back" callback={props.handleBackToResults}/>
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
                <FundingSpecificationDetails specification={props.specificationSummary}/>
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
                                        type={NumberType.FormattedMoney} decimalPlaces={2}/>
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
                                onClick={handleConfirmRelease}>
                            Confirm release
                        </button>
                        <button className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                onClick={props.handleBackToResults}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}