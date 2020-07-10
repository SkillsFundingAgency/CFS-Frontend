import * as React from "react";
import {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {DateFormatter} from "../../components/DateFormatter";
import Pagination from "../../components/Pagination";
import {SpecificationSearchRequestViewModel} from "../../types/SpecificationSearchRequestViewModel";
import {Section} from "../../types/Sections";
import {LoadingStatus} from "../../components/LoadingStatus";
import {getAllSpecificationsService} from "../../services/specificationService";
import {SpecificationListResults} from "../../types/SpecificationListResults";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {FacetValue} from "../../types/Facet";
import {NoData} from "../../components/NoData";

export function SpecificationsList() {
    const [specificationListResults, setSpecificationListResults] = useState<SpecificationListResults>({
        items: [],
        facets: [],
        pageNumber: 0,
        pageSize: 0,
        totalErrorItems: 0,
        totalItems: 0,
        totalPages: 0
    });
    const initialSearch: SpecificationSearchRequestViewModel = {
        searchText: "",
        fundingPeriods: [],
        fundingStreams: [],
        status: [],
        pageSize: 50,
        page: 1
    };
    const [singleFire, setSingleFire] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState(initialSearch);
    const [filterFundingPeriods, setFundingPeriods] = useState<FacetValue[]>([]);
    const [filterFundingStreams, setFundingStreams] = useState<FacetValue[]>([]);
    const [filterStatus, setStatus] = useState<FacetValue[]>([]);
    const [initialFundingPeriods, setInitialFundingPeriods] = useState<FacetValue[]>([]);
    const [initialFundingStreams, setInitialFundingStreams] = useState<FacetValue[]>([]);
    const [initialStatus, setInitialStatus] = useState<FacetValue[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    function populateSpecifications(criteria: SpecificationSearchRequestViewModel) {
        const getAllSpecifications = async () => {
            const result = getAllSpecificationsService(criteria);
            return result;
        };
        getAllSpecifications().then((result) => {
            let specifications = result.data as SpecificationListResults;
            setSpecificationListResults(specifications);
            setIsLoading(false);
        });
    }

    useEffectOnce(() => {
        populateSpecifications(searchCriteria);
    });

    useEffect(() => {
        if (!singleFire && specificationListResults.totalItems > 0) {
            setSingleFire(true);
        }
    }, [specificationListResults.totalItems]);

    useEffect(() => {
        if (specificationListResults.facets.length > 0) {
            setStatus(specificationListResults.facets[0].facetValues);
            setFundingPeriods(specificationListResults.facets[1].facetValues);
            setFundingStreams(specificationListResults.facets[2].facetValues);
            setInitialStatus(specificationListResults.facets[0].facetValues);
            setInitialFundingPeriods(specificationListResults.facets[1].facetValues);
            setInitialFundingStreams(specificationListResults.facets[2].facetValues);
        }
    }, [singleFire]);

    useEffect(() => {

    }, [specificationListResults.items])

    function movePage(pageNumber: number) {
        setSearchCriteria(prevState => {
            return {
                ...prevState,
                pageNumber: pageNumber
            }
        });

        let criteria = searchCriteria;
        criteria.page = pageNumber;

        populateSpecifications(criteria);
    }

    function filterByFundingPeriod(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = searchCriteria.fundingPeriods;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, fundingPeriods: filterUpdate}
        });

        let request = searchCriteria;
        request.fundingPeriods = filterUpdate;
        populateSpecifications(request);
    }

    function filterByFundingStream(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = searchCriteria.fundingStreams;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, fundingStreams: filterUpdate}
        });

        let request = searchCriteria;
        request.fundingStreams = filterUpdate;
        populateSpecifications(request);
    }

    function filterByStatus(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = searchCriteria.status;
        if (e.target.checked) {

            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, status: filterUpdate}
        });

        let request = searchCriteria;
        request.status = filterUpdate;

        populateSpecifications(searchCriteria);
    }

    function filterBySearchTerm(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = e.target.value;

        setSearchCriteria(prevState => {
            return {...prevState, searchTerm: filterUpdate}
        });

        let request = searchCriteria;
        request.searchText = filterUpdate;
        populateSpecifications(request);
    }

    function clearFilters() {
        // @ts-ignore
        document.getElementById("searchSpecifications").reset();
        setFundingPeriods(initialFundingPeriods);
        setFundingStreams(initialFundingStreams);
        setStatus(initialStatus);
        populateSpecifications(initialSearch);
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
                            <Breadcrumb name={"Calculate funding"} url={"/"} />
                            <Breadcrumb name={"View specifications"} />
                        </Breadcrumbs>
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Specifications</h1>
                    </div>
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
                <div className="govuk-grid-row" hidden={!isLoading}>
                    <LoadingStatus title={"Loading specification list"}
                                   description={"Please wait whilst the specification list is loading"}
                    />
                </div>
                <div className="govuk-grid-row" hidden={isLoading}>
                    <div className="govuk-grid-column-one-third">
                        <form id="searchSpecifications">
                            <CollapsiblePanel title="Search" expanded={true}>
                                <fieldset className="govuk-fieldset">
                                    <label className="govuk-label">Search</label>
                                    <input className="govuk-input" onChange={(e) => filterBySearchTerm(e)}/>
                                </fieldset>
                            </CollapsiblePanel>
                            <CollapsiblePanel title={"Filter by funding period"} expanded={false}>
                                <fieldset className="govuk-fieldset">
                                    <div className="govuk-form-group">
                                        <label className="govuk-label">Search</label>
                                        <input className="govuk-input" type="text"
                                               onChange={(e) => searchFundingPeriods(e)}/>
                                    </div>
                                    <div className="govuk-checkboxes">
                                        {filterFundingPeriods.map((fp, index) =>
                                            <div key={index} className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`fundingPeriods-${fp.name}`}
                                                       name={`fundingPeriods-${fp.name}`}
                                                       type="checkbox" value={fp.name}
                                                       onChange={(e) => filterByFundingPeriod(e)}/>
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
                                               onChange={(e) => searchFundingStreams(e)}/>
                                    </div>
                                    <div className="govuk-checkboxes">
                                        {filterFundingStreams.map((fs, index) =>
                                            <div key={index} className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`fundingPeriods-${fs.name}`}
                                                       name={`fundingPeriods-${fs.name}`}
                                                       type="checkbox" value={fs.name}
                                                       onChange={(e) => filterByFundingStream(e)}/>
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
                                               onChange={(e) => searchStatus(e)}/>
                                    </div>
                                    <div className="govuk-checkboxes">
                                        {filterStatus.map((s, index) =>
                                            <div key={index} className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`fundingPeriods-${s.name}`}
                                                       name={`fundingPeriods-${s.name}`}
                                                       type="checkbox" value={s.name}
                                                       onChange={(e) => filterByStatus(e)}/>
                                                <label className="govuk-label govuk-checkboxes__label"
                                                       htmlFor={`fundingPeriods-${s.name}`}>
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
                                </th>
                                <td className="govuk-table__cell">
                                    <DateFormatter date={s.lastUpdatedDate} utc={false}/>
                                </td>
                                <td className="govuk-table__cell">{s.status}</td>
                            </tr>)}


                            </tbody>
                        </table>
                        <NoData hidden={specificationListResults.items.length > 0}/>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <Pagination callback={movePage}
                                            currentPage={specificationListResults.pageNumber}
                                            lastPage={specificationListResults.totalPages}/>
                            </div>
                            <div className="govuk-grid-column-one-third">
                                <p className="govuk-body-s">Showing {(specificationListResults.pageNumber * specificationListResults.pageSize) - (specificationListResults.pageSize - 1)} - {specificationListResults.pageSize * specificationListResults.pageNumber} of {specificationListResults.totalItems} results</p>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        <Footer/>
    </div>

}
