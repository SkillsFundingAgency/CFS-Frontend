import React, { useCallback, useEffect, useState } from "react";
import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { DownloadDataSchemaSearchFilters } from "../../components/Datasets/DownloadDataSchemaSearchFilters";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NoData } from "../../components/NoData";
import { TableNavBottom } from "../../components/TableNavBottom";
import { Title } from "../../components/Title";
import { useErrors } from "../../hooks/useErrors";
import { searchDatasetDefinitionsService } from "../../services/datasetService";
import { DatasetDefinitionRequestViewModel } from "../../types/Datasets/DatasetDefinitionRequestViewModel";
import { DatasetDefinitionResponseViewModel } from "../../types/Datasets/DatasetDefinitionResponseViewModel";
import { SearchMode } from "../../types/SearchMode";
import { Section } from "../../types/Sections";
import { SearchFacetValue } from "../../types/TemplateBuilderDefinitions";

export function DownloadDataSchema() {
    const [datasetDefinitionsResults, setDatasetDefinitionsResults] = useState<DatasetDefinitionResponseViewModel>({
        currentPage: 0,
        datasetDefinitions: [],
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

    const initialSearch: DatasetDefinitionRequestViewModel = {
        errorToggle: "",
        facetCount: 10,
        filters: { "": [""] },
        includeFacets: true,
        pageNumber: 1,
        pageSize: 50,
        searchMode: SearchMode.All,
        searchTerm: "",
    };
    const [searchCriteria, setSearchCriteria] = useState<DatasetDefinitionRequestViewModel>(initialSearch);     
    const initialFacets: SearchFacetValue[] = [];
    const [fundingStreamFacets, setFundingStreamFacets] = useState<SearchFacetValue[]>(initialFacets);
    const [initialFundingStreams, setInitialFundingStreams] = useState<SearchFacetValue[]>(initialFacets);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { errors, addError, clearErrorMessages } = useErrors();
    let filters: string[] =
    searchCriteria.filters["fundingStreamName"] != undefined ? searchCriteria.filters["fundingStreamName"] : [];    

    const addFundingStreamFilter = useCallback((fundingStream: string) => {
        
        if (filters.indexOf(fundingStream) === -1) {
            filters.push(fundingStream);
            const newFiltersValue: any = {};
            newFiltersValue["fundingStreamName"] = filters;
            setSearchCriteria((prevState) => {
                return { ...prevState, filters: newFiltersValue, pageNumber: 1 };
            });
        }

      }, []);

      const removeFundingStreamFilter = useCallback((fundingStream: string) => {             
        const index = filters.indexOf(fundingStream);
        if (index !== -1) {
            filters.splice(index, 1);
            if (filters.length === 0) {
                setSearchCriteria((prevState) => {
                    return { ...prevState, filters: initialSearch.filters, pageNumber: 1 };
                });
            } else {
                const newFiltersValue: any = {};
                newFiltersValue["fundingStreamName"] = filters;
                setSearchCriteria((prevState) => {
                    return { ...prevState, filters: newFiltersValue, pageNumber: 1 };
                });
            }
        }     
      }, []);

      const filterBySearchTerm = useCallback((searchText: string) => {
        if (
          searchText.length === 0 ||
          searchText.length > 1 ||
          (searchText.length && searchCriteria.searchTerm.length !== 0)
        ) {
          setSearchCriteria((prevState) => {
            return { ...prevState, searchTerm: searchText };
          });
        }
      }, []);

      const clearFilters = useCallback(() => {
        // @ts-ignore
        document.getElementById("searchDatasources").reset();   
        filters.splice(0,filters.length);  
        setFundingStreamFacets(initialFundingStreams);         
        setSearchCriteria(initialSearch);
      }, [initialFundingStreams, initialSearch]);

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

      const movePage = (pageNumber: number) => {
       
        setSearchCriteria((prevState) => {
          return {
            ...prevState,
            pageNumber: pageNumber
          };
        });
      };

      useEffect(() => {
        const populateDownloadDataSchemas = async (criteria: DatasetDefinitionRequestViewModel) => {
          setIsLoading(true);
          try {
            clearErrorMessages();
            const results = (await searchDatasetDefinitionsService(criteria)).data;
            if (!results) {
              addError({ error: "Unexpected error occured whilst looking up dataset definitions" });
              return;
            }
            setDatasetDefinitionsResults(results);
            if (results.facets.length >= 2) {
              setFundingStreamFacets(results.facets[2].facetValues);
              setInitialFundingStreams(results.facets[2].facetValues);             
            }
          } catch (e: any) {
            addError({ error: e, description: "Unexpected error occured" });
          } finally {
            setIsLoading(false);
          }
        };
    
        if (searchCriteria) {
            populateDownloadDataSchemas(searchCriteria);
        }
      }, [searchCriteria]);

    return (
        <Main location={Section.Datasets}>
            <Breadcrumbs>
                <Breadcrumb name="Home" url="/"/>
                <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
            </Breadcrumbs>
            <MultipleErrorSummary errors={errors}/>
            <Title
                title="Download data schemas"
                titleCaption="Download the data schemas for data source files and datasets"
            />
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third position-sticky">
                <DownloadDataSchemaSearchFilters
                    searchCriteria={searchCriteria}
                    initialSearch={initialSearch}
                    filterBySearchTerm={filterBySearchTerm}
                    addFundingStreamFilter={addFundingStreamFilter}
                    removeFundingStreamFilter={removeFundingStreamFilter}   
                    filterByFundingStreams={filterByFundingStreams}                 
                    fundingStreamFacets={fundingStreamFacets}     
                    clearFilters={clearFilters}
                />                
                </div>
                <div className="govuk-grid-column-two-thirds">
                    <LoadingStatusNotifier notifications={
                        [
                            {
                                title: "Loading data schema",
                                isActive: isLoading
                            }
                        ]}/>
                    {!isLoading ? (datasetDefinitionsResults.totalResults > 0) ?
                        <table className="govuk-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header">
                                    Data schema template
                                </th>
                                <th scope="col" className="govuk-table__header text-stretch">
                                    Last updated
                                </th>
                                <th scope="col" className="govuk-table__header">
                                    Download
                                </th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body">
                            {datasetDefinitionsResults.datasetDefinitions.map((d, index) => (
                                <tr className="govuk-table__row" key={index}>
                                    <th scope="row" className="govuk-table__header">
                                        <p>{d.name}</p>
                                        <div className="govuk-!-margin-top-2">
                                            <details className="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
                                                <summary className="govuk-details__summary">
                                                    <span className="govuk-details__summary-text">Data schema description</span>
                                                </summary>
                                                <div className="govuk-details__text">
                                                    <p>
                                                        <strong>Provider identifier:</strong> {d.providerIdentifier}
                                                    </p>
                                                    <p>
                                                        <strong>Description:</strong> {d.description}
                                                    </p>
                                                </div>
                                            </details>
                                        </div>
                                    </th>
                                    <td className="govuk-table__cell">
                                        <DateTimeFormatter date={d.lastUpdatedDate}/>
                                    </td>
                                    <td className="govuk-table__cell">
                                        <p className="govuk-body-s">
                                            <a
                                                className="govuk-link"
                                                target="_self"
                                                href={`/api/datasets/download-dataset-schema/${d.id}`}
                                            >
                                                {d.name}.xlsx
                                            </a>
                                        </p>
                                    </td>
                                    <td className="govuk-table__cell"></td>
                                </tr>
                            ))}
                            </tbody>
                        </table> :
                        <NoData/> : <></>
                    }
                    <BackToTop id={"top"}/>
                    {(!isLoading || datasetDefinitionsResults.totalResults > 0) && (
                        <TableNavBottom
                            totalCount={datasetDefinitionsResults.totalResults}
                            startItemNumber={datasetDefinitionsResults.startItemNumber}
                            endItemNumber={datasetDefinitionsResults.endItemNumber}
                            currentPage={datasetDefinitionsResults.currentPage}
                            lastPage={datasetDefinitionsResults.pagerState.lastPage}
                            onPageChange={movePage}/>
                    )}
                </div>
            </div>
        </Main>
    );
}