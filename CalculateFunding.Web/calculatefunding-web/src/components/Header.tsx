import React from "react";

import { Section } from "../types/Sections";
import { AdminNav } from "./AdminNav";
import { TopHeader } from "./TopHeader";

export const Header = React.memo(function (props: { location: Section }) {
  return (
    <>
      <TopHeader {...props} />
      <div className="govuk-width-container">
        <div className="govuk-grid-row govuk-phase-banner">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-phase-banner__content">
              <strong className="govuk-tag govuk-phase-banner__content__tag">beta</strong>
              <span className="govuk-phase-banner__text">
                This is a new service – your{" "}
                <a
                  className="govuk-link"
                  href="https://forms.office.com/Pages/ResponsePage.aspx?id=yXfS-grGoU2187O4s0qC-YJWVbwgF21Alt5-BoBqL_RUNjY%20xSlJVTFhWR0wwTkgyRzc2RVdDN0VEMC4u"
                >
                  feedback
                </a>{" "}
                will help us to improve it.
              </span>
            </p>
          </div>
          <AdminNav />
        </div>
      </div>
    </>
  );
});
