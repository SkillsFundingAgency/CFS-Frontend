import React, {useState} from "react";
import {NoData} from "../NoData";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {BackToTop} from "../BackToTop";
import Pagination from "../Pagination";
import {PublishedProviderSearchResult} from "../../types/PublishedProvider/PublishedProviderSearchResult";
import {useDispatch, useSelector} from "react-redux";
import {removeProvidersFromFundingSelection, addProvidersToFundingSelection} from "../../actions/FundingSelectionActions";
import {IStoreState} from "../../reducers/rootReducer";
import {IFundingSelectionState} from "../../states/IFundingSelectionState";
import {PublishedProviderRow} from "./PublishedProviderRow";
import {refreshFundingService} from "../../services/publishService";
import {LoadingStatus} from "../LoadingStatus";

export interface IPublishedProviderResultsProps {
    specificationId: string,
    enableBatchSelection: boolean,
    providerSearchResults: PublishedProviderSearchResult,
    specProviderVersionId: string,
    canRefreshFunding: boolean | undefined,
    canApproveFunding: boolean | undefined,
    canReleaseFunding: boolean | undefined,
    selectedResults: number,
    totalResults: number,
    pageChange: any,
    fetchPublishedProviderIds: () => Promise<string[]>,
    setConfirmRelease: (set: boolean) => void,
    setConfirmApproval: (set: boolean) => void,
    addError: (errorMessage: string, fieldName?: string) => void,
}

export function PublishedProviderResults(props: IPublishedProviderResultsProps) {

    const [isLoadingRefresh, setIsLoadingRefresh] = useState<boolean>(false);
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

    async function handleRefreshFunding() {
        setIsLoadingRefresh(true);
        try {
            await refreshFundingService(props.specificationId);
        } catch (e) {
            props.addError("An error occured whilst calling the server to refresh: " + e);
        } finally {
            setIsLoadingRefresh(false);
        }
    }


    if (isLoadingRefresh) {
        return (
        <div className="govuk-grid-column-two-thirds">
            <LoadingStatus title={"Refreshing..."} description={"Please wait"}/>
        </div>
        );
    } else {
        return (
            <div className="govuk-grid-column-two-thirds">
                <NoData hidden={havePageResults}/>
                {havePageResults &&
                <table className="govuk-table">
                    <thead>
                    <tr>
                        <th className="govuk-table__header govuk-body">Provider name
                            {props.enableBatchSelection &&
                            <>
                                <br/>
                                <span className="govuk-!-margin-right-2">
                                    <span id="checkbox-checked">{props.selectedResults}</span> / <span id="checkbox-count">{props.totalResults}</span>
                                </span>
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
                            </>
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
                {props.providerSearchResults.providers.map((provider, i) =>
                        <PublishedProviderRow
                            key={`provider-${i}`}
                            publishedProvider={provider}
                            specProviderVersionId={props.specProviderVersionId}
                            enableSelection={props.enableBatchSelection}
                            isSelected={fundingSelectionState.providerVersionIds.includes(provider.publishedProviderVersionId)}
                            handleItemSelectionToggle={handleItemSelectionToggle}
                        />
                    )}
                    </tbody>
                </table>
                }
                <BackToTop id="top"/>
                {totalResults > 0 &&
                <>
                    <nav className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation" aria-label="Pagination">
                        <div
                            className="pagination__summary">Showing {props.providerSearchResults.startItemNumber} - {props.providerSearchResults.endItemNumber} of {totalResults} results
                        </div>
                        <Pagination callback={props.pageChange}
                                    currentPage={props.providerSearchResults.pagerState.currentPage}
                                    lastPage={props.providerSearchResults.pagerState.lastPage}/>
                    </nav>
                    <div className="right-align">
                        <button className="govuk-button govuk-!-margin-right-1"
                                disabled={!props.canRefreshFunding}
                                onClick={handleRefreshFunding}>Refresh funding
                        </button>
                        <button className="govuk-button govuk-!-margin-right-1"
                                disabled={!props.providerSearchResults.canApprove || !props.canApproveFunding}
                                onClick={() => props.setConfirmRelease(true)}>Approve funding
                        </button>
                        <button className="govuk-button govuk-button--warning"
                                disabled={!props.providerSearchResults.canPublish || !props.canReleaseFunding}
                                onClick={() => props.setConfirmApproval(true)}>Release funding
                        </button>
                    </div>
                </>
                }
            </div>
        );
    }
}