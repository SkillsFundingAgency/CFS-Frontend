import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { MapDataSourceFilesSearchFilters } from "../../components/Datasets/MapDataSourceFilesSearchFilters";
import { NoData } from "../../components/NoData";
import { TableNavBottom } from "../../components/TableNavBottom";
import { TextLink } from "../../components/TextLink";
import { Title } from "../../components/Title";
import { useErrors } from "../../hooks/useErrors";
import { searchDatasetRelationshipsService } from "../../services/datasetService";
import { DatasetDefinitionRequestViewModel } from "../../types/Datasets/DatasetDefinitionRequestViewModel";
import { SpecificationDatasourceRelationshipViewModel } from "../../types/Datasets/SpecificationDatasourceRelationshipViewModel";
import { SearchMode } from "../../types/SearchMode";
import { Section } from "../../types/Sections";
import { SearchFacetValue } from "types/TemplateBuilderDefinitions";
import { FacetValue } from "../../types/Facet";

export function MapDataSourceFiles() {
  const initialDatasetRelationships: SpecificationDatasourceRelationshipViewModel = {
    items: [
      {
        specificationId: "",
        specificationName: "",
        definitionRelationshipCount: 0,
        fundingStreamNames: [],
        fundingPeriodName: "",
        mapDatasetLastUpdated: null,
        totalMappedDataSets: 0,
      },
    ],
    totalCount: 0,
    startItemNumber: 0,
    endItemNumber: 0,
    pagerState: {
      currentPage: 0,
      displayNumberOfPages: 0,
      lastPage: 0,
      nextPage: 0,
      pages: [],
      previousPage: 0,
    },
  };
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
  const [fundingStreamFacets, setFundingStreamFacets] = useState<FacetValue[]>(initialFacets);
  const [initialFundingStreams, setInitialFundingStreams] = useState<FacetValue[]>(initialFacets);
  const [fundingPeriodFacets, setFundingPeriodFacets] = useState<FacetValue[]>(initialFacets);
  const [initialFundingPeriods, setInitialFundingPeriods] = useState<FacetValue[]>(initialFacets);
  const [datasetRelationships, setDatasetRelationships] =
    useState<SpecificationDatasourceRelationshipViewModel>(initialDatasetRelationships);
  const { errors, addError, clearErrorMessages } = useErrors();
  const [isLoading, setIsLoading] = useState<boolean>(false);  
  const filterOptions: string[] = ["fundingStreamNames", "fundingPeriodName"]
  let filters: any = [];
  for(let i=0; i<filterOptions.length; i++){
    filters[filterOptions[i]] =
    searchCriteria.filters[filterOptions[i]] != undefined ? searchCriteria.filters[filterOptions[i]] : [];
  }  

  function filterResults(filterKey: string, filterValue: string, enableFilter: boolean) {   
    let filtersValues: any = {}; 
    if(enableFilter) {     
      if (filters[filterKey].indexOf(filterValue) === -1) {
        filters[filterKey].push(filterValue);       
        filtersValues = getFilterValues();        
        setSearchCriteria((prevState) => {
            return { ...prevState, filters: filtersValues, pageNumber: 1 };
        });
      }
    } else {
      const index = filters[filterKey].indexOf(filterValue);         
      if (index !== -1) {
          filters[filterKey].splice(index, 1);               
          filtersValues = getFilterValues(); 
          setSearchCriteria((prevState) => {
            return { ...prevState, filters: (filtersValues == undefined || filtersValues.length === 0) ? initialSearch.filters : filtersValues, pageNumber: 1 };
          });        
      } else {
        setSearchCriteria((prevState) => {
          return { ...prevState, filters: initialSearch.filters, pageNumber: 1 };
        });
      }
    }    
  }

  const getFilterValues = function () {
    const newFiltersValue: any = {};       
    for(let i=0; i<filterOptions.length; i++){
      if(filters[filterOptions[i]].length != 0){
        newFiltersValue[filterOptions[i]] = filters[filterOptions[i]];
      }
    } 
    return newFiltersValue;
  }

  const addFundingStreamFilter = useCallback((fundingStream: string) => {
    filterResults("fundingStreamNames", fundingStream, true);
  }, []);
  
  const removeFundingStreamFilter = useCallback((fundingStream: string) => {    
    filterResults("fundingStreamNames", fundingStream, false);
  }, []);

  const addFundingPeriodFilter = useCallback((fundingPeriod: string) => { 
    filterResults("fundingPeriodName", fundingPeriod, true);
  }, []);

  const removeFundingPeriodFilter = useCallback((fundingPeriod: string) => {       
    filterResults("fundingPeriodName", fundingPeriod, false);
  }, []);

  const filterBySearchTerm = useCallback((searchText: string) => {
    if (
      searchText.length === 0 ||
      searchText.length > 1 ||
      (searchText.length && searchCriteria.searchTerm.length !== 0)
    ) {
      setSearchCriteria((prevState) => {
        return { ...prevState, searchTerm: searchText, pageNumber: 1 };
      });
    }
  }, []);

  const clearFilterValues = function() {
    for(let i=0; i<filterOptions.length; i++){
      filters[filterOptions[i]].splice(0,filters[filterOptions[i]].length);  
    }   
  }

  const clearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchDatasources").reset();   
    clearFilterValues();
    setFundingPeriodFacets(initialFundingPeriods);
    setFundingStreamFacets(initialFundingStreams);    
    setSearchCriteria(initialSearch);
  }, [initialFundingStreams, initialFundingPeriods, initialSearch]);  

  const filterByFundingPeriods = useCallback(
    (searchTerm: string) => {
      if (
        searchTerm.length === 0 ||
        searchTerm.length > 1
      ) {
        setFundingPeriodFacets(
          initialFundingPeriods.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
    },
    [initialFundingPeriods]
  );

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
        pageNumber: pageNumber,
      };
    });
  }; 

  useEffect(() => {
    const populateMapDataSourceFiles = async (criteria: DatasetDefinitionRequestViewModel) => {
      setIsLoading(true);
      try {
        clearErrorMessages();
        const resultset = (await searchDatasetRelationshipsService(criteria)).data;
        const results = resultset as SpecificationDatasourceRelationshipViewModel;
        if (!results) {
          addError({ error: "Unexpected error occured whilst looking up dataset relationships" });
          return;
        }
        setDatasetRelationships(results);      
        if(resultset.facets.length >= 2){         
          setFundingPeriodFacets(resultset.facets[0].facetValues);
          setInitialFundingPeriods(resultset.facets[0].facetValues);
          setFundingStreamFacets(resultset.facets[1].facetValues);
          setInitialFundingStreams(resultset.facets[1].facetValues);
        }       
      } catch (e: any) {
        addError({ error: e, description: "Unexpected error occured" });
      } finally {
        setIsLoading(false);
      }
    };

    if (searchCriteria) {
      populateMapDataSourceFiles(searchCriteria);
    }
  }, [searchCriteria]);


  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />
      <Title
        title={"Map data source files"}
        titleCaption={"Map data source files to data sets for a specification"}
      />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <MapDataSourceFilesSearchFilters
              searchCriteria={searchCriteria}
              initialSearch={initialSearch}
              filterBySearchTerm={filterBySearchTerm}
              addFundingStreamFilter={addFundingStreamFilter}
              removeFundingStreamFilter={removeFundingStreamFilter}
              addFundingPeriodFilter={addFundingPeriodFilter}
              removeFundingPeriodFilter={removeFundingPeriodFilter}              
              filterByFundingStreams={filterByFundingStreams}
              filterByFundingPeriods={filterByFundingPeriods}             
              fundingStreamFacets={fundingStreamFacets}
              fundingPeriodFacets={fundingPeriodFacets}
              clearFilters={clearFilters}
            />
        </div>

        <div className="govuk-grid-column-two-thirds">
          <LoadingStatus title={"Loading specifications"} hidden={!isLoading} />
          <NoData
            hidden={(datasetRelationships != null && datasetRelationships.items.length > 0) || isLoading}
          />
          <table className="govuk-table" hidden={isLoading || datasetRelationships.items.length === 0}>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header govuk-!-width-one-half">
                  Specification
                </th>
                <th scope="col" className="govuk-table__header"></th>
              </tr>
            </thead>
            <tbody className="govuk-table__body" id="mainContentResults">
              {datasetRelationships.items.map((dr, index) => (
                <tr className="govuk-table__row" key={index}>
                  <th scope="row" className="govuk-table__header">
                    <TextLink to={`/Datasets/DataRelationships/${dr.specificationId}`}>
                      {dr.specificationName}
                    </TextLink>
                    {dr.definitionRelationshipCount > 0 ? (
                      <p className="govuk-body govuk-!-margin-top-2">
                        {dr.totalMappedDataSets} of {dr.definitionRelationshipCount} data sets mapped for
                        specification
                      </p>
                    ) : (
                      <span>
                        <p className="govuk-body govuk-!-margin-top-2">
                          No data sets exist for specification
                        </p>
                        <p className="govuk-body-s">
                          <Link to={`/Datasets/CreateDataset/${dr.specificationId}`}>
                            Create new data set
                          </Link>
                        </p>
                      </span>
                    )}
                    {dr.definitionRelationshipCount > 0 && dr.mapDatasetLastUpdated != null ? (
                      <p className="govuk-body">
                        {" "}
                        Last mapped <DateTimeFormatter date={dr.mapDatasetLastUpdated} />
                      </p>
                    ) : null}
                  </th>
                  <td className="govuk-table__cell"></td>
                </tr>
              ))}
            </tbody>
          </table>
          <BackToTop id={"top"} />
          {!isLoading && datasetRelationships.totalCount > 0 && (
              <TableNavBottom totalCount={datasetRelationships.totalCount}
                              startItemNumber={datasetRelationships.startItemNumber}
                              endItemNumber={datasetRelationships.endItemNumber}
                              currentPage={datasetRelationships.pagerState.currentPage}
                              lastPage={datasetRelationships.pagerState.lastPage}
                              onPageChange={movePage} />
          )}
        </div>
      </div>
    </Main>
  );
}