import React, { useCallback, useMemo } from "react";
import { CalculationProviderSearchRequest } from "types/calculationProviderSearchRequest";

import { useToggle } from "../../hooks/useToggle";
import { FacetValue } from "../../types/Facet";
import {CollapsibleSearchSideBar} from "../CollapsibleSearchSideBar";
import {
  ViewCalculationResultsSearchFilterSelectionPanel,
  SearchFilterContainer,
  SearchFilterSection,
  SearchFiltersOuterContainer,
} from "../SearchFilterContainer";

export const ViewCalculationResultsSearchFilters = ({
  searchCriteria,
  addProviderTypeFilter,
  removeProviderTypeFilter,
  addProviderSubTypeFilter,
  removeProviderSubTypeFilter,
  addResultStatusFilter,
  removeResultStatusFilter,
  addLocalAuthorityFilter,
  removeLocalAuthorityFilter,
  filterBySearchTerm,
  filterByProviderType,
  filterByProviderSubType,
  filterByResultStatus,
  filterByLocalauthority,
  providerTypeFacets,
  providerSubTypeFacets,
  resultStatusFacets,
  localAuthorityFacets,
  clearFilters,
}: {
  searchCriteria: CalculationProviderSearchRequest;
  initialSearch: CalculationProviderSearchRequest;
  addProviderTypeFilter: (filter: string) => void;
  removeProviderTypeFilter: (filter: string) => void;
  addProviderSubTypeFilter: (filter: string) => void;
  removeProviderSubTypeFilter: (filter: string) => void;
  addResultStatusFilter: (filter: string) => void;
  removeResultStatusFilter: (filter: string) => void;
  addLocalAuthorityFilter: (filter: string) => void;
  removeLocalAuthorityFilter: (filter: string) => void;
  filterBySearchTerm?: (searchField: string, searchTerm: string) => void;
  filterByProviderType: (filter: string) => void;
  filterByProviderSubType: (filter: string) => void;
  filterByResultStatus: (filter: string) => void;
  filterByLocalauthority: (filter: string) => void;
  providerTypeFacets: FacetValue[];
  providerSubTypeFacets: FacetValue[];
  resultStatusFacets: FacetValue[];
  localAuthorityFacets: FacetValue[];
  clearFilters: () => void;
}) => {
  const {
    isExpanded: isProviderTypeExpanded,
    toggleExpanded: toggleProviderTypeExpanded,
    setExpanded: setProviderTypeExpanded,
  } = useToggle();

  const {
    isExpanded: isProviderSubTypeExpanded,
    toggleExpanded: toggleProviderSubTypeExpanded,
    setExpanded: setProviderSubTypeExpanded,
  } = useToggle();
  const {
    isExpanded: isResultStatusExpanded,
    toggleExpanded: toggleResultStatusExpanded,
    setExpanded: setResultStatusExpanded,
  } = useToggle();
  const {
    isExpanded: isLocalAuthorityExpanded,
    toggleExpanded: toggleLocalAuthorityExpanded,
    setExpanded: setLocalAuthorityExpanded,
  } = useToggle();

  const allExpanded = useMemo(
    () => isProviderTypeExpanded && isProviderSubTypeExpanded && isResultStatusExpanded && isLocalAuthorityExpanded,
    [isProviderTypeExpanded, isProviderSubTypeExpanded, isResultStatusExpanded, isLocalAuthorityExpanded]
  );
  const allCollapsed = useMemo(
    () => !isProviderTypeExpanded && !isProviderSubTypeExpanded && !isResultStatusExpanded && !isLocalAuthorityExpanded,
    [isProviderTypeExpanded, isProviderSubTypeExpanded, isResultStatusExpanded, isLocalAuthorityExpanded]
  );
  const expandAllFilters = useCallback(() => {
    setProviderTypeExpanded(true);
    setProviderSubTypeExpanded(true);
    setResultStatusExpanded(true);
    setLocalAuthorityExpanded(true)
  }, []);
  const collapseAllFilters = useCallback(() => {
    setProviderTypeExpanded(false);
    setProviderSubTypeExpanded(false);
    setResultStatusExpanded(false);
    setLocalAuthorityExpanded(false);
  }, []);
  const handleClearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchProviders").reset();
    clearFilters();
  }, []);

  return (
    <CollapsibleSearchSideBar formId={"searchProviders"} updateSearch={filterBySearchTerm} >
      <ViewCalculationResultsSearchFilterSelectionPanel
        title="Selected filters"
        selectedProviderTypeFilters={searchCriteria.providerType}
        selectedProviderSubTypeFilters={searchCriteria.providerSubType}
        selectedResultStatusFilters={searchCriteria.resultsStatus}
        selectedLocalAuthorityFilters={searchCriteria.localAuthority}
        handleRemoveProviderTypeFilter={removeProviderTypeFilter}
        handleRemoveProviderSubTypeFilter={removeProviderSubTypeFilter}
        handleRemoveResultStatusFilter={removeResultStatusFilter}
        handleRemoveLocalAuthorityFilter={removeLocalAuthorityFilter}
        handleClearSearch={handleClearFilters}
      />
      <SearchFiltersOuterContainer
        expandAllFilters={expandAllFilters}
        collapseAllFilters={collapseAllFilters}
        allExpanded={allExpanded}
        allCollapsed={allCollapsed}
      >
        <SearchFilterContainer>
          <SearchFilterSection
            title="Provider type"
            facets={providerTypeFacets}
            isExpanded={isProviderTypeExpanded}
            toggleExpanded={toggleProviderTypeExpanded}
            addFilter={addProviderTypeFilter}
            removeFilter={removeProviderTypeFilter}
            searchForFilter={filterByProviderType}
            selectedFilters={searchCriteria.providerType}
          />
          <SearchFilterSection
            title="Provider sub type"
            facets={providerSubTypeFacets}
            isExpanded={isProviderSubTypeExpanded}
            toggleExpanded={toggleProviderSubTypeExpanded}
            addFilter={addProviderSubTypeFilter}
            removeFilter={removeProviderSubTypeFilter}
            searchForFilter={filterByProviderSubType}
            selectedFilters={searchCriteria.providerSubType}
          />
          <SearchFilterSection
            title="Result status"
            facets={resultStatusFacets}
            isExpanded={isResultStatusExpanded}
            toggleExpanded={toggleResultStatusExpanded}
            addFilter={addResultStatusFilter}
            removeFilter={removeResultStatusFilter}
            selectedFilters={searchCriteria.resultsStatus}
          />
          <SearchFilterSection
            title="Local authority"
            facets={localAuthorityFacets}
            isExpanded={isLocalAuthorityExpanded}
            toggleExpanded={toggleLocalAuthorityExpanded}
            addFilter={addLocalAuthorityFilter}
            removeFilter={removeLocalAuthorityFilter}
            searchForFilter={filterByLocalauthority}
            selectedFilters={searchCriteria.localAuthority}
          />
        </SearchFilterContainer>
      </SearchFiltersOuterContainer>
    </CollapsibleSearchSideBar>
  );
};
