import * as React from "react"
import {Header} from "../components/Header";
import {Footer} from "../components/Footer";
import {Banner} from "../components/Banner";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {Tabs} from "../components/Tabs";
import {RouteComponentProps} from "react-router";
import {useEffect, useState} from "react";
import {
    getAdditionalCalculations,
    getSpecificationSummary,
    getTemplateCalculations
} from "../actions/ViewSpecificationResultsActions";
import {useDispatch, useSelector} from "react-redux";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {AppState} from "../states/AppState";
import {ViewSpecificationResultsState} from "../states/ViewSpecificationResultsState";
import Pagination from "../components/Pagination";

export interface ViewSpecificationResultsProps {
    specification: SpecificationSummary;
}

export interface ViewSpecificationResultsRoute {
    specificationId: string
}


export function ViewSpecificationResults({match}: RouteComponentProps<ViewSpecificationResultsRoute>, props: ViewSpecificationResultsProps) {
    const dispatch = useDispatch();
    const [additionalCalculationsSearchTerm, setAdditionalCalculationsSearchTerm] = useState('');
    const [templateCalculationsSearchTerm, setTemplateCalculationsSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState("Draft");

    let specificationResults: ViewSpecificationResultsState = useSelector((state: AppState) => state.viewSpecificationResults);

    let specificationId = match.params.specificationId;
    useEffect(() => {
        console.log("Fired Effect");
        document.title = "Specification Results - Calculate Funding";
        dispatch(getSpecificationSummary(specificationId));
        dispatch(getTemplateCalculations(specificationId, "Draft", 1, templateCalculationsSearchTerm));
        dispatch(getAdditionalCalculations(specificationId, "Draft", 1, additionalCalculationsSearchTerm));
    }, [specificationId]);


    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/"
        },
        {
            name: "View results",
            url: "/results"
        },
        {
            name: "Select specification",
            url: ""
        },
        {
            name: specificationResults.specification.name,
            url: null
        }
    ];

    function updateCalculations(event: React.ChangeEvent<HTMLSelectElement>) {
        const filter = event.target.value;
        setStatusFilter(filter);
        dispatch(getTemplateCalculations(specificationId, filter, 1, templateCalculationsSearchTerm));
        dispatch(getAdditionalCalculations(specificationId, filter, 1, additionalCalculationsSearchTerm));
    }

    function searchAdditionalCalculations() {
        dispatch(getAdditionalCalculations(specificationId, statusFilter, 1, additionalCalculationsSearchTerm));
    }

    function additionalCalculationsSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setAdditionalCalculationsSearchTerm(e.target.value);
    }

    function searchTemplateCalculations() {
        dispatch(getTemplateCalculations(specificationId, statusFilter, 1, templateCalculationsSearchTerm));
    }

    function templatesCalculationsSearch(e: React.ChangeEvent<HTMLInputElement>) {

        setTemplateCalculationsSearchTerm(e.target.value);
    }

    return <div>
        <Header/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">{specificationResults.specification.name}</h1>
                        <h2 className="govuk-caption-xl">{specificationResults.specification.fundingPeriod.name}</h2>
                    </div>
                </div>

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <p className="govuk-body">
                            Filter by calculation status
                        </p>
                        <select name="calculationStatus" id="calculationStatus" className="govuk-select"
                                onChange={(e) => {
                                    updateCalculations(e)
                                }}>
                            <option value="Draft">Draft</option>
                            <option value="Approved">Approved</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>
                </div>
                <div className="govuk-grid-row govuk-!-padding-top-5">
                    <div className="govuk-grid-column-full">

                        <Tabs initialTab="template-calculations">
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="template-calculations">Template Calculations</Tabs.Tab>
                                <Tabs.Tab label="additional-calculations">Additional Calculations</Tabs.Tab>
                            </ul>
                            <Tabs.Panel label="template-calculations">
                                <section className="govuk-tabs__panel" id="template-calculations">
                                    <h2 className="govuk-heading-l">Template Calculations</h2>
                                    <input className="govuk-input govuk-!-width-three-quarters govuk-!-margin-right-1"
                                           type="text" onChange={(e)=> templatesCalculationsSearch(e)}/>
                                    <button className="govuk-button" onClick={() => searchTemplateCalculations()}>Search</button>
                                    <table className="govuk-table">
                                        <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header">Calculation Name</th>
                                            <th scope="col" className="govuk-table__header">Status</th>
                                            <th scope="col" className="govuk-table__header">Updated</th>
                                        </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                        {specificationResults.templateCalculations.calculations.map(tc =>
                                            <tr key={tc.id} className="govuk-table__row">
                                                <td className="govuk-table__cell"><a
                                                    href={`/results/calculationproviderresults?calculationid=${tc.id}`}>{tc.name}</a>
                                                </td>
                                                <td className="govuk-table__cell">{tc.status}</td>
                                                <td className="govuk-table__cell">{tc.lastUpdatedDateDisplay}</td>
                                            </tr>
                                        )}
                                        <tr className="govuk-table__row" hidden={specificationResults.templateCalculations.totalResults > 0}>
                                            <td className="govuk-table__cell" colSpan={3}>No results were found.</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div className="govuk-grid-row">
                                        <div className="govuk-grid-column-two-thirds">
                                            <Pagination
                                                currentPage={specificationResults.templateCalculations.pagerState.currentPage}
                                                lastPage={specificationResults.templateCalculations.pagerState.lastPage}
                                                callback={() => {
                                                }}/>
                                        </div>
                                        <div className="govuk-grid-column-one-third govuk-body govuk-!-padding-top-4">
                                            Showing {specificationResults.templateCalculations.startItemNumber} - {specificationResults.templateCalculations.endItemNumber} of {specificationResults.templateCalculations.totalResults} results
                                        </div>
                                    </div>
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel label="additional-calculations">
                                <section className="govuk-tabs__panel"
                                         id="additional-calculations">
                                    <h2 className="govuk-heading-l">Additional calculations</h2>
                                    <input className="govuk-input govuk-!-width-three-quarters govuk-!-margin-right-1"
                                           type="text" onChange={(e) => additionalCalculationsSearch(e)}/>
                                    <button className="govuk-button" onClick={() => searchAdditionalCalculations}>Search
                                    </button>
                                    <table className="govuk-table">
                                        <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header">Calculation Name</th>
                                            <th scope="col" className="govuk-table__header">Status</th>
                                            <th scope="col" className="govuk-table__header">Updated</th>
                                        </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                        {specificationResults.additionalCalculations.calculations.map(tc =>
                                            <tr className="govuk-table__row">
                                                <td className="govuk-table__cell"><a
                                                    href={`/results/calculationproviderresults?calculationid=${tc.id}`}>{tc.name}</a>
                                                </td>
                                                <td className="govuk-table__cell">{tc.status}</td>
                                                <td className="govuk-table__cell">{tc.lastUpdatedDateDisplay}</td>
                                            </tr>
                                        )}
                                        <tr className="govuk-table__row" hidden={specificationResults.additionalCalculations.totalResults > 0}>
                                            <td className="govuk-table__cell" colSpan={3}>No results were found.</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div className="govuk-grid-row">
                                        <div className="govuk-grid-column-two-thirds">
                                            <Pagination
                                                currentPage={specificationResults.additionalCalculations.pagerState.currentPage}
                                                lastPage={specificationResults.additionalCalculations.pagerState.lastPage}
                                                callback={() => {
                                                }}/>
                                        </div>
                                        <div className="govuk-grid-column-one-third govuk-body govuk-!-padding-top-4">
                                            Showing {specificationResults.additionalCalculations.startItemNumber} - {specificationResults.additionalCalculations.endItemNumber} of {specificationResults.additionalCalculations.totalResults} results
                                        </div>
                                    </div>
                                </section>
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>

    </div>
}