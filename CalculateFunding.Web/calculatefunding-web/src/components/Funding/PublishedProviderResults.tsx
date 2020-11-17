import React, {useState} from "react";
import {NoData} from "../NoData";
import {FormattedNumber, NumberType} from "../FormattedNumber";
import {BackToTop} from "../BackToTop";
import Pagination from "../Pagination";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {useDispatch, useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {PublishedProviderRow} from "./PublishedProviderRow";
import {addProvidersToFundingSelection, removeProvidersFromFundingSelection, updateFundingSearch} from "../../actions/FundingSearchSelectionActions";

export interface IPublishedProviderResultsProps {
    specificationId: string,
    fundingStreamId: string,
    fundingPeriodId: string,
    versionId: string,
    enableBatchSelection: boolean,
    providerSearchResults: PublishedProviderSearchResults | undefined,
    canRefreshFunding: boolean | undefined,
    canApproveFunding: boolean | undefined,
    canReleaseFunding: boolean | undefined,
    totalResults: number,
    allPublishedProviderIds: string[] | undefined,
    addError: (errorMessage: string, fieldName?: string) => void,
    clearErrorMessages: () => void,
    setIsLoadingRefresh: (set: boolean) => void
}

export function PublishedProviderResults(props: IPublishedProviderResultsProps) {
    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);
    const havePageResults = props.providerSearchResults !== undefined &&
        props.providerSearchResults.providers !== undefined &&
        props.providerSearchResults.providers.length > 0;
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

    async function handlePageChange(pageNumber: string) {
        dispatch(updateFundingSearch({...state.searchCriteria, pageNumber: parseInt(pageNumber)}));
    }

    return <>
        <NoData hidden={havePageResults}/>
        
        {havePageResults && props.providerSearchResults &&
        <table className="govuk-table" data-testid={"published-provider-results"}>
            <thead>
            <tr>
                <th className="govuk-table__header govuk-body">Provider name
                    {props.enableBatchSelection &&
                    <>
                        <br/>
                        <span className="govuk-!-margin-right-2">
                                    <span id="checkbox-checked">{state.providerVersionIds.length}</span> / <span
                            id="checkbox-count">{props.totalResults}</span>
                                </span>
                        <div className="govuk-checkboxes govuk-checkboxes--small">
                            <div className="govuk-checkboxes__item">
                                <input className="govuk-checkboxes__input" id="toggle-all" type="checkbox"
                                       value="toggle-all"
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
                    specProviderVersionId={props.versionId}
                    enableSelection={props.enableBatchSelection}
                    isSelected={state.providerVersionIds.includes(provider.publishedProviderVersionId)}
                    handleItemSelectionToggle={handleItemSelectionToggle}
                />
            )}
            </tbody>
        </table>
        }
        
        <BackToTop id="top"/>
        
        {props.totalResults > 0 && props.providerSearchResults &&
        <nav className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation" aria-label="Pagination">
            <div className="pagination__summary">
                Showing {props.providerSearchResults.startItemNumber} - {props.providerSearchResults.endItemNumber} of {props.totalResults} results
            </div>
            <Pagination callback={handlePageChange}
                        currentPage={props.providerSearchResults.pagerState.currentPage}
                        lastPage={props.providerSearchResults.pagerState.lastPage}/>
        </nav>
        }
    </>
}