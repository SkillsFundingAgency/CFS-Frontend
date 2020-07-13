import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {searchDatasetRelationshipsService} from "../../services/datasetService";
import {SearchMode} from "../../types/SearchMode";
import Pagination from "../../components/Pagination";
import {LoadingStatus} from "../../components/LoadingStatus";
import {DatasetDefinitionRequestViewModel} from "../../types/Datasets/DatasetDefinitionRequestViewModel";
import {Link} from "react-router-dom";
import {SpecificationDatasourceRelationshipViewModel} from "../../types/Datasets/SpecificationDatasourceRelationshipViewModel";
import {BackToTop} from "../../components/BackToTop";

export function MapDataSourceFiles() {
    const initialSearchRequest: DatasetDefinitionRequestViewModel = {
        errorToggle: "",
        facetCount: 10,
        filters: {"": [""]},
        includeFacets: true,
        pageNumber: 1,
        pageSize: 50,
        searchMode: SearchMode.All,
        searchTerm: ""
    };
    const [searchRequest, setSearchRequest] = useState<DatasetDefinitionRequestViewModel>(initialSearchRequest);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const initialDatasetRelationships: SpecificationDatasourceRelationshipViewModel = {
        items: [{
            specificationId: "",
            specificationName: "",
            definitionRelationshipCount: 0,
            fundingStreamNames: [],
            fundingPeriodName: ""
        }],
        totalCount: 0,
        startItemNumber: 0,
        endItemNumber: 0,
        pagerState: {
            currentPage: 0,
            displayNumberOfPages:0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0
        }
    };

    const initialFacets: string[] = [""];
    const [filterFundingStreams, setFilterFundingStreams] = useState<string[]>([]);
    const [filterFundingStreamsInitialResult, setFilterFundingStreamsInitialResult] = useState<string[]>(initialFacets);
    const [filterFundingPeriods, setFilterFundingPeriods] = useState<string[]>([]);
    const [filterFundingPeriodsInitialResult, setFilterFundingPeriodsInitialResult] = useState<string[]>(initialFacets);
    const [datasetRelationships, setDatasetRelationships] = useState<SpecificationDatasourceRelationshipViewModel>(initialDatasetRelationships);

    useEffectOnce(() => {
        searchDatasetRelationships(searchRequest);
    });

    useEffect(()=>{
        searchDatasetRelationships(searchRequest);
    }, [searchRequest]);

    function searchDatasetRelationships(searchRequestViewModel: DatasetDefinitionRequestViewModel) {
        setIsLoading(true);
        searchDatasetRelationshipsService(searchRequestViewModel).then((response) => {
            if (response.status === 200 || response.status === 201) {
                const result = response.data as SpecificationDatasourceRelationshipViewModel;
                setDatasetRelationships(result);

                if (result.items.length > 0)
                {
                    const items = result.items;
                    let fundingStreamsResult: string[] = [];
                    items.map(item=> {
                        if (item.fundingStreamNames != null) {
                            item.fundingStreamNames.map(f=>{
                                fundingStreamsResult.push(f)
                            })
                        }
                    });
                    fundingStreamsResult = [...new Set(fundingStreamsResult)];
                    setFilterFundingStreamsInitialResult(fundingStreamsResult);
                    setFilterFundingStreams(fundingStreamsResult);

                    let fundingPeriodsResult: string[] = [];
                    items.map(item=> {
                        if (item.fundingPeriodName != null) {
                            fundingPeriodsResult.push(item.fundingPeriodName)
                        }
                    });
                    fundingPeriodsResult.filter((value, index, self) => {
                        return self.indexOf(value) === index;
                    });
                    fundingPeriodsResult = [...new Set(fundingPeriodsResult)];
                    setFilterFundingPeriodsInitialResult(fundingPeriodsResult);
                    setFilterFundingPeriods(fundingPeriodsResult);
                }
                setIsLoading(false);
            }
        }).catch((er) => {
            setIsLoading(false);
        });
    }

    function pageChange(pageNumber: string) {
        setSearchRequest(prevState => {
            return {...prevState, pageNumber: parseInt(pageNumber)}
        });
    }

    function clearFilters() {
        // @ts-ignore
        document.getElementById("searchDatasources").reset();
        setFilterFundingPeriods(filterFundingPeriodsInitialResult);
        setFilterFundingStreams(filterFundingStreamsInitialResult);
        setSearchRequest(initialSearchRequest);
    }

    function filterResults(filterKey: string, filterValue: string, enableFilter: boolean) {
        let filters: string [] = (searchRequest.filters[filterKey] != undefined) ? searchRequest.filters[filterKey] : [];
        if (enableFilter) {
            if (filters.indexOf(filterValue) === -1) {
                filters.push(filterValue);
                let newFiltersValue = {};
                newFiltersValue[filterKey] = filters;
                setSearchRequest(prevState => {
                    return {...prevState, filters: newFiltersValue, pageNumber: 1}
                });
            }
        } else {
            const index = filters.indexOf(filterValue);
            if (index !== -1) {
                filters.splice(index, 1)
                if (filters.length === 0)
                {
                    setSearchRequest(prevState => {
                        return {...prevState, filters: initialSearchRequest.filters, pageNumber: 1}
                    });
                }
                else
                {
                    let newFiltersValue = {};
                    newFiltersValue[filterKey] = filters;
                    setSearchRequest(prevState => {
                        return {...prevState, filters: newFiltersValue, pageNumber: 1}
                    });
                }
            }
        }
    }

    function filterSearch(keywords: string, originalFilters: string[], currentFilters: string[])
    {
        if (keywords.length >= 3) {
            const copyOfFilters: string[] = originalFilters as string[];
            return copyOfFilters.filter(x => x.toLowerCase().includes(keywords.toLowerCase()));
        }
        if (keywords.length === 0)
        {
            return originalFilters;
        }
        return currentFilters;
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

    function searchFundingStreamFilters(e: React.ChangeEvent<HTMLInputElement>) {
        setFilterFundingStreams(filterSearch(e.target.value, filterFundingStreamsInitialResult, filterFundingStreams));
    }
    function filterByFundingStream(e: React.ChangeEvent<HTMLInputElement>) {
        filterResults("fundingStreamNames", e.target.value, e.target.checked);
    }

    function searchFundingPeriodFilters(e: React.ChangeEvent<HTMLInputElement>) {
        setFilterFundingPeriods(filterSearch(e.target.value, filterFundingPeriodsInitialResult, filterFundingPeriods));
    }
    function filterByFundingPeriod(e: React.ChangeEvent<HTMLInputElement>) {
        filterResults("fundingPeriodName", e.target.value, e.target.checked);
    }

    return <div>
        <Header location={Section.Datasets}/>
        <div className="govuk-width-container">
            <div className="govuk-grid-row  govuk-!-margin-bottom-9">
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                        <Breadcrumb name={"Map data sources to data sets for a specification"}/>
                    </Breadcrumbs>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Map data source files</h1>
                    <span className="govuk-caption-xl">Map data source files to data sets for a specification</span>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                    <form id="searchDatasources">
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
                        <CollapsiblePanel title={"Filter by funding stream"} expanded={true}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={(e) => searchFundingStreamFilters(e)}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterFundingStreams.map((f, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   key={`fundingstream-${f}`}
                                                   id={`fundingstream-${f}`}
                                                   name={`fundingstream-${f}`}
                                                   type="checkbox" value={f}
                                                   onChange={(e) => filterByFundingStream(e)}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`fundingstream-${f}`}>
                                                {f}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by funding period"} expanded={true}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={(e) => searchFundingPeriodFilters(e)}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterFundingPeriods.map((f, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   key={`fundingperiod-${f}`}
                                                   id={`fundingperiod-${f}`}
                                                   name={`fundingperiod-${f}`}
                                                   type="checkbox" value={f}
                                                   onChange={(e) => filterByFundingPeriod(e)}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`fundingperiod-${f}`}>
                                                {f}
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
                    <LoadingStatus title={"Loading data source file results"} hidden={!isLoading}/>
                    <table className="govuk-table" hidden={isLoading}>
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th scope="col"
                                className="govuk-table__header govuk-!-width-one-half">Specification
                            </th>
                            <th scope="col" className="govuk-table__header"></th>
                        </tr>
                        </thead>
                        <tbody className="govuk-table__body" id="mainContentResults">
                        {datasetRelationships.items.map((dr, index) =>
                            <tr className="govuk-table__row" key={index}>
                                <th scope="row" className="govuk-table__header">
                                    <Link to={`/datasets/datarelationships/${dr.specificationId}`}>
                                        {dr.specificationName}
                                    </Link>
                                    <p className="govuk-body">{dr.definitionRelationshipCount > 0? dr.definitionRelationshipCount : "no" } datasets exist for specification</p>
                                </th>
                                <td className="govuk-table__cell"></td>

                            </tr>
                        )}
                        </tbody>
                    </table>
                    <p className="govuk-body govuk-body-m center-align"
                       hidden={(datasetRelationships != null && datasetRelationships.items.length > 0) || isLoading}>
                        There are no records to match your search
                    </p>
                    <BackToTop id={"top"} />
                    <nav hidden={isLoading} className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation"
                         aria-label="Pagination">
                        <div className="pagination__summary">Showing {datasetRelationships.startItemNumber} - {datasetRelationships.endItemNumber} of {datasetRelationships.totalCount} results</div>
                        <Pagination currentPage={datasetRelationships.pagerState.currentPage} lastPage={datasetRelationships.pagerState.lastPage} callback={pageChange}/>
                    </nav>
                </div>
            </div>
        </div>
    </div>
}