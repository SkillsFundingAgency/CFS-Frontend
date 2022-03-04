import * as React from "react";

import { Breadcrumb, Breadcrumbs } from "../components/Breadcrumbs";
import { Main } from "../components/Main";
import { TextLink } from "../components/TextLink";
import { Title } from "../components/Title";
import { Section } from "../types/Sections";

export function ViewResults() {
  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
        <Breadcrumb name="View results" />
      </Breadcrumbs>

      <Title title="View results" titleCaption="View results for providers and calculations." />

      <section className="homepage-section-container govuk-!-margin-top-9 govuk-!-margin-bottom-9">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-heading-m">
              <TextLink to="/ViewResults/ViewProvidersFundingStreamSelection">View provider results</TextLink>
            </div>
            <p className="govuk-body">
              Select a provider to view its calculation and quality assurance test results.
            </p>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-heading-m">
              <TextLink to="/SelectSpecification">View specification results</TextLink>
            </div>
            <p className="govuk-body">Select a specification to view the calculation and QA results.</p>
          </div>
        </div>
      </section>
    </Main>
  );
}
