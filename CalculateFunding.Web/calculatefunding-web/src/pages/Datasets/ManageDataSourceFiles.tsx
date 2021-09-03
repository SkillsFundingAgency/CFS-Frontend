import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {searchDatasetService} from "../../services/datasetService";
import {SearchMode} from "../../types/SearchMode";
import {DatasetSearchResponseViewModel} from "../../types/Datasets/DatasetSearchResponseViewModel";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import Pagination from "../../components/Pagination";
import {DatasetSearchRequestViewModel} from "../../types/Datasets/DatasetSearchRequestViewModel";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {FacetValue} from "../../types/Facet";
import {NoData} from "../../components/NoData";
import {Footer} from "../../components/Footer";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";
import {convertToSlug, removeSpaces} from "../../helpers/stringHelper";

export function ManageDataSourceFiles() {
    const initialSearch: DatasetSearchRequestViewModel = {
        errorToggle: "",
        facetCount: 0,
        filters: [],
        includeFacets: true,
        pageNumber: 1,
        pageSize: 50,
        searchMode: SearchMode.All,
        searchTerm: "",
        fundingStreams: [],
        dataSchemas: []
    }

    const [datasetSearchData, setDatasetSearchData] = useState<DatasetSearchResponseViewModel>({
        currentPage: 0,
        datasets: [],
        endItemNumber: 0,
        facets: [],
        pagerState: {
            lastPage: 0,
            previousPage: 0,
            pages: [],
            nextPage: 0,
            displayNumberOfPages: 0,
            currentPage: 0
        },
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchRequest, setSearchRequest] = useState<DatasetSearchRequestViewModel>(initialSearch)
    const [filterFundingStreams, setFundingStreams] = useState<FacetValue[]>([]);
    const [filterDataSchemas, setDataSchema] = useState<FacetValue[]>([]);
    const {errors, addError} = useErrors();

    useEffectOnce(() => {
        searchDataSourceFiles(searchRequest);
    })

    function setPagination(e: number) {
        const request = searchRequest;
        request.pageNumber = e;
        setSearchRequest(prevState => {
            return {...prevState, pageNumber: e}
        });
        searchDataSourceFiles(request);
    }

    function searchDataSourceFiles(searchRequestViewModel: DatasetSearchRequestViewModel) {
        setIsLoading(true);
        searchDatasetService(searchRequestViewModel)
            .then((result) => {
                setDatasetSearchData(result.data);

                if (filterFundingStreams.length === 0) {
                    if (result.data.facets !== undefined && result.data.facets.length > 5) {
                        setFundingStreams(result.data.facets[5].facetValues)
                    }
                }

                if (filterDataSchemas.length === 0) {
                    if (result.data.facets !== undefined && result.data.facets.length > 2) {
                        setDataSchema(result.data.facets[2].facetValues)
                    }
                }
            })
            .catch(err => {
                addError({error: err, description: `Error while searching datasets`});
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    function searchText(e: React.ChangeEvent<HTMLInputElement>) {
        const term = e.target.value;

        if ((term.length === 0 && searchRequest.searchTerm.length !== 0) || term.length > 2) {
            const request = searchRequest;
            request.searchTerm = term;
            request.pageNumber = 1;
            setSearchRequest(prevState => {
                return {...prevState, searchTerm: term, pageNumber: 1}
            })
            searchDataSourceFiles(request);
        }
    }

    function filterByDataSchema(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = searchRequest.dataSchemas;
        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchRequest(prevState => {
            return {...prevState, dataSchemas: filterUpdate, pageNumber: 1}
        });

        const request = searchRequest;
        request.dataSchemas = filterUpdate;
        request.pageNumber = 1
        searchDataSourceFiles(request);
    }

    function filterByFundingStreams(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = searchRequest.fundingStreams;
        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchRequest(prevState => {
            return {...prevState, fundingStreams: filterUpdate, pageNumber: 1}
        });

        const request = searchRequest;
        request.fundingStreams = filterUpdate;
        request.pageNumber = 1;
        searchDataSourceFiles(request);
    }

    function clearFilters() {
        // @ts-ignore
        document.getElementById("searchDatasources").reset();
        setSearchRequest(initialSearch);
        searchDataSourceFiles(initialSearch);
    }

    return <div>
        <Header location={Section.Datasets}/>
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                        <Breadcrumb name={"Manage data source files"}/>
                    </Breadcrumbs>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Manage data source files</h1>
                    <span className="govuk-caption-xl">Upload new or updated data source files</span>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <MultipleErrorSummary errors={errors}/>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <Link to="/Datasets/LoadNewDataSource" id={"upload-dataset-link"}
                          className="govuk-button govuk-button--primary button-createSpecification"
                          data-module="govuk-button">
                        Upload a new data source
                    </Link>
                </div>
                <div className="govuk-grid-column-one-third">
                    <br/>
                    <div className="pagination__summary"></div>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                    <form id="searchDatasources">
                        <CollapsiblePanel title={"Search"} expanded={true}>
                            <label className="govuk-label filterLabel" htmlFor="filter-by-type">
                                Search
                            </label>
                            <input className="govuk-input filterSearchInput govuk-!-margin-bottom-2"
                                   id="mainContentSearch" autoComplete="off"
                                   name="search" type="text" onChange={(e) => searchText(e)}/>

                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by funding stream"} expanded={false}>
                            <div className="govuk-checkboxes">
                                {filterFundingStreams.map((fp, index) =>
                                    <div key={index} className="govuk-checkboxes__item">
                                        <input className="govuk-checkboxes__input"
                                               id={`fundingPeriods-${fp.name}`}
                                               name={`fundingPeriods-${fp.name}`}
                                               type="checkbox" value={fp.name}
                                               onChange={(e) => filterByFundingStreams(e)}/>
                                        <label className="govuk-label govuk-checkboxes__label"
                                               htmlFor={`fundingPeriods-${fp.name}`}>
                                            {fp.name}
                                        </label>
                                    </div>)
                                }
                            </div>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by data schema"} expanded={false}>
                            <div className="govuk-checkboxes">
                                {filterDataSchemas.map((fp, index) =>
                                    <div key={index} className="govuk-checkboxes__item">
                                        <input className="govuk-checkboxes__input"
                                               id={`fundingPeriods-${fp.name}`}
                                               name={`fundingPeriods-${fp.name}`}
                                               type="checkbox" value={fp.name}
                                               onChange={(e) => filterByDataSchema(e)}/>
                                        <label className="govuk-label govuk-checkboxes__label"
                                               htmlFor={`fundingPeriods-${fp.name}`}>
                                            {fp.name}
                                        </label>
                                    </div>)
                                }
                            </div>
                        </CollapsiblePanel>
                        <button type="button" className="govuk-button"
                                onClick={() => clearFilters()}>Clear filters
                        </button>
                    </form>
                </div>

                <div className="govuk-grid-column-two-thirds">
                    <LoadingStatus title={"Loading data source file results"} hidden={!isLoading}/>
                    <table className="govuk-table" hidden={isLoading || datasetSearchData.datasets.length < 1}>
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header govuk-!-width-one-half">Data source</th>
                            <th scope="col" className="govuk-table__header">Last updated</th>
                            <th scope="col" className="govuk-table__header">Download</th>
                        </tr>
                        </thead>

                        <tbody className="govuk-table__body" id="mainContentResults">
                        {datasetSearchData.datasets.map(ds =>
                                <tr className="govuk-table__row" key={ds.id}>
                                    <th scope="row" className="govuk-table__header">
                                        <Link className="govuk-link"
                                              to={`UpdateDataSourceFile/${ds.fundingStreamId}/${ds.id}`}>{ds.name}</Link>

                                        <div className="govuk-!-margin-top-4">
                                            <details className="govuk-details govuk-!-margin-top-0"
                                                     data-module="govuk-details">
                                                <summary className="govuk-details__summary">
                                                    <span className="govuk-details__summary-text">
                                                        Data source details
                      </span>
                                                </summary>
                                                <div className="govuk-details__text">
                                                    <p className="govuk-body-s"><strong>Data
                                                        schema:</strong> {ds.definitionName}</p>
                                                    <p className="govuk-body-s"><strong>Data schema
                                                        description:</strong> {ds.description}</p>
                                                    <p className="govuk-body-s"><strong>Data source
                                                        version:</strong> {ds.version}</p>
                                                    <p className="govuk-body-s"><strong>Last updated
                                                        by:</strong> {ds.lastUpdatedByName}</p>
                                                    <p className="govuk-body-s"><strong>Change note for this
                                                        version:</strong> {ds.changeNote}</p>
                                                    <p className="govuk-body-s"><Link className="govuk-link"
                                                                                      to={`/Datasets/DatasetHistory/${ds.id}`}>View
                                                        all versions</Link></p>
                                                </div>
                                            </details>
                                        </div>
                                    </th>
                                    <td className="govuk-table__cell">
                                        <DateTimeFormatter date={ds.lastUpdated}/>
                                    </td>
                                    <td className="govuk-table__cell">
                                        <div>
                                            <p className="govuk-body">
                                                {ds.definitionName &&
                                                <a className="govuk-link" target="_self"
                                                   href={`/api/datasets/download-dataset-file/${ds?.id}`}>
                                                    {`${convertToSlug(ds.definitionName || '')}.xlsx`}
                                                </a>
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                        )}
                        </tbody>
                    </table>
                    <NoData hidden={datasetSearchData.datasets.length > 0 || isLoading}/>
                    <div className="app-back-to-top app-back-to-top--fixed govuk-!-margin-top-9"
                         data-module="app-back-to-top">
                        <a className="govuk-link govuk-link--no-visited-state app-back-to-top__link" href="#top">
                            <svg role="presentation" focusable="false" className="app-back-to-top__icon"
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="13" height="17" viewBox="0 0 13 17">
                                <path fill="currentColor" d="M6.5 0L0 6.5 1.4 8l4-4v12.7h2V4l4.3 4L13 6.4z"></path>
                            </svg>
                            Back to top
                        </a>
                    </div>
                    {datasetSearchData.totalResults > 0 &&
                    <nav role="navigation" aria-label="Pagination">
                        <div
                            className="pagination__summary">Showing {datasetSearchData.startItemNumber} - {datasetSearchData.endItemNumber} of {datasetSearchData.totalResults} results
                        </div>
                        <Pagination currentPage={datasetSearchData.pagerState.currentPage}
                                    lastPage={datasetSearchData.pagerState.lastPage}
                                    callback={setPagination}/>
                    </nav>}
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}