import React, {useState} from "react";
import {NoData} from "../NoData";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {BackToTop} from "../BackToTop";
import Pagination from "../Pagination";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
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
    providerSearchResults: PublishedProviderSearchResults | undefined,
    specProviderVersionId: string,
    canRefreshFunding: boolean | undefined,
    canApproveFunding: boolean | undefined,
    canReleaseFunding: boolean | undefined,
    selectedResults: number,
    totalResults: number,
    pageChange: any,
    allPublishedProviderIds: string[] | undefined,
    setConfirmRelease: (set: boolean) => void,
    setConfirmApproval: (set: boolean) => void,
    addError: (errorMessage: string, fieldName?: string) => void,
}

export function PublishedProviderResults(props: IPublishedProviderResultsProps) {

    const [isLoadingRefresh, setIsLoadingRefresh] = useState<boolean>(false);
    const fundingSelectionState: IFundingSelectionState = useSelector<IStoreState, IFundingSelectionState>(state => state.fundingSelection);
    const havePageResults = props.providerSearchResults !== undefined && props.providerSearchResults.providers.length > 0;
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const dispatch = useDispatch();

    const handleToggleAllProviders = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (props.allPublishedProviderIds) {
            const checked = e.target.checked;
            setSelectAll(checked);
            dispatch(checked ?
                addProvidersToFundingSelection(props.allPublishedProviderIds) :
                removeProvidersFromFundingSelection(props.allPublishedProviderIds));
        }
    };

    const handleItemSelectionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const providerId = e.target.value;
        dispatch(checked ?
            addProvidersToFundingSelection([providerId]) :
            removeProvidersFromFundingSelection([providerId]));
    };

    async function handleApprove() {
        props.setConfirmApproval(true);
    }

    async function handleRelease() {
        props.setConfirmRelease(true);
    }

    async function handleRefresh() {
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
        return <LoadingStatus title={"Refreshing..."} description={"Please wait"}/>
    } else {
        return <>
            <NoData hidden={havePageResults}/>
            {havePageResults && props.providerSearchResults &&
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
            {props.totalResults > 0 && props.providerSearchResults &&
            <>
                <nav className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation" aria-label="Pagination">
                    <div className="pagination__summary">
                        Showing {props.providerSearchResults.startItemNumber} - {props.providerSearchResults.endItemNumber} of {props.totalResults} results
                    </div>
                    <Pagination callback={props.pageChange}
                                currentPage={props.providerSearchResults.pagerState.currentPage}
                                lastPage={props.providerSearchResults.pagerState.lastPage}/>
                </nav>
                <div className="right-align">
                    <button className="govuk-button govuk-!-margin-right-1"
                            disabled={!props.canRefreshFunding}
                            onClick={handleRefresh}>Refresh funding
                    </button>
                    <button className="govuk-button govuk-!-margin-right-1"
                            disabled={!props.providerSearchResults.canApprove || !props.canApproveFunding}
                            onClick={handleApprove}>Approve funding
                    </button>
                    <button className="govuk-button govuk-button--warning"
                            disabled={!props.providerSearchResults.canPublish || !props.canReleaseFunding}
                            onClick={handleRelease}>Release funding
                    </button>
                </div>
            </>
            }
        </>
    }
}