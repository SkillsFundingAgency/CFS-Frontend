import * as React from "react"
import {Component} from "react";
import {Header} from "../components/Header";
import {Footer} from "../components/Footer";
import {Banner} from "../components/Banner";
import {IBreadcrumbs} from "../types/IBreadcrumbs";

export class ViewResults extends Component {
    render() {

        let breadcrumbs: IBreadcrumbs[] = [
            {
                url: "/app",
                name: "Calculate Funding"
            },
            {
                name: "View results",
                url: null
            }];

        return <div>
            <Header/>
            <div className="govuk-width-container">
                <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
                <div className="govuk-main-wrapper">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h1 className="govuk-heading-xl">View results</h1>
                            <h3 className="govuk-caption-xl govuk-!-padding-bottom-9">View results for providers and calculations.</h3>
                            <div className="homepage-section-container">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/results/viewproviderresults" className="govuk-link">View provider results</a>
                                        </div>
                                        <p className="govuk-body">Select a provider to view its calculation and quality assurance test results.</p>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/app/SelectSpecification" className="govuk-link">View specification results</a>
                                        </div>
                                        <p className="govuk-body">Select a specification to view the calculation and QA results.</p>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <div className="govuk-heading-m">
                                            <a href="/results/TestScenarioResults" className="govuk-link">View QA test result</a>
                                        </div>
                                        <p className="govuk-body">View the passes and failures for quality assurances tests.</p>
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