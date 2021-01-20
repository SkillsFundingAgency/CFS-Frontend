import React from "react";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {FundingActionType, PublishedProviderFundingCount} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import {Link} from "react-router-dom";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {useQuery} from "react-query";
import * as publishService from "../../services/publishService";
import {usePublishedProviderIds} from "../../hooks/FundingApproval/usePublishedProviderIds";
import {ApprovalMode} from "../../types/ApprovalMode";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {ErrorProps} from "../../hooks/useErrors";
import {AxiosError} from "axios";

export interface FundingConfirmationSummaryProps {
    fundingStreamId: string,
    fundingPeriodId: string,
    approvalMode: ApprovalMode,
    actionType: FundingActionType,
    specification: SpecificationSummary,
    canReleaseFunding: boolean,
    canApproveFunding: boolean,
    isLoading: boolean,
    addError: (props: ErrorProps) => void,
}

export function FundingConfirmationSummary(props: FundingConfirmationSummaryProps) {
    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);

    const {publishedProviderIds, isLoadingPublishedProviderIds} =
        usePublishedProviderIds(props.fundingStreamId, props.fundingPeriodId, props.specification.id,
            {
                enabled: props.approvalMode !== ApprovalMode.Batches,
                onError: err => props.addError({error: err, description: "Error while loading provider ids"})
            });
    const selectedProviderIds = props.approvalMode === ApprovalMode.Batches && state.providerVersionIds.length > 0 ?
        state.providerVersionIds : publishedProviderIds ? publishedProviderIds : [];

    const {data: batchApprovalSummary, isLoading: isLoadingBatchApprovalSummary} =
        useQuery<PublishedProviderFundingCount, AxiosError>(`spec-${props.specification.id}-funding-summary-for-approval`,
            async () => (await publishService.getFundingSummaryForApprovingService(props.specification.id, selectedProviderIds)).data,
            {
                enabled: props.actionType === FundingActionType.Approve && selectedProviderIds.length > 0,
                cacheTime: 0,
                staleTime: 0,
                onError: err => props.addError({error: err.message, description: "Error while loading funding summary"})
            });
    const {data: batchReleaseSummary, isLoading: isLoadingBatchReleaseSummary} =
        useQuery<PublishedProviderFundingCount, AxiosError>(`spec-${props.specification.id}-funding-summary-for-release`,
            async () => (await publishService.getFundingSummaryForReleasingService(props.specification.id, selectedProviderIds)).data,
            {
                enabled: props.actionType === FundingActionType.Release && selectedProviderIds.length > 0,
                cacheTime: 0,
                staleTime: 0,
                onError: err => props.addError({error: err.message, description: "Error while loading funding summary"})
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

        if (fundingSummary.count === 0) {
            props.addError({error: "There are no providers to " + props.actionType.toLowerCase()})
        }
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
                                    <p className="govuk-body">{fundingSummary.count}</p>
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

                {state.providerVersionIds.length > 0 && !props.isLoading &&
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
