import * as React from "react";
import { useEffect, useState } from "react";
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
import { Pagination } from "../components/Pagination";
import { TagTypes } from "../components/Tag";
import { TextLink } from "../components/TextLink";
import { useCalculation } from "../hooks/Calculations/useCalculation";
import { useJobSubscription } from "../hooks/Jobs/useJobSubscription";
import { useErrors } from "../hooks/useErrors";
import { useSpecificationSummary } from "../hooks/useSpecificationSummary";
import { getCalculationProvidersService } from "../services/calculationService";
import { CalculationProviderResultList } from "../types/CalculationProviderResult";
import { CalculationProviderSearchRequestViewModel } from "../types/calculationProviderSearchRequestViewModel";
import { FacetValue } from "../types/Facet";
import { JobType } from "../types/jobType";
import { SearchMode } from "../types/SearchMode";
import { Section } from "../types/Sections";
import { FundingStream } from "../types/viewFundingTypes";

export interface ViewCalculationResultsRoute {
  calculationId: string;
}

export function ViewCalculationResults({ match }: RouteComponentProps<ViewCalculationResultsRoute>) {
  document.title = "Calculation Results - Calculate funding";
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [singleFire, setSingleFire] = useState(false);
  const [autoExpand, setAutoExpand] = useState(false);
  const [filterProviderTypes, setProviderTypes] = useState<FacetValue[]>([]);
  const [filterProviderSubTypes, setProviderSubTypes] = useState<FacetValue[]>([]);
  const [filterResultsStatus] = useState([
    {
      name: "With exceptions",
      selected: false,
    },
    {
      name: "Without exceptions",
      selected: false,
    },
  ]);
  const [filterLocalAuthority, setLocalAuthority] = useState<FacetValue[]>([]);
  const calculationId = match.params.calculationId;
  const [specificationId, setSpecificationId] = useState<string>("");
  const { errors, addErrorMessage, addError } = useErrors();
  const { calculation } = useCalculation(calculationId, (err) =>
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
  const [initialSearch, setInitialSearch] = useState<CalculationProviderSearchRequestViewModel>({
    calculationValueType: "",
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
  const [calculationProviderSearchRequest, setCalculationProviderSearchRequest] =
    useState<CalculationProviderSearchRequestViewModel>(initialSearch);
  const fundingStream: FundingStream = {
    name: "",
    id: "",
  };
  const [providers, setProviders] = useState<CalculationProviderResultList>({
    calculationProviderResults: [],
    currentPage: 0,
    endItemNumber: 0,
    facets: [],
    pagerState: {
      currentPage: 0,
      displayNumberOfPages: 0,
      lastPage: 0,
      nextPage: 0,
      pages: [],
      previousPage: 0,
    },
    startItemNumber: 0,
    totalErrorResults: 0,
    totalResults: 0,
  });

  function filterByProviderTypes(e: React.ChangeEvent<HTMLInputElement>) {
    setIsLoading(true);
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
    setIsLoading(true);
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
    setIsLoading(true);
    let filterUpdate = calculationProviderSearchRequest.errorToggle;

    if (e.target.value === "With exceptions") {
      filterUpdate = "Errors";
    } else {
      filterUpdate = "";
    }

    setCalculationProviderSearchRequest((prevState) => {
      return { ...prevState, errorToggle: filterUpdate, pageNumber: 1 };
    });

    const request = calculationProviderSearchRequest;
    request.errorToggle = filterUpdate;
  }

  function filterByLocalAuthority(e: React.ChangeEvent<HTMLInputElement>) {
    setIsLoading(true);
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
      setIsLoading(true);

      const searchFields: string[] = [];
      if (searchField != null && searchField !== "") {
        searchFields.push(searchField);
      }

      setCalculationProviderSearchRequest((prevState) => {
        return { ...prevState, searchTerm: searchTerm, searchFields: searchFields, pageNumber: 1 };
      });
    }
  }

  function clearFilters() {
    setIsLoading(true);
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
    const request = calculationProviderSearchRequest;
    request.pageNumber = e;
    setCalculationProviderSearchRequest((prevState) => {
      return { ...prevState, pageNumber: e };
    });
  }

  function getCalculationResults(searchRequestViewModel: CalculationProviderSearchRequestViewModel) {
    getCalculationProvidersService(searchRequestViewModel)
      .then((response) => {
        setProviders(response.data);
        if (!singleFire && response.data.totalResults > 0) {
          setSingleFire(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    return () => removeAllSubs();
  }, []);

  useEffect(() => {
    if (calculation) {
      setSpecificationId(calculation.specificationId);
      const searchParams = {
        ...initialSearch,
        calculationValueType: calculation.valueType,
        calculationId: calculation.id,
      };
      setInitialSearch(searchParams);
      setCalculationProviderSearchRequest(searchParams);
      addSub({
        filterBy: {
          specificationId: calculation.specificationId,
          jobTypes: jobsToWatch,
        },
        onError: (err) => addError({ error: err, description: "Error while subscribing to job updates" }),
      });
    }
  }, [calculation]);

  useEffect(() => {
    if (providers.facets.length > 0) {
      setProviderTypes(providers.facets[5].facetValues);
      setProviderSubTypes(providers.facets[6].facetValues);
      setLocalAuthority(providers.facets[8].facetValues);
    }
  }, [singleFire]);

  useEffect(() => {
    if (
      calculationProviderSearchRequest.calculationId != null &&
      calculationProviderSearchRequest.calculationId !== ""
    ) {
      getCalculationResults(calculationProviderSearchRequest);
    }
  }, [calculationProviderSearchRequest]);

  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"View results"} url={"/results"} />
        <Breadcrumb name={"Select specification"} url={"/SelectSpecification"} />
        {specification && (
          <Breadcrumb name={specification.name} url={`/ViewSpecificationResults/${specification.id}`} />
        )}
        {calculation && <Breadcrumb name={calculation.name} />}
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />
      {specificationId.length > 0 && (
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
                <CollapsibleSearchBox searchTerm={""} callback={filterBySearchTerm} />
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
                  {filterProviderTypes.map((pt, index) => (
                    <div className="govuk-checkboxes__item" key={index}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`providerTypes-${pt.name}`}
                        name={`providerTypes-${pt.name}`}
                        type="checkbox"
                        value={pt.name}
                        onChange={filterByProviderTypes}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`providerTypes-${pt.name}`}
                      >
                        {pt.name}
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
                  {filterProviderSubTypes.map((pt, index) => (
                    <div className="govuk-checkboxes__item" key={index}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`providerSubTypes-${pt.name}`}
                        name={`providerSubTypes-${pt.name}`}
                        type="checkbox"
                        value={pt.name}
                        onChange={filterByProviderSubTypes}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`providerSubTypes-${pt.name}`}
                      >
                        {pt.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </CollapsiblePanel>
            <CollapsiblePanel title="Filter by results status" isExpanded={true} isCollapsible={true}>
              <fieldset className="govuk-fieldset">
                <div className="govuk-radios">
                  {filterResultsStatus.map((pt, index) => (
                    <div key={index} className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={`resultsStatus-${pt.name}`}
                        name="resultsStatus"
                        type="radio"
                        value={pt.name}
                        defaultChecked={pt.name === "Without exceptions"}
                        onChange={filterByResultStatus}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="resultsStatus">
                        {pt.name}
                      </label>
                    </div>
                  ))}
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
                  {filterLocalAuthority.map((pt, index) => (
                    <div className="govuk-checkboxes__item" key={index}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`localAuthorities-${pt.name}`}
                        name="localAuthorities"
                        type="checkbox"
                        value={pt.name}
                        onChange={filterByLocalAuthority}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`localAuthorities-${pt.name}`}
                      >
                        {pt.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </CollapsiblePanel>
            <button type="button" className="govuk-button" onClick={() => clearFilters()}>
              Clear filters
            </button>
          </form>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <LoadingStatus
            title={"Updating search results"}
            description={"Please wait whilst search results are updated"}
            hidden={!isLoading}
          />
          <div
            className="govuk-accordion"
            data-module="govuk-accordion"
            id="accordion-default "
            hidden={providers.totalResults === 0 || isLoading}
          >
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
            {providers.calculationProviderResults.map((cpr) => {
              const value = cpr.calculationResultDisplay;
              return (
                <AccordionPanel
                  id={cpr.id}
                  expanded={false}
                  title={cpr.providerName}
                  subtitle={"Value:"}
                  boldSubtitle={` ${value}`}
                  tagVisible={cpr.isIndicativeProvider}
                  tagText={"Indicative"}
                  tagType={TagTypes.grey}
                  key={cpr.id}
                  autoExpand={autoExpand}
                >
                  <div
                    id={"accordion-default-content-" + cpr.id}
                    className="govuk-accordion__section-content"
                  >
                    {calculation && (
                      <TextLink
                        to={`/ViewResults/ViewProviderResults/${cpr.providerId}/${calculation.fundingStreamId}/?specificationId=${cpr.specificationId}`}
                      >
                        View provider calculations
                      </TextLink>
                    )}
                    <dl className="govuk-summary-list govuk-!-margin-top-5">
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Updated</dt>
                        <dd className="govuk-summary-list__value">{cpr.lastUpdatedDateDisplay}</dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">UKPRN</dt>
                        <dd className="govuk-summary-list__value">{cpr.ukprn}</dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Provider type</dt>
                        <dd className="govuk-summary-list__value">{cpr.providerType}</dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Local authority</dt>
                        <dd className="govuk-summary-list__value">{cpr.localAuthority}</dd>
                      </div>
                    </dl>
                  </div>
                </AccordionPanel>
              );
            })}
          </div>
          {providers.totalResults === 0 && singleFire && !isLoading ? (
            <h2 className="govuk-heading-m">There are no results available</h2>
          ) : (
            ""
          )}
          {providers.totalResults > 0 && !isLoading && (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <Pagination
                  currentPage={providers.pagerState.currentPage}
                  lastPage={providers.pagerState.lastPage}
                  callback={setPagination}
                />
              </div>
              <div className="govuk-grid-column-one-third">
                <p className="govuk-body-s">
                  Showing {providers.startItemNumber} - {providers.endItemNumber} of {providers.totalResults}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Main>
  );
}
