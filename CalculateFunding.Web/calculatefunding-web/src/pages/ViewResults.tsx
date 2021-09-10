import * as React from "react";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../components/Breadcrumbs";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Section } from "../types/Sections";

export function ViewResults() {
  return (
    <div>
      <Header location={Section.Results} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"View results"} />
        </Breadcrumbs>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">View results</h1>
            <h3 className="govuk-caption-xl govuk-!-padding-bottom-9">
              View results for providers and calculations.
            </h3>
            <div className="homepage-section-container">
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-heading-m">
                    <Link to={"/viewresults/viewprovidersfundingstreamselection"}>View provider results</Link>
                  </div>
                  <p className="govuk-body">
                    Select a provider to view its calculation and quality assurance test results.
                  </p>
                </div>
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-heading-m">
                    <Link to="/SelectSpecification" className="govuk-link">
                      View specification results
                    </Link>
                  </div>
                  <p className="govuk-body">Select a specification to view the calculation and QA results.</p>
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
