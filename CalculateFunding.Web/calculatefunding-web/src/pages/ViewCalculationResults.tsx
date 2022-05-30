import { debounce } from "lodash";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";

import { AccordionPanel } from "../components/AccordionPanel";
import { Breadcrumb, Breadcrumbs } from "../components/Breadcrumbs";
import { CollapsiblePanel } from "../components/CollapsiblePanel";
import { CollapsibleSearchBox } from "../components/CollapsibleSearchBox";
import JobNotificationSection from "../components/Jobs/JobNotificationSection";
import { LoadingFieldStatus } from "../components/LoadingFieldStatus";
import { LoadingStatus } from "../components/LoadingStatus";
import { Main } from "../components/Main";
import { MultipleErrorSummary } from "../components/MultipleErrorSummary";
import { TableNavBottom } from "../components/TableNavBottom";
import { TagTypes } from "../components/Tag";
import { TextLink } from "../components/TextLink";
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
  const filterResultsStatus = [
    {
      name: "With exceptions",
      selected: false,
    },
    {
      name: "Without exceptions",
      selected: false,
    },
  ];
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

  const { providerTypes, providerSubTypes, localAuthorities } = useMemo(() => {
    const getFacetValues = (
      data: CalculationProviderSearchResponse,
      facetKey: PublishedProviderSearchFacet
    ): FacetValue[] => data.facets.find((f) => f.name === facetKey)?.facetValues ?? [];

    return {
      providerTypes: !providers ? [] : getFacetValues(providers, PublishedProviderSearchFacet.ProviderType),
      providerSubTypes: !providers
        ? []
        : getFacetValues(providers, PublishedProviderSearchFacet.ProviderSubType),
      localAuthorities: !providers
        ? []
        : getFacetValues(providers, PublishedProviderSearchFacet.LocalAuthority),
    };
  }, [providers]);

  function filterByProviderTypes(e: React.ChangeEvent<HTMLInputElement>) {
    const filterUpdate = calculationProviderSearchRequest.providerType;
    if (e.target.checked) {
      filterUpdate.push(e.target.value);
    } else {
      const position = filterUpdate.indexOf(e.target.value);
      filterUpdate.splice(position, 1);
    }
    setCalculationProviderSearchRequest((prevState) => {
      return { ...prevState, providerType: filterUpdate, pageNumber: 1 };
    });
  }

  function filterByProviderSubTypes(e: React.ChangeEvent<HTMLInputElement>) {
    const filterUpdate = calculationProviderSearchRequest.providerSubType;
    if (e.target.checked) {
      filterUpdate.push(e.target.value);
    } else {
      const position = filterUpdate.indexOf(e.target.value);
      filterUpdate.splice(position, 1);
    }
    setCalculationProviderSearchRequest((prevState) => {
      return { ...prevState, providerSubType: filterUpdate, pageNumber: 1 };
    });
  }

  function filterByResultStatus(e: React.ChangeEvent<HTMLInputElement>) {
    let filterUpdate = calculationProviderSearchRequest.errorToggle;

    if (e.target.value === "With exceptions") {
      filterUpdate = "Errors";
    } else {
      filterUpdate = "";
    }

    setCalculationProviderSearchRequest((prevState) => {
      return { ...prevState, errorToggle: filterUpdate, pageNumber: 1 };
    });
  }

  function filterByLocalAuthority(e: React.ChangeEvent<HTMLInputElement>) {
    const filterUpdate = calculationProviderSearchRequest.localAuthority;

    if (e.target.checked) {
      filterUpdate.push(e.target.value);
    } else {
      const position = filterUpdate.indexOf(e.target.value);
      filterUpdate.splice(position, 1);
    }
    setCalculationProviderSearchRequest((prevState) => {
      return { ...prevState, localAuthority: filterUpdate, pageNumber: 1 };
    });
  }

  function filterBySearchTerm(searchField: string, searchTerm: string) {
    if (searchTerm.length === 0 || searchTerm.length > 2) {
      const searchFields: string[] = [];
      if (searchField != null && searchField !== "") {
        searchFields.push(searchField);
      }

      setCalculationProviderSearchRequest((prevState) => {
        return { ...prevState, searchTerm: searchTerm, searchFields: searchFields, pageNumber: 1 };
      });
    }
  }
  const debounceFilterBySearchTerm = useRef(debounce(filterBySearchTerm, 500)).current;

  function clearFilters() {
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

    // @ts-ignore
    document.getElementById("searchProviders").reset();
  }

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
        <div className="govuk-grid-column-one-third">
          <form id="searchProviders">
            <CollapsiblePanel title={"Search"} isExpanded={true}>
              <fieldset className="govuk-fieldset">
                <span className="govuk-hint sidebar-search-span">Select one option.</span>
                <CollapsibleSearchBox searchTerm={""} callback={debounceFilterBySearchTerm} />
              </fieldset>
            </CollapsiblePanel>
            <CollapsiblePanel
              title="Filter by provider type"
              isExpanded={true}
              isCollapsible={true}
              showFacetCount={true}
              facetCount={calculationProviderSearchRequest.providerType.length}
            >
              <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes">
                  {providerTypes.map((providerType) => (
                    <div className="govuk-checkboxes__item" key={providerType.name}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`providerTypes-${providerType.name}`}
                        name={`providerTypes-${providerType.name}`}
                        checked={!!calculationProviderSearchRequest.providerType.find((name) => name == providerType.name)}
                        type="checkbox"
                        value={providerType.name}
                        onChange={filterByProviderTypes}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`providerTypes-${providerType.name}`}
                      >
                        {providerType.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </CollapsiblePanel>
            <CollapsiblePanel
              title="Filter by provider sub type"
              isExpanded={true}
              isCollapsible={true}
              showFacetCount={true}
              facetCount={calculationProviderSearchRequest.providerSubType.length}
            >
              <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes">
                  {providerSubTypes.map((providerSubType) => {
                    const key = `providerSubTypes-${providerSubType.name}`;
                    return (
                      <div className="govuk-checkboxes__item" key={key}>
                        <input
                          className="govuk-checkboxes__input"
                          id={key}
                          name={key}
                          checked={!!calculationProviderSearchRequest.providerSubType.find((name) => name == providerSubType.name)}
                          type="checkbox"
                          value={providerSubType.name}
                          onChange={filterByProviderSubTypes}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor={key}>
                          {providerSubType.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </CollapsiblePanel>
            <CollapsiblePanel title="Filter by results status" isExpanded={true} isCollapsible={true}>
              <fieldset className="govuk-fieldset">
                <div className="govuk-radios">
                  {filterResultsStatus.map((status) => {
                    const key = `resultsStatus-${status.name}`;
                    return (
                      <div key={key} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={key}
                          name={key}
                          type="radio"
                          value={status.name}
                          defaultChecked={status.name === "Without exceptions"}
                          onChange={filterByResultStatus}
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor={key}>
                          {status.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </CollapsiblePanel>
            <CollapsiblePanel
              title="Filter by local authority(LA)"
              isExpanded={true}
              isCollapsible={true}
              showFacetCount={true}
              facetCount={calculationProviderSearchRequest.localAuthority.length}
            >
              <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes">
                  {localAuthorities.map((localAuthority, index) => (
                    <div className="govuk-checkboxes__item" key={index}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`localAuthorities-${localAuthority.name}`}
                        name="localAuthorities"
                        checked={!!calculationProviderSearchRequest.localAuthority.find((name) => name == localAuthority.name)}
                        type="checkbox"
                        value={localAuthority.name}
                        onChange={filterByLocalAuthority}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`localAuthorities-${localAuthority.name}`}
                      >
                        {localAuthority.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </CollapsiblePanel>
            <button type="button" className="govuk-button" onClick={clearFilters}>
              Clear filters
            </button>
          </form>
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
