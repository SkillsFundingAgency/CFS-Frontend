import * as React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";

import { AccordionPanel } from "../components/AccordionPanel";
import { Breadcrumb, Breadcrumbs } from "../components/Breadcrumbs";
import JobNotificationSection from "../components/Jobs/JobNotificationSection";
import { LoadingFieldStatus } from "../components/LoadingFieldStatus";
import { LoadingStatus } from "../components/LoadingStatus";
import { Main } from "../components/Main";
import { MultipleErrorSummary } from "../components/MultipleErrorSummary";
import { TableNavBottom } from "../components/TableNavBottom";
import { TagTypes } from "../components/Tag";
import { TextLink } from "../components/TextLink";
import { ViewCalculationResultsSearchFilters } from "../components/Calculations/ViewCalculationResultsSearchFilter"
import { extractJobsFromNotifications, isActiveJob } from "../helpers/jobDetailsHelper";
import { useCalculation } from "../hooks/Calculations/useCalculation";
import { useCalculationProviderSearch } from "../hooks/Calculations/useCalculationProviderSearch";
import { useJobSubscription } from "../hooks/Jobs/useJobSubscription";
import { useErrors } from "../hooks/useErrors";
import { useSpecificationSummary } from "../hooks/useSpecificationSummary";
import { CalculationProviderSearchResponse } from "../types/CalculationProviderResult";
import { CalculationProviderSearchRequest } from "../types/calculationProviderSearchRequest";
import { FacetValue } from "../types/Facet";
import { JobDetails } from "../types/jobDetails";
import { JobType } from "../types/jobType";
import { PublishedProviderSearchFacet } from "../types/publishedProviderSearchRequest";
import { SearchMode } from "../types/SearchMode";
import { Section } from "../types/Sections";
import { FundingStream } from "../types/viewFundingTypes";

export interface ViewCalculationResultsRoute {
  calculationId: string;
}

export function ViewCalculationResults({ match }: RouteComponentProps<ViewCalculationResultsRoute>) {
  const { calculationId } = match.params;
  document.title = "Calculation Results - Calculate funding";
  const [autoExpand, setAutoExpand] = useState(false);
  const runningJobs = useRef<JobDetails[]>([]);
  const [providerTypeFacets, setProviderTypeFacets] = useState<FacetValue[]>([]);
  const [providerSubTypeFacets, setProviderSubTypeFacets] = useState<FacetValue[]>([]);
  const [localAuthorityFacets, setLocalAuthorityFacets] = useState<FacetValue[]>([]);
  const [resultStatusFacets, setResultStatusFacets] = useState<FacetValue[]>([ {
    name: "With exceptions",
    count: 0
  },
  {
    name: "Without exceptions",
    count: 0
  }]);

  const [initialProviderTypeFacets, setInitialProviderTypeFacets] = useState<FacetValue[]>([]);
  const [initialProviderSubTypeFacets, setInitialProviderSubTypeFacets] = useState<FacetValue[]>([]);
  const [initialLocalAuthorityFacets, setInitialLocalAuthorityFacets] = useState<FacetValue[]>([]);

  const { errors, addErrorMessage, addError } = useErrors();
  const { calculation, specificationId } = useCalculation(calculationId, (err) =>
    addErrorMessage(err.message, "Error while loading calculation")
  );
  const { specification } = useSpecificationSummary(specificationId, (err) =>
    addErrorMessage(err.message, "Error while loading specification")
  );

  const jobsToWatch = [
    JobType.CreateInstructAllocationJob,
    JobType.GenerateGraphAndInstructAllocationJob,
    JobType.CreateInstructGenerateAggregationsAllocationJob,
    JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob,
  ];
  const {
    addSub,
    removeAllSubs,
    results: jobNotifications,
  } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });

  const [calculationProviderSearchRequest, setCalculationProviderSearchRequest] =
    useState<CalculationProviderSearchRequest>({
      calculationValueType: undefined,
      errorToggle: "",
      facetCount: 0,
      includeFacets: true,
      localAuthority: [],
      pageNumber: 1,
      pageSize: 50,
      providerSubType: [],
      providerType: [],
      resultsStatus: [],
      searchMode: SearchMode.All,
      searchTerm: "",
      calculationId: "",
      searchFields: [],
    });
  const fundingStream: FundingStream = {
    name: "",
    id: "",
  };

  const {
    calculationProvidersData: providers,
    isLoadingCalculationProviders,
    refetchCalculationProviders,
  } = useCalculationProviderSearch(calculationProviderSearchRequest);

  var { providerTypes, providerSubTypes, localAuthorities } = useMemo(() => {
    const getFacetValues = (
      data: CalculationProviderSearchResponse,
      facetKey: PublishedProviderSearchFacet
    ): FacetValue[] => data.facets.find((f) => f.name === facetKey)?.facetValues ?? [];
    const types = !providers ? [] 
      : getFacetValues(providers, PublishedProviderSearchFacet.ProviderType);
    const subTypes = !providers
    ? []
      : getFacetValues(providers, PublishedProviderSearchFacet.ProviderSubType);
    const localAuthorities = !providers ? []
     : getFacetValues(providers, PublishedProviderSearchFacet.LocalAuthority);
     setProviderTypeFacets(types);
     setProviderSubTypeFacets(subTypes);
     setLocalAuthorityFacets(localAuthorities);
     setInitialProviderTypeFacets(types);
     setInitialProviderSubTypeFacets(subTypes);
     setInitialLocalAuthorityFacets(localAuthorities);
    return {
      providerTypes: types,
      providerSubTypes: subTypes,
      localAuthorities:localAuthorities,
    };
  }, [providers]);

