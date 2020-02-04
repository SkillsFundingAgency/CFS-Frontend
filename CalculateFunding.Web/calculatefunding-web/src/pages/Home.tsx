import * as React from "react"
import {Component} from "react";
import {Header} from "../components/Header";
import {Footer} from "../components/Footer";
import {Banner} from "../components/Banner";
import {IBreadcrumbs} from "../types/IBreadcrumbs";

export interface IHomeProps {
}

export class Home extends Component<IHomeProps, {}> {
    userIsAuthenticated() {
        fetch("/api/account/IsAuthenticated", {
            method: 'GET'
        })
            .then(function (response) {
                let username = document.getElementById("username");

                if (username != null) {
                    username.innerText = "";
                }

            });

        document.title = "Calculate Funding";
    }


    componentDidMount() {
        this.userIsAuthenticated();
    }

    render() {

        let breadcrumbs: IBreadcrumbs[] = [
            ];

        return <div>
            <Header/>
            <div className="govuk-width-container">
                <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
                <div className="govuk-main-wrapper">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h1 className="govuk-heading-xl">Calculate funding</h1>
                            <h3 className="govuk-heading-m">Calculate funding, quality assure the results or approve funding.</h3>
                            <div className="homepage-section-container">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/specs" className="govuk-link">Specifications</a>
                                        </div>
                                        <p className="govuk-body">Create and manage the specifications used to calculate funding.</p>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/datasets" className="govuk-link">Manage data</a>
                                        </div>
                                        <p className="govuk-body">Manage data source files or map them to datasets for a specification.</p>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/scenarios" className="govuk-link">Quality assurance tests</a>
                                        </div>
                                        <p className="govuk-body">Design tests to check calculations and data.</p>
                                    </div>
                                </div>
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/app/results" className="govuk-link">View results</a>
                                        </div>
                                        <p className="govuk-body">View results for providers, calculations and quality assurance tests.</p>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/approvals" className="govuk-link">Funding approvals</a>
                                        </div>
                                        <p className="govuk-body">Approve funding for providers and view how it's been calculated.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer/>

        </div>
    }
}