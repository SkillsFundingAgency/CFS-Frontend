import * as React from "react";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../components/Breadcrumbs";
import { Main } from "../components/Main";
import { Title } from "../components/Title";
import { Section } from "../types/Sections";

export function ViewResults() {
  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"View results"} />
      </Breadcrumbs>
      <Title title={"View results"} titleCaption={"View results for providers and calculations."} />
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
    </Main>
  );
}
