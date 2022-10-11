import React, { useCallback, useMemo } from "react";
import { ProviderVersionSearchModel } from "types/Provider/ProviderVersionSearchResults";

import { useToggle } from "../../hooks/useToggle";
import { FacetValue } from "../../types/Facet";
import {CollapsibleSearchSideBar} from "../CollapsibleSearchSideBar";
import {
  SearchFilterContainer,
  SearchFilterSection,
  SearchFiltersOuterContainer,
  ProviderResultsSearchFilterSelectionPanel,
} from "../SearchFilterContainer";

export const ProviderResultsSearchFilters = ({
  searchCriteria,
  addProviderTypeFilter,
  removeProviderTypeFilter,
  addProviderSubTypeFilter,
  removeProviderSubTypeFilter,
  addLocalAuthorityFilter,
  removeLocalAuthorityFilter,
  filterBySearchTerm,
  filterByProviderType,
  filterByProviderSubType,
  filterByLocalauthority,
  providerTypeFacets,
  providerSubTypeFacets,
  localAuthorityFacets,
  clearFilters,
}: {
  searchCriteria: ProviderVersionSearchModel;
  initialSearch: ProviderVersionSearchModel;
  addProviderTypeFilter: (filter: string) => void;
  removeProviderTypeFilter: (filter: string) => void;
  addProviderSubTypeFilter: (filter: string) => void;
  removeProviderSubTypeFilter: (filter: string) => void;
  addLocalAuthorityFilter: (filter: string) => void;
  removeLocalAuthorityFilter: (filter: string) => void;
  filterBySearchTerm?: (searchField: string, searchTerm: string) => void;
  filterByProviderType: (filter: string) => void;
  filterByProviderSubType: (filter: string) => void;
  filterByLocalauthority: (filter: string) => void;
  providerTypeFacets: FacetValue[];
  providerSubTypeFacets: FacetValue[];
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
    isExpanded: isLocalAuthorityExpanded,
    toggleExpanded: toggleLocalAuthorityExpanded,
    setExpanded: setLocalAuthorityExpanded,
  } = useToggle();

  const allExpanded = useMemo(
    () => isProviderTypeExpanded && isProviderSubTypeExpanded && isLocalAuthorityExpanded,
    [isProviderTypeExpanded, isProviderSubTypeExpanded, isLocalAuthorityExpanded]
  );
  const allCollapsed = useMemo(
    () => !isProviderTypeExpanded && !isProviderSubTypeExpanded && !isLocalAuthorityExpanded,
    [isProviderTypeExpanded, isProviderSubTypeExpanded, isLocalAuthorityExpanded]
  );
  const expandAllFilters = useCallback(() => {
    setProviderTypeExpanded(true);
    setProviderSubTypeExpanded(true);
    setLocalAuthorityExpanded(true)
  }, []);
  const collapseAllFilters = useCallback(() => {
    setProviderTypeExpanded(false);
    setProviderSubTypeExpanded(false);
    setLocalAuthorityExpanded(false);
  }, []);
  const handleClearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchProviders").reset();
    clearFilters();
  }, []);
  const providerTypes: string[] =
  searchCriteria.filters["providerType"] != undefined ? searchCriteria.filters["providerType"] : [];

  const providerSubTypes: string[] =
  searchCriteria.filters["providerSubType"] != undefined ? searchCriteria.filters["providerSubType"] : [];

  const localAuthority: string[] =
  searchCriteria.filters["authority"] != undefined ? searchCriteria.filters["authority"] : [];

  return (
    <CollapsibleSearchSideBar formId={"searchProviders"} updateSearch={filterBySearchTerm} >
      <ProviderResultsSearchFilterSelectionPanel
        title="Selected filters"
        selectedProviderTypeFilters={providerTypes}
        selectedProviderSubTypeFilters={providerSubTypes}
        selectedLocalAuthorityFilters={localAuthority}
        handleRemoveProviderTypeFilter={removeProviderTypeFilter}
        handleRemoveProviderSubTypeFilter={removeProviderSubTypeFilter}
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
            selectedFilters={providerTypes}
          />
          <SearchFilterSection
            title="Provider sub type"
            facets={providerSubTypeFacets}
            isExpanded={isProviderSubTypeExpanded}
            toggleExpanded={toggleProviderSubTypeExpanded}
            addFilter={addProviderSubTypeFilter}
            removeFilter={removeProviderSubTypeFilter}
            searchForFilter={filterByProviderSubType}
            selectedFilters={providerSubTypes}
          />
          <SearchFilterSection
            title="Local authority"
            facets={localAuthorityFacets}
            isExpanded={isLocalAuthorityExpanded}
            toggleExpanded={toggleLocalAuthorityExpanded}
            addFilter={addLocalAuthorityFilter}
            removeFilter={removeLocalAuthorityFilter}
            searchForFilter={filterByLocalauthority}
            selectedFilters={localAuthority}
          />
        </SearchFilterContainer>
      </SearchFiltersOuterContainer>
    </CollapsibleSearchSideBar>
  );
};
