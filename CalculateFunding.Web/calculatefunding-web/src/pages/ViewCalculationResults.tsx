import * as React from "react";
import {useEffect, useState} from "react";
import {Footer} from "../components/Footer";
import {Header} from "../components/Header";
import {RouteComponentProps} from "react-router";
import {CollapsiblePanel} from "../components/CollapsiblePanel";
import {Calculation, CalculationSummary} from "../types/CalculationSummary";
import {FundingStream} from "../types/viewFundingTypes";
import {AccordianPanel} from "../components/AccordianPanel";
import Pagination from "../components/Pagination";
import {Section} from "../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../components/Breadcrumbs";
import {SearchMode} from "../types/SearchMode";
import {CalculationJobNotification} from "../components/Calculations/CalculationJobNotification";
import {FacetValue} from "../types/Facet";
import {Link} from "react-router-dom";
import {CalculationProviderSearchRequestViewModel} from "../types/calculationProviderSearchRequestViewModel";
import {getCalculationByIdService, getCalculationProvidersService} from "../services/calculationService";
import {CalculationProviderResultList} from "../types/CalculationProviderResult";
import {getSpecificationSummaryService} from "../services/specificationService";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {LoadingStatus} from "../components/LoadingStatus";
import {useLatestSpecificationJobWithMonitoring} from "../hooks/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../types/jobType";
import {SearchBox} from "../components/SearchBox";

export interface ViewCalculationResultsProps {
    calculation: CalculationSummary;
}

export interface ViewCalculationResultsRoute {
    calculationId: string
}

