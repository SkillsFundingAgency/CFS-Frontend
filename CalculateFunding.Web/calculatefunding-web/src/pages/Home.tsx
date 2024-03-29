/* eslint-disable react/no-unescaped-entities */
import React, { useEffect } from "react";

import { Main } from "../components/Main";
import { TextLink } from "../components/TextLink";
import { Title } from "../components/Title";
import { FeatureFlagsState } from "../states/FeatureFlagsState";
import { Section } from "../types/Sections";

export function Home(props: { featureFlags: FeatureFlagsState }) {
  useEffect(() => {
    document.title = "Calculate funding";
  }, []);

  return (
    <Main location={Section.Home}>
      <Title
        title="Calculate funding"
        titleCaption="Calculate funding, quality assure the results or approve funding."
        css="govuk-!-margin-top-6"
      />

      <div className="homepage-section-container govuk-grid-row govuk-!-margin-top-9 govuk-!-margin-bottom-9">
        <div className="govuk-grid-column-full">
          <section className="homepage-section-container">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <div className="govuk-heading-m">
                  <TextLink to="/SpecificationsList">Specifications</TextLink>
                </div>
                <p className="govuk-body">Create and manage the specifications used to calculate funding.</p>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-heading-m">
                  <TextLink to="/datasets/managedata">Manage data</TextLink>
                </div>
                <p className="govuk-body">
                  Manage data source files or map them to datasets for a specification.
                </p>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-heading-m">
                  <TextLink to="/results">View results</TextLink>
                </div>
                <p className="govuk-body">View results for providers and calculations.</p>
              </div>
            </div>
            <div className="govuk-grid-row">
              {props.featureFlags.enableNewFundingManagement ? (
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-heading-m">
                    <TextLink to="/FundingManagement">Funding management</TextLink>
                  </div>
                  <p className="govuk-body">Approve and release allocations for statement and funding.</p>
                </div>
              ) : (
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-heading-m">
                    <TextLink to="/Approvals/Select">Funding approvals</TextLink>
                  </div>
                  <p className="govuk-body">
                    Approve funding for providers and view how it's been calculated.
                  </p>
                </div>
              )}
              {props.featureFlags.templateBuilderVisible && (
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-heading-m">
                    <TextLink to="/Templates/List">Templates</TextLink>
                  </div>
                  <p className="govuk-body">View and create funding templates.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Main>
  );
}
