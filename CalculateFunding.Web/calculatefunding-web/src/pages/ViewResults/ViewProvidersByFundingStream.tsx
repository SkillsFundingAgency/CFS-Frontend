import { ProviderResultsSearchFilters } from "../../components/Providers/ProviderResultsSearchFilters";
import React, { useEffect, useState, useCallback } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { publishedProviderService } from "../../services/publishedProviderService";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { PublishedProviderSearchResults } from "../../types/PublishedProvider/PublishedProviderSearchResults";
import { PublishedProviderSearchRequest } from "../../types/publishedProviderSearchRequest";
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
import { FacetValue } from "../../types/Facet";
import { SearchMode } from "../../types/SearchMode";
import { Section } from "../../types/Sections";
import { FundingStream } from "../../types/viewFundingTypes";

export interface ViewProvidersByFundingStreamRouteProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
}

export function ViewProvidersByFundingStream({
  match,
}: RouteComponentProps<ViewProvidersByFundingStreamRouteProps>): JSX.Element {
  const initialSearchRequest: PublishedProviderSearchRequest = {
    pageNumber: 1,
    pageSize: 50,
    searchTerm: "",
    errorToggle: "",
    fundingStreamId: match.params.fundingStreamId,
    fundingPeriodId: match.params.fundingPeriodId,
    specificationId: match.params.specificationId,
    hasErrors:undefined,
    providerType:[],
    providerSubType:[],
    localAuthority:[],
    monthYearOpened:[],
    status:[],
    includeFacets: true,
    facetCount: 200,
    searchMode: SearchMode.All,
    searchFields: [],
    indicative:[],
    fundingAction:FundingActionType.Release,
  };
  const initialProviderVersionSearchResults: PublishedProviderSearchResults = {
    facets: [],
    providers: [],
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
    totalResults: 0,
    filteredFundingAmount: 0,
  canPublish: false,
  canApprove: false,
  totalFundingAmount: 0,
  totalProvidersToApprove: 0,
  totalProvidersToPublish: 0,
  currentPage: 0,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchRequest, setSearchRequest] = useState<PublishedProviderSearchRequest>(initialSearchRequest);
  const [providerVersionSearchResults, setProviderVersionSearchResults] =
    useState<PublishedProviderSearchResults>(initialProviderVersionSearchResults);
  const [fundingStreamName, setFundingStreamName] = useState<string>("");

  const [filterProviderType, setFilterProviderType] = useState<FacetValue[]>([]);
  const [resultsProviderType, setResultsProviderType] = useState<FacetValue[]>([]);
  const [filterProviderSubType, setFilterProviderSubType] = useState<FacetValue[]>([]);
  const [resultsProviderSubType, setResultsProviderSubType] = useState<FacetValue[]>([]);
  const [filterLocalAuthority, setFilterLocalAuthority] = useState<FacetValue[]>([]);
  const [resultsLocalAuthority, setResultsLocalAuthority] = useState<FacetValue[]>([]);
  const { errors, addErrorMessage, clearErrorMessages } = useErrors();
  const specificationName = sessionStorage.getItem("specificationNameKey");

  useEffect(() => {
    getProvidersByFundingStream();
    getProviderListPerSpecification();
  }, [searchRequest]);
  
  const getDefaultFundingStatusFilters = (action: FundingActionType) => {
    switch (action) {
      case FundingActionType.Approve: {
        return ["Updated", "Draft"];
      }
      case FundingActionType.Release: {
        return ["Approved"];
      }
      default: {
        return [];
      }
    }
  };
  function getProvidersByFundingStream() {
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
  }

  async function getProviderListPerSpecification() {
    try {
    const { data: result } = await publishedProviderService.searchForPublishedProviderResults(searchRequest);
      setProviderVersionSearchResults(result);

      setResultsProviderType(result.facets[0].facetValues);
      setFilterProviderType(result.facets[0].facetValues);

      setFilterProviderSubType(result.facets[1].facetValues);
      setResultsProviderSubType(result.facets[1].facetValues);

      setFilterLocalAuthority(result.facets[2].facetValues);
      setResultsLocalAuthority(result.facets[2].facetValues);
        setIsLoading(false);
      }
      catch (err: any) {
        addErrorMessage(`A problem occurred while loading Providers ${err}`);

        setIsLoading(false);
      }
  }
  const clearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchProviders").reset();
    setFilterProviderType(resultsProviderType);
    setFilterProviderSubType(resultsProviderSubType);
    setFilterLocalAuthority(resultsLocalAuthority);
    setSearchRequest({...initialSearchRequest});
  },[resultsProviderType, resultsProviderSubType, resultsLocalAuthority, initialSearchRequest]);
 
  const filterBySearchTerm = useCallback((searchField: string, searchTerm: string) => {
    searchText(searchField, searchTerm);
  },[]);

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
  const addProviderTypeFilter = useCallback((providerType: string) => {
    setSearchRequest((prevState) => {
      return {
        ...prevState,
        providerType: [...prevState.providerType.filter((fs) => fs !== providerType), providerType], pageNumber: 1
      };
    });
  }, []);

  const removeProviderTypeFilter = useCallback((providerType: string) => {
    setSearchRequest((prevState) => {
      return { ...prevState, providerType: prevState.providerType.filter((fs) => fs !== providerType) , pageNumber: 1};
    });
  }, []);
  
  const addProviderSubTypeFilter = useCallback((providerSubType: string) => {
    setSearchRequest((prevState) => {
      return {
        ...prevState,
        providerSubType: [...prevState.providerSubType.filter((fs) => fs !== providerSubType), providerSubType], pageNumber: 1
      };
    });
  }, []);
  
  const removeProviderSubTypeFilter = useCallback((providerSubType: string) => {
    setSearchRequest((prevState) => {
      return { ...prevState, providerSubType: prevState.providerSubType.filter((fs) => fs !== providerSubType), pageNumber: 1 };
    });
  }, []);
  const addLocalAuthorityFilter = useCallback((localAuthority: string) => {
    setSearchRequest((prevState) => {
      return {
        ...prevState,
        localAuthority: [...prevState.localAuthority.filter((fs) => fs !== localAuthority), localAuthority], pageNumber: 1
      };
    });
  }, []);
  
  const removeLocalAuthorityFilter = useCallback((localAuthority: string) => {
    setSearchRequest((prevState) => {
      return { ...prevState, localAuthority: prevState.localAuthority.filter((fs) => fs !== localAuthority), pageNumber: 1 };
    });
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

      <Title title={specificationName??""} titleCaption={fundingStreamName +" "+ match.params.fundingPeriodId} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third position-sticky filterScroll">
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
        <div className="govuk-grid-column-two-thirds">
          {!isLoading ? (
            providerVersionSearchResults.providers.map((providerVersionSearchResult) => (
              <div key={`provider-${providerVersionSearchResult.publishedProviderVersionId}`} className="providerResults-details">
                <h3 className="govuk-heading-m">
                  <Link
                    className="govuk-link govuk-link--no-visited-state"
                    to={`/ViewResults/ViewProviderResults/${providerVersionSearchResult.ukprn}/${match.params.fundingStreamId}`}
                  >
                    {providerVersionSearchResult.providerName}
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
                      Local authority: <strong>{providerVersionSearchResult.localAuthority}</strong>
                    </span>
                    <span>
                      Date opened:
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

          <NoData hidden={providerVersionSearchResults.providers.length > 0 || isLoading} />

          <BackToTop id="top" />

          {!isLoading && (
            <TableNavBottom
              currentPage={providerVersionSearchResults?.pagerState?.currentPage}
              lastPage={providerVersionSearchResults?.pagerState?.lastPage}
              totalCount={providerVersionSearchResults?.totalResults}
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
