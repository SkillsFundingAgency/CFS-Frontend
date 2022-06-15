import React, { useState } from "react";
import { Link } from "react-router-dom";

import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { CollapsiblePanel } from "../../components/CollapsiblePanel";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatus } from "../../components/LoadingStatus";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NoData } from "../../components/NoData";
import { TableNavBottom } from "../../components/TableNavBottom";
import { Title } from "../../components/Title";
import { convertToSlug } from "../../helpers/stringHelper";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { useErrors } from "../../hooks/useErrors";
import { searchDatasetService } from "../../services/datasetService";
import { DatasetSearchRequestViewModel } from "../../types/Datasets/DatasetSearchRequestViewModel";
import { DatasetSearchResponseViewModel } from "../../types/Datasets/DatasetSearchResponseViewModel";
import { FacetValue } from "../../types/Facet";
import { SearchMode } from "../../types/SearchMode";
import { Section } from "../../types/Sections";

export function ManageDataSourceFiles() {
    const initialSearch: DatasetSearchRequestViewModel = {
        errorToggle: "",
        facetCount: 100,
        filters: [],
        includeFacets: true,
        pageNumber: 1,
        pageSize: 50,
        searchMode: SearchMode.All,
        searchTerm: "",
        fundingStreams: [],
        dataSchemas: [],
    };

    const [searchResults, setSearchResults] = useState<DatasetSearchResponseViewModel>({
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
            currentPage: 0,
        },
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchRequest, setSearchRequest] = useState<DatasetSearchRequestViewModel>(initialSearch);
    const [filterFundingStreams, setFilterFundingStreams] = useState<FacetValue[]>([]);
    const [filterDataSchemas, setFilterDataSchemas] = useState<FacetValue[]>([]);
    const { errors, addError } = useErrors();

    const getDataSchemaFacets = (results: DatasetSearchResponseViewModel): FacetValue[] =>
        results.facets.find((f) => f.name === "definitionName")?.facetValues ?? [];
    const getFundingStreamFacets = (results: DatasetSearchResponseViewModel): FacetValue[] =>
        results.facets.find((f) => f.name === "fundingStreamName")?.facetValues ?? [];

    const searchDataSourceFiles = async (searchRequestViewModel: DatasetSearchRequestViewModel) => {
        setIsLoading(true);

        try {
            const response = await searchDatasetService(searchRequestViewModel);
            setSearchResults(response.data);

            if (filterFundingStreams.length === 0) {
                setFilterFundingStreams(getFundingStreamFacets(response.data));
            }

            if (filterDataSchemas.length === 0) {
                setFilterDataSchemas(getDataSchemaFacets(response.data));
            }
        } catch (err: any) {
            addError({ error: err, description: "Error while searching datasets" });
        } finally {
            setIsLoading(false);
        }
    };

    const setPagination = async (page: number) => {
        const request = searchRequest;
        request.pageNumber = page;
        setSearchRequest((prevState) => {
            return { ...prevState, pageNumber: page };
        });

        await searchDataSourceFiles(request);
    };

    const searchText = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;

        if ((term.length === 0 && searchRequest.searchTerm.length !== 0) || term.length > 2) {
            const request = searchRequest;
            request.searchTerm = term;
            request.pageNumber = 1;
            setSearchRequest((prevState) => {
                return { ...prevState, searchTerm: term, pageNumber: 1 };
            });

            await searchDataSourceFiles(request);
        }
    };

    const filterByDataSchema = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const filterUpdate = searchRequest.dataSchemas;
        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchRequest((prevState) => {
            return { ...prevState, dataSchemas: filterUpdate, pageNumber: 1 };
        });

        const request = searchRequest;
        request.dataSchemas = filterUpdate;
        request.pageNumber = 1;

        await searchDataSourceFiles(request);
    };

    const filterByFundingStreams = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const filterUpdate = searchRequest.fundingStreams;
        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchRequest((prevState) => {
            return { ...prevState, fundingStreams: filterUpdate, pageNumber: 1 };
        });

        const request = searchRequest;
        request.fundingStreams = filterUpdate;
        request.pageNumber = 1;

        await searchDataSourceFiles(request);
    };

    function searchFundingStreams(e: React.ChangeEvent<HTMLInputElement>) {
        const searchText = e.target.value;
        setFilterFundingStreams(
            searchText.trim().length === 0
                ? getFundingStreamFacets(searchResults)
                : getFundingStreamFacets(searchResults).filter((x) =>
                    x.name.toLowerCase().includes(searchText.toLowerCase())
                )
        );
    }

    function searchDataSchemas(e: React.ChangeEvent<HTMLInputElement>) {
        const searchText = e.target.value;
        setFilterDataSchemas(
            searchText.trim().length === 0
                ? getDataSchemaFacets(searchResults)
                : getDataSchemaFacets(searchResults).filter((x) =>
                    x.name.toLowerCase().includes(searchText.toLowerCase())
                )
        );
    }

    function clearFilters() {
        // @ts-ignore
        document.getElementById("searchDatasources").reset();
        setSearchRequest(initialSearch);
        searchDataSourceFiles(initialSearch);
    }

    useEffectOnce(() => {
        searchDataSourceFiles(searchRequest);
    });

    return (
        <Main location={Section.Datasets}>
            <Breadcrumbs>
                <Breadcrumb name="Home" url="/"/>
                <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
            </Breadcrumbs>
            <MultipleErrorSummary errors={errors}/>
            <Title title={"Manage data source files"} titleCaption={"Upload new or updated data source files"}/>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <Link
                        to="/Datasets/LoadNewDataSource"
                        className="govuk-button govuk-button--primary button-createSpecification"
                        data-module="govuk-button"
                    >
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
                        <CollapsiblePanel title={"Search"} isExpanded={true}>
                            <label className="govuk-label filterLabel" htmlFor="filter-by-type">
                                Search
                            </label>
                            <input
                                className="govuk-input filterSearchInput govuk-!-margin-bottom-2"
                                id="mainContentSearch"
                                autoComplete="off"
                                name="search"
                                type="text"
                                onChange={searchText}
                            />
                        </CollapsiblePanel>

                        <CollapsiblePanel
                            title={"Filter by funding stream"}
                            isExpanded={true}
                            isCollapsible={true}
                            showFacetCount={true}
                            facetCount={searchRequest.fundingStreams.length}
                        >
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text" onChange={searchFundingStreams}/>
                                </div>
                                <div className="govuk-checkboxes govuk-scroll-window">
                                    {filterFundingStreams.map((stream, index) => (
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input
                                                className="govuk-checkboxes__input"
                                                id={`funding-streams-${stream.name}`}
                                                name={`funding-streams-${stream.name}`}
                                                type="checkbox"
                                                value={stream.name}
                                                onChange={filterByFundingStreams}
                                            />
                                            <label
                                                className="govuk-label govuk-checkboxes__label"
                                                htmlFor={`funding-streams-${stream.name}`}
                                            >
                                                {stream.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
                        </CollapsiblePanel>

                        <CollapsiblePanel
                            title={"Filter by data schema"}
                            isExpanded={false}
                            isCollapsible={true}
                            showFacetCount={true}
                            facetCount={searchRequest.dataSchemas.length}
                        >
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text" onChange={searchDataSchemas}/>
                                </div>
                                <div className="govuk-checkboxes govuk-scroll-window">
                                    {filterDataSchemas.map((schema, index) => (
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input
                                                className="govuk-checkboxes__input"
                                                id={`data-schemas-${schema.name}`}
                                                name={`data-schemas-${schema.name}`}
                                                type="checkbox"
                                                value={schema.name}
                                                onChange={filterByDataSchema}
                                            />
                                            <label
                                                className="govuk-label govuk-checkboxes__label"
                                                htmlFor={`data-schemas-${schema.name}`}
                                            >
                                                {schema.name}
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
                    <LoadingStatusNotifier notifications={[
                        {
                            title: "Loading data source file results",
                            isActive: isLoading
                        }
                    ]}/>
                    {!isLoading ? (searchResults.datasets.length > 0) ?
                        <table className="govuk-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header govuk-!-width-one-half">
                                    Data source
                                </th>
                                <th scope="col" className="govuk-table__header">
                                    Last updated
                                </th>
                                <th scope="col" className="govuk-table__header">
                                    Download
                                </th>
                            </tr>
                            </thead>

                            <tbody className="govuk-table__body" id="mainContentResults">
                            {searchResults.datasets.map((ds) => (
                                <tr className="govuk-table__row" key={ds.id}>
                                    <th scope="row" className="govuk-table__header">
                                        <Link className="govuk-link" to={`UpdateDataSourceFile/${ds.fundingStreamId}/${ds.id}`}>
                                            {ds.name}
                                        </Link>

                                        <div className="govuk-!-margin-top-4">
                                            <details className="govuk-details govuk-!-margin-top-0" data-module="govuk-details">
                                                <summary className="govuk-details__summary">
                                                    <span className="govuk-details__summary-text">Data source details</span>
                                                </summary>
                                                <div className="govuk-details__text">
                                                    <p className="govuk-body-s">
                                                        <strong>Data schema:</strong> {ds.definitionName}
                                                    </p>
                                                    <p className="govuk-body-s">
                                                        <strong>Data schema description:</strong> {ds.description}
                                                    </p>
                                                    <p className="govuk-body-s">
                                                        <strong>Data source version:</strong> {ds.version}
                                                    </p>
                                                    <p className="govuk-body-s">
                                                        <strong>Last updated by:</strong> {ds.lastUpdatedByName}
                                                    </p>
                                                    <p className="govuk-body-s">
                                                        <strong>Change note for this version:</strong> {ds.changeNote}
                                                    </p>
                                                    <p className="govuk-body-s">
                                                        <Link className="govuk-link" to={`/Datasets/DatasetHistory/${ds.id}`}>
                                                            View all versions
                                                        </Link>
                                                    </p>
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
                                                {ds.definitionName && (
                                                    <a
                                                        className="govuk-link"
                                                        target="_self"
                                                        href={`/api/datasets/download-dataset-file/${ds?.id}`}
                                                    >
                                                        {`${convertToSlug(ds.definitionName || "")}.xlsx`}
                                                    </a>
                                                )}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table> :
                        <NoData hidden={isLoading}/> : <></>
                    }
                    <BackToTop id={"top"}/>
                    {searchResults.totalResults > 0 && (
                        <TableNavBottom
                            totalCount={searchResults.totalResults}
                            startItemNumber={searchResults.startItemNumber}
                            endItemNumber={searchResults.endItemNumber}
                            currentPage={searchResults.pagerState.currentPage}
                            lastPage={searchResults.pagerState.lastPage}
                            onPageChange={setPagination}/>
                    )}
                </div>
            </div>
        </Main>
    );
}
