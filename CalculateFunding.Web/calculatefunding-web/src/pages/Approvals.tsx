import React from "react";
import {Header} from "../components/Header";
import {Section} from "../types/Sections";
import {Banner} from "../components/Banner";
import {IBreadcrumbs} from "../types/IBreadcrumbs";

export function Approvals() {
    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "Funding approvals",
            url: null
        }
    ];
    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 id={"funding-approvals-title"} className="govuk-heading-xl govuk-!-margin-bottom-2">Funding approvals</h1>
                        <span className="govuk-caption-xl">View results for providers, calculations, and quality assurance tests</span>
                    </div>
                </div>
                <div className="govuk-grid-row govuk-!-margin-bottom-9 govuk-!-margin-top-9">
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"choose-specification-approval-title"} className="govuk-heading-m"><a
                            href="/app/SelectSpecification">Choose a specification to approve and release</a>
                        </h3>
                        <p className="govuk-body">Select a specification for a funding period and a funding stream</p>
                    </div>
                    <div className="govuk-grid-column-one-third">
                        <h3 id={"approve-release-funding-title"} className="govuk-heading-m">
                            <a href="/app/ViewFunding">Approve and release funding</a>
                        </h3>
                        <p className="govuk-body">Approve funding for chosen specifications and release funding for payment and publishing.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
