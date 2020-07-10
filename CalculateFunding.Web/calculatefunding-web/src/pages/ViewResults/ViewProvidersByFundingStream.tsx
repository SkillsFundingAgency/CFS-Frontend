import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Link, RouteComponentProps} from "react-router-dom";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {LoadingStatus} from "../../components/LoadingStatus";
import {SearchMode} from "../../types/SearchMode";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {GetProvidersByFundingStreamService} from "../../services/providerService";
import {
    PagedProviderVersionSearchResults,
    ProviderVersionSearchModel,
} from "../../types/Provider/ProviderVersionSearchResults";
import Pagination from "../../components/Pagination";
import {FacetValue} from "../../types/Facet";
import {BackToTop} from "../../components/BackToTop";
import {DateFormatter} from "../../components/DateFormatter";
import {NoData} from "../../components/NoData";
export interface ViewProvidersByFundingStreamRouteProps {
    fundingStreamId: string;
}

export function ViewProvidersByFundingStream({match}: RouteComponentProps<ViewProvidersByFundingStreamRouteProps>) {
    const initialSearchRequest: ProviderVersionSearchModel = {
        pageNumber: 1,
        top: 100,
        searchTerm: "",
        errorToggle: null,
        orderBy: null,
        filters: {"": [""]},
        includeFacets: true,
        facetCount: 100,
        countOnly: false,
        searchMode: SearchMode.All,
        searchFields: null,
        overrideFacetFields: null
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
    const [filterProviderType, setFilterProviderType] = useState<FacetValue[]>([]);
    const [resultsProviderType, setResultsProviderType] = useState<FacetValue[]>([]);
    const [filterProviderSubType, setFilterProviderSubType] = useState<FacetValue[]>([]);
    const [resultsProviderSubType, setResultsProviderSubType] = useState<FacetValue[]>([]);
    const [filterLocalAuthority, setFilterLocalAuthority] = useState<FacetValue[]>([]);
    const [resultsLocalAuthority, setResultsLocalAuthority] = useState<FacetValue[]>([]);

    useEffectOnce(() => {
        setIsLoading(true);
        GetProvidersByFundingStream(initialSearchRequest);
    });

    useEffect(()=>{
        GetProvidersByFundingStream(searchRequest);
    }, [searchRequest]);

    function GetProvidersByFundingStream(searchModel: ProviderVersionSearchModel)
    {
        GetProvidersByFundingStreamService(match.params.fundingStreamId, searchModel).then( (response)=>{
            if (response.status === 200 || response.status === 201) {
                const result = response.data as PagedProviderVersionSearchResults;
                setProviderVersionSearchResults(result);

                if (result.facets.length >= 3 && resultsProviderType.length === 0)
                {
                    setResultsProviderType(result.facets[0].facetValues);
                    setFilterProviderType(result.facets[0].facetValues);

                    setFilterProviderSubType(result.facets[1].facetValues);
                    setResultsProviderSubType(result.facets[1].facetValues);

                    setFilterLocalAuthority(result.facets[2].facetValues);
                    setResultsLocalAuthority(result.facets[2].facetValues);
                }

                setIsLoading(false);
            }
        }).catch((er) => {
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

    function searchText(e: React.ChangeEvent<HTMLInputElement>) {
        const term = e.target.value;
        if (term.length > 3) {
            setSearchRequest(prevState => {
                return {...prevState, searchTerm: term}
            });
        }
        if (term.length === 0)
        {
            setSearchRequest(prevState => {
                return {...prevState, searchTerm: ""}
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
        let filters: [""] = (searchRequest.filters[filterKey] != undefined) ? searchRequest.filters[filterKey] : [];
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
        let newFiltersValue = {};
        newFiltersValue[filterKey] = filters;
        setSearchRequest(prevState => {
            return {...prevState, filters: newFiltersValue, pageNumber: 1}
        });
    }

    function filterSearch(keywords: string, originalFilters: FacetValue[], currentFilters: FacetValue[])
    {
        if (keywords.length >= 3) {
            const copyOfFilters: FacetValue[] = originalFilters as FacetValue[];
            return copyOfFilters.filter(x => x.name.toLowerCase().includes(keywords.toLowerCase()));
        }
        if (keywords.length === 0)
        {
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
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"View results"} url={"/results"} />
                    <Breadcrumb name={"Funding stream"} url={"/viewresults/viewprovidersfundingstreamselection"} />
                    <Breadcrumb name={"View provider results"} />
                </Breadcrumbs>
                <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">View provider results</h1>
                <span className="govuk-caption-m">Funding stream</span>
                <h3 className="govuk-heading-m">General annual grant</h3>
                </div>
            </div>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
                <form id="searchProviders">
                    <CollapsiblePanel title={"Search"} expanded={true}>
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-form-group">
                                <label className="govuk-label filterLabel" htmlFor="filter-by-type">
                                    Search
                                </label>
                                <input className="govuk-input filterSearchInput govuk-!-margin-bottom-2" id="mainContentSearch" autoComplete="off" name="search" type="text" onChange={(e) => searchText(e)}/>
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
                <LoadingStatus title={"Loading providers"} hidden={!isLoading}/>
                <NoData hidden={providerVersionSearchResults.items.length === 0 || isLoading} />
                {
                    providerVersionSearchResults.items.map(providerVersionSearchResult =>
                        <div key={`provider-${providerVersionSearchResult.id}`} className="providerResults-details">
                            <h3 className="govuk-heading-m">
                                <Link to={`/results/${providerVersionSearchResult.id}`}>{providerVersionSearchResult.name}</Link>
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
                            <p className="govuk-body-s govuk-!-margin-bottom-3">Provider type: <strong>{providerVersionSearchResult.providerType}</strong>
                            </p>
                            <p className="govuk-body-s govuk-!-margin-bottom-3">Provider subtype: <strong>{providerVersionSearchResult.providerSubType}</strong></p>

                            <p className="govuk-body-s govuk-!-margin-bottom-3">
                                <span>Local authority: <strong>{providerVersionSearchResult.authority}</strong></span>
                                <span>Date opened:
                                    <strong>
                                        {
                                            ((providerVersionSearchResult.dateOpened == null)?
                                            " Unknown"
                                            : <DateFormatter date={providerVersionSearchResult.dateOpened} utc={true}/>
                                        )}
                                    </strong>
                                </span>
                            </p>
                            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                        </div>
                    )
                }
                <BackToTop id="top" />
                <nav hidden={isLoading} className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation"
                     aria-label="Pagination">
                    <div className="pagination__summary">Showing {providerVersionSearchResults.startItemNumber} - {providerVersionSearchResults.endItemNumber} of {providerVersionSearchResults.totalCount} results</div>
                    <Pagination currentPage={providerVersionSearchResults.pagerState.currentPage} lastPage={providerVersionSearchResults.pagerState.lastPage} callback={pageChange}/>
                </nav>
            </div>
        </div>
        </div>
    </div>
}