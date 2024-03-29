﻿/* eslint-disable */
import "../styles/Accordion.scss";

import React, { ChangeEvent, useRef } from "react";

import { TextLink } from "./TextLink";
import { useToggle } from "../hooks/useToggle";
import { FacetValue } from "../types/Facet";
import { convertToSlug } from "../helpers/stringHelper";
import { debounce } from "lodash";

export const SearchFilterSectionHeader = ({
  filterName,
  handleToggleExpand,
  selectedFilters,
  isExpanded,
  enableStandalone,
}: {
  filterName: string;
  handleToggleExpand: () => void;
  selectedFilters: string[];
  isExpanded: boolean;
  enableStandalone: boolean;
}) => {
  const id = convertToSlug(`${filterName} filters`);
  return (
    <div
      className={`search-filters__section__content ${enableStandalone && "search-filters__standalone"}`}
      data-testid={id}
    >
      <h2 className="search-filters__section-heading">
        <label
          tabIndex={0}
          className="search-filters__section-label govuk-body govuk-!-font-size-19"
          htmlFor={id}
          onClick={handleToggleExpand}
        >
          <span className="search-filters__section-heading-text">
            <span className="search-filters__section-heading-text-focus" id={id}>
              <span className="govuk-visually-hidden">Filter by</span>
              {filterName}
            </span>
          </span>
          <span className="govuk-visually-hidden search-filters__section-heading-divider">, </span>
          <span className="search-filters__section-summary govuk-body govuk-body-s">
            <span className="search-filters__section-summary-focus">
              <span>{selectedFilters.length}</span> selected
            </span>
          </span>
          <span className="govuk-visually-hidden search-filters__section-heading-divider">, </span>
          <span className="search-filters__section-toggle">
            <span className="search-filters__section-toggle-focus">
              <span
                className={`search-filters-nav__chevron search-filters-nav__chevron--${
                  isExpanded ? "up" : "down"
                }`}
              >
                &nbsp;
              </span>
              <span className="search-filters__section-toggle-text">
                {isExpanded ? "Hide" : "Show"}
                <span className="govuk-visually-hidden"> this section</span>
              </span>
            </span>
          </span>
        </label>
      </h2>
    </div>
  );
};

const isFacetValue = (arg: any): arg is FacetValue => {
  return !!(arg as FacetValue)?.name?.length;
};

const isFacetValueArray = (arg: any[]): arg is FacetValue[] => {
  return arg.every((element: any) => isFacetValue(element));
};

