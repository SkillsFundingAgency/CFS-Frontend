import "../styles/Accordion.scss";

import React, { useRef } from "react";
import { useState } from "react";
import { TextLink } from "./TextLink";
import { debounce } from "lodash";

const enum SearchOptions {
  ProviderName = "providerName",
  UKPRN = "ukprn",
  UPIN= "upin",
  URN = "urn",
}
export const TextSearchPanel = ({
    title = "Search",
    handleTextSearchChange,
    clearSearchTitle = "Clear search",
  }: {
    title?: string;
    clearSearchTitle?: string;
    handleTextSearchChange: (searchField: string, searchTerm: string)  => void;
  }) => {
    const [searchFieldSet, setSearchFieldSet] = useState<string[]>(["", "", "", ""]);
    const handleClearSearch = (e: any) => {
      e.preventDefault();
      handleTextSearchChange("", "");
      setSearchFieldSet(["", "", "", ""]);
    };
    
    const debounceUpdateSearchText = useRef(debounce(handleTextSearchChange, 500)).current;
    const handleTextChange = (searchField: string, searchTerm: string) => {
      var n = 0;
      switch(searchField){
        case SearchOptions.ProviderName:
          n = 0; break;
        case SearchOptions.UKPRN:
          n = 1; break;
        case SearchOptions.UPIN:
          n = 2; break;
        case SearchOptions.URN:
          n = 3; break;
      }
      setSearchFieldSet(p=>{return {...p,[n]: searchTerm}});
      debounceUpdateSearchText(searchField, searchTerm)};
  
    return (
      <div className="govuk-form-group filterbyContainer">
        <fieldset className="govuk-fieldset">
          <div className="govuk-form-group filterSearch">
            <label
              className="govuk-heading-s govuk-!-display-inline-block govuk-!-margin-top-2 govuk-!-margin-bottom-2"
              htmlFor="mainContentSearch"
            >
              {title}
            </label>
  
            <TextLink
              handleOnClick={handleClearSearch}
              additionalCss="govuk-!-margin-top-2 govuk-!-margin-bottom-2 right-align"
            >
              {clearSearchTitle}
            </TextLink>
            <span id="how-contacted-conditional-hint" className="govuk-hint sidebar-search-span govuk-!-margin-left-0 govuk-!-margin-top-0">
                Select one option
            </span>
            <CollapsibleSearchBox searchfieldset={searchFieldSet} callback={handleTextChange}/>
          </div>
        </fieldset>
      </div>
    );
  };
  

export interface SearchSidebarProps {
    enableStickyScroll?: boolean;
    children?: any;
    formId?: string;
  }
  
  export interface SearchSidebarWithTextSearchProps extends SearchSidebarProps {
    updateSearch: (searchField: string, searchTerm: string)  => void;
  }
  
  const isTextSearchEnabled = (arg: any): arg is SearchSidebarWithTextSearchProps => {
    return !!(arg as SearchSidebarWithTextSearchProps)?.updateSearch;
  }; 
  
  export const CollapsibleSearchSideBar = (props: SearchSidebarProps | SearchSidebarWithTextSearchProps ) => {
    if (isTextSearchEnabled(props)){
      return (
        <aside className="govuk-form-group filterSearch search-filters">
          <div className={`${props.enableStickyScroll ? "search-filters--filterScroll" : ""}`}>
            <form id={props.formId}>
              <TextSearchPanel handleTextSearchChange={props.updateSearch}  />
              {!!props.children && <div className="govuk-form-group filterbyContainer">{props.children}</div>}
            </form>
          </div>
        </aside>
      );
    } else {
      return (
        <aside className="govuk-form-group filterSearch search-filters">
          <div className={`${props.enableStickyScroll ? "search-filters--filterScroll" : ""}`}>
            <form id={props.formId}>
              {!!props.children && <div className="govuk-form-group filterbyContainer">{props.children}</div>}
            </form>
          </div>
        </aside>
      );
    }
  };

  
