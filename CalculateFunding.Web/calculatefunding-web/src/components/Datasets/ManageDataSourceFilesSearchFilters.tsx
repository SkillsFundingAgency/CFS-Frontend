import React, { useCallback, useMemo } from "react";

import { useToggle } from "../../hooks/useToggle";
import { FacetValue } from "../../types/Facet";
import { DatasetSearchRequestViewModel } from "../../types/Datasets/DatasetSearchRequestViewModel";
import {
  SearchFilterContainer,
  SearchFilterSection,
  ManageDataSourceFilesSearchFilterSelectionPanel,
  SearchFiltersOuterContainer,
  SearchSidebar,
} from "../SearchFilterContainer";

export const ManageDataSourceFilesSearchFilters = ({
  searchCriteria,
  addFundingStreamFilter,
  removeFundingStreamFilter,
  addDataSchemaFilter,
  removeDataSchemaFilter,
  filterBySearchTerm,
  filterByFundingStreams,
  filterByDataSchemas,
  fundingStreamFacets,
  dataSchemaFacets,
  clearFilters,
}: {
  searchCriteria: DatasetSearchRequestViewModel;
  initialSearch: DatasetSearchRequestViewModel;
  addFundingStreamFilter: (filter: string) => void;
  removeFundingStreamFilter: (filter: string) => void;
  addDataSchemaFilter: (filter: string) => void;
  removeDataSchemaFilter: (filter: string) => void;
  filterBySearchTerm?: (filter: string) => void;
  filterByFundingStreams: (filter: string) => void;
  filterByDataSchemas: (filter: string) => void;
  fundingStreamFacets: FacetValue[];
  dataSchemaFacets: FacetValue[];
  clearFilters: () => void;
}) => {
  const {
    isExpanded: isFundingStreamExpanded,
    toggleExpanded: toggleFundingStreamExpanded,
    setExpanded: setFundingStreamExpanded,
  } = useToggle();

  const {
    isExpanded: isDataSchemaExpanded,
    toggleExpanded: toggleDataSchemaExpanded,
    setExpanded: setDataSchemaExpanded,
  } = useToggle(); 

  const allExpanded = useMemo(
    () => isFundingStreamExpanded && isDataSchemaExpanded, 
    [isFundingStreamExpanded, isDataSchemaExpanded]
  );
  const allCollapsed = useMemo(
    () => !isFundingStreamExpanded && !isDataSchemaExpanded,
    [isFundingStreamExpanded, isDataSchemaExpanded]
  );
  const expandAllFilters = useCallback(() => {
    setFundingStreamExpanded(true);
    setDataSchemaExpanded(true);
  }, []);
  const collapseAllFilters = useCallback(() => {
    setFundingStreamExpanded(false);
    setDataSchemaExpanded(false);
  }, []);
  const handleClearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchManageDatasources").reset();
    clearFilters();
  }, [clearFilters]);

  return (
    <SearchSidebar formId={"searchManageDatasources"} updateSearchText={filterBySearchTerm}>
      <ManageDataSourceFilesSearchFilterSelectionPanel
        title="Selected filters"
        selectedFundingStreamFilters={searchCriteria.fundingStreams}
        selectedDataSchemaFilters={searchCriteria.dataSchemas}
        handleRemoveFundingStreamFilter={removeFundingStreamFilter}
        handleRemoveDataSchemaFilter={removeDataSchemaFilter}
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
            title="Data schema"
            facets={dataSchemaFacets}
            isExpanded={isDataSchemaExpanded}
            toggleExpanded={toggleDataSchemaExpanded}
            addFilter={addDataSchemaFilter}
            removeFilter={removeDataSchemaFilter}
            searchForFilter={filterByDataSchemas}
            selectedFilters={searchCriteria.dataSchemas}
          />
        </SearchFilterContainer>
      </SearchFiltersOuterContainer>
    </SearchSidebar>
  );
};
