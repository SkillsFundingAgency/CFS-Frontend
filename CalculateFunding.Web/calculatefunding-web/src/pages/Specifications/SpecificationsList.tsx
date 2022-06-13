import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NoData } from "../../components/NoData";
import { SpecificationsSearchFilters } from "../../components/Specifications/SpecificationsSearchFilters";
import { TableNavBottom } from "../../components/TableNavBottom";
import { TextLink } from "../../components/TextLink";
import { Title } from "../../components/Title";
import { useErrors } from "../../hooks/useErrors";
import { getAllSpecificationsService } from "../../services/specificationService";
import { FacetValue } from "../../types/Facet";
import { Section } from "../../types/Sections";
import { SpecificationListResults } from "../../types/Specifications/SpecificationListResults";
import { SpecificationSearchRequestViewModel } from "../../types/SpecificationSearchRequestViewModel";

export function SpecificationsList() {
  const [specificationListResults, setSpecificationListResults] = useState<SpecificationListResults>({
    items: [],
    facets: [],
    endItemNumber: 0,
    startItemNumber: 0,
    totalCount: 0,
    pagerState: {
      lastPage: 0,
      currentPage: 0,
      pages: [],
      displayNumberOfPages: 0,
      nextPage: 0,
      previousPage: 0,
    },
  });
  const initialSearch: SpecificationSearchRequestViewModel = {
    searchText: "",
    fundingPeriods: [],
    fundingStreams: [],
    status: [],
    pageSize: 50,
    page: 1,
  };
  const [searchCriteria, setSearchCriteria] = React.useState<SpecificationSearchRequestViewModel>(initialSearch);
  const [fundingPeriodFacets, setFundingPeriodFacets] = useState<FacetValue[]>([]);
  const [fundingStreamFacets, setFundingStreamFacets] = useState<FacetValue[]>([]);
  const [statusFacets, setStatusFacets] = useState<FacetValue[]>([]);
  const [initialFundingPeriods, setInitialFundingPeriods] = useState<FacetValue[]>([]);
  const [initialFundingStreams, setInitialFundingStreams] = useState<FacetValue[]>([]);
  const [initialStatuses, setInitialStatuses] = useState<FacetValue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { errors, addError, clearErrorMessages } = useErrors();

  const addFundingStreamFilter = useCallback(
    (fundingStream: string) => {
      setSearchCriteria((prevState) => {
        return {
          ...prevState,
          fundingStreams: [...prevState.fundingStreams.filter(fs => fs !== fundingStream), fundingStream]
        };
      });
    }, []);

  const removeFundingStreamFilter = useCallback((fundingStream: string) => {
    setSearchCriteria((prevState) => {
      return { ...prevState, fundingStreams: prevState.fundingStreams.filter(fs => fs !== fundingStream) };
    });
  }, []);

  const addFundingPeriodFilter = useCallback((fundingPeriod: string) => {
    setSearchCriteria((prevState) => {
      return {
        ...prevState,
        fundingPeriods: [...prevState.fundingPeriods.filter(fp => fp !== fundingPeriod), fundingPeriod]
      };
    });
  }, []);

  const removeFundingPeriodFilter = useCallback((fundingPeriod: string) => {
    setSearchCriteria((prevState) => {
      return { ...prevState, fundingPeriods: prevState.fundingPeriods.filter(fp => fp !== fundingPeriod) };
    });
  }, []);

  const addStatusFilter = useCallback((status: string) => {
    setSearchCriteria((prevState) => {
      return { ...prevState, status: [...prevState.status.filter(fp => fp !== status), status] };
    });
  }, []);

  const removeStatusFilter = useCallback((status: string) => {
    setSearchCriteria((prevState) => {
      return { ...prevState, status: prevState.status.filter(fp => fp !== status) };
    });
  }, []);

  const filterBySearchTerm = useCallback((searchText: string) => {
    if (searchText.length > 2 || (searchText.length && searchCriteria.searchText.length !== 0)) {
      setSearchCriteria((prevState) => {
        return { ...prevState, searchText: searchText };
      });
    }
  }, []);

  const clearFilters = useCallback(() => {
    // @ts-ignore
    document.getElementById("searchSpecifications").reset();
    setFundingPeriodFacets(initialFundingPeriods);
    setFundingStreamFacets(initialFundingStreams);
    setStatusFacets(initialStatuses);
    setSearchCriteria(initialSearch);
  }, [initialFundingStreams, initialFundingPeriods, initialSearch, initialStatuses]);

  const filterByFundingStreams = useCallback((searchTerm: string) => {
    setFundingStreamFacets(
      initialFundingStreams.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [initialFundingStreams]);

  const filterByFundingPeriods = useCallback((searchTerm: string) => {
    setFundingPeriodFacets(
      initialFundingPeriods.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [initialFundingPeriods]);

  const filterBySearchStatus = useCallback((searchTerm: string) => {
    setStatusFacets(initialStatuses.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [initialStatuses]);

  useEffect(() => {
    const populateSpecifications = async (criteria: SpecificationSearchRequestViewModel) => {
      try {
        clearErrorMessages();
        const results = (await getAllSpecificationsService(criteria)).data;
        if (!results) {
          addError({ error: "Unexpected error occured whilst looking up specifications" });
          return;
        }
        setSpecificationListResults(results);
        if (results.facets.length > 0) {
          setStatusFacets(results.facets[0].facetValues);
          setFundingPeriodFacets(results.facets[1].facetValues);
          setFundingStreamFacets(results.facets[2].facetValues);
          setInitialStatuses(results.facets[0].facetValues);
          setInitialFundingPeriods(results.facets[1].facetValues);
          setInitialFundingStreams(results.facets[2].facetValues);
        }
      } catch (e: any) {
        addError({ error: e, description: "Unexpected error occured" });
      } finally {
        setIsLoading(false);
      }
    };

    if (searchCriteria) {
      populateSpecifications(searchCriteria);
    }
  }, [searchCriteria]);

  function movePage(pageNumber: number) {
    setSearchCriteria((prevState) => {
      return {
        ...prevState,
        page: pageNumber,
      };
    });
  }


  return (
    <Main location={Section.Specifications}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/"/>
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors}/>
      <LoadingStatusNotifier
        notifications={[
          {
            isActive: isLoading,
            title: "Loading specification list",
            description: "Please wait whilst the specification list is loading",
          },
        ]}
      />

      {!isLoading && (
        <>
          <Title
            title="Specifications"
            titleCaption="Create and manage the specifications used to calculate funding."
          />

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <Link
                to="/Specifications/CreateSpecification"
                id={"create-specification-link"}
                className="govuk-button govuk-button--primary"
                data-module="govuk-button"
              >
                Create a new specification
              </Link>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third position-sticky">
              <SpecificationsSearchFilters
                searchCriteria={searchCriteria}
                initialSearch={initialSearch}
                filterBySearchTerm={filterBySearchTerm}
                addFundingStreamFilter={addFundingStreamFilter}
                removeFundingStreamFilter={removeFundingStreamFilter}
                addFundingPeriodFilter={addFundingPeriodFilter}
                removeFundingPeriodFilter={removeFundingPeriodFilter}
                addStatusFilter={addStatusFilter}
                removeStatusFilter={removeStatusFilter}
                filterByFundingStreams={filterByFundingStreams}
                filterByFundingPeriods={filterByFundingPeriods}
                filterBySearchStatus={filterBySearchStatus}
                fundingStreamFacets={fundingStreamFacets}
                fundingPeriodFacets={fundingPeriodFacets}
                statusFacets={statusFacets}
                clearFilters={clearFilters}
              />
            </div>
            <div className="govuk-grid-column-two-thirds">
              <table
                className="govuk-table"
                id="specification-table"
                hidden={specificationListResults.items.length < 1}
              >
                <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header govuk-!-width-two-thirds">
                    Specification
                  </th>
                  <th scope="col" className="govuk-table__header govuk-!-width-one-sixth">
                    Chosen for funding
                  </th>
                  <th scope="col" className="govuk-table__header govuk-!-width-one-quarter">
                    Last edited data
                  </th>
                  <th scope="col" className="govuk-table__header govuk-!-width-one-sixth">
                    Status
                  </th>
                </tr>
                </thead>
                <tbody className="govuk-table__body" id="mainContentResults">
                {specificationListResults.items.map((s) => (
                  <tr key={s.id} className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">
                      <TextLink to={`/ViewSpecification/${s.id}`}>{s.name}</TextLink>
                    </th>
                    <td className="govuk-table__cell">
                      {s.isSelectedForFunding ? (
                        <strong className="govuk-tag" aria-label="Chosen for funding">Yes</strong>
                      ) : (
                        <span className="govuk-visually-hidden">Not chosen for funding</span>
                      )}
                    </td>
                    <td className="govuk-table__cell nobr">
                      {s.lastUpdatedDate && <DateTimeFormatter date={s.lastUpdatedDate} format={"d MMM yyyy h:mma"}/>}
                    </td>
                    <td className="govuk-table__cell">{s.status}</td>
                  </tr>
                ))}
                </tbody>
              </table>
              <NoData hidden={specificationListResults.items.length > 0}/>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">

                  <TableNavBottom totalCount={specificationListResults.totalCount}
                                  startItemNumber={specificationListResults.startItemNumber}
                                  endItemNumber={specificationListResults.endItemNumber}
                                  currentPage={specificationListResults.pagerState.currentPage}
                                  lastPage={specificationListResults.pagerState.lastPage}
                                  onPageChange={movePage} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Main>
  );
}
