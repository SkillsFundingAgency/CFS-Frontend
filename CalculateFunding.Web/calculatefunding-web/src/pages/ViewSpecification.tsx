import {RouteComponentProps} from "react-router";
import {Header} from "../components/Header";
import {Banner} from "../components/Banner";
import * as React from "react";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {Footer} from "../components/Footer";
import {Tabs} from "../components/Tabs";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../states/AppState";
import {
    confirmTimetableChanges,
    getAdditionalCalculations,
    getDatasetBySpecificationId,
    getFundingLineStructure,
    getReleaseTimetable,
    getSpecification,
    changeFundingLineState
} from "../actions/ViewSpecificationsActions";
import {ViewSpecificationState} from "../states/ViewSpecificationState";
import {SaveReleaseTimetableViewModel} from "../types/SaveReleaseTimetableViewModel";
import {DateInput} from "../components/DateInput";
import {TimeInput} from "../components/TimeInput";
import Pagination from "../components/Pagination";
import {Details} from "../components/Details";
import {FundingStructureType} from "../types/FundingStructureItem";
import {ApproveStatusButton} from "../components/ApproveStatusButton";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const dispatch = useDispatch();
    const [additionalCalculationsSearchTerm,] = useState('');
    const [statusFilter] = useState("");
    const [navisionDate, setNavisionDate] = useState();
    const [releaseDate, setReleaseDate] = useState();
    const [navisionTime, setNavisionTime] = useState();
    const [releaseTime, setReleaseTime] = useState();
    const [canTimetableBeUpdated, setCanTimetableBeUpdated] = useState(true);

    let viewSpecification: ViewSpecificationState = useSelector((state: AppState) => state.viewSpecification);

    let specificationId = match.params.specificationId;
    let saveReleaseTimetable: SaveReleaseTimetableViewModel;

    useEffect(() => {
        document.title = "Specification Results - Calculate Funding";
        dispatch(getSpecification(specificationId));
        dispatch(getAdditionalCalculations(specificationId, statusFilter, 1, additionalCalculationsSearchTerm));
        dispatch(getDatasetBySpecificationId(specificationId));
        dispatch(getReleaseTimetable(specificationId));
    }, [specificationId]);

    useEffect(() => {
        dispatch(getFundingLineStructure(viewSpecification.specification.id, viewSpecification.specification.fundingStreams[0].id));
    }, [viewSpecification.specification.id]);

    useEffect(() => {
        return () => setCanTimetableBeUpdated(true);
    }, [viewSpecification]);


    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "View specification",
            url: "/app/SpecificationsList"
        },
        {
            name: viewSpecification.specification.name,
            url: null
        }
    ];

    function confirmChanges() {
        setCanTimetableBeUpdated(false);
        let navDateAndTime2 = updateDateWithTime(navisionDate, navisionTime);
        let releaseDate2 = updateDateWithTime(releaseDate, releaseTime);
        saveReleaseTimetable = {
            specificationId: viewSpecification.specification.id,
            statementDate: navDateAndTime2,
            fundingDate: releaseDate2
        };
        dispatch(confirmTimetableChanges(saveReleaseTimetable));
    }

    function updateDateWithTime(date: Date, time: string) {
        let timeParts = time.match(/(\d+):(\d+)/);
        if (timeParts !== null) {
            let hours = timeParts[1];
            let minutes = timeParts[2];
            if (hours !== null && minutes !== null) {
                date.setHours(hours as unknown as number);
                date.setMinutes(minutes as unknown as number);
            }
        }
        return date;
    }

    function updateNavisionDate(e: Date) {
        setNavisionDate(e);
    }

    function updateReleaseDate(e: Date) {
        setReleaseDate(e);
    }

    function updateNavisionTime(e: string) {
        setNavisionTime(e);
    }

    function updateReleaseTime(e: string) {
        setReleaseTime(e);
    }

    function movePage(pageNumber : number)
    {
        dispatch(getAdditionalCalculations(specificationId, statusFilter, pageNumber, additionalCalculationsSearchTerm));
    }

    let fundingLineStatus = viewSpecification.specification.approvalStatus;
    if (viewSpecification.fundingLineStatusResult !== null && viewSpecification.fundingLineStatusResult !== "")
        fundingLineStatus = viewSpecification.fundingLineStatusResult;

    return <div>
        <Header/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-l">Specification Name</span>
                    <h2 className="govuk-heading-l">{viewSpecification.specification.name}</h2>
                    <span className="govuk-caption-m">Funding period</span>
                    <h3 className="govuk-heading-m">{viewSpecification.specification.fundingPeriod.name}</h3>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-m">Funding streams</span>
                    <h3 className="govuk-heading-m">{viewSpecification.specification.fundingStreams[0].name}</h3>
                </div>
                <div className="govuk-grid-column-one-third">
                    <ul className="govuk-list">
                        <li>
                            <a className="govuk-link"
                               href={'/specs/editspecification/' + viewSpecification.specification.id}>Edit specification</a>
                        </li>
                        <li>
                            <a className="govuk-link"
                               href={'/calcs/createadditionalcalculation/' + viewSpecification.specification.id}>Create additional calculation</a>
                        </li>
                        <li>
                            <a className="govuk-link" href="/datasets/createdataset">Create dataset</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <Details title={`What is ${viewSpecification.specification.name}`} body={viewSpecification.specification.description}/>
                    <Tabs initialTab="fundingline-structure">
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                            <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="fundingline-structure">
                            <section className="govuk-tabs__panel" id="fundingline-structure">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Funding line structure</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third ">
                                        <ApproveStatusButton id={viewSpecification.specification.id}
                                                             status={fundingLineStatus}
                                                             callback={changeFundingLineState(viewSpecification.specification.id)}/>
                                    </div>
                                </div>
                                <table className="govuk-table funding-lines-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header">Level</th>
                                        <th scope="col" className="govuk-table__header">Calculation Type</th>
                                        <th scope="col" className="govuk-table__header"></th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {viewSpecification.fundingLineStructureResult.map(f => {
                                        let calculationId = <span>{f.name}</span>;
                                        if (f.calculationId != null) {
                                            calculationId = <a className={"govuk-link"}
                                                               href={"/calcs/editTemplateCalculation/" + f.calculationId}>{f.name}</a>;
                                        }
                                        return <tr
                                            className={"govuk-table__row " + (f.level === 1 ? ('govuk-!-font-weight-bold') : (''))}>
                                            <td className="govuk-table__cell">{f.level}</td>
                                            <td className="govuk-table__cell">{FundingStructureType[f.type]}</td>
                                            <td className="govuk-table__cell">{calculationId}</td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="additional-calculations">
                            <section className="govuk-tabs__panel" id="additional-calculations">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Additional calculations</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third ">
                                        <p className="govuk-body right-align" hidden={viewSpecification.additionalCalculations.totalResults === 0}>Showing {viewSpecification.additionalCalculations.startItemNumber} - {viewSpecification.additionalCalculations.endItemNumber} of {viewSpecification.additionalCalculations.totalResults} calculations</p>
                                    </div>
                                </div>
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <div className="govuk-form-group search-container">
                                            <input className="govuk-input input-search" id="event-name"
                                                   name="event-name" type="text"/>
                                        </div>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <button className="govuk-button" type="submit">Search</button>
                                    </div>
                                </div>
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header">Additional calculation name</th>
                                        <th scope="col" className="govuk-table__header">Status</th>
                                        <th scope="col" className="govuk-table__header">Value type</th>
                                        <th scope="col" className="govuk-table__header">Last edited date</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">

                                    </tbody>
                                </table>

                                <div className="govuk-warning-text">
                                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        No additional calculations available. <a
                                        href={'/calcs/createadditionalcalculation/' + viewSpecification.specification.id}>Create a
                                        calculation</a>
                                    </strong>
                                </div>
                                <nav className="govuk-!-margin-top-9" role="navigation" aria-label="Pagination">
                                    <div className="pagination__summary"><p className="govuk-body right-align" hidden={viewSpecification.additionalCalculations.totalResults === 0}>Showing {viewSpecification.additionalCalculations.startItemNumber} - {viewSpecification.additionalCalculations.endItemNumber} of {viewSpecification.additionalCalculations.totalResults} calculations</p></div>
                                    <Pagination currentPage={viewSpecification.additionalCalculations.pagerState.currentPage} lastPage={viewSpecification.additionalCalculations.pagerState.lastPage} callback={movePage} />
                                </nav>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="datasets">
                            <section className="govuk-tabs__panel" id="datasets">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Datasets</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <a className="govuk-link govuk-button" data-module="govuk-button"
                                           href="/datasets/datasetrelationships">Map
                                            data source file to data set</a>
                                    </div>
                                </div>
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">Dataset and schemas</caption>
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header govuk-!-width-one-half">Dataset
                                        </th>
                                        <th scope="col" className="govuk-table__header govuk-!-width-one-half">Data
                                            schema
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {viewSpecification.datasets.content.map(ds =>
                                        <tr className="govuk-table__row" key={ds.id}>
                                            <td scope="row" className="govuk-table__cell">{ds.name}
                                                <div className="govuk-!-margin-top-2">
                                                    <details className="govuk-details govuk-!-margin-bottom-0"
                                                             data-module="govuk-details">
                                                        <summary className="govuk-details__summary">
                                                        <span
                                                            className="govuk-details__summary-text">Dataset Description</span>
                                                        </summary>
                                                        <div className="govuk-details__text">
                                                            {ds.relationshipDescription}
                                                        </div>
                                                    </details>
                                                </div>
                                            </td>
                                            <td className="govuk-table__cell">{ds.definition.name}</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="release-timetable">
                            <section className="govuk-tabs__panel" id="additional-calculations">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-full">
                                        <h2 className="govuk-heading-l">Release timetable</h2>
                                    </div>
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" role="group"
                                              aria-describedby="passport-issued-hint">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h3 className="govuk-heading-m">Release date of funding to Navison?</h3>
                                        </legend>
                                        <span id="passport-issued-hint"
                                              className="govuk-hint">Set the date and time that the statement will be published externally for this funding stream. <br/>For example, 12 11 2019</span>
                                        <DateInput year={parseInt(viewSpecification.releaseTimetable.navisionDate.year)}
                                                   month={parseInt(viewSpecification.releaseTimetable.navisionDate.month)}
                                                   day={parseInt(viewSpecification.releaseTimetable.navisionDate.day)}
                                                   callback={updateNavisionDate} />
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={viewSpecification.releaseTimetable.navisionDate.time}
                                               callback={updateNavisionTime}/>
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" role="group"
                                              aria-describedby="passport-issued-hint">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h3 className="govuk-heading-m">Release date of statement to providers?</h3>
                                        </legend>
                                        <span id="passport-issued-hint"
                                              className="govuk-hint">Set the date and time that the statement will be published externally for this funding stream. <br/>For example, 12 11 2019</span>
                                        <DateInput year={parseInt(viewSpecification.releaseTimetable.releaseDate.year)}
                                                   month={parseInt(viewSpecification.releaseTimetable.releaseDate.month)}
                                                   day={parseInt(viewSpecification.releaseTimetable.releaseDate.day)}
                                                   callback={updateReleaseDate} />
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={viewSpecification.releaseTimetable.releaseDate.time}
                                               callback={updateReleaseTime}/>
                                </div>
                                <div className="govuk-form-group">
                                    <button className="govuk-button" onClick={confirmChanges} disabled={!canTimetableBeUpdated} >Confirm changes</button>
                                </div>
                            </section>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}