export const SearchFilterSelection = ({
  title,
  facets,
  searchForFilter,
  selectedFilters,
  enableStandalone,
  addFilter,
  removeFilter,
}: {
  title: string;
  enableStandalone: boolean;
  facets: FacetValue[] | string[];
  searchForFilter?: (searchTerm: string) => void;
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  selectedFilters: string[];
}) => {
  const id = convertToSlug(`${title} option`);
  return (
    <div
      className={`search-filters__section__content ${enableStandalone ? "search-filters__standalone" : ""}`}
    >
      <fieldset className="govuk-fieldset">
        {searchForFilter && (
          <div className="govuk-form-group filterSearch">
            <label id={`label-search-${id}`} className="govuk-label filterLabel" htmlFor={`search-${id}`}>
              Search for {title}
            </label>
            <input
              className="govuk-input filterSearchInput govuk-!-margin-bottom-2"
              id={`search-${id}`}
              aria-labelledby={`label-search-${id}`}
              autoComplete="off"
              name="searchBox"
              type="text"
              onChange={(e) => searchForFilter(e.target.value)}
            />
          </div>
        )}
        {isFacetValueArray(facets) ? (
          <div className="govuk-checkboxes govuk-checkboxes--small filterbyCheckboxNew">
            {facets?.map((f, i) => {
              const key = `checkbox-${id}-${convertToSlug(f.name)}-${i}`;
              const isSelected = selectedFilters.includes(f.name);
              const handleFilterChange = () => (isSelected ? removeFilter(f.name) : addFilter(f.name));
              return (
                <div key={key} className="govuk-checkboxes__item">
                  <input
                    id={key}
                    className="govuk-checkboxes__input"
                    name={key}
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleFilterChange}
                  />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor={key}>
                    {f.name} <span>({f.count})</span>
                  </label>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="govuk-checkboxes govuk-checkboxes--small filterbyCheckboxNew">
            {facets?.map((f) => {
              const key = `checkbox-${id}-${convertToSlug(f)}`;
              const isSelected = selectedFilters.includes(f);
              const handleFilterChange = () => (isSelected ? removeFilter(f) : addFilter(f));
              return (
                <div key={key} className="govuk-checkboxes__item">
                  <input
                    id={key}
                    className="govuk-checkboxes__input"
                    name={key}
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleFilterChange}
                  />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor={key}>
                    {f}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </fieldset>
    </div>
  );
};

export const SearchFilterSection = React.memo(
  ({
    title,
    facets,
    searchForFilter,
    selectedFilters,
    isExpanded,
    enableStandalone = false,
    toggleExpanded,
    addFilter,
    removeFilter,
  }: {
    title: string;
    facets: FacetValue[] | string[];
    isExpanded: boolean;
    enableStandalone?: boolean;
    toggleExpanded: () => void;
    addFilter: (filter: string) => void;
    removeFilter: (filter: string) => void;
    searchForFilter?: (searchTerm: string) => void;
    selectedFilters: string[];
  }) => {
    return (
      <div className="search-filters__section">
        <SearchFilterSectionHeader
          filterName={title}
          handleToggleExpand={toggleExpanded}
          isExpanded={isExpanded}
          enableStandalone={enableStandalone}
          selectedFilters={selectedFilters}
        />
        {isExpanded && (
          <SearchFilterSelection
            title={title}
            enableStandalone={enableStandalone}
            selectedFilters={selectedFilters}
            searchForFilter={searchForFilter}
            addFilter={addFilter}
            removeFilter={removeFilter}
            facets={facets}
          />
        )}
      </div>
    );
  }
);

export const TextSearchPanel = ({
  title = "Search",
  handleTextSearchChange,
  clearSearchTitle = "Clear search",
}: {
  title?: string;
  clearSearchTitle?: string;
  handleTextSearchChange: (text: string) => void;
}) => {
  const inputRef = useRef<any>();
  const handleClearSearch = (e: any) => {
    e.preventDefault();
    handleTextSearchChange("");
    inputRef.current.value = "";
  };
  const debounceUpdateSearchText = useRef(debounce(handleTextSearchChange, 500)).current;
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => debounceUpdateSearchText(e.target.value);

  return (
    <div className="govuk-form-group filterbyContainer">
      <fieldset className="govuk-fieldset">
        <div className="govuk-form-group filterSearch">
          <label
            className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2"
            htmlFor="mainContentSearch"
          >
            {title}
          </label>

          <TextLink
            handleOnClick={handleClearSearch}
            additionalCss="govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"
          >
            {clearSearchTitle}
          </TextLink>

          <input
            className="govuk-input filterSearchInput govuk-!-margin-bottom-2"
            id="mainContentSearch"
            autoComplete="off"
            name="searchBox"
            type="text"
            ref={inputRef}
            onChange={handleTextChange}
          />
        </div>
      </fieldset>
    </div>
  );
};

export const SelectedFilters = ({
  title,
  selectedFilters,
  handleRemoveFilter,
}: {
  title: string;
  selectedFilters: string[];
  handleRemoveFilter: (value: string) => void;
}) => {
  return (
    <div className="filter">
      <div className="filter__content">
        <div className="filter__selected">
          <h3 className="govuk-hint govuk-body govuk-!-font-size-16 govuk-!-margin-0">{title}</h3>
          <ul className="filter-tags">
            {selectedFilters?.map((f) => {
              const selectionKey = convertToSlug(`selected ${title} ${f}`);
              return (
                <li id={selectionKey} key={selectionKey}>
                  <button className="filter__tag" onClick={() => handleRemoveFilter(f)}>
                    <span className="govuk-visually-hidden">Remove this filter</span>
                    {f}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const SearchFilterSelectionPanel = ({
  title,
  selectedFundingStreamFilters,
  selectedFundingPeriodFilters,
  selectedStatusFilters,
  handleRemoveFundingStreamFilter,
  handleRemoveFundingPeriodFilter,
  handleRemoveStatusFilter,
  clearSearchTitle = "Clear search",
  handleClearSearch,
}: {
  title: string;
  selectedFundingStreamFilters: string[];
  selectedFundingPeriodFilters: string[];
  selectedStatusFilters: string[];
  clearSearchTitle?: string;
  handleRemoveFundingStreamFilter: (fundingStream: string) => void;
  handleRemoveFundingPeriodFilter: (fundingPeriod: string) => void;
  handleRemoveStatusFilter: (status: string) => void;
  handleClearSearch: () => void;
}) => {
  const haveFilters =
    !!selectedFundingStreamFilters.length ||
    !!selectedFundingPeriodFilters.length ||
    !!selectedStatusFilters.length;

  return (
    <fieldset className="govuk-fieldset search-filters--greyed selected-filters-background">
      <div className="govuk-form-group filterSearch">
        <h2 className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2">
          {title}
        </h2>
        <TextLink
          handleOnClick={handleClearSearch}
          additionalCss={"govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"}
        >
          {clearSearchTitle}
        </TextLink>

        {!haveFilters ? (
          <div id="showHideText">
            <p className="govuk-body-s">No filters selected</p>
          </div>
        ) : (
          <div className="filtersSelected">
            {selectedFundingStreamFilters.length > 0 && (
              <SelectedFilters
                title="Funding streams"
                selectedFilters={selectedFundingStreamFilters}
                handleRemoveFilter={handleRemoveFundingStreamFilter}
              />
            )}
            {selectedFundingPeriodFilters.length > 0 && (
              <SelectedFilters
                title="Funding periods"
                selectedFilters={selectedFundingPeriodFilters}
                handleRemoveFilter={handleRemoveFundingPeriodFilter}
              />
            )}
            {selectedStatusFilters.length > 0 && (
              <SelectedFilters
                title="Status"
                selectedFilters={selectedStatusFilters}
                handleRemoveFilter={handleRemoveStatusFilter}
              />
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};

export const DownloadDataSchemaSearchFilterSelectionPanel = ({
  title,
  selectedFundingStreamFilters,
  handleRemoveFundingStreamFilter,
  clearSearchTitle = "Clear search",
  handleClearSearch,
}: {
  title: string;
  selectedFundingStreamFilters: string[];
  clearSearchTitle?: string;
  handleRemoveFundingStreamFilter: (fundingStream: string) => void;
  handleClearSearch: () => void;
}) => {
  const haveFilters =
    !!selectedFundingStreamFilters.length;

  return (
    <fieldset className="govuk-fieldset search-filters--greyed selected-filters-background">
      <div className="govuk-form-group filterSearch">
        <h2 className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2">
          {title}
        </h2>
        <TextLink
          handleOnClick={handleClearSearch}
          additionalCss={"govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"}
        >
          {clearSearchTitle}
        </TextLink>

        {!haveFilters ? (
          <div id="showHideText">
            <p className="govuk-body-s">No filters selected</p>
          </div>
        ) : (
          <div className="filtersSelected">
            {selectedFundingStreamFilters.length > 0 && (
              <SelectedFilters
                title="Funding streams"
                selectedFilters={selectedFundingStreamFilters}
                handleRemoveFilter={handleRemoveFundingStreamFilter}
              />
            )}           
          </div>
        )}
      </div>
    </fieldset>
  );
};

export const ManageDataSourceFilesSearchFilterSelectionPanel = ({
  title,
  selectedFundingStreamFilters,
  selectedDataSchemaFilters,
  handleRemoveFundingStreamFilter,
  handleRemoveDataSchemaFilter,
  clearSearchTitle = "Clear search",
  handleClearSearch,
}: {
  title: string;
  selectedFundingStreamFilters: string[];
  selectedDataSchemaFilters: string[];
  clearSearchTitle?: string;
  handleRemoveFundingStreamFilter: (fundingStream: string) => void;
  handleRemoveDataSchemaFilter: (fundingPeriod: string) => void;
  handleClearSearch: () => void;
}) => {
  const haveFilters =
    !!selectedFundingStreamFilters.length ||
    !!selectedDataSchemaFilters.length;

  return (
    <fieldset className="govuk-fieldset search-filters--greyed selected-filters-background">
      <div className="govuk-form-group filterSearch">
        <h2 className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2">
          {title}
        </h2>
        <TextLink
          handleOnClick={handleClearSearch}
          additionalCss={"govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"}
        >
          {clearSearchTitle}
        </TextLink>

        {!haveFilters ? (
          <div id="showHideText">
            <p className="govuk-body-s">No filters selected</p>
          </div>
        ) : (
          <div className="filtersSelected">
            {selectedFundingStreamFilters.length > 0 && (
              <SelectedFilters
                title="Funding streams"
                selectedFilters={selectedFundingStreamFilters}
                handleRemoveFilter={handleRemoveFundingStreamFilter}
              />
            )}
            {selectedDataSchemaFilters.length > 0 && (
              <SelectedFilters
                title="Data schema"
                selectedFilters={selectedDataSchemaFilters}
                handleRemoveFilter={handleRemoveDataSchemaFilter}
              />
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};

export const MapDataSourceFileDatasetFilterSelectionPanel = ({
  title,
  selectedFundingStreamFilters,
  selectedFundingPeriodFilters,
  handleRemoveFundingStreamFilter,
  handleRemoveFundingPeriodFilter,
  clearSearchTitle = "Clear search",
  handleClearSearch,
}: {
  title: string;
  selectedFundingStreamFilters: string[];
  selectedFundingPeriodFilters: string[];
  clearSearchTitle?: string;
  handleRemoveFundingStreamFilter: (fundingStream: string) => void;
  handleRemoveFundingPeriodFilter: (fundingPeriod: string) => void;
  handleClearSearch: () => void;
}) => {
  const haveFilters =
    !!selectedFundingStreamFilters.length ||
    !!selectedFundingPeriodFilters.length ;

  return (
    <fieldset className="govuk-fieldset search-filters--greyed selected-filters-background">
      <div className="govuk-form-group filterSearch">
        <h2 className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2">
          {title}
        </h2>
        <TextLink
          handleOnClick={handleClearSearch}
          additionalCss={"govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"}
        >
          {clearSearchTitle}
        </TextLink>

        {!haveFilters ? (
          <div id="showHideText">
            <p className="govuk-body-s">No filters selected</p>
          </div>
        ) : (
          <div className="filtersSelected">
            {selectedFundingStreamFilters.length > 0 && (
              <SelectedFilters
                title="Funding streams"
                selectedFilters={selectedFundingStreamFilters}
                handleRemoveFilter={handleRemoveFundingStreamFilter}
              />
            )}
            {selectedFundingPeriodFilters.length > 0 && (
              <SelectedFilters
                title="Funding periods"
                selectedFilters={selectedFundingPeriodFilters}
                handleRemoveFilter={handleRemoveFundingPeriodFilter}
              />
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};

export const SearchFiltersOuterContainer = React.memo(
  ({
    expandAllFilters,
    collapseAllFilters,
    allExpanded,
    allCollapsed,
    children,
  }: {
    expandAllFilters: () => void;
    collapseAllFilters: () => void;
    allExpanded: boolean;
    allCollapsed: boolean;
    children: any;
  }) => {
    const handleClick = (e?: any) => {
      e.preventDefault();
      if (allExpanded) {
        collapseAllFilters();
      } else {
        expandAllFilters();
      }
    };
    return (
      <div className="govuk-form-group filterSearch filterbyContainer">
        <div className="filterContainer">
          <div className="search-filters__controls">
            <label tabIndex={0} onClick={(e) => handleClick(e)} className="search-filters__show-all">
              <span
                className={`search-filters-nav__chevron search-filters-nav__chevron--${
                  allExpanded ? "up" : "down"
                }`}
              >
                &nbsp;
              </span>
              <span id="show-hide-all" className="search-filters__show-all-text">
                {allExpanded ? "Hide all sections" : "Show all sections"}
              </span>
            </label>
          </div>
          {children}
        </div>
      </div>
    );
  }
);

export interface SearchSidebarProps {
  enableStickyScroll?: boolean;
  children?: any;
  formId?: string;
}

export interface SearchSidebarWithTextSearchProps extends SearchSidebarProps {
  updateSearchText: (searchText: string) => void;
}

const isTextSearchEnabled = (arg: any): arg is SearchSidebarWithTextSearchProps => {
  return !!(arg as SearchSidebarWithTextSearchProps)?.updateSearchText;
};

export const SearchSidebar = (props: SearchSidebarProps | SearchSidebarWithTextSearchProps) => {
  if (isTextSearchEnabled(props)) {
    return (
      <aside className="govuk-form-group filterSearch search-filters">
        <div className={`${props.enableStickyScroll ? "search-filters--filterScroll" : ""}`}>
          <form id={props.formId}>
            <TextSearchPanel handleTextSearchChange={props.updateSearchText} />
            {!!props.children && <div className="govuk-form-group filterbyContainer">{props.children}</div>}
          </form>
        </div>
      </aside>
    );
  } else {
    return (
      <aside className="govuk-form-group filterSearch search-filters">
        <div className={`${props.enableStickyScroll ? "search-filters--filterScroll" : ""}`}>
          <form id={props.formId}>
            {!!props.children && <div className="govuk-form-group filterbyContainer">{props.children}</div>}
          </form>
        </div>
      </aside>
    );
  }
};

export const SearchFilterContainer = ({ children }: { children: any }) => {
  return <div className="govuk-form-group filterContainer">{children}</div>;
};

const Accordion = ({
  id,
  expandedTitle,
  collapsedTitle,
  children,
}: {
  id: string;
  expandedTitle: any;
  collapsedTitle: any;
  children: any;
}) => {
  const { isExpanded, toggleExpanded } = useToggle();

  return (
    <div className="search-filters__controls">
      <label
        id={`label-${id}`}
        onClick={toggleExpanded}
        className="search-filters__show-all"
        aria-expanded={isExpanded}
        htmlFor={id}
      >
        <span
          className={`search-filters-nav__chevron search-filters-nav__chevron--${isExpanded ? "up" : "down"}`}
        ></span>
        <span className="search-filters__show-all-text">{isExpanded ? expandedTitle : collapsedTitle}</span>
      </label>
      {isExpanded && (
        <section id={id} aria-labelledby={`label-${id}`} className="search-filters__section">
          {children}
        </section>
      )}
    </div>
  );
};

export const ViewCalculationResultsSearchFilterSelectionPanel = ({
  title,
  selectedProviderTypeFilters,
  selectedProviderSubTypeFilters,
  selectedResultStatusFilters,
  selectedLocalAuthorityFilters,
  handleRemoveProviderTypeFilter,
  handleRemoveProviderSubTypeFilter,
  handleRemoveResultStatusFilter,
  handleRemoveLocalAuthorityFilter,
  clearSearchTitle = "Clear filters",
  handleClearSearch,
}: {
  title: string;
  selectedProviderTypeFilters: string[];
  selectedProviderSubTypeFilters: string[];
  selectedResultStatusFilters: string[];
  selectedLocalAuthorityFilters: string[];
  clearSearchTitle?: string;
  handleRemoveProviderTypeFilter: (providerType: string) => void;
  handleRemoveProviderSubTypeFilter: (providerSubType: string) => void;
  handleRemoveResultStatusFilter: (resultStatus: string) => void;
  handleRemoveLocalAuthorityFilter: (localAuthority: string) => void;
  handleClearSearch: () => void;
}) => {
  const haveFilters =
    !!selectedProviderTypeFilters.length ||
    !!selectedProviderSubTypeFilters.length ||
    !!selectedResultStatusFilters.length ||
    !!selectedLocalAuthorityFilters.length;

  return (
    <fieldset className="govuk-fieldset search-filters--greyed selected-filters-background">
      <div className="govuk-form-group filterSearch">
        <h2 className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2">
          {title}
        </h2>
        <TextLink
          handleOnClick={handleClearSearch}
          additionalCss={"govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"}
        >
          {clearSearchTitle}
        </TextLink>

        {!haveFilters ? (
          <div id="showHideText">
            <p className="govuk-body-s">No filters selected</p>
          </div>
        ) : (
          <div className="filtersSelected">
            {selectedProviderTypeFilters.length > 0 && (
              <SelectedFilters
                title="Provider type"
                selectedFilters={selectedProviderTypeFilters}
                handleRemoveFilter={handleRemoveProviderTypeFilter}
              />
            )}
            {selectedProviderSubTypeFilters.length > 0 && (
              <SelectedFilters
                title="Provider sub type"
                selectedFilters={selectedProviderSubTypeFilters}
                handleRemoveFilter={handleRemoveProviderSubTypeFilter}
              />
            )}
            {selectedResultStatusFilters.length > 0 && (
              <SelectedFilters
                title="Result status"
                selectedFilters={selectedResultStatusFilters}
                handleRemoveFilter={handleRemoveResultStatusFilter}
              />
            )}
            {selectedLocalAuthorityFilters.length > 0 && (
              <SelectedFilters
                title="Local authority"
                selectedFilters={selectedLocalAuthorityFilters}
                handleRemoveFilter={handleRemoveLocalAuthorityFilter}
              />
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};


export const ProviderResultsSearchFilterSelectionPanel = ({
  title,
  selectedProviderTypeFilters,
  selectedProviderSubTypeFilters,
  selectedLocalAuthorityFilters,
  handleRemoveProviderTypeFilter,
  handleRemoveProviderSubTypeFilter,
  handleRemoveLocalAuthorityFilter,
  clearSearchTitle = "Clear filters",
  handleClearSearch,
}: {
  title: string;
  selectedProviderTypeFilters: string[];
  selectedProviderSubTypeFilters: string[];
  selectedLocalAuthorityFilters: string[];
  clearSearchTitle?: string;
  handleRemoveProviderTypeFilter: (providerType: string) => void;
  handleRemoveProviderSubTypeFilter: (providerSubType: string) => void;
  handleRemoveLocalAuthorityFilter: (localAuthority: string) => void;
  handleClearSearch: () => void;
}) => {
  const haveFilters =
    !!selectedProviderTypeFilters.length ||
    !!selectedProviderSubTypeFilters.length ||
    !!selectedLocalAuthorityFilters.length;

  return (
    <fieldset className="govuk-fieldset search-filters--greyed selected-filters-background">
      <div className="govuk-form-group filterSearch">
        <h2 className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2">
          {title}
        </h2>
        <TextLink
          handleOnClick={handleClearSearch}
          additionalCss={"govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"}
        >
          {clearSearchTitle}
        </TextLink>

        {!haveFilters ? (
          <div id="showHideText">
            <p className="govuk-body-s">No filters selected</p>
          </div>
        ) : (
          <div className="filtersSelected">
            {selectedProviderTypeFilters.length > 0 && (
              <SelectedFilters
                title="Provider type"
                selectedFilters={selectedProviderTypeFilters}
                handleRemoveFilter={handleRemoveProviderTypeFilter}
              />
            )}
            {selectedProviderSubTypeFilters.length > 0 && (
              <SelectedFilters
                title="Provider sub type"
                selectedFilters={selectedProviderSubTypeFilters}
                handleRemoveFilter={handleRemoveProviderSubTypeFilter}
              />
            )}
            {selectedLocalAuthorityFilters.length > 0 && (
              <SelectedFilters
                title="Local authority"
                selectedFilters={selectedLocalAuthorityFilters}
                handleRemoveFilter={handleRemoveLocalAuthorityFilter}
              />
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};


export const ApproveProvidersSearchFilterSelectionPanel = ({
  title,
  selectedProviderTypeFilters,
  selectedProviderSubTypeFilters,
  selectedLocalAuthorityFilters,
  selectedStatusFilters,
  selectedErrorStateFilters,
  selectedAllocationFilters,
  selectedDatefilters,
  handleRemoveProviderTypeFilter,
  handleRemoveProviderSubTypeFilter,
  handleRemoveLocalAuthorityFilter,
  handleRemoveStatusFilter,
  handleRemoveErrorStateFilter,
  handleRemoveAllocationFilter,
  handleRemoveDatefilter,
  clearSearchTitle = "Clear filters",
  handleClearSearch,
}: {
  title: string;
  selectedProviderTypeFilters: string[];
  selectedProviderSubTypeFilters: string[];
  selectedLocalAuthorityFilters: string[];
  selectedStatusFilters: string[],
  selectedErrorStateFilters: string[],
  selectedAllocationFilters: string[],
  selectedDatefilters: string[],
  clearSearchTitle?: string;
  handleRemoveProviderTypeFilter: (providerType: string) => void;
  handleRemoveProviderSubTypeFilter: (providerSubType: string) => void;
  handleRemoveLocalAuthorityFilter: (localAuthority: string) => void;
  handleRemoveStatusFilter: (filter: string) => void;
  handleRemoveErrorStateFilter: (filter: string) => void;
  handleRemoveAllocationFilter: (filter: string) => void;
  handleRemoveDatefilter: (filter: string) => void;
  handleClearSearch: () => void;
}) => {
  const haveFilters =
    !!selectedProviderTypeFilters.length ||
    !!selectedProviderSubTypeFilters.length ||
    !!selectedStatusFilters.length ||
    !!selectedErrorStateFilters.length ||
    !!selectedAllocationFilters.length ||
    !!selectedDatefilters.length ||
    !!selectedLocalAuthorityFilters.length;

  return (
    <fieldset className="govuk-fieldset search-filters--greyed selected-filters-background">
      <div className="govuk-form-group filterSearch">
        <h2 className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2">
          {title}
        </h2>
        <TextLink
          handleOnClick={handleClearSearch}
          additionalCss={"govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"}
        >
          {clearSearchTitle}
        </TextLink>

        {!haveFilters ? (
          <div id="showHideText">
            <p className="govuk-body-s">No filters selected</p>
          </div>
        ) : (
          <div className="filtersSelected">
            {selectedProviderTypeFilters.length > 0 && (
              <SelectedFilters
                title="Provider type"
                selectedFilters={selectedProviderTypeFilters}
                handleRemoveFilter={handleRemoveProviderTypeFilter}
              />
            )}
            {selectedProviderSubTypeFilters.length > 0 && (
              <SelectedFilters
                title="Provider sub type"
                selectedFilters={selectedProviderSubTypeFilters}
                handleRemoveFilter={handleRemoveProviderSubTypeFilter}
              />
            )}
            {selectedLocalAuthorityFilters.length > 0 && (
              <SelectedFilters
                title="Local authority"
                selectedFilters={selectedLocalAuthorityFilters}
                handleRemoveFilter={handleRemoveLocalAuthorityFilter}
              />
            )}
            {selectedStatusFilters.length > 0 && (
              <SelectedFilters
                title="Status"
                selectedFilters={selectedStatusFilters}
                handleRemoveFilter={handleRemoveStatusFilter}
              />
            )}
            {selectedErrorStateFilters.length > 0 && (
              <SelectedFilters
                title="Error status"
                selectedFilters={selectedErrorStateFilters}
                handleRemoveFilter={handleRemoveErrorStateFilter}
              />
            )}
            {selectedAllocationFilters.length > 0 && (
              <SelectedFilters
                title="Allocation type"
                selectedFilters={selectedAllocationFilters}
                handleRemoveFilter={handleRemoveAllocationFilter}
              />
            )}
            {selectedDatefilters.length > 0 && (
              <SelectedFilters
                title="Open date"
                selectedFilters={selectedDatefilters}
                handleRemoveFilter={handleRemoveDatefilter}
              />
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
};
