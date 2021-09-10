import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as actions from "../../actions/FundingSearchSelectionActions";
import { IStoreState } from "../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { Facet, FacetValue } from "../../types/Facet";
import {
  PublishedProviderSearchFacet,
  PublishedProviderSearchRequest,
} from "../../types/publishedProviderSearchRequest";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ProviderSearchBox, SearchFieldOption } from "../ProviderSearchBox";
import { FilterAllocationType } from "../Search/FilterAllocationType";
import { FilterCheckboxFieldset } from "../Search/FilterCheckboxFieldset";
import { FilterOptionProps } from "../Search/FilterCheckboxOption";

export interface IPublishedProviderSearchFiltersProps {
  facets: Facet[];
  numberOfProvidersWithErrors: number;
  clearFundingSearchSelection: () => void;
}

export function PublishedProviderSearchFilters(props: IPublishedProviderSearchFiltersProps) {
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
  const [providerSubTypeFacets, setProviderSubTypeFacets] = useState<FacetValue[]>([]);
  const [localAuthorityFacets, setLocalAuthorityFacets] = useState<FacetValue[]>([]);
  const [openDateFacets, setOpenDateFacets] = useState<FacetValue[]>([]);
  const [filterWithErrors, setFilterWithErrors] = useState<boolean>(
    searchCriteria && searchCriteria.hasErrors ? (searchCriteria.hasErrors as boolean) : false
  );
  const [filterWithoutErrors, setFilterWithoutErrors] = useState<boolean>(
    searchCriteria && searchCriteria ? !searchCriteria.hasErrors : false
  );
  const dispatch = useDispatch();

  const sortFacetDateValues = (array: FacetValue[]) =>
    array.sort((a: FacetValue, b: FacetValue) => new Date(a.name).getTime() - new Date(b.name).getTime());

  useEffect(() => {
    props.facets.forEach((facet) => {
      switch (facet.name) {
        case PublishedProviderSearchFacet.ProviderType:
          setProviderTypeFacets(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.ProviderSubType:
          setProviderSubTypeFacets(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.LocalAuthority:
          setLocalAuthorityFacets(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.FundingStatus:
          setStatusFacets(facet.facetValues);
          break;
        case PublishedProviderSearchFacet.MonthYearOpened:
          setOpenDateFacets(sortFacetDateValues(facet.facetValues));
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
      dispatch(
        actions.updateSearchTextFilter({
          searchTerm: selectedTextSearch.searchTerm,
          searchFields: [selectedTextSearch.searchField],
        })
      );
    }
  }, [selectedTextSearch]);

  useEffect(() => {
    setSelectedTextSearch({
      searchTerm: state.searchCriteria?.searchTerm,
      searchField: state.searchCriteria?.searchFields[0],
      isSelected: true,
    });
  }, []);

  function changeProviderTypeFilter(value: string, isSelected: boolean) {
    dispatch(actions.updateProviderTypeFilters({ value, isSelected }));
  }

  function changeProviderSubTypeFilter(value: string, isSelected: boolean) {
    dispatch(actions.updateProviderSubTypeFilters({ value, isSelected }));
  }

  function changeStatusFilter(value: string, isSelected: boolean) {
    dispatch(actions.updateStatusFilters({ value, isSelected }));
  }

  function changeLocalAuthorityFilter(value: string, isSelected: boolean) {
    dispatch(actions.updateLocalAuthorityFilters({ value, isSelected }));
  }

  function setAllocationType(value: string) {
    dispatch(actions.updateAllocationTypeFilters(value));
  }

  function changeErrorFilter(value: string, isSelected: boolean) {
    const withErrors = value === "with-errors" ? isSelected : filterWithErrors;
    const withoutErrors = value === "without-errors" ? isSelected : filterWithoutErrors;
    dispatch(actions.setHasErrors(withErrors === withoutErrors ? undefined : withErrors));
    setFilterWithoutErrors(withoutErrors);
    setFilterWithErrors(withErrors);
  }

  function changeMonthYearOpenedFilter(value: string, isSelected: boolean) {
    dispatch(actions.updateMonthYearOpenedFilters({ value, isSelected }));
  }

  const providerTypeOptions: FilterOptionProps[] = providerTypeFacets.map((item, index) => ({
    index,
    value: item.name,
    labelText: `${item.name} (${item.count})`,
    isSelected: searchCriteria.providerType.includes(item.name),
  }));
  const providerSubTypeOptions: FilterOptionProps[] = providerSubTypeFacets.map((item, index) => ({
    index,
    value: item.name,
    labelText: `${item.name} (${item.count})`,
    isSelected: searchCriteria.providerSubType.includes(item.name),
  }));
  const statusOptions: FilterOptionProps[] = statusFacets.map((item, index) => ({
    index,
    value: item.name,
    labelText: `${item.name} (${item.count})`,
    isSelected: searchCriteria.status.includes(item.name),
  }));
  const localAuthorityOptions: FilterOptionProps[] = localAuthorityFacets.map((item, index) => ({
    index,
    value: item.name,
    labelText: `${item.name} (${item.count})`,
    isSelected: searchCriteria.localAuthority.includes(item.name),
  }));
  const openDateOptions: FilterOptionProps[] = openDateFacets.map((item, index) => ({
    index,
    value: item.name,
    labelText: `${item.name} (${item.count})`,
    isSelected: searchCriteria.monthYearOpened?.includes(item.name),
  }));
  const hasErrorOptions: FilterOptionProps[] = [
    {
      index: 1,
      value: "with-errors",
      labelText: "With errors",
      isSelected: filterWithErrors,
    },
    {
      index: 2,
      value: "without-errors",
      labelText: "Without errors",
      isSelected: filterWithoutErrors,
    },
  ];

  return (
    <>
      <CollapsiblePanel title={"Search"} expanded={true}>
        <fieldset className="govuk-fieldset" aria-describedby="how-contacted-conditional-hint">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m filterbyHeading">
            <h4 className="govuk-heading-s">Search</h4>
          </legend>
          <span id="how-contacted-conditional-hint" className="govuk-hint sidebar-search-span">
            Select one option.
          </span>
          <ProviderSearchBox searchField={selectedTextSearch} callback={setSelectedTextSearch} />
        </fieldset>
      </CollapsiblePanel>
      <CollapsiblePanel title={"Filter by provider type"} expanded={providerTypeFacets.length > 0}>
        <FilterCheckboxFieldset
          fieldId="providerType"
          onChangeHandler={changeProviderTypeFilter}
          options={providerTypeOptions}
        />
      </CollapsiblePanel>
      <CollapsiblePanel title={"Filter by provider sub type"} expanded={providerSubTypeFacets.length > 0}>
        <FilterCheckboxFieldset
          fieldId="providerSubType"
          onChangeHandler={changeProviderSubTypeFilter}
          options={providerSubTypeOptions}
        />
      </CollapsiblePanel>
      <CollapsiblePanel title={"Filter by status"} expanded={statusFacets.length > 0}>
        <FilterCheckboxFieldset
          fieldId="status"
          onChangeHandler={changeStatusFilter}
          options={statusOptions}
        />
      </CollapsiblePanel>
      <CollapsiblePanel title={"Filter by local authority"} expanded={localAuthorityFacets.length > 0}>
        <FilterCheckboxFieldset
          fieldId="status"
          onChangeHandler={changeLocalAuthorityFilter}
          options={localAuthorityOptions}
        />
      </CollapsiblePanel>
      <CollapsiblePanel title={"Filter by error status"} expanded={props.numberOfProvidersWithErrors > 0}>
        <FilterCheckboxFieldset
          fieldId="has-errors"
          onChangeHandler={changeErrorFilter}
          options={hasErrorOptions}
        />
      </CollapsiblePanel>
      <CollapsiblePanel title={"Filter by allocation type"} expanded={true}>
        <FilterAllocationType callback={setAllocationType} />
      </CollapsiblePanel>
      <CollapsiblePanel title={"Filter by open date"} expanded={openDateFacets.length > 0}>
        <FilterCheckboxFieldset
          fieldId="openDate"
          onChangeHandler={changeMonthYearOpenedFilter}
          options={openDateOptions}
        />
      </CollapsiblePanel>
      <button
        id="clearFilters"
        className="govuk-button right-align"
        onClick={props.clearFundingSearchSelection}
      >
        Clear filters
      </button>
    </>
  );
}
