import {Banner} from "../../components/Banner";
import * as React from "react";
import {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {IBreadcrumbs} from "../../types/IBreadcrumbs";
import {Header} from "../../components/Header";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {useDispatch, useSelector} from "react-redux";
import {getAllSpecifications} from "../../actions/SpecificationActions";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {AppState} from "../../states/AppState";
import {SpecificationState} from "../../states/SpecificationState";
import {DateFormatter} from "../../components/DateFormatter";
import Pagination from "../../components/Pagination";
import {FacetValue} from "../../types/CalculationProviderResult";
import {SpecificationSearchRequestViewModel} from "../../types/SpecificationSearchRequestViewModel";
import {Section} from "../../types/Sections";


export function SpecificationsList() {
    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "View specifications",
            url: null
        }
    ];

    let specificationListResults: SpecificationState = useSelector((state: AppState) => state.specifications);

    const dispatch = useDispatch();

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


    useEffectOnce(() => {
        dispatch(getAllSpecifications(searchCriteria));

    });

    useEffect(() => {
        if (!singleFire && specificationListResults.specificationListResults.totalItems > 0) {
            setSingleFire(true);
        }
    }, [specificationListResults.specificationListResults.totalItems]);

    useEffect(() => {
        if (specificationListResults.specificationListResults.facets.length > 0) {
            setStatus(specificationListResults.specificationListResults.facets[0].facetValues);
            setFundingPeriods(specificationListResults.specificationListResults.facets[1].facetValues);
            setFundingStreams(specificationListResults.specificationListResults.facets[2].facetValues);
            setInitialStatus(specificationListResults.specificationListResults.facets[0].facetValues);
            setInitialFundingPeriods(specificationListResults.specificationListResults.facets[1].facetValues);
            setInitialFundingStreams(specificationListResults.specificationListResults.facets[2].facetValues);
        }
    }, [singleFire]);

    function movePage(pageNumber: number) {
        setSearchCriteria(prevState => {
            return {
                ...prevState,
                pageNumber: pageNumber
            }
        });

        let request = searchCriteria;
        request.page = pageNumber;

        dispatch(getAllSpecifications(request));
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
        dispatch(getAllSpecifications(request));
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
        dispatch(getAllSpecifications(request));
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

        dispatch(getAllSpecifications(searchCriteria));
    }

    function filterBySearchTerm(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = e.target.value;

        setSearchCriteria(prevState => {
            return {...prevState, searchTerm: filterUpdate}
        });

        let request = searchCriteria;
        request.searchText = filterUpdate;
        dispatch(getAllSpecifications(request));
    }

    function clearFilters() {
        // @ts-ignore
        document.getElementById("searchSpecifications").reset();
        setFundingPeriods(initialFundingPeriods);
        setFundingStreams(initialFundingStreams);
        setStatus(initialStatus);
        dispatch(getAllSpecifications(initialSearch));
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
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row  govuk-!-margin-bottom-4">
                    <div className="govuk-grid-column-full ">
                        <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Specifications</h1>
                    </div>
                </div>

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third">
                        <a href="/app/Specifications/CreateSpecification" id={"create-specification-link"}
                           className="govuk-button govuk-button--primary"
                           data-module="govuk-button">
                            Create specification
                        </a>
                    </div>
                </div>
                <div className="govuk-grid-row">
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
                               hidden={specificationListResults.specificationListResults.items.length < 1}>
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
                            {specificationListResults.specificationListResults.items.map(s => <tr key={s.id}
                                                                                                  className="govuk-table__row">
                                <th scope="row" className="govuk-table__header"><a
                                    href={"/app/ViewSpecification/" + s.id}>{s.name}</a></th>
                                <td className="govuk-table__cell"><DateFormatter date={s.lastUpdatedDate} utc={false}/>
                                </td>
                                <td className="govuk-table__cell">{s.status}</td>
                            </tr>)}


                            </tbody>
                        </table>
                        <p className="govuk-body"
                           hidden={specificationListResults.specificationListResults.items.length > 0}>There are no records to match your search</p>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <Pagination callback={movePage}
                                            currentPage={specificationListResults.specificationListResults.pageNumber}
                                            lastPage={specificationListResults.specificationListResults.totalPages}/>
                            </div>
                            <div className="govuk-grid-column-one-third">
                                <p className="govuk-body-s">Showing {(specificationListResults.specificationListResults.pageNumber * specificationListResults.specificationListResults.pageSize) - (specificationListResults.specificationListResults.pageSize - 1)} - {specificationListResults.specificationListResults.pageSize * specificationListResults.specificationListResults.pageNumber} of {specificationListResults.specificationListResults.totalItems} results</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>

}
