import { CollapsibleSearchSideBar } from "components/CollapsibleSearchSideBar";
import { ApproveProvidersSearchFilterSelectionPanel, SearchFilterContainer, SearchFilterSection, SearchFiltersOuterContainer } from "components/SearchFilterContainer";
import { useToggle } from "hooks/useToggle";
import React, { useCallback, useMemo } from "react";
import { FacetValue } from "types/Facet";
import { PublishedProviderSearchRequest } from "types/publishedProviderSearchRequest";

export const ProviderResultsSearchFilterPanel = ({
  searchCriteria,
  addProviderTypeFilter,
  removeProviderTypeFilter,
  addProviderSubTypeFilter,
  removeProviderSubTypeFilter,
  addLocalAuthorityFilter,
  removeLocalAuthorityFilter,
  addStatusFilter,
  removeStatusFilter,
  addOpenDateFilter,
  removeOpenDateFilter,
  addAllocationTypeFilter,
  removeAllocationTypeFilter,
  addErrorStateFilter,
  removeErrorStateFilter,
  filterBySearchTerm,
  filterByProviderType,
  filterByProviderSubType,
  filterByLocalAuthority,
  filterByErrorStatus,
  filterByOpenDate,
  providerTypeFacets,
  providerSubTypeFacets,
  localAuthorityFacets,
  statusFacets,
  errorStatusFacets,
  openDateFacets,
  allocationTypeFacets,
  clearFilters,
  selectedErrorState,
  selectedAllocationType,
}: {
  searchCriteria: PublishedProviderSearchRequest;
  initialSearch: PublishedProviderSearchRequest;
  addProviderTypeFilter: (filter: string) => void;
  removeProviderTypeFilter: (filter: string) => void;
  addProviderSubTypeFilter: (filter: string) => void;
  removeProviderSubTypeFilter: (filter: string) => void;
  addLocalAuthorityFilter: (filter: string) => void;
  removeLocalAuthorityFilter: (filter: string) => void;
  addStatusFilter: (filter: string) => void;
  removeStatusFilter: (filter: string) => void;
  addOpenDateFilter: (filter: string) => void;
  removeOpenDateFilter: (filter: string) => void;
  addAllocationTypeFilter: (filter: string) => void;
  removeAllocationTypeFilter: (filter: string) => void;
  addErrorStateFilter: (filter: string) => void;
  removeErrorStateFilter: (filter: string) => void;
  filterBySearchTerm?: (searchField: string, searchTerm: string) => void;
  filterByProviderType: (filter: string) => void;
  filterByProviderSubType: (filter: string) => void;
  filterByErrorStatus: (filter: any) => void;
  filterByLocalAuthority: (filter: string) => void;
  filterByOpenDate: (filter: string) => void;
  providerTypeFacets: FacetValue[];
  providerSubTypeFacets: FacetValue[];
  localAuthorityFacets: FacetValue[];
  statusFacets: FacetValue[];
  errorStatusFacets: FacetValue[];
  openDateFacets: FacetValue[];
  allocationTypeFacets: FacetValue[];
  clearFilters: () => void;
  selectedErrorState: string[];
  selectedAllocationType: string[];
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
  const {
    isExpanded: isStatusExpanded,
    toggleExpanded: toggleStatusExpanded,
    setExpanded: setStatusExpanded,
  } = useToggle();
  const {
    isExpanded: isErrorsExpanded,
    toggleExpanded: toggleErrorsExpanded,
    setExpanded: setErrorsExpanded,
  } = useToggle();

  const {
    isExpanded: isOpenDateExpanded,
    toggleExpanded: toggleOpenDateExpanded,
    setExpanded: setOpenDateExpanded,
  } = useToggle();
  const {
    isExpanded: isAllocationTypeExpanded,
    toggleExpanded: toggleAllocationTypeExpanded,
    setExpanded: setAllocationTypeExpanded,
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
    setLocalAuthorityExpanded(true);
    setStatusExpanded(true);
    setErrorsExpanded(true);
    setOpenDateExpanded(true);
    setAllocationTypeExpanded(true);
  }, []);
  const collapseAllFilters = useCallback(() => {
    setProviderTypeExpanded(false);
    setProviderSubTypeExpanded(false);
    setLocalAuthorityExpanded(false);
    setStatusExpanded(false);
    setErrorsExpanded(false);
    setOpenDateExpanded(false);
    setAllocationTypeExpanded(false);
  }, []);

  const providerTypes: string[] =
  searchCriteria?.providerType != undefined ? searchCriteria.providerType: [];

  const providerSubTypes: string[] =
  searchCriteria?.providerSubType != undefined ? searchCriteria.providerSubType : [];

  const localAuthority: string[] =
  searchCriteria?.localAuthority != undefined ? searchCriteria.localAuthority : [];

  const status: string[] =
  searchCriteria?.status != undefined ? searchCriteria.status : [];

  const openDate: string[] =
  searchCriteria?.monthYearOpened != undefined ? searchCriteria.monthYearOpened : [];

  return (
    <CollapsibleSearchSideBar formId={"approvedProviderSearch"} updateSearch={filterBySearchTerm} >
      <ApproveProvidersSearchFilterSelectionPanel
        title="Selected filters"
        selectedProviderTypeFilters={providerTypes}
        selectedProviderSubTypeFilters={providerSubTypes}
        selectedLocalAuthorityFilters={localAuthority}
        selectedStatusFilters={status}
        selectedErrorStateFilters={selectedErrorState}
        selectedAllocationFilters={selectedAllocationType}
        selectedDatefilters={openDate}
        handleRemoveProviderTypeFilter={removeProviderTypeFilter}
        handleRemoveProviderSubTypeFilter={removeProviderSubTypeFilter}
        handleRemoveLocalAuthorityFilter={removeLocalAuthorityFilter}
        handleRemoveStatusFilter={removeStatusFilter}
        handleRemoveErrorStateFilter={removeErrorStateFilter}
        handleRemoveAllocationFilter={removeAllocationTypeFilter}
        handleRemoveDatefilter= {removeOpenDateFilter}
        handleClearSearch={clearFilters}
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
            title="Status"
            facets={statusFacets}
            isExpanded={isStatusExpanded}
            toggleExpanded={toggleStatusExpanded}
            addFilter={addStatusFilter}
            removeFilter={removeStatusFilter}
            selectedFilters={status} 
            />
          <SearchFilterSection
            title="Local authority"
            facets={localAuthorityFacets}
            isExpanded={isLocalAuthorityExpanded}
            toggleExpanded={toggleLocalAuthorityExpanded}
            addFilter={addLocalAuthorityFilter}
            removeFilter={removeLocalAuthorityFilter}
            searchForFilter={filterByLocalAuthority}
            selectedFilters={localAuthority}
          />
          <SearchFilterSection
            title="Error status"
            facets={errorStatusFacets}
            selectedFilters={selectedErrorState} 
            isExpanded={isErrorsExpanded} 
            toggleExpanded={toggleErrorsExpanded}        
            addFilter={addErrorStateFilter}
            removeFilter={removeErrorStateFilter}
            />

          <SearchFilterSection
            title="Allocation type"
            facets={allocationTypeFacets}
            isExpanded={isAllocationTypeExpanded}
            toggleExpanded={toggleAllocationTypeExpanded}       
            addFilter={addAllocationTypeFilter} 
            removeFilter={removeAllocationTypeFilter} 
            selectedFilters={selectedAllocationType}         
          />
          <SearchFilterSection
            title="Open date"
            facets={openDateFacets}
            isExpanded={isOpenDateExpanded}
            toggleExpanded={toggleOpenDateExpanded}
            addFilter={addOpenDateFilter}
            removeFilter={removeOpenDateFilter}
            searchForFilter={filterByOpenDate}
            selectedFilters={openDate}
          />
        </SearchFilterContainer>
      </SearchFiltersOuterContainer>
    </CollapsibleSearchSideBar>
  );
};
