import React from "react";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {LoadingStatus} from "../LoadingStatus";
import {FundingActionType, PublishedProviderFundingCount} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import {Link} from "react-router-dom";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {getFundingSummaryForApprovingService, getFundingSummaryForReleasingService} from "../../services/publishService";
import {usePublishedProviderIds} from "../../hooks/FundingApproval/usePublishedProviderIds";
import {ApprovalMode} from "../../types/ApprovalMode";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {LoadingFieldStatus} from "../LoadingFieldStatus";

export interface FundingConfirmationSummaryProps {
    fundingStreamId: string,
    fundingPeriodId: string,
    approvalMode: ApprovalMode,
    actionType: FundingActionType,
    specification: SpecificationSummary,
    canReleaseFunding: boolean,
    canApproveFunding: boolean,
    addError: (errorMessage: string, description?: string, fieldName?: string) => void,
}

export function FundingConfirmationSummary(props: FundingConfirmationSummaryProps) {
    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);

    const {publishedProviderIds, isLoadingPublishedProviderIds} =
        usePublishedProviderIds(props.fundingStreamId, props.fundingPeriodId, props.specification.id,
            props.approvalMode !== ApprovalMode.Batches,
            err => props.addError(err.message, "Error while loading provider ids"));
    const selectedProviderIds = state.providerVersionIds.length > 0 ? state.providerVersionIds : publishedProviderIds ? publishedProviderIds : [];

    const {data: batchApprovalSummary, isLoading: isLoadingBatchApprovalSummary} =
        useQuery<PublishedProviderFundingCount, AxiosError>(`spec-${props.specification.id}-funding-summary-for-approval`,
            async () => (await getFundingSummaryForApprovingService(props.specification.id, selectedProviderIds)).data,
            {
                enabled: props.actionType === FundingActionType.Approve && selectedProviderIds.length > 0,
                onError: err => props.addError(err.message, "Error while loading funding summary")
            });
    const {data: batchReleaseSummary, isLoading: isLoadingBatchReleaseSummary} =
        useQuery<PublishedProviderFundingCount, AxiosError>(`spec-${props.specification.id}-funding-summary-for-release`,
            async () => (await getFundingSummaryForReleasingService(props.specification.id, selectedProviderIds)).data,
            {
                enabled: props.actionType === FundingActionType.Release && selectedProviderIds.length > 0,
                onError: err => props.addError(err.message, "Error while loading funding summary")
            });

    if (props.actionType === FundingActionType.Refresh ||
        props.actionType === FundingActionType.Release && !props.canReleaseFunding ||
        props.actionType === FundingActionType.Approve && !props.canApproveFunding) {
        return (<></>);
    }

    const fundingSummary = props.actionType === FundingActionType.Approve ? batchApprovalSummary : batchReleaseSummary;

    if (!fundingSummary) {
        return (
            <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
                <LoadingFieldStatus title={"Loading funding summary"}/>
            </div>
        );

    } else {

        return (
            <>
                <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1">
                    <div className="govuk-grid-column-full">
                        <Link to={`/Approvals/SpecificationFundingApproval/${props.fundingStreamId}/${props.fundingPeriodId}/${props.specification.id}`}
                              className="govuk-back-link">Back</Link>
                    </div>
                </div>
                <div className="govuk-grid-row  govuk-!-margin-bottom-4">
                    <div className="govuk-grid-column-three-quarters">
                        <table className="govuk-table" aria-label="funding-summary-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header">
                                </th>
                                <th scope="col" className="govuk-table__header">Summary</th>
                                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Amount</th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body">
                            <tr className="govuk-table__row">
                                <th scope="row" className="govuk-table__header">Providers selected</th>
                                <td className="govuk-table__cell">
                                </td>
                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                    <p className="govuk-body">{selectedProviderIds.length}</p>
                                </td>
                            </tr>
                            <tr className="govuk-table__row">
                                <th scope="row" className="govuk-table__header">Funding period</th>
                                <td className="govuk-table__cell">{props.specification.fundingPeriod.name}</td>
                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                </td>
                            </tr>
                            <tr className="govuk-table__row">
                                <th scope="row" className="govuk-table__header">Specification selected</th>
                                <td className="govuk-table__cell">{props.specification.name}</td>
                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                </td>
                            </tr>
                            <tr className="govuk-table__row">
                                <th scope="row" className="govuk-table__header">Total funding being approved</th>
                                <td className="govuk-table__cell">{props.specification.fundingStreams && props.specification.fundingStreams[0].name}</td>
                                <td className="govuk-table__cell govuk-table__cell--numeric">
                                    <strong>
                                        <FormattedNumber value={fundingSummary.totalFunding ? fundingSummary.totalFunding : 0}
                                                         type={NumberType.FormattedMoney}/>
                                    </strong>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {state.providerVersionIds.length > 0 &&
                <div className="govuk-grid-row govuk-!-margin-bottom-9">
                    <div className="govuk-grid-column-three-quarters">
                        <Link to={`/Approvals/SpecificationFundingApproval/${props.fundingStreamId}/${props.fundingPeriodId}/${props.specification.id}`}
                              className="govuk-link govuk-link--no-visited-state right-align">
                            Change selection
                        </Link>
                    </div>
                </div>
                }
            </>
        );
    }
}
