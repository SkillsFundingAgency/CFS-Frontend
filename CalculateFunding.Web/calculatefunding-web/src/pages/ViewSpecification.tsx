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
    getAdditionalCalculations,
    getDatasetBySpecificationId,
    getSpecification
} from "../actions/ViewSpecificationsActions";
import {ViewSpecificationState} from "../states/ViewSpecificationState";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const dispatch = useDispatch();
    const [additionalCalculationsSearchTerm,] = useState('');
    const [statusFilter] = useState("");

    let viewSpecification: ViewSpecificationState = useSelector((state: AppState) => state.viewSpecification);
    console.log(viewSpecification);

    let specificationId = match.params.specificationId;

    console.log(specificationId);

    useEffect(() => {
        console.log("Fired Effect - now getSpecification");
        document.title = "Specification Results - Calculate Funding";
        dispatch(getSpecification(specificationId));
        dispatch(getAdditionalCalculations(specificationId, statusFilter, 1, additionalCalculationsSearchTerm));
        dispatch(getDatasetBySpecificationId(specificationId));
    }, [specificationId]);


    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/"
        },
        {
            name: "View specification",
            url: "/specs"
        },
        {
            name: viewSpecification.specification.name,
            url: null
        }
    ];

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
                    <details className="govuk-details govuk-!-margin-bottom-5" data-module="govuk-details">
                        <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          What is DSG SIT?
        </span>
                        </summary>
                        <div className="govuk-details__text">
                            <p>{viewSpecification.specification.description}</p>
                        </div>
                    </details>
                    <Tabs initialTab="additional-calculations">
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="additional-calculations">
                            <section className="govuk-tabs__panel" id="additional-calculations">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Additional calculations</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third ">
                                        <p className="govuk-body right-align">Showing 0 - 0 of 0 calculations</p>
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
                                        No additional calculations available. <a href={'/calcs/createadditionalcalculation/' + viewSpecification.specification.id}>Create a
                                        calculation</a>
                                    </strong>
                                </div>
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
                    </Tabs>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}