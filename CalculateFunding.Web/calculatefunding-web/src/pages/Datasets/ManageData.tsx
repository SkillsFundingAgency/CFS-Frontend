import React from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Link} from "react-router-dom";
import {Footer} from "../../components/Footer";

export function ManageData() {
    return <div>
        <Header location={Section.Datasets}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Manage data"}/>
            </Breadcrumbs>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Manage data</h1>
                        <span className="govuk-caption-xl">Manage data source files or map them to datasets for a specification</span>
                    </div>
                </div>
                <div className="govuk-grid-row govuk-!-margin-bottom-9  govuk-!-margin-top-9">
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"manage-data-source-files-title"} className="govuk-heading-m">
                           <Link to={"/Datasets/ManageDataSourceFiles"}>Manage data source files</Link>
                        </h3>
                        <p className="govuk-body">Load a new data source file or download an existing one.</p>
                    </div>
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"map-data-source-files-title"} className="govuk-heading-m">
                            <a href="/Datasets/MapDataSourceFiles">Map data source files to datasets for a specification</a>
                        </h3>
                        <p className="govuk-body">Select the data source file a dataset uses.</p>
                    </div>
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"download-data-schemas-title"} className="govuk-heading-m">
                            <Link to="/datasets/DownloadDataSchema">Download data schemas</Link>
                        </h3>
                        <p className="govuk-body">Download the data schema for data source.</p>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
}