import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import { Main } from "../components/Main";
import { FeatureFlagsState } from "../states/FeatureFlagsState";
import { Section } from "../types/Sections";

export function Home(props: { featureFlags: FeatureFlagsState }) {
  useEffect(() => {
    document.title = "Calculate funding";
  }, []);

  return (
    <Main location={Section.Home}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Calculate funding</h1>
          <h3 className="govuk-heading-m">
            Calculate funding, quality assure the results or approve funding.
          </h3>
          <div className="homepage-section-container">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <div className="govuk-heading-m">
                  <Link to="/SpecificationsList" className="govuk-link">
                    Specifications
                  </Link>
                </div>
                <p className="govuk-body">Create and manage the specifications used to calculate funding.</p>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-heading-m">
                  <Link to="/datasets/managedata" className="govuk-link">
                    Manage data
                  </Link>
                </div>
                <p className="govuk-body">
                  Manage data source files or map them to datasets for a specification.
                </p>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-heading-m">
                  <Link to="/results" className="govuk-link">
                    View results
                  </Link>
                </div>
                <p className="govuk-body">View results for providers and calculations.</p>
              </div>
            </div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <div className="govuk-heading-m">
                  <Link to="/Approvals/Select" className="govuk-link">
                    Funding approvals
                  </Link>
                </div>
                <p className="govuk-body">Approve funding for providers and view how it's been calculated.</p>
              </div>
              {props.featureFlags.templateBuilderVisible && (
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-heading-m">
                    <Link to="/Templates/List" className="govuk-link">
                      Templates
                    </Link>
                  </div>
                  <p className="govuk-body">View and create funding templates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
}
