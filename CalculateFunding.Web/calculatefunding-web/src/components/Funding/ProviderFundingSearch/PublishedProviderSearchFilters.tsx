import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as actions from "../../../actions/FundingSearchSelectionActions";
import { IStoreState } from "../../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../../states/FundingSearchSelectionState";
import { Facet, FacetValue } from "../../../types/Facet";
import {
  PublishedProviderSearchFacet,
  PublishedProviderSearchRequest,
} from "../../../types/publishedProviderSearchRequest";
import {
  FilterAllocationType,
  FilterCheckboxFieldset,
  FilterOptionProps,
  ProviderSearchBox,
  SearchFieldOption,
} from "../../Search";
import { ProviderResultsSearchFilterPanel } from "./PublishedProviderSearchFilterPanel";

export interface PublishedProviderSearchFiltersProps {
  facets: Facet[];
  numberOfProvidersWithErrors: number;
  clearFundingSearchSelection: () => void;
}

export const PublishedProviderSearchFilters = React.memo(function (
  props: PublishedProviderSearchFiltersProps
) {
  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const searchCriteria = state.searchCriteria as PublishedProviderSearchRequest;
  const [selectedTextSearch, setSelectedTextSearch] = useState<SearchFieldOption>({
    searchTerm: undefined,
    searchField: undefined,
    isSelected: true,
  });
  const [statusFacets, setStatusFacets] = useState<FacetValue[]>([]);
  const [providerTypeFacets, setProviderTypeFacets] = useState<FacetValue[]>([]);
  const [resultsProviderType, setResultsProviderType] = useState<FacetValue[]>([]);
  const [providerSubTypeFacets, setProviderSubTypeFacets] = useState<FacetValue[]>([]);
  const [resultsProviderSubType, setResultsProviderSubType] = useState<FacetValue[]>([]);
  const [localAuthorityFacets, setLocalAuthorityFacets] = useState<FacetValue[]>([]);
  const [errorStatusFacets, setErrorStatusFacets] = useState<FacetValue[]>([]);
  const [selectedErrorState, setSelectedErrorState] = useState<string[]>([]);
  const [selectedAllocationType, setSelectedAllocationType] = useState<string[]>([]);
  const [resutErrorStatusFacets, setResultErrorStatusFacets] = useState<FacetValue[]>([]);
  const [resultsLocalAuthorityType, setResultsLocalAuthorityType] = useState<FacetValue[]>([]);
  const [resultsStatusType, setResultsStatusType] = useState<FacetValue[]>([]);
  
  const [resultsOpenDateType, setResultsOpenDateType] = useState<FacetValue[]>([]);
  const [openDateFacets, setOpenDateFacets] = useState<FacetValue[]>([]);
  const [resultsAllocationType, setResultsAllocationType] = useState<FacetValue[]>([]);
  const [allocationTypeFacets, setAllocationTypeFacets] = useState<FacetValue[]>([]);
  const [filterWithErrors, setFilterWithErrors] = useState<boolean>(
    searchCriteria && searchCriteria.hasErrors ? (searchCriteria.hasErrors as boolean) : false
  );
  const [filterWithoutErrors, setFilterWithoutErrors] = useState<boolean>(
    searchCriteria && searchCriteria ? !searchCriteria.hasErrors : false
  );
  const dispatch = useDispatch();

  const sortFacetDateValues = (array: FacetValue[]) =>
    array.sort((a: FacetValue, b: FacetValue) => new Date(a.name).getTime() - new Date(b.name).getTime());

  const updateSearchText = (searchField : string, searchTerm: string | undefined) => {
    if ( searchTerm == undefined || searchTerm.length === 0 || searchTerm.length > 1 ){
    dispatch(
      actions.updateSearchTextFilter({
        searchTerm: searchTerm,
        searchFields: [searchField],
      })
    );
    }
  };

  const debounceUpdateSearchText = useRef(debounce(updateSearchText, 500)).current;

  
  useEffect(() => {
    props.facets.forEach((facet) => {
      switch (facet.name) {
        case PublishedProviderSearchFacet.ProviderType:
          setProviderTypeFacets(facet.facetValues);
          setResultsProviderType(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.ProviderSubType:
          setProviderSubTypeFacets(facet.facetValues);
          setResultsProviderSubType(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.LocalAuthority:
          setLocalAuthorityFacets(facet.facetValues);
          setResultsLocalAuthorityType(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.FundingStatus:
          setStatusFacets(facet.facetValues);
          setResultsStatusType(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.Indicative:
          const allocationOptions: FacetValue[] = facet.facetValues.map((item, index) => ({
            count: item.count,
            name:  item.name == "Hide indicative allocations" ? "Non-Indicative allocations" : "Indicative allocations"
          }));
          setAllocationTypeFacets(allocationOptions);
          setResultsAllocationType(allocationOptions);
          break;
        case PublishedProviderSearchFacet.MonthYearOpened:
          setOpenDateFacets(sortFacetDateValues(facet.facetValues));
          setResultsOpenDateType(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.HasErrors:
          const hasErrorOptions: FacetValue[] = facet.facetValues.map((item, index) => ({
            count: item.count,
            name: item.name == "True" ? "With errors" : "Without errors"
          }));
          setErrorStatusFacets(hasErrorOptions);
          setResultErrorStatusFacets(hasErrorOptions);
          break;
      }
    });
  }, [props.facets]);

  useEffect(() => {
    if (selectedTextSearch === undefined || selectedTextSearch.searchTerm === undefined) return;
    if (
      selectedTextSearch.searchTerm.length > 2 ||
      (selectedTextSearch.searchTerm.length === 0 && searchCriteria.searchTerm.length !== 0)
    ) {
      debounceUpdateSearchText(selectedTextSearch.searchTerm, selectedTextSearch.searchField);
    }
  }, [selectedTextSearch]);

  useEffect(() => {
    setSelectedTextSearch({
      searchTerm: state.searchCriteria?.searchFields[0],
      searchField: state.searchCriteria?.searchTerm,
      isSelected: true,
    });
  }, []);


    const addProviderTypeFilter = useCallback((value: string) => {
    const isSelected = true;
    dispatch(actions.updateProviderTypeFilters({ value, isSelected }));
  }, []);

  const removeProviderTypeFilter = useCallback((value: string) => {
    const isSelected = false;
    dispatch(actions.updateProviderTypeFilters({ value, isSelected }));
  }, []);

  const filterByProviderType = useCallback(
    (searchTerm: string) => {
      if ( searchTerm.length === 0 || searchTerm.length > 1 ){     
        setProviderTypeFacets(resultsProviderType.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    },
    [resultsProviderType]
  );
  const addErrorStateFilter = useCallback((value: string) => {
    const hasErrorsoptions:string[] = selectedErrorState;
    if(value === "With errors"){
      hasErrorsoptions.push("With errors");
    }
    if(value === "Without errors"){
      hasErrorsoptions.push("Without errors");
    }
    const errValue : any = (hasErrorsoptions.length > 1) ? undefined 
    : (hasErrorsoptions[0] === "Without errors") ? false : true;
    dispatch(actions.setHasErrors(errValue));
    setSelectedErrorState(hasErrorsoptions);
  }, []);

  const removeErrorStateFilter = useCallback((value: string) => {
    const hasErrorsoptions:string[] = selectedErrorState;
    if(value === "With errors"){
      hasErrorsoptions.splice(hasErrorsoptions.indexOf('With errors'), 1)
    }
    if(value === "Without errors"){
      hasErrorsoptions.splice(hasErrorsoptions.indexOf('Without errors'), 1)
    }
    const errValue : any = (hasErrorsoptions.length == 0) ? undefined 
    : (hasErrorsoptions[0] === "Without errors") ? false : true;
      dispatch(actions.setHasErrors(errValue));
    setSelectedErrorState(hasErrorsoptions);
  }, []);

  const addProviderSubTypeFilter = useCallback((value: string) => {
    const isSelected = true;
    dispatch(actions.updateProviderSubTypeFilters({ value, isSelected }));
  }, []);

  const removeProviderSubTypeFilter = useCallback((value: string) => {
    const isSelected = false;
    dispatch(actions.updateProviderSubTypeFilters({ value, isSelected }));
  }, []);

  const filterByProviderSubType = useCallback(
    (searchTerm: string) => {
      if ( searchTerm.length === 0 || searchTerm.length > 1 ){     
        setProviderSubTypeFacets(resultsProviderSubType.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    },
    [resultsProviderSubType]
  );

  const addLocalAuthorityFilter = useCallback((value: string) => {
    const isSelected = true;
    dispatch(actions.updateLocalAuthorityFilters({ value, isSelected }));
  }, []);

  const removeLocalAuthorityFilter = useCallback((value: string) => {
    const isSelected = false;
    dispatch(actions.updateLocalAuthorityFilters({ value, isSelected }));
  }, []);

  const filterByLocalAuthorityType = useCallback(
    (searchTerm: string) => {
      if ( searchTerm.length === 0 || searchTerm.length > 1 ){     
        setLocalAuthorityFacets(resultsLocalAuthorityType.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    },
    [resultsLocalAuthorityType]
  );

  const addStatusFilter = useCallback((value: string) => {
    const isSelected = true;
    dispatch(actions.updateStatusFilters({ value, isSelected }));
  }, []);

  const removeStatusFilter = useCallback((value: string) => {
    const isSelected = false;
    dispatch(actions.updateStatusFilters({ value, isSelected }));
  }, []);

  const addOpenDateFilter = useCallback((value: string) => {
    const isSelected = true;
    dispatch(actions.updateMonthYearOpenedFilters({ value, isSelected }));
  }, []);

  const removeOpenDateFilter = useCallback((value: string) => {
    const isSelected = false;
    dispatch(actions.updateMonthYearOpenedFilters({ value, isSelected }));
  }, []);


  const filterByOpenDateType = useCallback(
    (searchTerm: string) => {
      if ( searchTerm.length === 0 || searchTerm.length > 1 ){     
        setOpenDateFacets(resultsOpenDateType.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    },
    [resultsOpenDateType]
  );

  const addAllocationTypeFilter = useCallback((value: string) => {
    const allocationTypeOptions:string[] = selectedAllocationType;
    if(value === "Indicative allocations"){
      allocationTypeOptions.push("Indicative allocations");
    }
    if(value === "Non-Indicative allocations"){
      allocationTypeOptions.push("Non-Indicative allocations");
    }
    const allocationValue : any = (allocationTypeOptions.length > 1) ? "Show all allocation types" 
    : (allocationTypeOptions[0] === "Indicative allocations") ? "Only indicative allocations" : "Hide indicative allocations";
    dispatch(actions.updateAllocationTypeFilters( allocationValue ));
    setSelectedAllocationType(allocationTypeOptions);
  }, []);

  const removeAllocationTypeFilter = useCallback((value: string) => {
    const allocationTypeOptions:string[] = selectedAllocationType;
    if(value === "Indicative allocations"){
      allocationTypeOptions.splice(allocationTypeOptions.indexOf('Indicative allocations'), 1);
    }
    if(value === "Non-Indicative allocations"){
      allocationTypeOptions.splice(allocationTypeOptions.indexOf('Non-Indicative allocations'), 1);
    }
    const allocationValue : any = (allocationTypeOptions.length == 0) ? "Show all allocation types" 
    : (allocationTypeOptions[0] === "Indicative allocations") ? "Only indicative allocations" : "Hide indicative allocations";
    dispatch(actions.updateAllocationTypeFilters( allocationValue ));
    setSelectedAllocationType(allocationTypeOptions);
  }, []);

  const clearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("approvedProviderSearch").reset();
    setProviderTypeFacets(resultsProviderType);
    setProviderSubTypeFacets(resultsProviderSubType);
    setLocalAuthorityFacets(resultsLocalAuthorityType);
    setErrorStatusFacets(resutErrorStatusFacets);
    setSelectedErrorState([]);
    setSelectedAllocationType([]);
    setResultsStatusType(resultsStatusType);
    setAllocationTypeFacets(resultsAllocationType);
    props.clearFundingSearchSelection();
  },[resultsProviderType, resultsProviderSubType, resultsLocalAuthorityType, resutErrorStatusFacets, resultsStatusType, resultsAllocationType]);

  function filterByErrorStatus(value: any) {
    const withErrors = value === "With errors" ? true : filterWithErrors;
    const withoutErrors = value === "without errors" ? false : filterWithoutErrors;
    dispatch(actions.setHasErrors(withErrors === withoutErrors ? undefined : withErrors));
    setFilterWithoutErrors(withoutErrors);
    setFilterWithErrors(withErrors);
  }


  return (
    <>
      <ProviderResultsSearchFilterPanel
        searchCriteria={searchCriteria}
        initialSearch={searchCriteria}
        filterBySearchTerm={updateSearchText}
        addProviderTypeFilter = {addProviderTypeFilter} 
        removeProviderTypeFilter = {removeProviderTypeFilter} 
        addProviderSubTypeFilter = {addProviderSubTypeFilter} 
        removeProviderSubTypeFilter = {removeProviderSubTypeFilter}
        addLocalAuthorityFilter = {addLocalAuthorityFilter} 
        removeLocalAuthorityFilter = {removeLocalAuthorityFilter} 
        addStatusFilter = {addStatusFilter} 
        removeStatusFilter = {removeStatusFilter} 
        addOpenDateFilter = {addOpenDateFilter} 
        removeOpenDateFilter = {removeOpenDateFilter} 
        addAllocationTypeFilter = {addAllocationTypeFilter} 
        removeAllocationTypeFilter = {removeAllocationTypeFilter} 
        filterByProviderType = {filterByProviderType} 
        filterByProviderSubType = {filterByProviderSubType} 
        filterByLocalAuthority = {filterByLocalAuthorityType} 
        filterByOpenDate = {filterByOpenDateType} 
        filterByErrorStatus = {filterByErrorStatus}
        addErrorStateFilter = {addErrorStateFilter}
        removeErrorStateFilter = {removeErrorStateFilter}
        providerTypeFacets = {providerTypeFacets} 
        providerSubTypeFacets = {providerSubTypeFacets} 
        localAuthorityFacets = {localAuthorityFacets} 
        statusFacets = {statusFacets} 
        openDateFacets = {openDateFacets} 
        allocationTypeFacets = {allocationTypeFacets} 
        errorStatusFacets = {errorStatusFacets} 
        clearFilters={clearFilters}
        selectedErrorState = {selectedErrorState}
        selectedAllocationType = {selectedAllocationType}
      />
    </>
  );
});
