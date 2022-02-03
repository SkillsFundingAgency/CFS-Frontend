import * as React from "react";

import { ConditionalTextSearchInput } from "./ConditionalTextSearchInput";
import { SearchOptionLabel } from "./SearchOptionLabel";

export interface SearchFieldOption {
  searchField?: string;
  searchTerm?: string;
  isSelected: boolean;
}

export interface ProviderSearchBoxProps {
  searchField: SearchFieldOption;
  callback: (value: SearchFieldOption) => void;
}

export function ProviderSearchBox({ searchField, callback }: ProviderSearchBoxProps) {
  const selectedField = searchField?.searchField;

  function onSearchTextChange(fieldName: string, searchText: string) {
    callback({ searchField: fieldName, searchTerm: searchText, isSelected: true } as SearchFieldOption);
  }

  function onFocus(newSelection: string) {
    if (selectedField !== newSelection) {
      callback({ searchField: newSelection, searchTerm: "", isSelected: true } as SearchFieldOption);
    }
  }

  const searchTerm = searchField.searchTerm ? searchField.searchTerm : "";
  const isProviderNameSelected = selectedField === "providerName";
  const isUkprnSelected = selectedField === "ukprn";
  const isUpinSelected = selectedField === "upin";
  const isUrnSelected = selectedField === "urn";
  const providerName = isProviderNameSelected ? searchTerm : "";
  const ukprn = isUkprnSelected ? searchTerm : "";
  const upin = isUpinSelected ? searchTerm : "";
  const urn = isUrnSelected ? searchTerm : "";

  return (
    <div
      className="govuk-radios govuk-radios--small govuk-radios--conditional sidebar-overflow-visible"
      data-module="govuk-radios"
    >
      <SearchOptionLabel
        fieldName="providerName"
        labelText="Provider name"
        handleFocus={onFocus}
        isSelected={isProviderNameSelected}
      />
      {isProviderNameSelected && (
        <ConditionalTextSearchInput
          fieldName="providerName"
          labelText="Provider name"
          value={providerName}
          handleChange={onSearchTextChange}
        />
      )}

      <SearchOptionLabel
        fieldName="ukprn"
        labelText="UKPRN"
        handleFocus={onFocus}
        isSelected={isUkprnSelected}
      />
      {isUkprnSelected && (
        <ConditionalTextSearchInput
          fieldName="ukprn"
          labelText="UKPRN"
          value={ukprn}
          handleChange={onSearchTextChange}
        />
      )}

      <SearchOptionLabel
        fieldName="upin"
        labelText="UPIN"
        handleFocus={onFocus}
        isSelected={isUpinSelected}
      />
      {isUpinSelected && (
        <ConditionalTextSearchInput
          fieldName="upin"
          labelText="UPIN"
          value={upin}
          handleChange={onSearchTextChange}
        />
      )}

      <SearchOptionLabel fieldName="urn" labelText="URN" handleFocus={onFocus} isSelected={isUrnSelected} />
      {isUrnSelected && (
        <ConditionalTextSearchInput
          fieldName="urn"
          labelText="URN"
          value={urn}
          handleChange={onSearchTextChange}
        />
      )}
    </div>
  );
}
