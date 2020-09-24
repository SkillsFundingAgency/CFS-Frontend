﻿import React, {useState} from "react";
import {BackButton} from "../BackButton";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {PublishedProviderSearchResult} from "../../types/PublishedProvider/PublishedProviderSearchResult";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {FundingSpecificationDetails} from "./FundingSpecificationDetails";
import {approveFundingService} from "../../services/publishService";
import {LoadingStatus} from "../LoadingStatus";

export interface IConfirmFundingApprovalProps {
    publishedProviderResults: PublishedProviderSearchResult,
    specificationSummary: SpecificationSummary,
    canApproveFunding: boolean | undefined,
    handleBack: any,
    addError: (errorMessage: string, fieldName?: string) => void,
}

export function ConfirmFundingApproval(props: IConfirmFundingApprovalProps) {
    const [isLoadingApproval, setIsLoadingApproval] = useState<boolean>(false);

    if (!props.canApproveFunding || !props.publishedProviderResults.canApprove) {
        return (<></>);
    }

    async function handleConfirmApprove() {
        setIsLoadingApproval(true);
        try {
            await approveFundingService(props.specificationSummary.id);
        } catch (e) {
            props.addError("An error occured whilst calling the server to confirm approval: " + e);
        } finally {
            setIsLoadingApproval(false);
        }
    }

    if (isLoadingApproval) {
        return (
            <div className="govuk-grid-column-two-thirds">
                <LoadingStatus title={"Approving..."} description={"Please wait"}/>
            </div>
        );
    } else {
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
                            <tbody className="govuk-table__body">
                            <tr className="govuk-table__row">
                                <td className="govuk-table__header">Number of providers to approve</td>
                                <td className="govuk-table__cell">{props.publishedProviderResults.totalProvidersToApprove}</td>
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
                                <th className="govuk-table__header">Total funding being approved</th>
                                <th className="govuk-table__header"></th>
                                <th className="govuk-table__header">
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
                                onClick={handleConfirmApprove}>
                            Confirm approval
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
}