import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as actions from "../../actions/FundingSearchSelectionActions";
import { IStoreState } from "../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { PublishedProviderSearchResults } from "../../types/PublishedProvider/PublishedProviderSearchResults";
import { BackToTop } from "../BackToTop";
import { FormattedNumber, NumberType } from "../FormattedNumber";
import { NoData } from "../NoData";
import { Pagination } from "../Pagination";
import { PublishedProviderRow } from "./PublishedProviderRow";

export interface FundingManagementApprovalResultsProps {
  specificationId: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  specCoreProviderVersionId?: string;
  enableBatchSelection: boolean;
  providerSearchResults: PublishedProviderSearchResults | undefined;
  canRefreshFunding: boolean | undefined;
  canApproveFunding: boolean | undefined;
  canReleaseFunding: boolean | undefined;
  totalResults: number;
  allPublishedProviderIds: string[] | undefined;
  addError: (errorMessage: string, fieldName?: string) => void;
  clearErrorMessages: () => void;
  setIsLoadingRefresh: (set: boolean) => void;
}

export function FundingManagementApprovalResults(props: FundingManagementApprovalResultsProps) {
  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const havePageResults =
    props.providerSearchResults !== undefined &&
    props.providerSearchResults.providers !== undefined &&
    props.providerSearchResults.providers.length > 0;
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectAll && props.allPublishedProviderIds && props.allPublishedProviderIds.length === 0) {
      setSelectAll(false);
    }
  }, [selectAll, props.allPublishedProviderIds]);

  const handleToggleAllProviders = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.allPublishedProviderIds) {
      const checked = e.target.checked;
      setSelectAll(checked);
      dispatch(
        checked
          ? actions.addProvidersToFundingSelection(props.allPublishedProviderIds)
          : actions.removeProvidersFromFundingSelection(props.allPublishedProviderIds)
      );
    }
  };

  const handleItemSelectionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const providerId = e.target.value;
    dispatch(
      checked
        ? actions.addProvidersToFundingSelection([providerId])
        : actions.removeProvidersFromFundingSelection([providerId])
    );
  };

  async function handlePageChange(page: number) {
    dispatch(actions.setPage(page));
  }

  return (
    <>
      <NoData hidden={havePageResults} />

      {havePageResults && props.providerSearchResults && (
        <table className="govuk-table" data-testid={"published-provider-results"}>
          <thead>
            <tr>
              <th className="govuk-table__header govuk-body">
                Provider name
                {props.enableBatchSelection && (
                  <>
                    <br />
                    <span className="govuk-!-margin-right-2">
                      <span id="checkbox-checked">
                        {state.selectedProviderIds ? state.selectedProviderIds.length : 0}
                      </span>{" "}
                      / <span id="checkbox-count">{props.totalResults}</span>
                    </span>
                    <div className="govuk-checkboxes govuk-checkboxes--small">
                      <div className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id="toggle-all"
                          type="checkbox"
                          value="toggle-all"
                          checked={selectAll}
                          onChange={handleToggleAllProviders}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor="toggle-all">
                          Select all
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </th>
              <th className="govuk-table__header govuk-body">UKPRN</th>
              <th className="govuk-table__header govuk-body">Status</th>
              <th className="govuk-table__header govuk-body">
                Funding total
                <br />
                <FormattedNumber
                  value={props.providerSearchResults.filteredFundingAmount}
                  type={NumberType.FormattedMoney}
                />
                <br />
                <p className="govuk-body-s">of filtered providers</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {props.providerSearchResults.providers.map((provider, i) => (
              <PublishedProviderRow
                key={`provider-${i}`}
                publishedProvider={provider}
                specCoreProviderVersionId={props.specCoreProviderVersionId}
                enableSelection={props.enableBatchSelection}
                isSelected={state.selectedProviderIds.includes(provider.publishedProviderVersionId)}
                handleItemSelectionToggle={handleItemSelectionToggle}
              />
            ))}
          </tbody>
        </table>
      )}

      <BackToTop id="top" />

      {props.totalResults > 0 && props.providerSearchResults && (
        <nav
          className="govuk-!-margin-top-5 govuk-!-margin-bottom-9"
          role="navigation"
          aria-label="Pagination"
        >
          <div className="pagination__summary">
            Showing {props.providerSearchResults.startItemNumber} -{" "}
            {props.providerSearchResults.endItemNumber} of {props.totalResults} results
          </div>
          <Pagination
            callback={handlePageChange}
            currentPage={props.providerSearchResults.pagerState.currentPage}
            lastPage={props.providerSearchResults.pagerState.lastPage}
          />
        </nav>
      )}
    </>
  );
}
