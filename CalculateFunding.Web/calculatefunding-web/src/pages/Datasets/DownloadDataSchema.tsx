import React, { useEffect, useState } from "react";

import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { CollapsiblePanel } from "../../components/CollapsiblePanel";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NoData } from "../../components/NoData";
import { Pagination } from "../../components/Pagination";
import { Title } from "../../components/Title";
import { useErrors } from "../../hooks/useErrors";
import { searchDatasetDefinitionsService } from "../../services/datasetService";
import { DatasetDefinitionRequestViewModel } from "../../types/Datasets/DatasetDefinitionRequestViewModel";
import { DatasetDefinitionResponseViewModel } from "../../types/Datasets/DatasetDefinitionResponseViewModel";
import { SearchMode } from "../../types/SearchMode";
import { Section } from "../../types/Sections";
import { SearchFacetValue } from "../../types/TemplateBuilderDefinitions";

export function DownloadDataSchema() {
  const initialSearchRequest: DatasetDefinitionRequestViewModel = {
    errorToggle: "",
    facetCount: 10,
    filters: { "": [""] },
    includeFacets: true,
    pageNumber: 1,
    pageSize: 50,
    searchMode: SearchMode.All,
    searchTerm: "",
  };
  const [searchRequest, setSearchRequest] = useState<DatasetDefinitionRequestViewModel>(initialSearchRequest);
  const [datasetDefinitions, setDatasetDefinitions] = useState<DatasetDefinitionResponseViewModel>({
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const initialFacets: SearchFacetValue[] = [];
  const [filterFundingStreams, setFilterFundingStreams] = useState<SearchFacetValue[]>(initialFacets);
  const [filterFundingStreamsInitialResult, setFilterFundingStreamsInitialResult] =
    useState<SearchFacetValue[]>(initialFacets);
  const { errors, addError } = useErrors();

  useEffect(() => {
    searchDatasetDefinitions(searchRequest);
  }, [searchRequest]);

  function searchDatasetDefinitions(searchRequestViewModel: DatasetDefinitionRequestViewModel) {
    setIsLoading(true);
    searchDatasetDefinitionsService(searchRequestViewModel)
      .then((response) => {
        const datasetDefinitionResponse = response.data as DatasetDefinitionResponseViewModel;
        setDatasetDefinitions(datasetDefinitionResponse);
        if (datasetDefinitionResponse.facets.length >= 2) {
          setFilterFundingStreams(datasetDefinitionResponse.facets[2].facetValues);
          setFilterFundingStreamsInitialResult(datasetDefinitionResponse.facets[2].facetValues);
        }
      })
      .catch((err) => {
        addError({ error: err, description: "Error while searching dataset definitions" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function setPagination(e: number) {
    searchRequest.pageNumber = e;
    setSearchRequest((prevState) => {
      return { ...prevState, pageNumber: e };
    });
  }

  function filterResults(filterKey: string, filterValue: string, enableFilter: boolean) {
    const filters: string[] =
      searchRequest.filters[filterKey] != undefined ? searchRequest.filters[filterKey] : [];
    if (enableFilter) {
      if (filters.indexOf(filterValue) === -1) {
        filters.push(filterValue);
        const newFiltersValue: any = {};
        newFiltersValue[filterKey] = filters;
        setSearchRequest((prevState) => {
          return { ...prevState, filters: newFiltersValue, pageNumber: 1 };
        });
      }
    } else {
      const index = filters.indexOf(filterValue);
      if (index !== -1) {
        filters.splice(index, 1);
        if (filters.length === 0) {
          setSearchRequest((prevState) => {
            return { ...prevState, filters: initialSearchRequest.filters, pageNumber: 1 };
          });
        } else {
          const newFiltersValue: any = {};
          newFiltersValue[filterKey] = filters;
          setSearchRequest((prevState) => {
            return { ...prevState, filters: newFiltersValue, pageNumber: 1 };
          });
        }
      }
    }
  }

  function searchFundingStreamFilters(e: React.ChangeEvent<HTMLInputElement>) {
    setFilterFundingStreams(
      filterSearch(e.target.value, filterFundingStreamsInitialResult, filterFundingStreams)
    );
  }

  function filterByFundingStream(e: React.ChangeEvent<HTMLInputElement>) {
    filterResults("fundingStreamName", e.target.value, e.target.checked);
  }

  function clearFilters() {
    // @ts-ignore
    document.getElementById("searchDatasources").reset();
    setFilterFundingStreams(filterFundingStreamsInitialResult);
    setSearchRequest(initialSearchRequest);
  }

  function searchText(e: React.ChangeEvent<HTMLInputElement>) {
    const term = e.target.value;
    if (term.length >= 3) {
      setSearchRequest((prevState) => {
        return { ...prevState, searchTerm: term };
      });
    }
    if (term.length === 0) {
      setSearchRequest((prevState) => {
        return { ...prevState, searchTerm: "" };
      });
    }
  }

  function filterSearch(
    keywords: string,
    originalFilters: SearchFacetValue[],
    currentFilters: SearchFacetValue[]
  ) {
    if (keywords.length >= 3) {
      const copyOfFilters: SearchFacetValue[] = originalFilters as SearchFacetValue[];
      return copyOfFilters.filter((x) => x.name.toLowerCase().includes(keywords.toLowerCase()));
    }
    if (keywords.length === 0) {
      return originalFilters;
    }
    return currentFilters;
  }

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />
      <Title title={"Download data schema template"} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <form id="searchDatasources">
            <CollapsiblePanel title={"Search"} isExpanded={true} isCollapsible={false}>
              <fieldset className="govuk-fieldset">
                <div className="govuk-form-group">
                  <label className="govuk-label filterLabel" htmlFor="filter-by-type">
                    Search data schema templates
                  </label>
                  <input
                    className="govuk-input filterSearchInput govuk-!-margin-bottom-2"
                    id="mainContentSearch"
                    autoComplete="off"
                    name="search"
                    type="text"
                    onChange={(e) => searchText(e)}
                  />
                </div>
              </fieldset>
            </CollapsiblePanel>
            <CollapsiblePanel
              title={"Filter by funding stream"}
              isExpanded={true}
              isCollapsible={true}
              showFacetCount={true}
              facetCount={searchRequest.filters["fundingStreamName"]?.length}
            >
              <fieldset className="govuk-fieldset">
                <div className="govuk-form-group">
                  <label className="govuk-label">Search</label>
                  <input
                    className="govuk-input"
                    type="text"
                    onChange={(e) => searchFundingStreamFilters(e)}
                  />
                </div>
                <div className="govuk-checkboxes">
                  {filterFundingStreams.map((f, index) => (
                    <div key={index} className="govuk-checkboxes__item">
                      <input
                        className="govuk-checkboxes__input"
                        key={`fundingstream-${f.name}`}
                        id={`fundingstream-${f.name}`}
                        name={`fundingstream-${f.name}`}
                        type="checkbox"
                        value={f.name}
                        onChange={(e) => filterByFundingStream(e)}
                      />
                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={`fundingstream-${f.name}`}
                      >
                        {f.name}
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
          <LoadingStatus title={"Loading data schema"} hidden={!isLoading} />
          <NoData hidden={(datasetDefinitions != null && datasetDefinitions.totalResults > 0) || isLoading} />
          <table className="govuk-table" hidden={isLoading || datasetDefinitions.totalResults === 0}>
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
              {datasetDefinitions.datasetDefinitions.map((d, index) => (
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
                    <DateTimeFormatter date={d.lastUpdatedDate} />
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
          </table>
          <BackToTop id={"top"} />
          {datasetDefinitions.totalResults > 0 && (
            <nav role="navigation" aria-label="Pagination">
              <div className="pagination__summary">
                Showing {datasetDefinitions.startItemNumber} - {datasetDefinitions.endItemNumber} of{" "}
                {datasetDefinitions.totalResults} results
              </div>
              <Pagination
                currentPage={datasetDefinitions.currentPage}
                lastPage={datasetDefinitions.pagerState.lastPage}
                callback={setPagination}
              />
            </nav>
          )}
        </div>
      </div>
    </Main>
  );
}
