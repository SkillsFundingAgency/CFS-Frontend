import React, { useCallback, useMemo } from "react";
import { DatasetDefinitionRequestViewModel } from "../../types/Datasets/DatasetDefinitionRequestViewModel";

import { useToggle } from "../../hooks/useToggle";
import { Facet, FacetValue } from "../../types/Facet";
import {
  MapDataSourceFileDatasetFilterSelectionPanel,
  SearchFilterContainer,
  SearchFilterSection,
  SearchFiltersOuterContainer,
  SearchSidebar,
} from "../SearchFilterContainer";

export const MapDataSourceFilesSearchFilters = ({
  searchCriteria,
  addFundingStreamFilter,
  removeFundingStreamFilter,
  addFundingPeriodFilter,
  removeFundingPeriodFilter,
  filterBySearchTerm,
  filterByFundingStreams,
  filterByFundingPeriods,
  fundingStreamFacets,
  fundingPeriodFacets,
  clearFilters,
}: {
  searchCriteria: DatasetDefinitionRequestViewModel;
  initialSearch: DatasetDefinitionRequestViewModel;
  addFundingStreamFilter: (filter: string) => void;
  removeFundingStreamFilter: (filter: string) => void;
  addFundingPeriodFilter: (filter: string) => void;
  removeFundingPeriodFilter: (filter: string) => void;
  filterBySearchTerm?: (filter: string) => void;
  filterByFundingStreams: (filter: string) => void;
  filterByFundingPeriods: (filter: string) => void;
  fundingStreamFacets: FacetValue[];
  fundingPeriodFacets: FacetValue[];
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
  }, []);
  const collapseAllFilters = useCallback(() => {
    setFundingStreamExpanded(false);
    setFundingPeriodExpanded(false);
  }, []);
  const handleClearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchDatasources").reset();
    clearFilters();
  }, [clearFilters]);

  const fundingStreams: string[] =
  searchCriteria.filters["fundingStreamNames"] != undefined ? searchCriteria.filters["fundingStreamNames"] : [];

  const fundingPeriod: string[] =
  searchCriteria.filters["fundingPeriodName"] != undefined ? searchCriteria.filters["fundingPeriodName"] : [];

  return (
    <SearchSidebar formId={"searchDatasources"} updateSearchText={filterBySearchTerm}>
      <MapDataSourceFileDatasetFilterSelectionPanel
        title="Selected filters"
        selectedFundingStreamFilters={fundingStreams}
        selectedFundingPeriodFilters={fundingPeriod}
        handleRemoveFundingStreamFilter={removeFundingStreamFilter}
        handleRemoveFundingPeriodFilter={removeFundingPeriodFilter}
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
            selectedFilters={fundingStreams}
          />
          <SearchFilterSection
            title="Funding periods"
            facets={fundingPeriodFacets}
            isExpanded={isFundingPeriodExpanded}
            toggleExpanded={toggleFundingPeriodExpanded}
            addFilter={addFundingPeriodFilter}
            removeFilter={removeFundingPeriodFilter}
            searchForFilter={filterByFundingPeriods}
            selectedFilters={fundingPeriod}
          />
        </SearchFilterContainer>
      </SearchFiltersOuterContainer>
    </SearchSidebar>
  );
};
