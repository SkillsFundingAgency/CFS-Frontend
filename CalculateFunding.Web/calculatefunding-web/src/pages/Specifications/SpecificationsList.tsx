import * as React from "react";
import {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import Pagination from "../../components/Pagination";
import {SpecificationSearchRequestViewModel} from "../../types/SpecificationSearchRequestViewModel";
import {Section} from "../../types/Sections";
import {LoadingStatus} from "../../components/LoadingStatus";
import {getAllSpecificationsService} from "../../services/specificationService";
import {SpecificationListResults} from "../../types/Specifications/SpecificationListResults";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {FacetValue} from "../../types/Facet";
import {NoData} from "../../components/NoData";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";

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
            previousPage: 0
        }
    });
    const initialSearch: SpecificationSearchRequestViewModel = {
        searchText: "",
        fundingPeriods: [],
        fundingStreams: [],
        status: [],
        pageSize: 50,
        page: 1
    };
    const [searchCriteria, setSearchCriteria] = useState<SpecificationSearchRequestViewModel>(initialSearch);
    const [filterFundingPeriods, setFundingPeriods] = useState<FacetValue[]>([]);
    const [filterFundingStreams, setFundingStreams] = useState<FacetValue[]>([]);
    const [filterStatus, setStatus] = useState<FacetValue[]>([]);
    const [initialFundingPeriods, setInitialFundingPeriods] = useState<FacetValue[]>([]);
    const [initialFundingStreams, setInitialFundingStreams] = useState<FacetValue[]>([]);
    const [initialStatus, setInitialStatus] = useState<FacetValue[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {errors, addError, clearErrorMessages} = useErrors();


    useEffect(() => {
        const populateSpecifications = async (criteria: SpecificationSearchRequestViewModel) => {
            try {
                clearErrorMessages();
                const results = (await getAllSpecificationsService(criteria)).data;
                if (!results) {
                    addError({error: "Unexpected error occured whilst looking up specifications"});
                    return;
                }
                setSpecificationListResults(results);
                if (results.facets.length > 0) {
                    setStatus(results.facets[0].facetValues);
                    setFundingPeriods(results.facets[1].facetValues);
                    setFundingStreams(results.facets[2].facetValues);
                    setInitialStatus(results.facets[0].facetValues);
                    setInitialFundingPeriods(results.facets[1].facetValues);
                    setInitialFundingStreams(results.facets[2].facetValues);
                }
            } catch (e) {
                addError({error: e, description: "Unexpected error occured"});
            } finally {
                setIsLoading(false);
            }
        }
        
        if (searchCriteria) {
            populateSpecifications(searchCriteria);
        }
    }, [searchCriteria]);

    function movePage(pageNumber: number) {
        setSearchCriteria(prevState => {
            return {
                ...prevState,
                page: pageNumber
            }
        });
    }
    function filterByFundingPeriod(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = searchCriteria.fundingPeriods;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, fundingPeriods: filterUpdate}
        });
    }

    function filterByFundingStream(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = searchCriteria.fundingStreams;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, fundingStreams: filterUpdate}
        });
    }

    function filterByStatus(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = searchCriteria.status;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, status: filterUpdate}
        });
    }

    function filterBySearchTerm(e: React.ChangeEvent<HTMLInputElement>) {
        const searchText = e.target.value;
        if (searchText.length > 2 || (searchText.length  && searchCriteria.searchText.length !== 0)) {
            setSearchCriteria(prevState => {
                return {...prevState, searchText: searchText}
            });
        }
    }

    function clearFilters() {
        // @ts-ignore
        document.getElementById("searchSpecifications").reset();
        setFundingPeriods(initialFundingPeriods);
        setFundingStreams(initialFundingStreams);
        setStatus(initialStatus);
        setSearchCriteria(initialSearch);
    }

    function searchFundingPeriods(e: React.ChangeEvent<HTMLInputElement>) {
        setFundingPeriods(initialFundingPeriods.filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase())))
    }

    function searchFundingStreams(e: React.ChangeEvent<HTMLInputElement>) {
        setFundingStreams(initialFundingStreams.filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase())))
    }

    function searchStatus(e: React.ChangeEvent<HTMLInputElement>) {
        setStatus(initialStatus.filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase())))
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <div className="govuk-grid-row  govuk-!-margin-bottom-4">
                <div className="govuk-grid-column-full ">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"View specifications"}/>
                    </Breadcrumbs>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Specifications</h1>
                </div>
            </div>
            <div className="govuk-grid-row">
                <MultipleErrorSummary errors={errors}/>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                    <Link to="/Specifications/CreateSpecification" id={"create-specification-link"}
                          className="govuk-button govuk-button--primary"
                          data-module="govuk-button">
                        Create specification
                    </Link>
                </div>
            </div>
            {isLoading &&
            <div className="govuk-grid-row">
                <LoadingStatus title={"Loading specification list"}
                               description={"Please wait whilst the specification list is loading"}
                />
            </div>
            }
            {!isLoading &&
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                    <form id="searchSpecifications">
                        <CollapsiblePanel title="Search" expanded={true}>
                            <fieldset className="govuk-fieldset">
                                <label className="govuk-label">Search</label>
                                <input className="govuk-input" onChange={filterBySearchTerm}/>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by funding period"} expanded={false}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={searchFundingPeriods}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterFundingPeriods.map((fp, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   id={`fundingPeriods-${fp.name}`}
                                                   name={`fundingPeriods-${fp.name}`}
                                                   type="checkbox" value={fp.name}
                                                   onChange={filterByFundingPeriod}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`fundingPeriods-${fp.name}`}>
                                                {fp.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by funding streams"} expanded={false}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={searchFundingStreams}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterFundingStreams.map((fs, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   id={`fundingPeriods-${fs.name}`}
                                                   name={`fundingPeriods-${fs.name}`}
                                                   type="checkbox" value={fs.name}
                                                   onChange={filterByFundingStream}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`fundingPeriods-${fs.name}`}>
                                                {fs.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by status"} expanded={false}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" type="text"
                                           onChange={searchStatus}/>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterStatus.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   id={`fundingPeriods-${s.name}`}
                                                   name={`fundingPeriods-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={filterByStatus}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`fundingPeriods-${s.name}`}>
                                                {s.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <button type="button" className="govuk-button" onClick={clearFilters}>
                            Clear filters
                        </button>
                    </form>
                </div>
                <div className="govuk-grid-column-two-thirds">
                    <table className="govuk-table" id="specification-table"
                           hidden={specificationListResults.items.length < 1}>
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th scope="col"
                                className="govuk-table__header">Specification
                            </th>
                            <th scope="col"
                                className="govuk-table__header govuk-!-width-one-half">Last edited data
                            </th>
                            <th scope="col"
                                className="govuk-table__header govuk-!-width-one-quarter">Specification status
                            </th>
                        </tr>
                        </thead>
                        <tbody className="govuk-table__body" id="mainContentResults">
                        {specificationListResults.items.map(s => <tr key={s.id} className="govuk-table__row">
                            <th scope="row" className="govuk-table__header">
                                <Link to={`/ViewSpecification/${s.id}`}>{s.name}</Link>
                                {s.isSelectedForFunding && <strong className="govuk-tag govuk-!-margin-top-2">Chosen for funding</strong>}
                            </th>
                            <td className="govuk-table__cell">
                                <DateTimeFormatter date={s.lastUpdatedDate}/>
                            </td>
                            <td className="govuk-table__cell">{s.status}</td>
                        </tr>)}
                        </tbody>
                    </table>
                    <NoData hidden={specificationListResults.items.length > 0}/>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <Pagination callback={movePage}
                                        currentPage={specificationListResults.pagerState.currentPage}
                                        lastPage={specificationListResults.pagerState.lastPage}/>
                        </div>
                        <div className="govuk-grid-column-one-third">
                            <p className="govuk-body-s">Showing {(specificationListResults.startItemNumber)} - {specificationListResults.endItemNumber} of {specificationListResults.totalCount} results</p>
                        </div>
                    </div>
                </div>
            </div>
            }
        </div>
        <Footer/>
    </div>

}
