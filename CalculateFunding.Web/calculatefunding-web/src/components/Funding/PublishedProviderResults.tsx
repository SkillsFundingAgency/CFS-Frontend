import React, {useState} from "react";
import {LoadingStatus} from "../LoadingStatus";
import {NoData} from "../NoData";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {Link} from "react-router-dom";
import {BackToTop} from "../BackToTop";
import Pagination from "../Pagination";
import {PublishedProviderSearchResult} from "../../types/PublishedProvider/PublishedProviderSearchResult";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {useDispatch, useSelector} from "react-redux";
import {removeProvidersFromFundingSelection, addProvidersToFundingSelection} from "../../actions/FundingSelectionActions";
import {IStoreState} from "../../reducers/rootReducer";
import {IFundingSelectionState} from "../../states/IFundingSelectionState";

export interface IPublishedProviderResultsProps {
    isLoading: boolean,
    isLoadingProviderIds: boolean,
    enableToggles: boolean,
    fundingStreamId: string,
    fundingPeriodId: string,
    providerSearchResults: PublishedProviderSearchResult,
    specification: SpecificationSummary,
    userPermissions: EffectiveSpecificationPermission,
    pageChange: any,
    fetchPublishedProviderIds: () => Promise<string[]>,
    handleRefreshFunding: any,
    handleApprove: any,
    handleRelease: any
}

export function PublishedProviderResults(props: IPublishedProviderResultsProps) {

    const fundingSelectionState: IFundingSelectionState = useSelector<IStoreState, IFundingSelectionState>(state => state.fundingSelection);
    const havePageResults = props.providerSearchResults.providers.length > 0;
    const totalResults = props.providerSearchResults.totalResults;
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const dispatch = useDispatch();

    const handleToggleAllProviders = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        const allProviderIdsInCurrentSearch = await props.fetchPublishedProviderIds();
        dispatch(checked ?
            addProvidersToFundingSelection(allProviderIdsInCurrentSearch) :
            removeProvidersFromFundingSelection(allProviderIdsInCurrentSearch));
    };

    const handleItemSelectionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const providerId = e.target.value;
        dispatch(checked ?
            addProvidersToFundingSelection([providerId]) :
            removeProvidersFromFundingSelection([providerId]));
    };

    const isLoading = props.isLoading || props.isLoadingProviderIds;
    
    return (
        <div className="govuk-grid-column-two-thirds">
            {isLoading &&
            <LoadingStatus title={isLoading ? "Loading provider funding data" : "Applying selection..."}/>
            }
            {!isLoading &&
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
                                           checked={selectAll}
                                           onChange={handleToggleAllProviders}/>
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
                        <tr key={provider.publishedProviderVersionId}>
                            <td className="govuk-table__cell govuk-body">
                                {props.enableToggles &&
                                <div className="govuk-checkboxes govuk-checkboxes--small">
                                    <div className="govuk-checkboxes__item">
                                        <input className="govuk-checkboxes__input provider-checked"
                                               id={`provider-approval-${provider.publishedProviderVersionId}`}
                                               type="checkbox"
                                               value={provider.publishedProviderVersionId}
                                               checked={fundingSelectionState.providerVersionIds.includes(provider.publishedProviderVersionId)}
                                               onChange={handleItemSelectionToggle}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor={`provider-approval-${provider.publishedProviderVersionId}`}>
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
            <BackToTop id="top"/>
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