export function ViewCalculationResults({match}: RouteComponentProps<ViewCalculationResultsRoute>) {

    document.title = "Calculation Results - Calculate funding";
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [singleFire, setSingleFire] = useState(false);
    const [autoExpand, setAutoExpand] = useState(false);
    const [filterProviderTypes, setProviderTypes] = useState<FacetValue[]>([]);
    const [filterProviderSubTypes, setProviderSubTypes] = useState<FacetValue[]>([]);
    const [filterResultsStatus] = useState([{
        name: "With exceptions",
        selected: false
    }, {
        name: "Without exceptions",
        selected: false
    }]);
    const [filterLocalAuthority, setLocalAuthority] = useState<FacetValue[]>([]);
    const initialSearch: CalculationProviderSearchRequestViewModel = {
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
        calculationId: match.params.calculationId,
    };
    const [calculationProviderSearchRequest, setCalculationProviderSearchRequest] = useState<CalculationProviderSearchRequestViewModel>(initialSearch);
    const calculationId = match.params.calculationId;
    let fundingStream: FundingStream = {
        name: "",
        id: ""
    };

    const [calculation, setCalculation] = useState<Calculation>({
        calculationType: "",
        description: null,
        fundingStreamId: "",
        id: "",
        lastUpdatedDate: new Date(),
        lastUpdatedDateDisplay: "",
        name: "",
        namespace: "",
        specificationId: "",
        specificationName: "",
        status: "",
        valueType: "",
        wasTemplateCalculation: false
    });
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
            previousPage: 0
        },
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0
    });
    const [specification, setSpecification] = useState<SpecificationSummary>({
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            name: "",
            id: ""
        },
        fundingStreams: [],
        id: "",
        isSelectedForFunding: false,
        name: "",
        providerVersionId: ""
    })

    const specificationId = calculation.specificationId.length > 0 ?
        calculation.specificationId : specification.id.length > 0 ?
            specification.id :
            specification.id.length > 0 ?
                specification.id : "";

    const {latestJob, hasActiveJob, jobError, hasJobError, isCheckingForJob, jobInProgressMessage} =
        useLatestSpecificationJobWithMonitoring(specificationId,
            [JobType.CreateInstructAllocationJob, JobType.GenerateGraphAndInstructAllocationJob, JobType.CreateInstructGenerateAggregationsAllocationJob, JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob]);


    useEffect(() => {
        if (!singleFire && providers.totalResults > 0) {
            setSingleFire(true);
        }
    }, [providers.totalResults]);

    useEffect(() => {
        getCalculationById(calculationId);
    }, [calculationId]);

    useEffect(() => {
        if (calculation.specificationId !== "") {
            getSpecificationSummary(calculation.specificationId);
        }
    }, [calculation.specificationId]);

    useEffect(() => {
        fundingStream = specification.fundingStreams[0];
    }, [specification.fundingStreams]);

    useEffect(() => {
        setCalculationProviderSearchRequest(prevState => {
            return {
                ...prevState,
                calculationValueType: calculation.valueType,
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
                calculationId: calculationId,
            }
        });
        getCalculationResults(calculationProviderSearchRequest);
    }, [calculationId]);

    useEffect(() => {
        if (providers.facets.length > 0) {
            setProviderTypes(providers.facets[5].facetValues);
            setProviderSubTypes(providers.facets[6].facetValues);
            setLocalAuthority(providers.facets[8].facetValues)
        }
    }, [singleFire]);

    function filterByProviderTypes(e: React.ChangeEvent<HTMLInputElement>) {
        setIsLoading(true);
        let filterUpdate = calculationProviderSearchRequest.providerType;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setCalculationProviderSearchRequest(prevState => {
            return {...prevState, providerType: filterUpdate}
        });
        getCalculationResults(calculationProviderSearchRequest);
    }

    function filterByProviderSubTypes(e: React.ChangeEvent<HTMLInputElement>) {
        setIsLoading(true);
        let filterUpdate = calculationProviderSearchRequest.providerSubType;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setCalculationProviderSearchRequest(prevState => {
            return {...prevState, providerSubType: filterUpdate}
        });
        getCalculationResults(calculationProviderSearchRequest);
    }

    function filterByResultStatus(e: React.ChangeEvent<HTMLInputElement>) {
        setIsLoading(true);
        let filterUpdate = calculationProviderSearchRequest.errorToggle;

        if (e.target.value === "With exceptions") {
            filterUpdate = "Errors";
        } else {
            filterUpdate = "";
        }

        setCalculationProviderSearchRequest(prevState => {
            return {...prevState, errorToggle: filterUpdate}
        });

        const request = calculationProviderSearchRequest;
        request.errorToggle = filterUpdate;
        getCalculationResults(request);
    }

    function filterByLocalAuthority(e: React.ChangeEvent<HTMLInputElement>) {
        setIsLoading(true);
        let filterUpdate = calculationProviderSearchRequest.localAuthority;

        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setCalculationProviderSearchRequest(prevState => {
            return {...prevState, localAuthority: filterUpdate}
        });
        getCalculationResults(calculationProviderSearchRequest);
    }

    function filterBySearchTerm(searchQuery:string) {
            setIsLoading(true);
            let filterUpdate = searchQuery;
            calculationProviderSearchRequest.searchTerm = filterUpdate;

            setCalculationProviderSearchRequest(prevState => {
                return {...prevState, searchTerm: filterUpdate}
            });

            getCalculationResults(calculationProviderSearchRequest);
    }

    function clearFilters() {
        setCalculationProviderSearchRequest(initialSearch);
        // @ts-ignore
        document.getElementById("searchProviders").reset();
        getCalculationResults(initialSearch);
    }

    function setPagination(e: number) {
        let request = calculationProviderSearchRequest;
        request.pageNumber = e;
        setCalculationProviderSearchRequest(prevState => {
            return {...prevState, pageNumber: e}
        });

        getCalculationResults(request);
    }

    function getCalculationById(calculationId: string) {
        getCalculationByIdService(calculationId).then((response) => {
            setCalculation(response.data as Calculation);
        })
    }

    function getCalculationResults(calculationId: CalculationProviderSearchRequestViewModel) {
        getCalculationProvidersService(calculationId).then((response) => {
            setProviders(response.data as CalculationProviderResultList);
        }).finally(() => {
            setIsLoading(false);
        })
    }

    function getSpecificationSummary(specificationId: string) {
        getSpecificationSummaryService(specificationId).then((response) => {
            setSpecification(response.data as SpecificationSummary);
        });
    }

    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View results"} url={"/results"}/>
                <Breadcrumb name={"Select specification"} url={"/SelectSpecification"}/>
                <Breadcrumb name={specification.name} url={`/ViewSpecificationResults/${specification.id}`}/>
                <Breadcrumb name={calculation.name}/>
            </Breadcrumbs>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h2 className="govuk-caption-xl">{specification.fundingPeriod.name}</h2>
                        <h1 className="govuk-heading-xl">{calculation.name}</h1>
                        <h3 className="govuk-heading-m">{fundingStream.name}</h3>
                        {specificationId.length > 0 &&
                        <CalculationJobNotification 
                            latestJob={latestJob} 
                            anyJobsRunning={hasActiveJob} 
                            isCheckingForJob={isCheckingForJob}
                            jobProgressMessage={jobInProgressMessage}
                            hasJobError={hasJobError}
                            jobError={jobError}/>
                        }
                        <Link id={"view-calculation-button"} to={`/Specifications/Edit${calculation.calculationType}Calculation/${calculation.id}`}
                              className="govuk-button" role="button">
                            View calculation
                        </Link>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third">
                        <form id="searchProviders">
                            <CollapsiblePanel title="Search" expanded={true}>
                                <fieldset className="govuk-fieldset">
                                    <label className="govuk-label">Search</label>
                                    <SearchBox callback={filterBySearchTerm} timeout={5000} />
                                </fieldset>
                            </CollapsiblePanel>
                            <CollapsiblePanel title="Filter by provider type" expanded={false}>
                                <fieldset className="govuk-fieldset">
                                    <div className="govuk-checkboxes">
                                        {filterProviderTypes.map((pt, index) =>
                                            <div className="govuk-checkboxes__item" key={index}>
                                                <input className="govuk-checkboxes__input"
                                                       id={`providerTypes-${pt.name}`}
                                                       name={`providerTypes-${pt.name}`}
                                                       type="checkbox" value={pt.name}
                                                       onChange={filterByProviderTypes}/>
                                                <label className="govuk-label govuk-checkboxes__label"
                                                       htmlFor={`providerTypes-${pt.name}`}>
                                                    {pt.name}
                                                </label>
                                            </div>)
                                        }
                                    </div>
                                </fieldset>
                            </CollapsiblePanel>
                            <CollapsiblePanel title="Filter by provider sub type" expanded={false}>
                                <fieldset className="govuk-fieldset">
                                    <div className="govuk-checkboxes">
                                        {filterProviderSubTypes.map((pt, index) =>
                                            <div className="govuk-checkboxes__item" key={index}>
                                                <input className="govuk-checkboxes__input"
                                                       id={`providerSubTypes-${pt.name}`}
                                                       name={`providerSubTypes-${pt.name}`}
                                                       type="checkbox" value={pt.name}
                                                       onChange={filterByProviderSubTypes}/>
                                                <label className="govuk-label govuk-checkboxes__label"
                                                       htmlFor={`providerSubTypes-${pt.name}`}>
                                                    {pt.name}
                                                </label>
                                            </div>)
                                        }
                                    </div>
                                </fieldset>
                            </CollapsiblePanel>
                            <CollapsiblePanel title="Filter by results status" expanded={false}>
                                <fieldset className="govuk-fieldset">
                                    <div className="govuk-radios">
                                        {filterResultsStatus.map((pt, index) =>
                                            <div key={index} className="govuk-radios__item">
                                                <input className="govuk-radios__input" id={`resultsStatus-${pt.name}`}
                                                       name="resultsStatus"
                                                       type="radio" value={pt.name}
                                                       defaultChecked={pt.name === "Without exceptions"}
                                                       onChange={filterByResultStatus}/>
                                                <label className="govuk-label govuk-radios__label"
                                                       htmlFor="resultsStatus">
                                                    {pt.name}
                                                </label>
                                            </div>)
                                        }
                                    </div>
                                </fieldset>
                            </CollapsiblePanel>
                            <CollapsiblePanel title="Filter by local authority(LA)" expanded={false}>
                                <fieldset className="govuk-fieldset">
                                    <div className="govuk-checkboxes">
                                        {filterLocalAuthority.map((pt, index) =>
                                            <div className="govuk-checkboxes__item" key={index}>
                                                <input className="govuk-checkboxes__input"
                                                       id={`localAuthorities-${pt.name}`} name="localAuthorities"
                                                       type="checkbox" value={pt.name}
                                                       onChange={filterByLocalAuthority}/>
                                                <label className="govuk-label govuk-checkboxes__label"
                                                       htmlFor={`localAuthorities-${pt.name}`}>
                                                    {pt.name}
                                                </label>
                                            </div>)
                                        }
                                    </div>
                                </fieldset>
                            </CollapsiblePanel>
                            <button type="button" className="govuk-button"
                                    onClick={() => clearFilters()}>Clear filters
                            </button>
                        </form>
                    </div>
                    <div className="govuk-grid-column-two-thirds">
                        <LoadingStatus title={"Updating search results"} description={"Please wait whilst search results are updated"} hidden={!isLoading}/>
                        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default "
                             hidden={providers.totalResults === 0 || isLoading}>
                            <div className="govuk-accordion__controls">
                                <button type="button" className="govuk-accordion__open-all"
                                        onClick={() => setAutoExpand(!autoExpand)}>{autoExpand ? "Close" : "Open"} all<span
                                    className="govuk-visually-hidden"> sections</span></button>

                            </div>
                            {providers.calculationProviderResults.map(cpr => {
                                    let value = cpr.calculationResultDisplay;
                                    return <AccordianPanel id={cpr.id} expanded={false} title={cpr.providerName}
                                                           subtitle={"Value:"} boldSubtitle={` ${value}`}
                                                           key={cpr.id} autoExpand={autoExpand}>
                                        <div id={"accordion-default-content-" + cpr.id}
                                             className="govuk-accordion__section-content">
                                            <Link to={`/ViewResults/ViewProviderResults/${cpr.providerId}/${calculation.fundingStreamId}/?specificationId=${cpr.specificationId}`} className="govuk-link">
                                                View provider calculations
                                            </Link>
                                            <dl className="govuk-summary-list govuk-!-margin-top-5">
                                                <div className="govuk-summary-list__row">
                                                    <dt className="govuk-summary-list__key">
                                                        Updated
                                                    </dt>
                                                    <dd className="govuk-summary-list__value">
                                                        {cpr.lastUpdatedDateDisplay}
                                                    </dd>
                                                </div>
                                                <div className="govuk-summary-list__row">
                                                    <dt className="govuk-summary-list__key">
                                                        UKPRN
                                                    </dt>
                                                    <dd className="govuk-summary-list__value">
                                                        {cpr.ukprn}
                                                    </dd>
                                                </div>
                                                <div className="govuk-summary-list__row">
                                                    <dt className="govuk-summary-list__key">
                                                        Provider type
                                                    </dt>
                                                    <dd className="govuk-summary-list__value">
                                                        {cpr.providerType}
                                                    </dd>
                                                </div>
                                                <div className="govuk-summary-list__row">
                                                    <dt className="govuk-summary-list__key">
                                                        Local authority
                                                    </dt>
                                                    <dd className="govuk-summary-list__value">
                                                        {cpr.localAuthority}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </AccordianPanel>
                                }
                            )}
                        </div>
                        {providers.totalResults === 0 && singleFire ?
                            <h2 className="govuk-heading-m">There are no results available</h2> : ""}
                        {providers.totalResults > 0 &&
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <Pagination currentPage={providers.pagerState.currentPage}
                                            lastPage={providers.pagerState.lastPage}
                                            callback={setPagination}/>
                            </div>
                            <div className="govuk-grid-column-one-third">
                                <p className="govuk-body-s">Showing {providers.startItemNumber} - {providers.endItemNumber} of {providers.totalResults}</p>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}
