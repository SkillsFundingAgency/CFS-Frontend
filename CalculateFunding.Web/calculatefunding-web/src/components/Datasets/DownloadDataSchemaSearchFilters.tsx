import React, { useCallback} from "react";

import { useToggle } from "../../hooks/useToggle";
import { FacetValue } from "../../types/Facet";
import { DatasetDefinitionRequestViewModel } from "../../types/Datasets/DatasetDefinitionRequestViewModel";
import {
  SearchFilterContainer,
  SearchFilterSection,
  DownloadDataSchemaSearchFilterSelectionPanel,
  SearchSidebar,
} from "../SearchFilterContainer";

export const DownloadDataSchemaSearchFilters = ({
  searchCriteria,
  addFundingStreamFilter,
  removeFundingStreamFilter,
  filterBySearchTerm,
  filterByFundingStreams,
  fundingStreamFacets,
  clearFilters,
}: {
  searchCriteria: DatasetDefinitionRequestViewModel;
  initialSearch: DatasetDefinitionRequestViewModel;
  addFundingStreamFilter: (filter: string) => void;
  removeFundingStreamFilter: (filter: string) => void;
  filterBySearchTerm?: (filter: string) => void;
  filterByFundingStreams: (filter: string) => void;
  fundingStreamFacets: FacetValue[];
  clearFilters: () => void;
}) => {
  const {
    isExpanded: isFundingStreamExpanded,
    toggleExpanded: toggleFundingStreamExpanded,
  } = useToggle();

  const handleClearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchDatasources").reset();
    clearFilters();
  }, [clearFilters]);

  const filters: string[] =
  searchCriteria.filters["fundingStreamName"] != undefined ? searchCriteria.filters["fundingStreamName"] : [];

  return (
    <SearchSidebar formId={"searchDatasources"} updateSearchText={filterBySearchTerm}>
      <DownloadDataSchemaSearchFilterSelectionPanel
        title="Selected filters"
        selectedFundingStreamFilters={filters}
        handleRemoveFundingStreamFilter={removeFundingStreamFilter}
        handleClearSearch={handleClearFilters}
      />
        <SearchFilterContainer>
          <SearchFilterSection
            title="Funding streams"
            facets={fundingStreamFacets}
            isExpanded={isFundingStreamExpanded}
            toggleExpanded={toggleFundingStreamExpanded}
            addFilter={addFundingStreamFilter}
            removeFilter={removeFundingStreamFilter}
            searchForFilter={filterByFundingStreams}
            selectedFilters={filters}
          />          
        </SearchFilterContainer>
    </SearchSidebar>
  );
};
