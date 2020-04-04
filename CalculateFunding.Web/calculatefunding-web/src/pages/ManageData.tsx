import React from "react";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {Header} from "../components/Header";
import {Section} from "../types/Sections";
import {Banner} from "../components/Banner";

export function ManageData() {
    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "Manage data",
            url: null
        }
    ];
    return <div>
        <Header location={Section.Datasets}/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Manage data</h1>
                    <span className="govuk-caption-xl">Manage data source files or map them to datasets for a specification</span>
                </div>
                </div>
                <div className="govuk-grid-row govuk-!-margin-bottom-9  govuk-!-margin-top-9">
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"manage-data-source-files-title"} className="govuk-heading-m"><a href="/datasets/manageDatasets">Manage data source files</a></h3>
                        <p className="govuk-body">Load a new data source file or download an existing one.</p>
                    </div>
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"map-data-source-files-title"} className="govuk-heading-m"><a
                            href="/datasets/datasetRelationships">Map data source files to datasets for a specification</a></h3>
                        <p className="govuk-body">Select the data source file a dataset uses.</p>
                    </div>
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"download-data-schemas-title"} className="govuk-heading-m"><a href="/datasets/schemas">Download data schemas</a></h3>
                        <p className="govuk-body">Download the data schme for data source.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
