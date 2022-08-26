import { ProviderResultsSearchFilters } from "components/Providers/ProviderResultsSearchFilters";
import React, { useEffect, useState, useCallback } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NoData } from "../../components/NoData";
import { TableNavBottom } from "../../components/TableNavBottom";
import { Title } from "../../components/Title";
import { useErrors } from "../../hooks/useErrors";
import { getFundingStreamByIdService } from "../../services/policyService";
import { getProvidersByFundingStreamService } from "../../services/providerService";
import { FacetValue } from "../../types/Facet";
import {
  PagedProviderVersionSearchResults,
  ProviderVersionSearchModel,
} from "../../types/Provider/ProviderVersionSearchResults";
import { SearchMode } from "../../types/SearchMode";
import { Section } from "../../types/Sections";
import { FundingStream } from "../../types/viewFundingTypes";

export interface ViewProvidersByFundingStreamRouteProps {
  fundingStreamId: string;
}

export function ViewProvidersByFundingStream({
  match,
}: RouteComponentProps<ViewProvidersByFundingStreamRouteProps>): JSX.Element {
  const initialSearchRequest: ProviderVersionSearchModel = {
    pageNumber: 1,
    top: 50,
    searchTerm: "",
    errorToggle: false,
    orderBy: [],
    filters: {},
    includeFacets: true,
    facetCount: 200,
    countOnly: false,
    searchMode: SearchMode.All,
    searchFields: [],
    overrideFacetFields: [],
  };
  const initialProviderVersionSearchResults: PagedProviderVersionSearchResults = {
    facets: [],
    items: [],
    endItemNumber: 0,
    pagerState: {
      lastPage: 0,
      previousPage: 0,
      pages: [],
      nextPage: 0,
      displayNumberOfPages: 0,
      currentPage: 0,
    },
    startItemNumber: 0,
    totalCount: 0,
  };
  const enum FilterBy {
    ProviderType = "providerType",
    ProviderSubType = "providerSubType",
    LocalAuthority = "authority",
  }
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchRequest, setSearchRequest] = useState<ProviderVersionSearchModel>(initialSearchRequest);
  const [providerVersionSearchResults, setProviderVersionSearchResults] =
    useState<PagedProviderVersionSearchResults>(initialProviderVersionSearchResults);
  const [fundingStreamName, setFundingStreamName] = useState<string>("");

  const [filterProviderType, setFilterProviderType] = useState<FacetValue[]>([]);
  const [resultsProviderType, setResultsProviderType] = useState<FacetValue[]>([]);
  const [filterProviderSubType, setFilterProviderSubType] = useState<FacetValue[]>([]);
  const [resultsProviderSubType, setResultsProviderSubType] = useState<FacetValue[]>([]);
  const [filterLocalAuthority, setFilterLocalAuthority] = useState<FacetValue[]>([]);
  const [resultsLocalAuthority, setResultsLocalAuthority] = useState<FacetValue[]>([]);
  const { errors, addErrorMessage, clearErrorMessages } = useErrors();
  
  const filterOptions: string[] = [FilterBy.ProviderType, FilterBy.ProviderSubType, FilterBy.LocalAuthority]
  let filters: any = [];
  for(let i=0; i<filterOptions.length; i++){
    filters[filterOptions[i]] =
    searchRequest.filters[filterOptions[i]] != undefined ? searchRequest.filters[filterOptions[i]] : [];
  }

  const getFilterValues = function () {
    const newFiltersValue: any = {};       
    for(let i=0; i<filterOptions.length; i++){
      if(filters[filterOptions[i]].length != 0){
        newFiltersValue[filterOptions[i]] = filters[filterOptions[i]];
      }
    } 
    return newFiltersValue;
  }

  useEffect(() => {
    getProvidersByFundingStream(searchRequest);
  }, [searchRequest]);

  function getProvidersByFundingStream(searchModel: ProviderVersionSearchModel) {
    clearErrorMessages();
    setIsLoading(true);
    getFundingStreamByIdService(match.params.fundingStreamId).then((fundingStreamResponse) => {
      if (fundingStreamResponse.status === 200 || fundingStreamResponse.status === 201) {
        const fundingStream = fundingStreamResponse.data as FundingStream;
        if (fundingStream != null) {
          setFundingStreamName(fundingStream.name);
        }
      }
    });
    getProvidersByFundingStreamService(match.params.fundingStreamId, searchModel)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          const result = response.data as PagedProviderVersionSearchResults;
          setProviderVersionSearchResults(result);

          setResultsProviderType(result.facets[0].facetValues);
          setFilterProviderType(result.facets[0].facetValues);

          setFilterProviderSubType(result.facets[1].facetValues);
          setResultsProviderSubType(result.facets[1].facetValues);

          setFilterLocalAuthority(result.facets[2].facetValues);
          setResultsLocalAuthority(result.facets[2].facetValues);

          setIsLoading(false);
        }
      })
      .catch((err) => {
        addErrorMessage(`A problem occurred while loading funding line structure: ${err}`);
        setIsLoading(false);
      });
  }

  const clearSearchFilterOptions = function() {
    for(let i=0; i<filterOptions.length; i++){
      filters[filterOptions[i]].splice(0,filters[filterOptions[i]].length);  
    }   
  }

  const clearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchProviders").reset();
    clearSearchFilterOptions();
    setFilterProviderType(resultsProviderType);
    setFilterProviderSubType(resultsProviderSubType);
    setFilterLocalAuthority(resultsLocalAuthority);
    setSearchRequest(initialSearchRequest);
  },[resultsProviderType, resultsProviderSubType, resultsLocalAuthority, initialSearchRequest]);
 
  const filterBySearchTerm = useCallback((searchField: string, searchTerm: string) => {
    if(searchField === "providerName"){
      searchField = "name";
    }
    searchText(searchField, searchTerm);
  },[]);

  function filterResults(filterKey: string, filterValue: string, enableFilter: boolean) {   
    let filtersValues: any = {}; 
    if(enableFilter) {     
      if (filters[filterKey].indexOf(filterValue) === -1) {
        filters[filterKey].push(filterValue);       
        filtersValues = getFilterValues();        
        setSearchRequest((prevState) => {
            return { ...prevState, filters: filtersValues, pageNumber: 1 };
        });
      }
    } else {
      const index = filters[filterKey].indexOf(filterValue);         
      if (index !== -1) {
          filters[filterKey].splice(index, 1);               
          filtersValues = getFilterValues(); 
          setSearchRequest((prevState) => {
            return { ...prevState, filters: (filtersValues == undefined || filtersValues.length === 0) ? initialSearchRequest.filters : filtersValues, pageNumber: 1 };
          });        
      } else {
        setSearchRequest((prevState) => {
          return { ...prevState, filters: initialSearchRequest.filters, pageNumber: 1 };
        });
      }
    }    
  }

  function searchText(searchType: string, searchText?: string) {
    const term = searchText;
    if (term !== null && term !== undefined) {
      setSearchRequest((prevState) => {
        return { ...prevState, searchTerm: term.length > 1 ? term : "", searchFields: term.length > 1 ? [searchType] : [], pageNumber: 1 };
      });
    }   
  }

  function pageChange(pageNumber: number) {
    setSearchRequest((prevState) => {
      return { ...prevState, pageNumber: pageNumber };
    });
  }

  const addProviderTypeFilter = useCallback((type: string) => {
    filterResults(FilterBy.ProviderType, type, true);
  }, []);

  const removeProviderTypeFilter = useCallback((type: string) => {
    filterResults(FilterBy.ProviderType, type, false);
  }, []);
  const addProviderSubTypeFilter = useCallback((type: string) => {
    filterResults(FilterBy.ProviderSubType, type, true);
  }, []);

  const removeProviderSubTypeFilter = useCallback((type: string) => {
    filterResults(FilterBy.ProviderSubType, type, false);
  }, []);
  const addLocalAuthorityFilter = useCallback((type: string) => {
    filterResults(FilterBy.LocalAuthority, type, true);
  }, []);

  const removeLocalAuthorityFilter = useCallback((providerType: string) => {
    filterResults(FilterBy.LocalAuthority, providerType, false);
  }, []);
  
  const filterByProviderType = useCallback(
    (searchTerm: string) => {
      if ( searchTerm.length === 0 || searchTerm.length > 1 ){     
        setFilterProviderType(resultsProviderType.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    },
    [resultsProviderType]
  );
  const filterByProviderSubType = useCallback(
    (searchTerm: string) => {
      if (searchTerm.length === 0 ||  searchTerm.length > 1 ){
        setFilterProviderSubType(resultsProviderSubType.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    },
    [resultsProviderSubType]
  );
  const filterByLocalAuthority = useCallback(
    (searchTerm: string) => {
      if (searchTerm.length === 0 || searchTerm.length > 1){
        setFilterLocalAuthority(resultsLocalAuthority.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }
    },
    [resultsLocalAuthority]
  ); 

  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name={"View results"} url={"/results"} />
        <Breadcrumb name={"Funding stream"} url={"/viewresults/viewprovidersfundingstreamselection"} />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />

      <Title title="View provider results" titleCaption={fundingStreamName} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third position-sticky">
        <div className="filterScroll">
          <ProviderResultsSearchFilters
            searchCriteria={searchRequest}
            initialSearch={searchRequest}
            filterBySearchTerm={filterBySearchTerm}
            addProviderTypeFilter = {addProviderTypeFilter} 
            removeProviderTypeFilter = {removeProviderTypeFilter} 
            addProviderSubTypeFilter = {addProviderSubTypeFilter} 
            removeProviderSubTypeFilter = {removeProviderSubTypeFilter}
            addLocalAuthorityFilter = {addLocalAuthorityFilter} 
            removeLocalAuthorityFilter = {removeLocalAuthorityFilter} 
            filterByProviderType = {filterByProviderType} 
            filterByProviderSubType = {filterByProviderSubType} 
            filterByLocalauthority = {filterByLocalAuthority} 
            providerTypeFacets = {filterProviderType} 
            providerSubTypeFacets = {filterProviderSubType} 
            localAuthorityFacets = {filterLocalAuthority} 
            clearFilters={clearFilters}
          />
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          {!isLoading ? (
            providerVersionSearchResults.items.map((providerVersionSearchResult) => (
              <div key={`provider-${providerVersionSearchResult.id}`} className="providerResults-details">
                <h3 className="govuk-heading-m">
                  <Link
                    className="govuk-link govuk-link--no-visited-state"
                    to={`/ViewResults/ViewProviderResults/${providerVersionSearchResult.providerId}/${match.params.fundingStreamId}`}
                  >
                    {providerVersionSearchResult.name}
                  </Link>
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-3govuk-!-margin-top-2">
                  <span>
                    UKPRN:{" "}
                    <strong>
                      {providerVersionSearchResult.ukprn !== ""
                        ? providerVersionSearchResult.ukprn
                        : "No data found"}
                    </strong>
                  </span>
                  <span>
                    UPIN:{" "}
                    <strong>
                      {providerVersionSearchResult.upin !== ""
                        ? providerVersionSearchResult.upin
                        : "No data found"}
                    </strong>
                  </span>
                  <span>
                    URN:{" "}
                    <strong>
                      {providerVersionSearchResult.urn !== ""
                        ? providerVersionSearchResult.urn
                        : "No data found"}
                    </strong>
                  </span>
                </p>

                <details
                  className="govuk-details govuk-!-margin-top-2 govuk-!-margin-bottom-2"
                  data-module="govuk-details"
                >
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">Provider details</span>
                  </summary>
                  <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-2">
                    Establishment number: <strong>4249</strong>
                  </p>
                  <p className="govuk-body-s govuk-!-margin-bottom-2">
                    Provider type: <strong>{providerVersionSearchResult.providerType}</strong>
                  </p>
                  <p className="govuk-body-s govuk-!-margin-bottom-2">
                    Provider subtype: <strong>{providerVersionSearchResult.providerSubType}</strong>
                  </p>
                  <p className="govuk-body-s govuk-!-margin-bottom-2">
                    <span>
                      Local authority: <strong>{providerVersionSearchResult.authority}</strong>
                    </span>
                    <span>
                      Date opened:{" "}
                      <strong>
                        {providerVersionSearchResult.dateOpened ? (
                          <DateTimeFormatter date={providerVersionSearchResult.dateOpened} />
                        ) : (
                          "Unknown"
                        )}
                      </strong>
                    </span>
                  </p>
                </details>
                <hr className="govuk-section-break govuk-!-margin-top-0 govuk-section-break--l govuk-section-break--visible" />
              </div>
            ))
          ) : (
            <LoadingStatus title={"Loading providers"} />
          )}

          <NoData hidden={providerVersionSearchResults.items.length > 0 || isLoading} />

          <BackToTop id="top" />

          {!isLoading && (
            <TableNavBottom
              currentPage={providerVersionSearchResults?.pagerState?.currentPage}
              lastPage={providerVersionSearchResults?.pagerState?.lastPage}
              totalCount={providerVersionSearchResults?.totalCount}
              startItemNumber={providerVersionSearchResults?.startItemNumber}
              endItemNumber={providerVersionSearchResults?.endItemNumber}
              onPageChange={pageChange}
            />
          )}
        </div>
      </div>
    </Main>
  );
}
