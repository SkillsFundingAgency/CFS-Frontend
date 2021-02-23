import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Link, RouteComponentProps} from "react-router-dom";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {LoadingStatus} from "../../components/LoadingStatus";
import {SearchMode} from "../../types/SearchMode";
import {getProvidersByFundingStreamService} from "../../services/providerService";
import {
    PagedProviderVersionSearchResults,
    ProviderVersionSearchModel,
} from "../../types/Provider/ProviderVersionSearchResults";
import Pagination from "../../components/Pagination";
import {FacetValue} from "../../types/Facet";
import {BackToTop} from "../../components/BackToTop";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {NoData} from "../../components/NoData";
import {getFundingStreamByIdService} from "../../services/policyService";
import {FundingStream} from "../../types/viewFundingTypes";
import {Footer} from "../../components/Footer";
import {RadioSearch} from "./RadioSearch";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {CharacterRestrictions} from "../../types/CharacterRestrictions";

export interface ViewProvidersByFundingStreamRouteProps {
    fundingStreamId: string;
}

export function ViewProvidersByFundingStream({match}: RouteComponentProps<ViewProvidersByFundingStreamRouteProps>) {
    const initialSearchRequest: ProviderVersionSearchModel = {
        pageNumber: 1,
        top: 100,
        searchTerm: "",
        errorToggle: false,
        orderBy: [],
        filters: {},
        includeFacets: true,
        facetCount: 100,
        countOnly: false,
        searchMode: SearchMode.All,
        searchFields: [],
        overrideFacetFields: []
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
            currentPage: 0
        },
        startItemNumber: 0,
        totalCount: 0
    };
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchRequest, setSearchRequest] = useState<ProviderVersionSearchModel>(initialSearchRequest);
    const [providerVersionSearchResults, setProviderVersionSearchResults] = useState<PagedProviderVersionSearchResults>(initialProviderVersionSearchResults);
    const [fundingStreamName, setFundingStreamName] = useState<string>("");
    const [filterProviderType, setFilterProviderType] = useState<FacetValue[]>([]);
    const [resultsProviderType, setResultsProviderType] = useState<FacetValue[]>([]);
    const [filterProviderSubType, setFilterProviderSubType] = useState<FacetValue[]>([]);
    const [resultsProviderSubType, setResultsProviderSubType] = useState<FacetValue[]>([]);
    const [filterLocalAuthority, setFilterLocalAuthority] = useState<FacetValue[]>([]);
    const [resultsLocalAuthority, setResultsLocalAuthority] = useState<FacetValue[]>([]);
    const [searchType, setSearchType] = useState<string>();
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();

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
                    setFundingStreamName(fundingStream.name)
                }
            }
        });
        getProvidersByFundingStreamService(match.params.fundingStreamId, searchModel).then((response) => {
            if (response.status === 200 || response.status === 201) {
                const result = response.data as PagedProviderVersionSearchResults;
                setProviderVersionSearchResults(result);

                if (result.facets.length >= 3 && resultsProviderType.length === 0) {
                    setResultsProviderType(result.facets[0].facetValues);
                    setFilterProviderType(result.facets[0].facetValues);

                    setFilterProviderSubType(result.facets[1].facetValues);
                    setResultsProviderSubType(result.facets[1].facetValues);

                    setFilterLocalAuthority(result.facets[2].facetValues);
                    setResultsLocalAuthority(result.facets[2].facetValues);
                }

                setIsLoading(false);
            }
        }).catch((err) => {
            addErrorMessage(`A problem occurred while loading funding line structure: ${err}`);

            setIsLoading(false);
        });
    }

    function clearFilters() {
        // @ts-ignore
        document.getElementById("searchProviders").reset();
        setFilterProviderType(resultsProviderType);
        setFilterProviderSubType(resultsProviderSubType);
        setFilterLocalAuthority(resultsLocalAuthority);
        setSearchRequest(initialSearchRequest);
    }

    function searchText(searchType: string, searchText?: string) {
        const term = searchText;
        setSearchType(searchType);
        if (term !== null && term !== undefined && term.length > 3) {
            setSearchRequest(prevState => {
                return {...prevState, searchTerm: term, searchFields: [searchType]}
            });
        }
        if (term !== null && term !== undefined && term.length === 0) {
            setSearchRequest(prevState => {
                return {...prevState, searchTerm: "", searchFields: []}
            });
        }
    }

    function pageChange(pageNumber: string) {
        setSearchRequest(prevState => {
            return {...prevState, pageNumber: parseInt(pageNumber)}
        });
    }

    function filterByProviderType(e: React.ChangeEvent<HTMLInputElement>) {
        filterResults("providerType", e.target.value, e.target.checked);
    }

    function searchProviderTypeFilters(e: React.ChangeEvent<HTMLInputElement>) {
        setFilterProviderType(filterSearch(e.target.value, resultsProviderType, filterProviderType));
    }

    function filterByProviderSubType(e: React.ChangeEvent<HTMLInputElement>) {
        filterResults("providerSubType", e.target.value, e.target.checked);
    }

    function searchProviderSubTypeFilters(e: React.ChangeEvent<HTMLInputElement>) {
        setFilterProviderSubType(filterSearch(e.target.value, resultsProviderSubType, filterProviderSubType));
    }

    function filterByLocalAuthority(e: React.ChangeEvent<HTMLInputElement>) {
        filterResults("authority", e.target.value, e.target.checked);
    }

    function searchLocalAuthorityFilters(e: React.ChangeEvent<HTMLInputElement>) {
        setFilterLocalAuthority(filterSearch(e.target.value, resultsLocalAuthority, filterLocalAuthority));
    }

    function filterResults(filterKey: string, filterValue: string, enableFilter: boolean) {
        const filters: string [] = (searchRequest.filters[filterKey] !== undefined) ? searchRequest.filters[filterKey] : [];
        if (enableFilter) {
            if (filters.indexOf(filterValue) === -1) {
                filters.push(filterValue);
            }
        } else {
            const index = filters.indexOf(filterValue);
            if (index !== -1) {
                filters.splice(index, 1)
            }
        }
        const newFiltersValue: any = {};
        newFiltersValue[filterKey] = filters;
        setSearchRequest(prevState => {
            return {...prevState, filters: newFiltersValue, pageNumber: 1}
        });
    }

    function filterSearch(keywords: string, originalFilters: FacetValue[], currentFilters: FacetValue[]) {
        if (keywords.length >= 3) {
            const copyOfFilters: FacetValue[] = originalFilters as FacetValue[];
            return copyOfFilters.filter(x => x.name.toLowerCase().includes(keywords.toLowerCase()));
        }
        if (keywords.length === 0) {
            return resultsProviderType;
        }
        return currentFilters;
    }

    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <div className={"govuk-grid-row  govuk-!-margin-bottom-9"}>
                <div className={"govuk-grid-column-full"}>
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"View results"} url={"/results"}/>
                        <Breadcrumb name={"Funding stream"} url={"/viewresults/viewprovidersfundingstreamselection"}/>
                        <Breadcrumb name={"View provider results"}/>
                    </Breadcrumbs>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">View provider results</h1>
                    {
                        fundingStreamName !== "" ?
                            <span className="govuk-caption-m">Funding stream</span>
                            : null
                    }
                    <h3 className="govuk-heading-m">{fundingStreamName}</h3>
                </div>
            </div>
            <div className="grid-row">
                <div className="govuk-grid-column-full">
                    <MultipleErrorSummary errors={errors}/>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                    <form id="searchProviders">
                        <CollapsiblePanel title={"Search"} expanded={true}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <span className="govuk-caption-m govuk-!-margin-bottom-4">Select one option</span>
                                    <div className="radios">
                                        <RadioSearch text="Provider name" timeout={900} radioId={"provider-name"} characterRestrictions={CharacterRestrictions.AlphaNumeric}
                                                     radioName={"search-providers-radios"} searchType={"name"}
                                                     minimumChars={3} callback={searchText}
                                                     selectedSearchType={searchType}/>
                                        <RadioSearch text="UKPRN" timeout={900} radioId={"ukprn"} characterRestrictions={CharacterRestrictions.NumericOnly}
                                                     radioName={"search-providers-radios"} searchType={"ukprn"}
                                                     minimumChars={3}
                                                     maximumChars={8}
                                                     callback={searchText}
                                                     selectedSearchType={searchType}/>
                                        <RadioSearch text="UPIN" timeout={900} radioId={"upin"} characterRestrictions={CharacterRestrictions.NumericOnly}
                                                     radioName={"search-providers-radios"} searchType={"upin"}
                                                     minimumChars={3}
                                                     maximumChars={6}
                                                     callback={searchText}
                                                     selectedSearchType={searchType}/>
                                        <RadioSearch text="URN" timeout={900} radioId={"urn"} characterRestrictions={CharacterRestrictions.NumericOnly}
                                                     radioName={"search-providers-radios"} searchType={"urn"}
                                                     minimumChars={3}
                                                     maximumChars={6}
                                                     callback={searchText}
                                                     selectedSearchType={searchType}/>
                                    </div>
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by provider type"} expanded={true}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={(e) => searchProviderTypeFilters(e)}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterProviderType.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   key={`providerType-${s.name}`}
                                                   id={`providerType-${s.name}`}
                                                   name={`providerType-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={(e) => filterByProviderType(e)}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`providerType-${s.name}`}>
                                                {s.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by provider sub type"} expanded={true}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={(e) => searchProviderSubTypeFilters(e)}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterProviderSubType.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   key={`providerSubType-${s.name}`}
                                                   id={`providerSubType-${s.name}`}
                                                   name={`providerSubType-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={(e) => filterByProviderSubType(e)}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`providerType-${s.name}`}>
                                                {s.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by local authority (LA)"} expanded={true}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={(e) => searchLocalAuthorityFilters(e)}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterLocalAuthority.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   key={`authority-${s.name}`}
                                                   id={`authority-${s.name}`}
                                                   name={`authority-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={(e) => filterByLocalAuthority(e)}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`providerType-${s.name}`}>
                                                {s.name}
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
                    {(!isLoading) ?
                        providerVersionSearchResults.items.map(providerVersionSearchResult =>
                            <div key={`provider-${providerVersionSearchResult.id}`} className="providerResults-details">
                                <h3 className="govuk-heading-m">
                                    <Link
                                        to={`/ViewResults/ViewProviderResults/${providerVersionSearchResult.providerId}/${match.params.fundingStreamId}`}>{providerVersionSearchResult.name}</Link>
                                </h3>
                                <p className="govuk-body-s govuk-!-margin-bottom-3">
                                <span>UKPRN: <strong>
                                    {
                                        (providerVersionSearchResult.ukprn !== "") ?
                                            providerVersionSearchResult.ukprn
                                            : "No data found"
                                    }
                                </strong></span>
                                    <span>UPIN: <strong>
                                    {
                                        (providerVersionSearchResult.upin !== "") ?
                                            providerVersionSearchResult.upin
                                            : "No data found"
                                    }
                                </strong></span>
                                    <span>URN: <strong>
                                    {
                                        (providerVersionSearchResult.urn !== "") ?
                                            providerVersionSearchResult.urn
                                            : "No data found"
                                    }
                                </strong></span>
                                    <span>Establishment number: <strong>
                                    {
                                        (providerVersionSearchResult.establishmentNumber !== "") ?
                                            providerVersionSearchResult.establishmentNumber
                                            : "No data found"
                                    }
                                </strong></span>
                                </p>
                                <p className="govuk-body-s govuk-!-margin-bottom-3">Provider
                                    type: <strong>{providerVersionSearchResult.providerType}</strong>
                                </p>
                                <p className="govuk-body-s govuk-!-margin-bottom-3">Provider
                                    subtype: <strong>{providerVersionSearchResult.providerSubType}</strong></p>

                                <p className="govuk-body-s govuk-!-margin-bottom-3">
                                    <span>Local authority: <strong>{providerVersionSearchResult.authority}</strong></span>
                                    <span>Date opened:
                                    <strong>
                                        {
                                            ((providerVersionSearchResult.dateOpened == null) ?
                                                    " Unknown"
                                                    : <DateTimeFormatter date={providerVersionSearchResult.dateOpened}
                                                                     />
                                            )}
                                    </strong>
                                </span>
                                </p>
                                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                            </div>
                        ) : <LoadingStatus title={"Loading providers"}/>
                    }
                    <NoData hidden={providerVersionSearchResults.items.length > 0 || isLoading}/>
                    <BackToTop id="top"/>
                    {!isLoading && providerVersionSearchResults.totalCount > 0 &&
                    <nav className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation"
                         aria-label="Pagination">
                        <div
                            className="pagination__summary">Showing {providerVersionSearchResults.startItemNumber} - {providerVersionSearchResults.endItemNumber} of {providerVersionSearchResults.totalCount} results
                        </div>
                        <Pagination currentPage={providerVersionSearchResults.pagerState.currentPage}
                                    lastPage={providerVersionSearchResults.pagerState.lastPage} callback={pageChange}/>
                    </nav>}
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}