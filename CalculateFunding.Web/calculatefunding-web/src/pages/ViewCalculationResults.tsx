import * as React from "react";
import {useEffect, useState} from "react";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {Banner} from "../components/Banner";
import {Footer} from "../components/Footer";
import {Header} from "../components/Header";
import {RouteComponentProps} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../states/AppState";
import {CollapsiblePanel} from "../components/CollapsiblePanel";
import {CalculationSummary} from "../types/CalculationSummary";
import {ViewCalculationState} from "../states/ViewCalculationState";
import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import {getCalculationById, getCalculationResults} from "../actions/ViewCalculationResultsActions";
import {FundingStream} from "../types/viewFundingTypes";
import {CalculationProviderSearchRequestViewModel, SearchMode} from "../types/searchRequestViewModel";
import {FacetValue} from "../types/CalculationProviderResult";
import {getSpecificationSummary} from "../actions/ViewSpecificationResultsActions";
import {AccordianPanel} from "../components/AccordianPanel";
import Pagination from "../components/Pagination";

export interface ViewCalculationResultsProps {
    calculation: CalculationSummary;
}

export interface ViewCalculationResultsRoute {
    calculationId: string
}

export function ViewCalculationResults({match}: RouteComponentProps<ViewCalculationResultsRoute>, props: ViewCalculationResultsProps) {

    document.title = "Calculation Results - Calculate Funding";
    const [singleFire, setSingleFire] = useState(false);

    const dispatch = useDispatch();
    const [autoExpand, setAutoExpand] = useState(false);
    const [filterProviderTypes, setProviderTypes] = useState<FacetValue[]>([]);
    const [filterProviderSubTypes, setProviderSubTypes] = useState<FacetValue[]>([]);
    const [filterResultsStatus, setResultsStatus] = useState([{
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

    const [calculationProviderSearchRequest, setcalculationProviderSearchRequest] = useState<CalculationProviderSearchRequestViewModel>(initialSearch);

    const calculationId = match.params.calculationId;
    let calculationSummary: ViewCalculationState = useSelector((state: AppState) => state.viewCalculationResults);
    let specificationResults: ViewSpecificationResultsState = useSelector((state: AppState) => state.viewSpecificationResults);
    let fundingStream: FundingStream = {
        name: "",
        id: ""
    };

    useEffect(() => {
        if (!singleFire && calculationSummary.providers.totalResults > 0) {
            setSingleFire(true);
        }
    }, [calculationSummary.providers.totalResults]);

    useEffect(() => {
        dispatch(getCalculationById(calculationId));

    }, [calculationId]);

    useEffect(() => {
        if (calculationSummary.calculation.specificationId !== "") {
            dispatch(getSpecificationSummary(calculationSummary.calculation.specificationId));
        }
    }, [calculationSummary.calculation.specificationId]);

    useEffect(() => {
        fundingStream = specificationResults.specification.fundingStreams[0];
    }, [specificationResults.specification.fundingStreams]);

    useEffect(() => {
        setcalculationProviderSearchRequest(prevState => {
            return {
                ...prevState,
                calculationValueType: calculationSummary.calculation.valueType,
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
        dispatch(getCalculationResults(calculationProviderSearchRequest));
    }, [calculationId]);

    useEffect(() => {
        if (calculationSummary.providers.facets.length > 0) {
            setProviderTypes(calculationSummary.providers.facets[5].facetValues);
            setProviderSubTypes(calculationSummary.providers.facets[6].facetValues);
            setLocalAuthority(calculationSummary.providers.facets[8].facetValues)
        }
    }, [singleFire]);


    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "View results",
            url: "/results"
        },
        {
            name: "Select specification",
            url: `/app/SelectSpecification`
        },
        {
            name: specificationResults.specification.name,
            url: `/app/ViewSpecification/${specificationResults.specification.id}`
        },
        {
            name: calculationSummary.calculation.name,
            url: null
        }
    ];

    function filterByProviderTypes(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = calculationProviderSearchRequest.providerType;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setcalculationProviderSearchRequest(prevState => {
            return {...prevState, providerType: filterUpdate}
        });
        dispatch(getCalculationResults(calculationProviderSearchRequest));
    }

    function filterByProviderSubTypes(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = calculationProviderSearchRequest.providerSubType;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setcalculationProviderSearchRequest(prevState => {
            return {...prevState, providerSubType: filterUpdate}
        });
        dispatch(getCalculationResults(calculationProviderSearchRequest));
    }

    function filterByResultStatus(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = calculationProviderSearchRequest.errorToggle;

        if (e.target.value === "With exceptions") {
            filterUpdate = "Errors";
        } else {
            filterUpdate = "";
        }

        setcalculationProviderSearchRequest(prevState => {
            return {...prevState, errorToggle: filterUpdate}
        });

        const request = calculationProviderSearchRequest;
        request.errorToggle = filterUpdate;
        dispatch(getCalculationResults(request));
    }

    function filterByLocalAuthority(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = calculationProviderSearchRequest.localAuthority;

        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setcalculationProviderSearchRequest(prevState => {
            return {...prevState, localAuthority: filterUpdate}
        });
        dispatch(getCalculationResults(calculationProviderSearchRequest));
    }

    function filterBySearchTerm(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = e.target.value;

        setcalculationProviderSearchRequest(prevState => {
            return {...prevState, searchTerm: filterUpdate}
        });

        dispatch(getCalculationResults(calculationProviderSearchRequest));
    }

    function clearFilters() {
        setcalculationProviderSearchRequest(initialSearch);
        // @ts-ignore
        document.getElementById("searchProviders").reset();
        dispatch(getCalculationResults(initialSearch));
    }

    function setPagination(e: number) {
        let request = calculationProviderSearchRequest;
        request.pageNumber = e;
        setcalculationProviderSearchRequest(prevState => {
            return {...prevState, pageNumber: e}
        });

        dispatch(getCalculationResults(request));
    }

    return <div>
        <Header/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h2 className="govuk-caption-xl">{specificationResults.specification.fundingPeriod.name}</h2>
                        <h1 className="govuk-heading-xl">{calculationSummary.calculation.name}</h1>
                        <h3 className="govuk-heading-m">{fundingStream.name}</h3>
                        <a href={`/calcs/edit${calculationSummary.calculation.calculationType}calculation/${calculationSummary.calculation.id}`}
                           role="button" className="govuk-button">
                            View calculation
                        </a>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third">
                        <form id="searchProviders">
                            <CollapsiblePanel title="Search" expanded={true}>
                                <fieldset className="govuk-fieldset">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" onChange={(e) => filterBySearchTerm(e)}/>
                                </fieldset>
                            </CollapsiblePanel>
                            <CollapsiblePanel title="Filter by provider type" expanded={false}>
                                <fieldset className="govuk-fieldset">
                                    <div className="govuk-checkboxes">
                                        {filterProviderTypes.map(pt =>
                                            <div className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`providerTypes-${pt.name}`}
                                                       name={`providerTypes-${pt.name}`}
                                                       type="checkbox" value={pt.name}
                                                       onChange={(e) => filterByProviderTypes(e)}/>
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
                                        {filterProviderSubTypes.map(pt =>
                                            <div className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`providerSubTypes-${pt.name}`}
                                                       name={`providerSubTypes-${pt.name}`}
                                                       type="checkbox" value={pt.name}
                                                       onChange={(e) => filterByProviderSubTypes(e)}/>
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
                                                       onChange={(e) => filterByResultStatus(e)}/>
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
                                        {filterLocalAuthority.map(pt =>
                                            <div className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`localAuthorities-${pt.name}`} name="localAuthorities"
                                                       type="checkbox" value={pt.name}
                                                       onChange={(e) => filterByLocalAuthority(e)}/>
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
                        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default "
                             hidden={calculationSummary.providers.totalResults === 0}>
                            <div className="govuk-accordion__controls">
                                <button type="button" className="govuk-accordion__open-all"
                                        onClick={() => setAutoExpand(!autoExpand)}>{autoExpand ? "Close" : "Open"} all<span
                                    className="govuk-visually-hidden"> sections</span></button>

                            </div>

                            {calculationSummary.providers.calculationProviderResults.map(cpr =>
                                <AccordianPanel id={cpr.id} expanded={false} title={cpr.providerName}
                                                subtitle={"Total value:"} boldSubtitle={cpr.calculationResultDisplay}
                                                key={cpr.id} autoExpand={autoExpand}>
                                    <div id={"accordion-default-content-" + cpr.id}
                                         className="govuk-accordion__section-content">
                                        <a className="govuk-link"
                                           href={"/results/ProviderTemplateCalculations?providerId=" + cpr.providerId + "&fundingPeriodId=" + specificationResults.specification.fundingPeriod.id + "&specificationProviderVersion=" + specificationResults.specification.providerVersionId}>View provider calculations</a>
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
                            )}


                        </div>
                        {calculationSummary.providers.totalResults === 0 && singleFire ?
                            <h2 className="govuk-heading-m">There are no results available</h2> : ""}
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                {calculationSummary.providers.totalResults > 0 ?
                                    <Pagination currentPage={calculationSummary.providers.pagerState.currentPage}
                                                lastPage={calculationSummary.providers.pagerState.lastPage}
                                                callback={setPagination}/> : ""}
                            </div>
                            <div className="govuk-grid-column-one-third">
                                <p className="govuk-body-s">Showing {calculationSummary.providers.startItemNumber} - {calculationSummary.providers.endItemNumber} of {calculationSummary.providers.totalResults}</p>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}