const addProviderTypeFilter = useCallback((providerType: string) => {
  setCalculationProviderSearchRequest((prevState) => {
    return {
      ...prevState,
      providerType: [...prevState.providerType.filter((fs) => fs !== providerType), providerType],
    };
  });
}, []);

const removeProviderTypeFilter = useCallback((providerType: string) => {
  setCalculationProviderSearchRequest((prevState) => {
    return { ...prevState, providerType: prevState.providerType.filter((fs) => fs !== providerType) };
  });
}, []);

const addProviderSubTypeFilter = useCallback((providerSubType: string) => {
  setCalculationProviderSearchRequest((prevState) => {
    return {
      ...prevState,
      providerSubType: [...prevState.providerSubType.filter((fs) => fs !== providerSubType), providerSubType],
    };
  });
}, []);

const removeProviderSubTypeFilter = useCallback((providerSubType: string) => {
  setCalculationProviderSearchRequest((prevState) => {
    return { ...prevState, providerSubType: prevState.providerSubType.filter((fs) => fs !== providerSubType) };
  });
}, []);
const addLocalAuthorityFilter = useCallback((localAuthority: string) => {
  setCalculationProviderSearchRequest((prevState) => {
    return {
      ...prevState,
      localAuthority: [...prevState.localAuthority.filter((fs) => fs !== localAuthority), localAuthority],
    };
  });
}, []);

const removeLocalAuthorityFilter = useCallback((localAuthority: string) => {
  setCalculationProviderSearchRequest((prevState) => {
    return { ...prevState, localAuthority: prevState.localAuthority.filter((fs) => fs !== localAuthority) };
  });
}, []);