export function CollapsibleSearchBox(props: {
    searchfieldset: string[];
    callback: (searchField: string, searchTerm: string) => void;
  }) {
    const callback = props.callback;
    const searchFieldSet = props.searchfieldset;
    const [expandedProvider, setExpandedProvider] = useState(true);
    const [expandedUKPRN, setExpandedUKPRN] = useState(false);
    const [expandedUPIN, setExpandedUPIN] = useState(false);
    const [expandedURN, setExpandedURN] = useState(false);
    function expandSearchProvider() {
      setExpandedUKPRN(false);
      setExpandedUPIN(false);
      setExpandedProvider(true);
      setExpandedURN(false);
    }
    function expandSearchUKPRN() {
      setExpandedUKPRN(true);
      setExpandedUPIN(false);
      setExpandedProvider(false);
      setExpandedURN(false);
    }
    function expandSearchUPIN() {
      setExpandedUKPRN(false);
      setExpandedUPIN(true);
      setExpandedProvider(false);
      setExpandedURN(false);
    }
    function expandSearchURN() {
      setExpandedUKPRN(false);
      setExpandedUPIN(false);
      setExpandedProvider(false);
      setExpandedURN(true);
    }
  
    return (
      <div
        className="govuk-radios govuk-radios--small govuk-radios--conditional sidebar-overflow-visible"
        data-module="govuk-radios"
      >
        <div className="govuk-radios__item">
          <input
            onChange={expandSearchProvider}
            className="govuk-radios__input"
            id="search-options-providers"
            name="search-options"
            type="radio"
            checked={expandedProvider}
            aria-controls="conditional-search-options-provider"
            aria-expanded="false"
          ></input>
          <label
            onClick={expandSearchProvider}
            className="govuk-label govuk-radios__label"
            htmlFor="search-options-providers"
          >
            Provider name
          </label>
        </div>
        {expandedProvider && (
          <div className={"govuk-radios__conditional"}>
            <div className="govuk-form-group">
              <input
                className="govuk-input sidebar-search-input"
                id={SearchOptions.ProviderName}
                data-testid={SearchOptions.ProviderName}
                type="text"
                value={searchFieldSet[0]}
                onChange={(e) => {callback(SearchOptions.ProviderName, e.target.value)}}
              />
            </div>
          </div>
        )}
        <div className="govuk-radios__item">
          <input
            onChange={expandSearchUKPRN}
            className="govuk-radios__input"
            id="search-options-UKPRN"
            name="search-options"
            type="radio"
            checked={expandedUKPRN}
            aria-controls="conditional-search-options-UKPRN"
            aria-expanded="true"
          ></input>
          <label
            onClick={expandSearchUKPRN}
            className="govuk-label govuk-radios__label"
            htmlFor="search-options-UKPRN"
          >
            UKPRN
          </label>
        </div>
        {expandedUKPRN && (
          <div className={"govuk-radios__conditional"}>
            <div className="govuk-form-group">
              <input
                className="govuk-input sidebar-search-input"
                id={SearchOptions.UKPRN}
                data-testid={SearchOptions.UKPRN}
                type="number"
                value={searchFieldSet[1]}
                onChange={(e) => {callback(SearchOptions.UKPRN, e.target.value)}}
              />
            </div>
          </div>
        )}
        <div className="govuk-radios__item">
          <input
            onChange={expandSearchUPIN}
            className="govuk-radios__input"
            id="search-options-UPIN"
            name="search-options"
            type="radio"
            checked={expandedUPIN}
            aria-controls="conditional-search-options-UPIN"
            aria-expanded="false"
          ></input>
          <label
            onClick={expandSearchUPIN}
            className="govuk-label govuk-radios__label"
            htmlFor="search-options-UPIN"
          >
            UPIN
          </label>
        </div>
        {expandedUPIN && (
          <div className={"govuk-radios__conditional"}>
            <div className="govuk-form-group">
              <input
                className="govuk-input sidebar-search-input"
                id={SearchOptions.UPIN}
                data-testid={SearchOptions.UPIN}
                type="number"
                value={searchFieldSet[2]}
                onChange={(e) => callback(SearchOptions.UPIN, e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="govuk-radios__item">
          <input
            onChange={expandSearchURN}
            className="govuk-radios__input"
            id="search-options-URN"
            name="search-options"
            type="radio"
            checked={expandedURN}
            aria-controls="conditional-search-options-URN"
            aria-expanded="false"
          ></input>
          <label
            onClick={expandSearchURN}
            className="govuk-label govuk-radios__label"
            htmlFor="search-options-URN"
          >
            URN
          </label>
        </div>
        {expandedURN && (
          <div className={"govuk-radios__conditional"}>
            <div className="govuk-form-group">
              <input
                className="govuk-input sidebar-search-input"
                id={SearchOptions.URN}
                data-testid={SearchOptions.URN}
                type="number"
                value={searchFieldSet[3]}
                onChange={(e) => callback(SearchOptions.URN, e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }