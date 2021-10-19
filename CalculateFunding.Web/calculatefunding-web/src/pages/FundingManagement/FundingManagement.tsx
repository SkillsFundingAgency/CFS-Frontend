import * as React from "react";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { Section } from "../../types/Sections";

export default function FundingManagement() {
    return (
        <div>
            <Header location={Section.Results} />
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Funding management"} />
                </Breadcrumbs>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">Funding management</h1>
                        <h3 className="govuk-caption-xl govuk-!-padding-bottom-9">
                            Approve allocations and release allocations for statement and funding.
                        </h3>
                        <div className="homepage-section-container">
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-one-third">
                                    <div className="govuk-heading-m">
                                        <Link to={"/"}>Funding approvals</Link>
                                    </div>
                                    <p className="govuk-body">
                                        Approve allocations for funding.
                                    </p>
                                </div>
                                <div className="govuk-grid-column-one-third">
                                    <div className="govuk-heading-m">
                                        <Link to="/" className="govuk-link">
                                            Release management
                                        </Link>
                                    </div>
                                    <p className="govuk-body">Release allocations for statement of funding.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
