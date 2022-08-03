import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { ManageDataSourceFilesSearchFilters } from "../../components/Datasets/ManageDataSourceFilesSearchFilters";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NoData } from "../../components/NoData";
import { TableNavBottom } from "../../components/TableNavBottom";
import { Title } from "../../components/Title";
import { convertToSlug } from "../../helpers/stringHelper";
import { useErrors } from "../../hooks/useErrors";
import { searchDatasetService } from "../../services/datasetService";
import { DatasetSearchRequestViewModel } from "../../types/Datasets/DatasetSearchRequestViewModel";
import { DatasetSearchResponseViewModel } from "../../types/Datasets/DatasetSearchResponseViewModel";
import { FacetValue } from "../../types/Facet";
import { SearchMode } from "../../types/SearchMode";
import { Section } from "../../types/Sections";

export function ManageDataSourceFiles() {
    const [manageDataSourceFilesResults, setManageDataSourceFilesSearchResults] = useState<DatasetSearchResponseViewModel>({
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
   
    const [searchCriteria, setSearchCriteria] = useState<DatasetSearchRequestViewModel>(initialSearch);
    const [fundingStreamFacets, setFundingStreamFacets] = useState<FacetValue[]>([]);
    const [dataSchemasFacets, setDataSchemasFacets] = useState<FacetValue[]>([]);    
    const [initialFundingStreams, setInitialFundingStreams] = useState<FacetValue[]>([]);
    const [initialDataSchemas, setInitialDataSchemas] = useState<FacetValue[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { errors, addError, clearErrorMessages } = useErrors();

    const addFundingStreamFilter = useCallback((fundingStream: string) => {
        setSearchCriteria((prevState) => {
            return {
              ...prevState,
              fundingStreams: [...prevState.fundingStreams.filter((fs) => fs !== fundingStream), fundingStream],
              pageNumber: 1
            };
          });
    }, []);

    const removeFundingStreamFilter = useCallback((fundingStream: string) => { 
        setSearchCriteria((prevState) => {
          return { ...prevState, fundingStreams: prevState.fundingStreams.filter((fs) => fs !== fundingStream),
            pageNumber: 1 };
        });
      
    }, []);

    const addDataSchemaFilter = useCallback(async (dataSchema: string) => {   
        setSearchCriteria((prevState) => {
            return {
              ...prevState,
              dataSchemas: [...prevState.dataSchemas.filter((fs) => fs !== dataSchema), dataSchema],
              pageNumber: 1
            };
        });
      }, []);
    
    const removeDataSchemaFilter = useCallback(async (dataSchema: string) => {   
        setSearchCriteria((prevState) => {
            return { ...prevState, dataSchemas: prevState.dataSchemas.filter((fs) => fs !== dataSchema),
                pageNumber: 1};
        });
    }, []);

    const filterByFundingStreams = useCallback(
    (searchTerm: string) => {
        if (
            searchTerm.length === 0 ||
            searchTerm.length > 1
          ) { 
            setFundingStreamFacets(
                initialFundingStreams.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
          }
        },
        [initialFundingStreams]
    );

    const filterByDataSchemas = useCallback(
    (searchTerm: string) => {
        if (
            searchTerm.length === 0 ||
            searchTerm.length > 1
          ) { 
            setDataSchemasFacets(
                initialDataSchemas.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
          }
        },
        [initialDataSchemas]
    );

    const movePage = (pageNumber: number) => {    
        setSearchCriteria((prevState) => {
            return {
            ...prevState,
            pageNumber: pageNumber
            };
        });
    };

    const clearFilters = useCallback(() => {
        // @ts-ignore
        document.getElementById("searchManageDatasources").reset();
        setSearchCriteria(initialSearch);
        setDataSchemasFacets(initialDataSchemas);
        setFundingStreamFacets(initialFundingStreams);
    }, [initialSearch, initialDataSchemas, initialFundingStreams]);

    const filterBySearchTerm = useCallback(async (searchText: string) => {
        if (
            searchText.length === 0 ||
            searchText.length > 1 ||
          (searchText.length && searchCriteria.searchTerm.length !== 0)
        ) {          
            setSearchCriteria((prevState) => {
                return { ...prevState, searchTerm: searchText, pageNumber: 1};
            });
        }
      }, []);

      useEffect(() => {
        const populateManageDataSourceFiles = async (criteria: DatasetSearchRequestViewModel) => {
          setIsLoading(true);
          try {
            clearErrorMessages();
            const results = (await searchDatasetService(criteria)).data;
            if (!results) {
              addError({ error: "Unexpected error occured whilst looking datasets" });
              return;
            }
            setManageDataSourceFilesSearchResults(results);
            if (results.facets.length >= 6) {
              setDataSchemasFacets(results.facets[2].facetValues);
              setInitialDataSchemas(results.facets[2].facetValues);
              setFundingStreamFacets(results.facets[5].facetValues);
              setInitialFundingStreams(results.facets[5].facetValues);             
            }
          } catch (e: any) {
            addError({ error: e, description: "Unexpected error occured" });
          } finally {
            setIsLoading(false);
          }
        };
    
        if (searchCriteria) {
            populateManageDataSourceFiles(searchCriteria);
        }
      }, [searchCriteria]);

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
                <div className="govuk-grid-column-one-third position-sticky">
                    <ManageDataSourceFilesSearchFilters
                        searchCriteria={searchCriteria}
                        initialSearch={initialSearch}
                        filterBySearchTerm={filterBySearchTerm}
                        addFundingStreamFilter={addFundingStreamFilter}
                        removeFundingStreamFilter={removeFundingStreamFilter}
                        addDataSchemaFilter={addDataSchemaFilter}
                        removeDataSchemaFilter={removeDataSchemaFilter}                     
                        filterByFundingStreams={filterByFundingStreams}
                        filterByDataSchemas={filterByDataSchemas}
                        fundingStreamFacets={fundingStreamFacets}
                        dataSchemaFacets={dataSchemasFacets}
                        clearFilters={clearFilters}
                    />                    
                </div>

                <div className="govuk-grid-column-two-thirds">
                    <LoadingStatusNotifier notifications={[
                        {
                            title: "Loading data source file results",
                            isActive: isLoading
                        }
                    ]}/>
                    {!isLoading ? (manageDataSourceFilesResults.datasets.length > 0) ?
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
                            {manageDataSourceFilesResults.datasets.map((ds) => (
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
                    {manageDataSourceFilesResults.totalResults > 0 && (
                        <TableNavBottom
                            totalCount={manageDataSourceFilesResults.totalResults}
                            startItemNumber={manageDataSourceFilesResults.startItemNumber}
                            endItemNumber={manageDataSourceFilesResults.endItemNumber}
                            currentPage={manageDataSourceFilesResults.pagerState.currentPage}
                            lastPage={manageDataSourceFilesResults.pagerState.lastPage}
                            onPageChange={movePage}/>
                    )}
                </div>
            </div>
        </Main>
    );
}
