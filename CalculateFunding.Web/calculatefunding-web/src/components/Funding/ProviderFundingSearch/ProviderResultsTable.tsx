import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as actions from "../../../actions/FundingSearchSelectionActions";
import { IStoreState } from "../../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../../states/FundingSearchSelectionState";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { PublishedProviderSearchResults } from "../../../types/PublishedProvider/PublishedProviderSearchResults";
import { BackToTop } from "../../BackToTop";
import { FormattedNumber, NumberType } from "../../FormattedNumber";
import { NoData } from "../../NoData";
import { Pagination } from "../../Pagination";
import { ProviderResultRow } from "./ProviderResultRow";

export interface ProviderResultsForFundingProps {
  actionType: FundingActionType;
  specCoreProviderVersionId?: string;
  enableBatchSelection: boolean;
  providerSearchResults: PublishedProviderSearchResults | undefined;
  totalResults: number;
  allPublishedProviderIds: string[] | undefined;
}

export function ProviderResultsTable({
  actionType,
  providerSearchResults,
  allPublishedProviderIds,
  enableBatchSelection,
  totalResults,
  specCoreProviderVersionId,
}: ProviderResultsForFundingProps) {
  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const havePageResults =
    providerSearchResults !== undefined &&
    providerSearchResults.providers !== undefined &&
    providerSearchResults.providers.length > 0;
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!allPublishedProviderIds) return;
    if (selectAll && allPublishedProviderIds.length === 0) {
      setSelectAll(false);
    }
  }, [selectAll, allPublishedProviderIds]);

  const handleToggleAllProviders = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (allPublishedProviderIds) {
      const checked = e.target.checked;
      setSelectAll(checked);
      dispatch(
        checked
          ? actions.addProvidersToFundingSelection(allPublishedProviderIds)
          : actions.removeProvidersFromFundingSelection(allPublishedProviderIds)
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

      {havePageResults && providerSearchResults && (
        <table className="govuk-table" data-testid={"published-provider-results"}>
          <thead>
            <tr>
              <th className="govuk-table__header govuk-body">
                Provider name
                {enableBatchSelection && (
                  <>
                    <br />
                    <span className="govuk-!-margin-right-2">
                      <span id="checkbox-checked">
                        {state.selectedProviderIds ? state.selectedProviderIds.length : 0}
                      </span>{" "}
                      / <span id="checkbox-count">{totalResults}</span>
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
              <th className="govuk-table__header govuk-body">Status</th>
              <th className="govuk-table__header govuk-body">Released version</th>
              <th className="govuk-table__header govuk-body">
                Funding total
                <br />
                <FormattedNumber
                  value={providerSearchResults.filteredFundingAmount}
                  type={NumberType.FormattedMoney}
                />
                <br />
                <p className="govuk-body-s">of filtered providers</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {providerSearchResults.providers.map((provider, i) => (
              <ProviderResultRow
                key={`provider-${i}`}
                actionType={actionType}
                publishedProvider={provider}
                specCoreProviderVersionId={specCoreProviderVersionId}
                enableSelection={enableBatchSelection}
                isSelected={state.selectedProviderIds.includes(provider.publishedProviderVersionId)}
                handleItemSelectionToggle={handleItemSelectionToggle}
              />
            ))}
          </tbody>
        </table>
      )}

      <BackToTop id="top" />

      {totalResults > 0 && providerSearchResults && (
        <nav
          className="govuk-!-margin-top-5 govuk-!-margin-bottom-9"
          role="navigation"
          aria-label="Pagination"
        >
          <div className="pagination__summary">
            Showing {providerSearchResults.startItemNumber} - {providerSearchResults.endItemNumber} of{" "}
            {totalResults} results
          </div>
          <Pagination
            callback={handlePageChange}
            currentPage={providerSearchResults.pagerState.currentPage}
            lastPage={providerSearchResults.pagerState.lastPage}
          />
        </nav>
      )}
    </>
  );
}