const filterByProviderType = useCallback(
  (searchTerm: string) => {
    if (
      searchTerm.length === 0 ||
      searchTerm.length > 1
    ) { 
      setProviderTypeFacets(
        initialProviderTypeFacets.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  },
  [initialProviderTypeFacets]
);
const filterByProviderSubType = useCallback(
  (searchTerm: string) => {
    if (
      searchTerm.length === 0 ||
      searchTerm.length > 1
    ) { 
      setProviderSubTypeFacets(
        initialProviderSubTypeFacets.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  },
  [initialProviderSubTypeFacets]
);
const filterResultsStatus = useCallback(
  (searchTerm: string) => {
    if (
      searchTerm.length === 0 ||
      searchTerm.length > 1
    ) { 
      setResultStatusFacets(
        resultStatusFacets.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  },
  [resultStatusFacets]
);
const filterByLocalAuthority = useCallback(
  (searchTerm: string) => {
    if (
      searchTerm.length === 0 ||
      searchTerm.length > 1
    ) { 
      setLocalAuthorityFacets(
        initialLocalAuthorityFacets.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  },
  [initialLocalAuthorityFacets]
);

  const filterBySearchTerm = useCallback((searchField: string, searchTerm: string) => {
    if (searchTerm.length === 0 || searchTerm.length > 1) {
      const searchFields: string[] = [];
      if (searchField != null && searchField !== "") {
        searchFields.push(searchField);
      }

      setCalculationProviderSearchRequest((prevState) => {
        return { ...prevState, searchTerm: searchTerm, searchFields: searchFields, pageNumber: 1 };
      });
    }
  },[]);

  const clearFilters = useCallback(()=> {
    setCalculationProviderSearchRequest((prevState) => {
      return {
        ...prevState,
        localAuthority: [],
        providerType: [],
        providerSubType: [],
        errorToggle: "",
        searchTerm: "",
        pageNumber: 1,
      };
    });
  }, []);

  function setPagination(e: number) {
    setCalculationProviderSearchRequest((prevState) => {
      return { ...prevState, pageNumber: e };
    });
  }

  useEffect(() => {
    return () => removeAllSubs();
  }, []);

  useEffect(() => {
    if (calculation) {
      setCalculationProviderSearchRequest((prevState) => {
        return {
          ...prevState,
          calculationValueType: calculation.valueType,
          calculationId: calculationId,
        };
      });
      addSub({
        filterBy: {
          specificationId: calculation.specificationId,
          jobTypes: jobsToWatch,
        },
        fetchPriorNotifications: true,
        onError: (err) => addError({ error: err, description: "Error while subscribing to job updates" }),
      });
    }
  }, [calculation]);

  useEffect(() => {
    if (!jobNotifications?.length) return;

    const activeJobs = extractJobsFromNotifications(jobNotifications).filter(isActiveJob);

    // let's refresh data if any job has just completed
    if (runningJobs.current.length > activeJobs.length) {
      refetchCalculationProviders();
    }
    runningJobs.current = activeJobs;
  }, [jobNotifications]);

  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name={"View results"} url={"/results"} />
        <Breadcrumb name={"Select specification"} url={"/SelectSpecification"} />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />
      {!!specificationId?.length && (
        <JobNotificationSection
          jobNotifications={jobNotifications}
          notificationSettings={[
            {
              showActive: true,
              showFailed: true,
              failDescription: "Calculation run failed due to a problem with the service",
              failureOutcomeDescription:
                "Calculation run completed with one or more exceptions detected in the calculation code",
              showSuccessful: true,
              jobTypes: jobsToWatch,
            },
          ]}
        />
      )}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-caption-xl">
            {specification ? specification.fundingPeriod.name : <LoadingFieldStatus title="Loading..." />}
          </h2>
          <h1 className="govuk-heading-xl">
            {calculation ? calculation.name : <LoadingFieldStatus title="Loading..." />}
          </h1>
          <h3 className="govuk-heading-m">{fundingStream.name}</h3>
          {calculation && (
            <Link
              id={"view-calculation-button"}
              to={`/Specifications/EditCalculation/${calculation.id}`}
              className="govuk-button"
              role="button"
            >
              View calculation
            </Link>
          )}
        </div>
      </div>
      <div className="govuk-grid-row">
      <div className="govuk-grid-column-one-third position-sticky">
        <div className="filterScroll">
          <ViewCalculationResultsSearchFilters
            searchCriteria={calculationProviderSearchRequest}
            initialSearch={calculationProviderSearchRequest}
            filterBySearchTerm={filterBySearchTerm}
            addProviderTypeFilter = {addProviderTypeFilter} 
            removeProviderTypeFilter = {removeProviderTypeFilter} 
            addProviderSubTypeFilter = {addProviderSubTypeFilter} 
            removeProviderSubTypeFilter = {removeProviderSubTypeFilter}
            addResultStatusFilter = {addProviderTypeFilter} 
            removeResultStatusFilter = {removeProviderTypeFilter}
            addLocalAuthorityFilter = {addLocalAuthorityFilter} 
            removeLocalAuthorityFilter = {removeLocalAuthorityFilter} 
            filterByProviderType = {filterByProviderType} 
            filterByProviderSubType = {filterByProviderSubType} 
            filterByResultStatus = {filterResultsStatus} 
            filterByLocalauthority = {filterByLocalAuthority} 
            providerTypeFacets = {providerTypeFacets} 
            providerSubTypeFacets = {providerSubTypeFacets} 
            resultStatusFacets = {resultStatusFacets} 
            localAuthorityFacets = {localAuthorityFacets} 
            clearFilters={clearFilters}
          />
          </div>
        </div>
        
        <div className="govuk-grid-column-two-thirds">
          <LoadingStatus
            title={"Updating search results"}
            description={"Please wait whilst search results are updated"}
            hidden={!isLoadingCalculationProviders}
          />
          {!!providers?.totalResults && !isLoadingCalculationProviders && (
            <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
              <div className="govuk-accordion__controls">
                <button
                  type="button"
                  className="govuk-accordion__open-all"
                  onClick={() => setAutoExpand(!autoExpand)}
                >
                  {autoExpand ? "Close" : "Open"} all
                  <span className="govuk-visually-hidden"> sections</span>
                </button>
              </div>
              {providers.calculationProviderResults.map((provider) => {
                return (
                  <AccordionPanel
                    id={provider.id}
                    expanded={false}
                    title={provider.providerName}
                    subtitle={"Value:"}
                    boldSubtitle={` ${provider.calculationResultDisplay}`}
                    tagVisible={provider.isIndicativeProvider}
                    tagText={"Indicative"}
                    tagType={TagTypes.grey}
                    key={provider.id}
                    autoExpand={autoExpand}
                  >
                    <div
                      id={"accordion-default-content-" + provider.id}
                      className="govuk-accordion__section-content"
                    >
                      {calculation && (
                        <TextLink
                          to={`/ViewResults/ViewProviderResults/${provider.providerId}/${calculation.fundingStreamId}/?specificationId=${provider.specificationId}`}
                        >
                          View provider calculations
                        </TextLink>
                      )}
                      <dl className="govuk-summary-list govuk-!-margin-top-5">
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Updated</dt>
                          <dd className="govuk-summary-list__value">{provider.lastUpdatedDateDisplay}</dd>
                        </div>
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">UKPRN</dt>
                          <dd className="govuk-summary-list__value">{provider.ukprn}</dd>
                        </div>
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Provider type</dt>
                          <dd className="govuk-summary-list__value">{provider.providerType}</dd>
                        </div>
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Local authority</dt>
                          <dd className="govuk-summary-list__value">{provider.localAuthority}</dd>
                        </div>
                      </dl>
                    </div>
                  </AccordionPanel>
                );
              })}
            </div>
          )}
          {!!providers && providers.totalResults === 0 && !isLoadingCalculationProviders && (
            <h2 className="govuk-heading-m">There are no results available</h2>
          )}
          {!!providers?.totalResults && !isLoadingCalculationProviders && (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <TableNavBottom
                    totalCount={providers.totalResults}
                    startItemNumber={providers.startItemNumber}
                    endItemNumber={providers.endItemNumber}
                    currentPage={providers.pagerState.currentPage}
                    lastPage={providers.pagerState.lastPage}
                    onPageChange={setPagination} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Main>
  );
}
