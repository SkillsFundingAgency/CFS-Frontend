import React, { useCallback, useMemo } from "react";

import { useToggle } from "../../hooks/useToggle";
import { FacetValue } from "../../types/Facet";
import { SpecificationSearchRequestViewModel } from "../../types/SpecificationSearchRequestViewModel";
import {
  SearchFilterContainer,
  SearchFilterSection,
  SearchFilterSelectionPanel,
  SearchFiltersOuterContainer,
  SearchSidebar,
} from "../SearchFilterContainer";

export const SpecificationsSearchFilters = ({
  searchCriteria,
  addFundingStreamFilter,
  removeFundingStreamFilter,
  addFundingPeriodFilter,
  removeFundingPeriodFilter,
  addStatusFilter,
  removeStatusFilter,
  filterBySearchTerm,
  filterByFundingStreams,
  filterByFundingPeriods,
  fundingStreamFacets,
  fundingPeriodFacets,
  statusFacets,
  clearFilters,
}: {
  searchCriteria: SpecificationSearchRequestViewModel;
  initialSearch: SpecificationSearchRequestViewModel;
  addFundingStreamFilter: (filter: string) => void;
  removeFundingStreamFilter: (filter: string) => void;
  addFundingPeriodFilter: (filter: string) => void;
  removeFundingPeriodFilter: (filter: string) => void;
  addStatusFilter: (filter: string) => void;
  removeStatusFilter: (filter: string) => void;
  filterBySearchTerm?: (filter: string) => void;
  filterByFundingStreams: (filter: string) => void;
  filterByFundingPeriods: (filter: string) => void;
  filterBySearchStatus: (filter: string) => void;
  fundingStreamFacets: FacetValue[];
  fundingPeriodFacets: FacetValue[];
  statusFacets: FacetValue[];
  clearFilters: () => void;
}) => {
  const {
    isExpanded: isFundingStreamExpanded,
    toggleExpanded: toggleFundingStreamExpanded,
    setExpanded: setFundingStreamExpanded,
  } = useToggle();

  const {
    isExpanded: isFundingPeriodExpanded,
    toggleExpanded: toggleFundingPeriodExpanded,
    setExpanded: setFundingPeriodExpanded,
  } = useToggle();
  const {
    isExpanded: isStatusExpanded,
    toggleExpanded: toggleStatusExpanded,
    setExpanded: setStatusExpanded,
  } = useToggle();

  const allExpanded = useMemo(
    () => isFundingStreamExpanded && isFundingPeriodExpanded,
    [isFundingStreamExpanded, isFundingPeriodExpanded]
  );
  const allCollapsed = useMemo(
    () => !isFundingStreamExpanded && !isFundingPeriodExpanded,
    [isFundingStreamExpanded, isFundingPeriodExpanded]
  );
  const expandAllFilters = useCallback(() => {
    setFundingStreamExpanded(true);
    setFundingPeriodExpanded(true);
    setStatusExpanded(true);
  }, []);
  const collapseAllFilters = useCallback(() => {
    setFundingStreamExpanded(false);
    setFundingPeriodExpanded(false);
    setStatusExpanded(false);
  }, []);
  const handleClearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchSpecifications").reset();
    clearFilters();
  }, [clearFilters]);

  return (
    <SearchSidebar formId={"searchSpecifications"} updateSearchText={filterBySearchTerm}>
      <SearchFilterSelectionPanel
        title="Selected filters"
        selectedFundingStreamFilters={searchCriteria.fundingStreams}
        selectedFundingPeriodFilters={searchCriteria.fundingPeriods}
        selectedStatusFilters={searchCriteria.status}
        handleRemoveFundingStreamFilter={removeFundingStreamFilter}
        handleRemoveFundingPeriodFilter={removeFundingPeriodFilter}
        handleRemoveStatusFilter={removeStatusFilter}
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
            title="Funding streams"
            facets={fundingStreamFacets}
            isExpanded={isFundingStreamExpanded}
            toggleExpanded={toggleFundingStreamExpanded}
            addFilter={addFundingStreamFilter}
            removeFilter={removeFundingStreamFilter}
            searchForFilter={filterByFundingStreams}
            selectedFilters={searchCriteria.fundingStreams}
          />
          <SearchFilterSection
            title="Funding periods"
            facets={fundingPeriodFacets}
            isExpanded={isFundingPeriodExpanded}
            toggleExpanded={toggleFundingPeriodExpanded}
            addFilter={addFundingPeriodFilter}
            removeFilter={removeFundingPeriodFilter}
            searchForFilter={filterByFundingPeriods}
            selectedFilters={searchCriteria.fundingPeriods}
          />
          <SearchFilterSection
            title="Status"
            facets={statusFacets}
            isExpanded={isStatusExpanded}
            toggleExpanded={toggleStatusExpanded}
            addFilter={addStatusFilter}
            removeFilter={removeStatusFilter}
            selectedFilters={searchCriteria.status}
          />
        </SearchFilterContainer>
      </SearchFiltersOuterContainer>
    </SearchSidebar>
  );
};
