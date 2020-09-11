import React from "react";
import {LoadingStatus} from "../LoadingStatus";
import {NoData} from "../NoData";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {Link} from "react-router-dom";
import {BackToTop} from "../BackToTop";
import Pagination from "../Pagination";
import {PublishProviderSearchResult} from "../../types/PublishedProvider/PublishProviderSearchResult";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";

export interface IPublishedProviderResultsProps {
    isLoading: boolean,
    enableToggles: boolean,
    fundingStreamId: string,
    fundingPeriodId: string,
    providerSearchResults: PublishProviderSearchResult,
    specification: SpecificationSummary,
    userPermissions: EffectiveSpecificationPermission,
    pageChange: any,
    handleToggleProvider: any,
    handleToggleAllProviders: any,
    handleRefreshFunding: any,
    handleApprove: any,
    handleRelease: any
}

export function PublishedProviderResults(props: IPublishedProviderResultsProps) {

    const havePageResults = props.providerSearchResults.providers.length > 0;
    const totalResults = props.providerSearchResults.totalResults;
    
    return (
        <div className="govuk-grid-column-two-thirds">
            {props.isLoading &&
            <LoadingStatus title={"Loading provider funding data"}/>
            }
            {!props.isLoading &&
            <>
                <NoData hidden={havePageResults}/>
                {havePageResults &&
                <table className="govuk-table">
                    <thead>
                    <tr>
                        <th className="govuk-table__header govuk-body">Provider name
                            {props.enableToggles &&
                            <div className="govuk-checkboxes govuk-checkboxes--small">
                                <div className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input" id="toggle-all" type="checkbox" value="toggle-all"
                                           onClick={props.handleToggleAllProviders}/>
                                    <label className="govuk-label govuk-checkboxes__label" htmlFor="toggle-all">
                                        Select all
                                    </label>
                                </div>
                            </div>
                            }
                        </th>
                        <th className="govuk-table__header govuk-body">UKPRN</th>
                        <th className="govuk-table__header govuk-body">Status</th>
                        <th className="govuk-table__header govuk-body">
                            Funding total<br/>
                            <FormattedNumber value={props.providerSearchResults.totalFundingAmount}
                                             type={NumberType.FormattedMoney}/><br/>
                            <p className="govuk-body-s">of filtered providers</p>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.providerSearchResults.providers.map(provider =>
                        <tr key={provider.providerVersionId}>
                            <td className="govuk-table__cell govuk-body">
                                {props.enableToggles &&
                                <div className="govuk-checkboxes govuk-checkboxes--small">
                                    <div className="govuk-checkboxes__item">
                                        <input className="govuk-checkboxes__input provider-checked"
                                               id={`provider-approval-${provider.providerVersionId}`}
                                               type="checkbox"
                                               value={props.specification.providerVersionId}
                                               onClick={props.handleToggleProvider(props.specification.providerVersionId)}/>
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor={`provider-approval-${provider.providerVersionId}`}>
                                            <Link to={`/Approvals/ProviderFundingOverview/${provider.specificationId}/${provider.ukprn}/${props.specification.providerVersionId}/${props.fundingStreamId}/${props.fundingPeriodId}`}>
                                                {provider.providerName}
                                            </Link>
                                        </label>
                                    </div>
                                </div>
                                }
                                {!props.enableToggles &&
                                <Link to={`/Approvals/ProviderFundingOverview/${provider.specificationId}/${provider.ukprn}/${props.specification.providerVersionId}/${props.fundingStreamId}/${props.fundingPeriodId}`}>
                                    {provider.providerName}
                                </Link>
                                }
                            </td>
                            <td className="govuk-table__cell govuk-body">{provider.ukprn}</td>
                            <td className="govuk-table__cell govuk-body">{provider.fundingStatus}</td>
                            <td className="govuk-table__cell govuk-body">
                                <FormattedNumber value={provider.fundingValue} type={NumberType.FormattedMoney} decimalPoint={2}/>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                }
            </>
            }
            <BackToTop id="top" />
            {totalResults > 0 &&
            <>
                <nav className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation"
                     aria-label="Pagination">
                    <div
                        className="pagination__summary">Showing {props.providerSearchResults.startItemNumber} - {props.providerSearchResults.endItemNumber} of {totalResults} results
                    </div>
                    <Pagination callback={props.pageChange}
                                currentPage={props.providerSearchResults.pagerState.currentPage}
                                lastPage={props.providerSearchResults.pagerState.lastPage}/>
                </nav>
                <div className="right-align">
                    <button className="govuk-button govuk-!-margin-right-1"
                            disabled={!props.userPermissions.canRefreshFunding}
                            onClick={props.handleRefreshFunding}>Refresh funding
                    </button>
                    <button className="govuk-button govuk-!-margin-right-1"
                            disabled={!props.providerSearchResults.canApprove || !props.userPermissions.canApproveFunding}
                            onClick={props.handleApprove}>Approve funding
                    </button>
                    <button className="govuk-button govuk-button--warning"
                            disabled={!props.providerSearchResults.canPublish || !props.userPermissions.canReleaseFunding}
                            onClick={props.handleRelease}>Release funding
                    </button>
                </div>
            </>
            }
        </div>
    );
}